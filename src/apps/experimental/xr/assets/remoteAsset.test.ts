// @vitest-environment node
/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync", "CreateBox", "Quaternion.FromEulerAngles", "BabylonVector3.TransformCoordinates", "BabylonVector3.TransformNormal"] }] */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Vector3 as BabylonVector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { Box3, BoxGeometry, Color, Euler, Mesh, MeshStandardMaterial, Scene, Vector3, type BufferGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { describe, expect, it, vi } from 'vitest';

import manifest from './observatory/remote-manifest.json';
import collision from './observatory/observatory-remote-collision.json';
import { REMOTE_SIZE, ROOM_FIXTURE } from '../fixtures/roomFixture';
import { createThreeSceneQuery } from '../input/threeSceneQuery';
import { createBabylonSceneQuery } from '../input/babylonSceneQuery';
import { disposeChairModel } from './disposeChairModel';
import { loadThreeRemote } from './threeRemote';
import { loadBabylonRemote } from './babylonRemote';

vi.mock('@babylonjs/core/Loading/sceneLoader', async importOriginal => {
    const actual = await importOriginal<typeof import('@babylonjs/core/Loading/sceneLoader')>();
    return { ...actual, LoadAssetContainerAsync: vi.fn(actual.LoadAssetContainerAsync) };
});

