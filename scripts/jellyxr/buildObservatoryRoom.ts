import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

import { Box3, BoxGeometry, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { exportGlb } from './gltfAuthoring.ts';

type Vec3 = [number, number, number];
type Finish = 'backing' | 'acoustic' | 'floor' | 'metal' | 'warmMetal';
const destination = new URL('../../src/apps/experimental/xr/assets/observatory/', import.meta.url);
const materials: Record<Finish, MeshStandardMaterial> = {
    backing: new MeshStandardMaterial({ color: '#0B0F14', roughness: 0.9 }),
    acoustic: new MeshStandardMaterial({ color: '#202A35', roughness: 0.96 }),
    floor: new MeshStandardMaterial({ color: '#1B222B', roughness: 0.84 }),
    metal: new MeshStandardMaterial({ color: '#555E66', roughness: 0.4, metalness: 0.8 }),
    warmMetal: new MeshStandardMaterial({ color: '#D7B67A', roughness: 0.42, metalness: 0.65 })
};
const buckets: Record<Finish, BufferGeometry[]> = { backing: [], acoustic: [], floor: [], metal: [], warmMetal: [] };
const collision: { id: string; size: Vec3; position: Vec3 }[] = [];

function part(size: Vec3, position: Vec3, finish: Finish, radius = 0) {
    const geometry = radius ? new RoundedBoxGeometry(...size, 1, radius) : new BoxGeometry(...size);
    const prepared = geometry.index ? geometry.toNonIndexed() : geometry;
    prepared.clearGroups();
    prepared.deleteAttribute('uv');
    prepared.translate(...position);
    buckets[finish].push(prepared);
    if (prepared !== geometry) geometry.dispose();
}

function proxy(id: string, size: Vec3, position: Vec3) {
    collision.push({ id, size, position });
}

proxy('floor', [12, 0.2, 14], [0, -0.1, 0]);
proxy('ceiling', [12, 0.2, 14], [0, 4.1, 0]);
part([12, 0.19, 14], [0, -0.105, 0], 'backing');
part([12, 0.15, 14], [0, 4.125, 0], 'backing');
for (let column = 0; column < 6; column++) {
    for (let row = 0; row < 7; row++) {
        const x = -5 + column * 2;
        const z = -6 + row * 2;
        part([1.992, 0.01, 1.992], [x, -0.005, z], 'floor', 0.003);
        part([1.85, 0.05, 1.85], [x, 4.025, z], 'acoustic', 0.015);
    }
}
for (const side of [-1, 1]) {
    proxy(side < 0 ? 'wall-left' : 'wall-right', [0.2, 4, 14], [side * 6, 2, 0]);
    part([0.12, 4, 14], [side * 6.04, 2, 0], 'backing');
    for (let bay = 0; bay < 12; bay++) {
        const z = -77 / 12 + bay * 7 / 6;
        part([0.08, 3.68, 1.12], [side * 5.94, 2, z], 'acoustic', 0.018);
    }
    for (const y of [0.08, 3.92]) part([0.07, 0.08, 13.9], [side * 5.945, y, 0], 'metal', 0.012);
    proxy(side < 0 ? 'wall-front' : 'wall-back', [12, 4, 0.2], [0, 2, side * 7]);
    part([12, 4, 0.12], [0, 2, side * 7.04], 'backing');
    for (let bay = 0; bay < 10; bay++) {
        part([1.14, 3.68, 0.08], [-5.4 + bay * 1.2, 2, side * 6.94], 'acoustic', 0.018);
    }
    for (const y of [0.08, 3.92]) part([11.9, 0.08, 0.07], [0, y, side * 6.945], 'metal', 0.012);
}
proxy('library-plinth', [8, 0.35, 0.45], [0, 0.175, 5.2]);
part([7.9, 0.27, 0.39], [0, 0.165, 5.2], 'backing', 0.025);
part([8, 0.045, 0.45], [0, 0.3275, 5.2], 'metal', 0.01);
part([7.78, 0.025, 0.31], [0, 0.0125, 5.2], 'metal', 0.01);

// Two open cases face the named library position. The centre stays clear for seated controls.
for (const side of [-1, 1]) {
    const x = side * 2.75;
    const id = `library-case-${side < 0 ? 'left' : 'right'}`;
    proxy(`${id}-back`, [1.66, 2.24, 0.06], [x, 1.49, 5.035]);
    part([1.66, 2.24, 0.06], [x, 1.49, 5.035], 'backing', 0.012);
    for (const edge of [-1, 1]) {
        const postX = x + edge * 0.865;
        proxy(`${id}-post-${edge < 0 ? 'left' : 'right'}`, [0.07, 2.3, 0.4], [postX, 1.5, 5.2]);
        part([0.07, 2.3, 0.4], [postX, 1.5, 5.2], 'floor', 0.012);
        part([0.014, 2.2, 0.008], [postX, 1.5, 5.396], 'warmMetal', 0.003);
    }
    [0.395, 1.14, 1.885, 2.63].forEach((y, index) => {
        proxy(`${id}-shelf-${index}`, [1.8, 0.04, 0.4], [x, y, 5.2]);
        part([1.8, 0.04, 0.4], [x, y, 5.2], 'floor', 0.008);
        part([1.69, 0.012, 0.009], [x, y - 0.008, 5.3955], 'warmMetal', 0.004);
    });
}

const root = new Group();
root.name = 'Observatory architectural shell';
for (const finish of Object.keys(buckets) as Finish[]) {
    const geometry = mergeGeometries(buckets[finish]);
    if (!geometry) throw new Error(`Cannot merge ${finish} geometry.`);
    materials[finish].name = `Observatory architecture ${finish}`;
    const mesh = new Mesh(geometry, materials[finish]);
    mesh.name = `architecture-${finish}`;
    root.add(mesh);
    buckets[finish].forEach(value => {
        value.dispose();
    });
}
root.updateMatrixWorld(true);
const dimensions = new Box3().setFromObject(root).getSize(new Vector3()).toArray();
const triangles = root.children.reduce((total, mesh) => total + (mesh as Mesh).geometry.getAttribute('position').count / 3, 0);
const bytes = new Uint8Array(await exportGlb(root));
const file = 'observatory-room.glb';
const manifest = {
    id: 'observatory-room', status: 'M2 representative architectural shell; not final M5 qualification',
    author: 'JellyXR project; original procedural geometry authored with Codex assistance',
    licence: 'GPL-2.0-or-later', licenceFile: '../../../../../../LICENSE',
    source: '../../../../../../scripts/jellyxr/buildObservatoryRoom.ts',
    externalAssets: [], authoringDependency: 'three 0.186.0 (MIT)',
    coordinates: 'right-handed, +Y up, forward -Z', units: 'metres',
    file, bytes: bytes.byteLength, triangles, primitives: root.children.length, textureCount: 0,
    dimensionsMetres: dimensions, sha256: createHash('sha256').update(bytes).digest('hex'),
    collision: 'observatory-room-collision.json', replaces: collision.map(box => box.id),
    outstanding: ['Baked lighting/reflections', 'Authored surface textures and GPU compression', 'Production artwork placement and interaction',
        'Quest close-range geometry and comfort review', 'Measured loading, draw calls and GPU cost']
};
await mkdir(destination, { recursive: true });
await writeFile(new URL(file, destination), bytes);
await writeFile(new URL(manifest.collision, destination), `${JSON.stringify({ units: 'metres', boxes: collision }, null, 2)}\n`);
await writeFile(new URL('room-manifest.json', destination), `${JSON.stringify(manifest, null, 2)}\n`);
root.traverse(object => {
    if (object instanceof Mesh) object.geometry.dispose();
});
Object.values(materials).forEach(material => {
    material.dispose();
});
console.log(JSON.stringify(manifest, null, 2));
