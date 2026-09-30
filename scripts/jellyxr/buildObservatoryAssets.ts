import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { Box3, BufferGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { computeMikkTSpaceTangents, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as MikkTSpace from 'three/examples/jsm/libs/mikktspace.module.js';

import { embedUpholstery, upholsteryMaps, UPHOLSTERY_TILE_METRES } from './upholsteryMaterial.ts';

// GLTFExporter's binary-only path uses FileReader for Blob.arrayBuffer. No DOM/image shim is needed.
class BlobReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    readAsArrayBuffer(blob: Blob): Promise<void> {
        return blob.arrayBuffer().then(result => {
            this.result = result;
            this.onloadend?.();
        });
    }
}
Object.defineProperty(globalThis, 'FileReader', { value: BlobReader });

type Vec3 = [number, number, number];
type Finish = 'shell' | 'cushion' | 'seam' | 'metal' | 'trim';
type Variant = 'detailed' | 'reduced';
const destination = new URL('../../src/apps/experimental/xr/assets/observatory/', import.meta.url);
const materials: Record<Finish, MeshStandardMaterial> = {
    shell: new MeshStandardMaterial({ color: '#151B23', roughness: 0.75, metalness: 0.15 }),
    cushion: new MeshStandardMaterial({ color: '#303944', roughness: 0.97 }),
    seam: new MeshStandardMaterial({ color: '#111820', roughness: 0.95 }),
    metal: new MeshStandardMaterial({ color: '#555E66', roughness: 0.32, metalness: 0.85 }),
    trim: new MeshStandardMaterial({ color: '#B99B67', roughness: 0.45, metalness: 0.75 })
};
for (const [name, material] of Object.entries(materials)) material.name = `Observatory ${name}`;

function buildChair(variant: Variant): Group {
    const buckets: Record<Finish, BufferGeometry[]> = { shell: [], cushion: [], seam: [], metal: [], trim: [] };
    const segments = variant === 'detailed' ? 3 : 1;
    const place = (geometry: BufferGeometry, finish: Finish, position: Vec3, tilt = 0) => {
        const prepared = geometry.index ? geometry.toNonIndexed() : geometry;
        prepared.clearGroups();
        prepared.rotateX(tilt);
        prepared.translate(...position);
        buckets[finish].push(prepared);
        if (prepared !== geometry) geometry.dispose();
    };
    const rounded = (size: Vec3, radius: number, finish: Finish, position: Vec3, tilt = 0) => {
        const geometry = new RoundedBoxGeometry(...size, segments, radius);
        if (finish === 'cushion') {
            const uv = geometry.getAttribute('uv');
            const [width, height, depth] = size;
            const faces = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
            const clampedRadius = Math.min(radius, ...size.map(side => side / 2));
            const arcLength = (side: number) => Math.max(0, side - 2 * clampedRadius) + Math.PI * clampedRadius / 2;
            for (let index = 0; index < uv.count; index++) {
                const face = faces[Math.floor(index / (uv.count / 6))];
                uv.setXY(index, uv.getX(index) * arcLength(face[0]) / UPHOLSTERY_TILE_METRES,
                    uv.getY(index) * arcLength(face[1]) / UPHOLSTERY_TILE_METRES);
            }
        }
        place(geometry, finish, position, tilt);
    };

    // Metres, floor-origin, +Y up; chair faces -Z. Source proportions are authored here.
    rounded([0.76, 0.17, 0.78], 0.06, 'shell', [0, 0.29, 0]);
    rounded([0.62, 0.16, 0.62], 0.07, 'cushion', [0, 0.47, -0.055]);
    rounded([0.76, 0.93, 0.145], 0.065, 'shell', [0, 0.89, 0.27], 0.12);
    rounded([0.60, 0.61, 0.12], 0.055, 'cushion', [0, 0.91, 0.175], 0.12);
    rounded([0.53, 0.17, 0.13], 0.055, 'cushion', [0, 1.235, 0.215], 0.12);
    rounded([0.53, 0.11, 0.15], 0.05, 'cushion', [0, 0.65, 0.115], 0.12);
    for (const side of [-1, 1]) {
        rounded([0.105, 0.29, 0.70], 0.045, 'shell', [side * 0.385, 0.55, -0.025]);
        rounded([0.11, 0.075, 0.56], 0.035, 'cushion', [side * 0.385, 0.715, -0.025]);
        rounded([0.014, 0.024, 0.46], 0.006, 'trim', [side * 0.441, 0.65, -0.025]);
        for (const z of [-0.25, 0.25]) {
            place(new CylinderGeometry(0.025, 0.032, 0.22, variant === 'detailed' ? 16 : 8),
                'metal', [side * 0.26, 0.11, z]);
            rounded([0.13, 0.025, 0.12], 0.012, 'metal', [side * 0.26, 0.015, z]);
        }
    }
    // Inset channels follow the back support; geometry adds relief without photographic textures.
    for (const x of [-0.20, -0.10, 0, 0.10, 0.20]) {
        rounded([0.008, 0.43, 0.005], 0.002, 'seam', [x, 0.92, 0.107], 0.12);
    }
    rounded([0.48, 0.006, 0.006], 0.002, 'seam', [0, 0.551, -0.24]);

    const root = new Group();
    root.name = `Observatory chair / ${variant}`;
    for (const finish of Object.keys(buckets) as Finish[]) {
        const geometry = mergeGeometries(buckets[finish]);
        if (!geometry) throw new Error(`Cannot merge ${finish} geometry.`);
        if (finish === 'cushion') computeMikkTSpaceTangents(geometry, MikkTSpace);
        const mesh = new Mesh(geometry, materials[finish]);
        mesh.name = `chair-${finish}`;
        root.add(mesh);
        buckets[finish].forEach(part => {
            part.dispose();
        });
    }
    return root;
}

await mkdir(destination, { recursive: true });
await MikkTSpace.ready;
const maps = upholsteryMaps();
for (const map of maps) await writeFile(new URL(map.file, destination), map.data);
const variants = [];
for (const variant of ['detailed', 'reduced'] as const) {
    const root = buildChair(variant);
    root.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(root);
    const dimensions = bounds.getSize(new Vector3()).toArray();
    let triangles = 0;
    root.traverse(object => {
        if (object instanceof Mesh) triangles += object.geometry.getAttribute('position').count / 3;
    });
    const binary = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
    if (!(binary instanceof ArrayBuffer)) throw new Error('Expected binary glTF.');
    const file = `observatory-chair-${variant}.glb`;
    const data = embedUpholstery(binary, maps);
    await writeFile(new URL(file, destination), data);
    variants.push({ variant, file, bytes: data.byteLength, triangles, primitives: root.children.length,
        dimensionsMetres: dimensions, sha256: createHash('sha256').update(data).digest('hex') });
    root.traverse(object => {
        if (object instanceof Mesh) object.geometry.dispose();
    });
}
const collision = {
    units: 'metres', coordinates: 'right-handed, +Y up, forward -Z',
    boxes: [
        { id: 'base', size: [0.90, 0.76, 0.84], position: [0, 0.38, 0] },
        { id: 'back', size: [0.78, 0.73, 0.36], position: [0, 1.03, 0.24] }
    ]
};
const manifest = {
    id: 'observatory-chair', status: 'M2 representative asset; not final M5 qualification',
    author: 'JellyXR project; procedural geometry authored with Codex assistance',
    licence: 'GPL-2.0-or-later', licenceFile: '../../../../../../LICENSE',
    source: '../../../../../../scripts/jellyxr/buildObservatoryAssets.ts',
    externalAssets: [], authoringDependency: 'three 0.186.0 (MIT)',
    coordinates: collision.coordinates, units: collision.units,
    materialCount: 5, textureCount: maps.length,
    materialSource: '../../../../../../scripts/jellyxr/upholsteryMaterial.ts',
    textures: maps.map(({ data, ...map }) => ({ ...map, bytes: data.byteLength, sha256: createHash('sha256').update(data).digest('hex') })),
    textureEncoding: 'PNG RGBA8 reference; runtime mipmaps; GPU compression not yet qualified',
    collision: 'observatory-chair-collision.json', variants,
    outstanding: ['GPU texture compression', 'Baked lighting/reflections', 'Quest weave/mipmap/shimmer review',
        'Quest visual/comfort review', 'Measured loading and draw-call budgets']
};
await writeFile(new URL('observatory-chair-collision.json', destination), `${JSON.stringify(collision, null, 2)}\n`);
await writeFile(new URL('manifest.json', destination), `${JSON.stringify(manifest, null, 2)}\n`);
for (const material of Object.values(materials)) material.dispose();
console.log(JSON.stringify({ directory: fileURLToPath(destination), variants }, null, 2));