async function remoteBytes() {
    const bytes = new Uint8Array(await readFile(`src/apps/experimental/xr/assets/observatory/${manifest.file}`));
    expect(bytes.byteLength).toBe(manifest.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(manifest.sha256);
    return bytes;
}

describe('original remote model', () => {
    it('rejects missing feedback materials in both loaders without hiding or disposing the external proxy', async () => {
        const bytes = await remoteBytes();
        const model = await new GLTFLoader().parseAsync(bytes.buffer, '');
        const trim = (model.scene.getObjectByName('remote-trim') as Mesh<BufferGeometry, MeshStandardMaterial>).material;
        trim.name = 'Technical invalid-material fixture';
        const materialDispose = vi.spyOn(trim, 'dispose');
        const threeProxy = new Mesh(new BoxGeometry(...REMOTE_SIZE), new MeshStandardMaterial());
        vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockResolvedValueOnce(model);
        await expect(loadThreeRemote(threeProxy)).rejects.toThrow('feedback material is missing');
        expect(threeProxy.material.visible).toBe(true);
        expect(threeProxy.children).toHaveLength(0);
        expect(materialDispose).toHaveBeenCalledTimes(1);
        threeProxy.geometry.dispose();
        threeProxy.material.dispose();
        const engine = new NullEngine();
        const scene = new BabylonScene(engine);
        scene.useRightHandedSystem = true;
        try {
            await expect(loadThreeRemote(undefined)).rejects.toThrow('physics proxy is missing');
            await expect(loadBabylonRemote(scene, undefined)).rejects.toThrow('physics proxy is missing');
            const proxy = CreateBox('remote', { size: 1 }, scene);
            const container = await LoadAssetContainerAsync(bytes, scene, { pluginExtension: '.glb' });
            container.materials.find(material => material.name === manifest.feedback.material)!.name = 'Technical invalid-material fixture';
            vi.mocked(LoadAssetContainerAsync).mockResolvedValueOnce(container);
            await expect(loadBabylonRemote(scene, proxy)).rejects.toThrow('feedback material is missing');
            expect(proxy.isVisible).toBe(true);
            expect(proxy.isDisposed()).toBe(false);
            expect(scene.meshes).toEqual([proxy]);
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });

    it('loads identical bytes with declared materials/counts and every vertex inside the unchanged collider', async () => {
        expect(manifest.externalAssets).toEqual([]);
        expect(collision.boxes).toEqual([{ id: 'remote', size: [0.08, 0.035, 0.19], position: [0, 0, 0] }]);
        expect(REMOTE_SIZE).toEqual(collision.boxes[0].size);
        expect(ROOM_FIXTURE.filter(box => box.collision === 'dynamic')).toHaveLength(1);
        const bytes = await remoteBytes();
        const model = await new GLTFLoader().parseAsync(bytes.buffer, '');
        const engine = new NullEngine();
        const scene = new BabylonScene(engine);
        scene.useRightHandedSystem = true;
        try {
            model.scene.updateMatrixWorld(true);
            const size = new Box3().setFromObject(model.scene).getSize(new Vector3()).toArray();
            size.forEach((value, axis) => {
                expect(value).toBeCloseTo(manifest.dimensionsMetres[axis], 6);
            });
            let triangles = 0;
            let primitives = 0;
            model.scene.traverse(object => {
                if (!(object instanceof Mesh)) return;
                primitives++;
                const vertices = object.geometry.getAttribute('position');
                triangles += vertices.count / 3;
                expect(object.geometry.getAttribute('normal').count).toBe(vertices.count);
                expect(object.material).toBeInstanceOf(MeshStandardMaterial);
                expect(object.material.transparent).toBe(false);
                expect(object.material.map).toBeNull();
                for (let index = 0; index < vertices.count; index++) {
                    const point = new Vector3().fromBufferAttribute(vertices, index).applyMatrix4(object.matrixWorld).toArray();
                    point.forEach((value, axis) => {
                        expect(Math.abs(value)).toBeLessThanOrEqual(REMOTE_SIZE[axis] / 2 + 0.000001);
                    });
                }
            });
            expect([triangles, primitives]).toEqual([manifest.triangles, manifest.primitives]);
            const container = await LoadAssetContainerAsync(bytes, scene, { pluginExtension: '.glb' });
            expect(container.textures).toHaveLength(0);
            expect(container.materials).toHaveLength(manifest.primitives);
            expect(container.meshes.filter(mesh => mesh.getTotalVertices()).reduce((n, mesh) => n + mesh.getTotalVertices() / 3, 0)).toBe(manifest.triangles);
            const threeTrim = model.scene.getObjectByName('remote-trim') as Mesh<BufferGeometry, MeshStandardMaterial>;
            const babylonTrim = container.materials.find(material => material.name === manifest.feedback.material) as PBRMaterial;
            babylonTrim.albedoColor.asArray().forEach((value, channel) => {
                expect(value).toBeCloseTo(threeTrim.material.color.toArray()[channel], 5);
            });
            expect(babylonTrim.roughness).toBeCloseTo(threeTrim.material.roughness);
            expect(babylonTrim.metallic).toBeCloseTo(threeTrim.material.metalness);
            container.dispose();
        } finally {
            disposeChairModel(model.scene);
            scene.dispose();
            engine.dispose();
        }
    });

    it('preserves Three failure fallback, follows the rotated body, restores rendering and releases only owned resources', async () => {
        const scene = new Scene();
        const proxy = new Mesh(new BoxGeometry(...REMOTE_SIZE), new MeshStandardMaterial());
        scene.add(proxy);
        const ownGeometry = vi.spyOn(proxy.geometry, 'dispose');
        const ownMaterial = vi.spyOn(proxy.material, 'dispose');
        const load = vi.spyOn(GLTFLoader.prototype, 'loadAsync');
        load.mockRejectedValueOnce(new Error('Technical asset failure'));
        await expect(loadThreeRemote(proxy)).rejects.toThrow('Technical asset failure');
        expect(proxy.material.visible).toBe(true);
        expect(proxy.children).toHaveLength(0);
        const model = await new GLTFLoader().parseAsync((await remoteBytes()).buffer, '');
        load.mockResolvedValueOnce(model);
        const trim = (model.scene.getObjectByName('remote-trim') as Mesh<BufferGeometry, MeshStandardMaterial>).material;
        const trimDispose = vi.spyOn(trim, 'dispose');
        const asset = await loadThreeRemote(proxy);
        expect(proxy.visible).toBe(true);
        expect(proxy.material.visible).toBe(false);
        expect(model.scene.parent).toBe(proxy);
        asset.setHeld(true);
        expect(trim.emissive.toArray()).toEqual(new Color(manifest.feedback.colourSrgb).multiplyScalar(manifest.feedback.intensity).toArray());
        asset.setHeld(false);
        expect(trim.emissive.toArray()).toEqual([0, 0, 0]);
        const query = createThreeSceneQuery(scene);
        for (const pitch of [0, 0.7, -0.4]) {
            proxy.position.set(1, 2, -3);
            proxy.quaternion.setFromEuler(new Euler(pitch, 0.4, -0.2));
            scene.updateMatrixWorld(true);
            const origin = proxy.localToWorld(new Vector3(0, 0.3, 0));
            const direction = new Vector3(0, -1, 0).transformDirection(proxy.matrixWorld);
            expect(query({ origin: origin.toArray(), direction: direction.toArray() }, 1)).toBeCloseTo(0.283, 5);
        }
        asset.dispose();
        asset.dispose();
        asset.setHeld(true);
        expect(trimDispose).toHaveBeenCalledTimes(1);
        expect(ownGeometry).not.toHaveBeenCalled();
        expect(ownMaterial).not.toHaveBeenCalled();
        expect(proxy.material.visible).toBe(true);
        expect(proxy.children).toHaveLength(0);
        proxy.geometry.dispose();
        proxy.material.dispose();
    });

    it('preserves Babylon failure fallback, follows the rotated body and disposes without destroying that body proxy', async () => {
        const engine = new NullEngine();
        const scene = new BabylonScene(engine);
        scene.useRightHandedSystem = true;
        try {
            const proxy = CreateBox('remote', { width: REMOTE_SIZE[0], height: REMOTE_SIZE[1], depth: REMOTE_SIZE[2] }, scene);
            const load = vi.mocked(LoadAssetContainerAsync);
            load.mockRejectedValueOnce(new Error('Technical asset failure'));
            await expect(loadBabylonRemote(scene, proxy)).rejects.toThrow('Technical asset failure');
            expect(proxy.isVisible).toBe(true);
            expect(proxy.getChildMeshes()).toHaveLength(0);
            const container = await LoadAssetContainerAsync(await remoteBytes(), scene, { pluginExtension: '.glb' });
            const trim = container.materials.find(material => material.name === manifest.feedback.material) as PBRMaterial;
            const ownDispose = vi.spyOn(proxy, 'dispose');
            const trimDispose = vi.spyOn(trim, 'dispose');
            load.mockResolvedValueOnce(container);
            const asset = await loadBabylonRemote(scene, proxy);
            expect(proxy.isEnabled()).toBe(true);
            expect(proxy.isVisible).toBe(false);
            expect(proxy.getChildMeshes().filter(mesh => mesh.getTotalVertices())).toHaveLength(manifest.primitives);
            asset.setHeld(true);
            new Color(manifest.feedback.colourSrgb).multiplyScalar(manifest.feedback.intensity).toArray().forEach((value, channel) => {
                expect(trim.emissiveColor.asArray()[channel]).toBeCloseTo(value, 5);
            });
            asset.setHeld(false);
            expect(trim.emissiveColor.asArray()).toEqual([0, 0, 0]);
            const query = createBabylonSceneQuery(scene);
            for (const pitch of [0, 0.7, -0.4]) {
                proxy.position.set(1, 2, -3);
                proxy.rotationQuaternion = Quaternion.FromEulerAngles(pitch, 0.4, -0.2);
                const matrix = proxy.computeWorldMatrix(true);
                const origin = BabylonVector3.TransformCoordinates(new BabylonVector3(0, 0.3, 0), matrix);
                const direction = BabylonVector3.TransformNormal(new BabylonVector3(0, -1, 0), matrix).normalize();
                expect(query({ origin: [origin.x, origin.y, origin.z], direction: [direction.x, direction.y, direction.z] }, 1)).toBeCloseTo(0.283, 5);
            }
            asset.dispose();
            asset.dispose();
            asset.setHeld(true);
            expect(trimDispose).toHaveBeenCalledTimes(1);
            expect(ownDispose).not.toHaveBeenCalled();
            expect(proxy.isVisible).toBe(true);
            expect(proxy.getChildMeshes()).toHaveLength(0);
            expect(scene.meshes).toEqual([proxy]);
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });
});
