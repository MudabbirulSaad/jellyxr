// @vitest-environment node
/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync", "CreateBox"] }] */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { describe, expect, it, vi } from 'vitest';

import manifest from './observatory/room-manifest.json';
import collision from './observatory/observatory-room-collision.json';
import { FIXTURE_LIBRARY, FIXTURE_SEAT, ROOM_FIXTURE, isFixtureDestinationClear } from '../fixtures/roomFixture';
import { createThreeSceneQuery } from '../input/threeSceneQuery';
import { createBabylonSceneQuery } from '../input/babylonSceneQuery';
import type { InputRay } from '../input/controlTargets';
import { disposeChairModel } from './disposeChairModel';
import { loadThreeArchitecture } from './threeArchitecture';
import { loadBabylonArchitecture } from './babylonArchitecture';
import { constrainRemote } from '../input/remoteGrab';
import { ControlLayout, isControlPlacementClear } from '../input/controlLayout';
import { SpatialCatalogue } from '../input/spatialCatalogue';

vi.mock('@babylonjs/core/Loading/sceneLoader', async importOriginal => {
    const actual = await importOriginal<typeof import('@babylonjs/core/Loading/sceneLoader')>();
    return { ...actual, LoadAssetContainerAsync: vi.fn(actual.LoadAssetContainerAsync) };
});

async function roomBytes() {
    const bytes = await readFile(`src/apps/experimental/xr/assets/observatory/${manifest.file}`);
    expect(bytes.byteLength).toBe(manifest.bytes);
    expect(createHash('sha256').update(new Uint8Array(bytes)).digest('hex')).toBe(manifest.sha256);
    return new Uint8Array(bytes);
}

