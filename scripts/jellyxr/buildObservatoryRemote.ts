import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

import { Box3, BufferGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { exportGlb } from './gltfAuthoring.ts';

type Vec3 = [number, number, number];
type Finish = 'shell' | 'grip' | 'trim';
const destination = new URL('../../src/apps/experimental/xr/assets/observatory/', import.meta.url);
const materials: Record<Finish, MeshStandardMaterial> = {
    shell: new MeshStandardMaterial({ color: '#202A35', metalness: 0.65, roughness: 0.38 }),
    grip: new MeshStandardMaterial({ color: '#151B23', metalness: 0, roughness: 0.92 }),
    trim: new MeshStandardMaterial({ color: '#D7B67A', metalness: 0.65, roughness: 0.42 })
};
const buckets: Record<Finish, BufferGeometry[]> = { shell: [], grip: [], trim: [] };
for (const [name, material] of Object.entries(materials)) material.name = `Observatory remote ${name}`;

function part(size: Vec3, position: Vec3, finish: Finish, radius: number, segments = 2) {
    const geometry = new RoundedBoxGeometry(...size, segments, radius);
    const prepared = geometry.index ? geometry.toNonIndexed() : geometry;
    prepared.clearGroups();
    prepared.deleteAttribute('uv');
    prepared.translate(...position);
    buckets[finish].push(prepared);
    if (prepared !== geometry) geometry.dispose();
}

part([0.078, 0.030, 0.188], [0, -0.001, 0], 'shell', 0.007);
part([0.076, 0.0015, 0.184], [0, 0.014, 0], 'trim', 0.0007);
part([0.067, 0.003, 0.170], [0, 0.0155, 0], 'grip', 0.0014);
// Shallow underside ribs are geometry, not unimplemented playback buttons.
for (let index = 0; index < 14; index++) {
    part([0.050, 0.0014, 0.002], [0, -0.016, -0.065 + index * 0.010], 'grip', 0.0006, 1);
}

const root = new Group();
root.name = 'Observatory remote';
let triangles = 0;
for (const finish of Object.keys(buckets) as Finish[]) {
    const geometry = mergeGeometries(buckets[finish]);
    if (!geometry) throw new Error(`Remote geometry merge failed: ${finish}`);
    const mesh = new Mesh(geometry, materials[finish]);
    mesh.name = `remote-${finish}`;
    root.add(mesh);
    triangles += geometry.getAttribute('position').count / 3;
    buckets[finish].forEach(partGeometry => {
        partGeometry.dispose();
    });
}
root.updateMatrixWorld(true);
const dimensions = new Box3().setFromObject(root).getSize(new Vector3()).toArray();
const binary = await exportGlb(root);
const data = new Uint8Array(binary);
const collision = { units: 'metres', coordinates: 'right-handed, +Y up, forward -Z',
    boxes: [{ id: 'remote', size: [0.08, 0.035, 0.19], position: [0, 0, 0] }] };
const manifest = {
    id: 'observatory-remote', file: 'observatory-remote.glb', status: 'M2 representative model; not final M5 qualification',
    author: 'JellyXR project; original procedural geometry authored with Codex assistance',
    licence: 'GPL-2.0-or-later', licenceFile: '../../../../../../LICENSE',
    source: '../../../../../../scripts/jellyxr/buildObservatoryRemote.ts',
    externalAssets: [], authoringDependency: 'three 0.186.0 (MIT)',
    units: collision.units, coordinates: collision.coordinates, collision: 'observatory-remote-collision.json',
    triangles, primitives: root.children.length, textureCount: 0, dimensionsMetres: dimensions,
    bytes: data.byteLength, sha256: createHash('sha256').update(data).digest('hex'),
    feedback: { material: materials.trim.name, colourSrgb: '#D7B67A', intensity: 0.35 },
    outstanding: ['Final playback-control design', 'Authored normal/roughness detail', 'Baked reflection reference',
        'Quest close-range visibility, hand/controller and comfort review', 'Measured GPU/load/disposal budgets']
};
await mkdir(destination, { recursive: true });
await writeFile(new URL(manifest.file, destination), data);
await writeFile(new URL(manifest.collision, destination), JSON.stringify(collision, null, 2) + '\n');
await writeFile(new URL('remote-manifest.json', destination), JSON.stringify(manifest, null, 2) + '\n');
root.traverse(object => {
    if (object instanceof Mesh) object.geometry.dispose();
});
Object.values(materials).forEach(material => {
    material.dispose();
});
console.log(JSON.stringify(manifest, null, 2));