describe('original Observatory architectural shell', () => {
    it('retains Three proxies on failure and restores them after successful model disposal', async () => {
        const scene = new Scene();
        const proxy = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
        proxy.name = 'floor';
        scene.add(proxy);
        const load = vi.spyOn(GLTFLoader.prototype, 'loadAsync');
        const plain = await loadThreeArchitecture(scene, false);
        expect(load).not.toHaveBeenCalled();
        expect(plain.status).toContain('Plain room');
        plain.dispose();
        expect(proxy.visible).toBe(true);
        load.mockRejectedValueOnce(new Error('Fixture load failure'));
        await expect(loadThreeArchitecture(scene)).rejects.toThrow('Fixture load failure');
        expect(proxy.visible).toBe(true);
        expect(scene.children).toEqual([proxy]);
        const model = await new GLTFLoader().parseAsync((await roomBytes()).buffer, '');
        load.mockResolvedValueOnce(model);
        const asset = await loadThreeArchitecture(scene);
        expect(proxy.visible).toBe(false);
        expect(scene.children).toContain(model.scene);
        asset.dispose();
        expect(proxy.visible).toBe(true);
        expect(scene.children).toEqual([proxy]);
        proxy.geometry.dispose();
        proxy.material.dispose();
    });

    it('retains Babylon proxies on failure and restores them after successful container disposal', async () => {
        const engine = new NullEngine();
        const scene = new BabylonScene(engine);
        scene.useRightHandedSystem = true;
        try {
            const proxy = CreateBox('floor', { size: 1 }, scene);
            const container = await LoadAssetContainerAsync(await roomBytes(), scene, { pluginExtension: '.glb' });
            const load = vi.mocked(LoadAssetContainerAsync);
            load.mockClear();
            const plain = await loadBabylonArchitecture(scene, false);
            expect(load).not.toHaveBeenCalled();
            expect(plain.status).toContain('Plain room');
            plain.dispose();
            expect(proxy.isVisible).toBe(true);
            load.mockRejectedValueOnce(new Error('Fixture load failure'));
            await expect(loadBabylonArchitecture(scene)).rejects.toThrow('Fixture load failure');
            expect(proxy.isVisible).toBe(true);
            expect(scene.meshes).toEqual([proxy]);
            load.mockResolvedValueOnce(container);
            const asset = await loadBabylonArchitecture(scene);
            expect(proxy.isVisible).toBe(false);
            expect(scene.meshes.length).toBeGreaterThan(1);
            asset.dispose();
            expect(proxy.isVisible).toBe(true);
            expect(scene.meshes).toEqual([proxy]);
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });

    it('keeps authored vertices within the static collision volumes, including individual shelf parts', async () => {
        expect(collision.boxes).toHaveLength(21);
        expect(new Set(collision.boxes.map(box => box.id)).size).toBe(21);
        for (const box of collision.boxes) {
            expect(ROOM_FIXTURE.find(fixture => fixture.id === box.id)).toMatchObject({ ...box, collision: 'static' });
        }
        expect(manifest.replaces).toEqual(collision.boxes.map(box => box.id));
        const model = await new GLTFLoader().parseAsync((await roomBytes()).buffer, '');
        try {
            const bounds = new Box3().setFromObject(model.scene);
            bounds.getSize(new Vector3()).toArray().forEach((value, index) => {
                expect(value).toBeCloseTo(manifest.dimensionsMetres[index], 5);
            });
            let triangles = 0;
            let primitives = 0;
            let outside = 0;
            model.scene.traverse(object => {
                if (!(object instanceof Mesh)) return;
                const vertices = object.geometry.getAttribute('position');
                triangles += vertices.count / 3;
                primitives++;
                expect(object.geometry.getAttribute('normal').count).toBe(vertices.count);
                for (let index = 0; index < vertices.count; index++) {
                    const vertex = new Vector3().fromBufferAttribute(vertices, index).applyMatrix4(object.matrixWorld).toArray();
                    if (!collision.boxes.some(box => vertex.every((value, axis) =>
                        Math.abs(value - box.position[axis]) <= box.size[axis] / 2 + 0.00001))) outside++;
                }
            });
            expect(triangles).toBe(manifest.triangles);
            expect(primitives).toBe(manifest.primitives);
            expect(outside).toBe(0);
        } finally {
            disposeChairModel(model.scene);
        }
    });

    it('loads the same shell in both engines with matching visible surface hits and no external textures', async () => {
        const bytes = await roomBytes();
        const a = new Scene();
        const model = await new GLTFLoader().parseAsync(bytes.buffer, '');
        a.add(model.scene);
        const engine = new NullEngine();
        const b = new BabylonScene(engine);
        b.useRightHandedSystem = true;
        try {
            const container = await LoadAssetContainerAsync(bytes, b, { pluginExtension: '.glb' });
            container.addAllToScene();
            expect(container.textures).toHaveLength(0);
            expect(container.materials).toHaveLength(manifest.primitives);
            const meshes = container.meshes.filter(mesh => mesh.getTotalVertices());
            expect(meshes).toHaveLength(manifest.primitives);
            expect(meshes.reduce((sum, mesh) => sum + mesh.getTotalVertices() / 3, 0)).toBe(manifest.triangles);
            const queries = [createThreeSceneQuery(a), createBabylonSceneQuery(b)];
            const cases: { ray: InputRay; distance: number }[] = [
                { ray: { origin: [1, 1.65, 0], direction: [0, -1, 0] }, distance: 1.65 },
                { ray: { origin: [1, 1.65, 0], direction: [0, 1, 0] }, distance: 2.35 },
                { ray: { origin: [0.6, 1.65, 0], direction: [0, 0, -1] }, distance: 6.9 },
                { ray: { origin: [0.6, 1.65, 0], direction: [0, 0, 1] }, distance: 6.9 },
                { ray: { origin: [0, 1.65, 7 / 12], direction: [1, 0, 0] }, distance: 5.9 },
                { ray: { origin: [0, 1.65, 7 / 12], direction: [-1, 0, 0] }, distance: 5.9 },
                { ray: { origin: [0, 1, 5.2], direction: [0, -1, 0] }, distance: 0.65 },
                // The open compartment is not filled by an invisible solid proxy.
                { ray: { origin: [2.75, 1.6, 6.2], direction: [0, 0, -1] }, distance: 1.135 },
                { ray: { origin: [2.75, 1.6, 5.2], direction: [1, 0, 0] }, distance: 0.83 },
                { ray: { origin: [2.75, 1.6, 5.2], direction: [0, -1, 0] }, distance: 0.44 },
                { ray: { origin: [2.75, 1.6, 5.2], direction: [0, 1, 0] }, distance: 0.265 }
            ];
            for (const { ray, distance } of cases) {
                for (const query of queries) expect(query(ray, 10)).toBeCloseTo(distance, 4);
            }
            for (const query of queries) {
                expect(query({ origin: [0, 1.65, 6.2], direction: [0, 0, -1] }, 2)).toBeNull();
            }
            container.dispose();
            expect(b.meshes).toHaveLength(0);
        } finally {
            disposeChairModel(model.scene);
            b.dispose();
            engine.dispose();
        }
    });

    it('keeps the library workspace reachable while stopping remote sweeps at shelf surfaces', () => {
        expect(isFixtureDestinationClear(FIXTURE_LIBRARY)).toBe(true);
        expect(isFixtureDestinationClear(FIXTURE_SEAT)).toBe(true);
        expect(isFixtureDestinationClear([2.75, 0, 5.2])).toBe(false);
        const half = [0.04, 0.0175, 0.095] as const;
        expect(constrainRemote([2.75, 1.6, 5.8], [2.75, 1.6, 5.2], half)).toEqual([2.75, 1.6, 5.2]);
        const back = constrainRemote([2.75, 1.6, 5.8], [2.75, 1.6, 4.8], half);
        expect(back[2]).toBeCloseTo(5.161);
        const shelf = constrainRemote([2.75, 1.6, 5.2], [2.75, 1, 5.2], half);
        expect(shelf[1]).toBeCloseTo(1.1785);
        for (const height of [1.3, 1.65]) {
            const layout = new ControlLayout();
            const catalogue = new SpatialCatalogue();
            const content = catalogue.handle('catalogue-open')!;
            layout.setContent(content.targets, true);
            expect(layout.update({ position: [0, height, 6.2], forward: [0, 0, -1] })).toBe('placed');
            expect(layout.targets()).toEqual(content.targets);
            expect(isControlPlacementClear(layout.read(), content.targets)).toBe(true);
        }
    });
});
