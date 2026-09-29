// @vitest-environment node
/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync"] }] */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { Box3, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { describe, expect, it } from 'vitest';

import manifest from './observatory/manifest.json';
import collision from './observatory/observatory-chair-collision.json';

describe('original Observatory GLB assets', () => {
    it.each(manifest.variants)('loads the same $variant bytes in both renderers with matching bounds and counts', async variant => {
        const bytes = await readFile(`src/apps/experimental/xr/assets/observatory/${variant.file}`);
        expect(bytes.byteLength).toBe(variant.bytes);
        expect(createHash('sha256').update(new Uint8Array(bytes)).digest('hex')).toBe(variant.sha256);
        const binary = new Uint8Array(bytes).buffer;
        const model = await new GLTFLoader().parseAsync(binary, '');
        const bounds = new Box3().setFromObject(model.scene);
        const size = bounds.getSize(new Vector3()).toArray();
        size.forEach((value, index) => {
            expect(value).toBeCloseTo(variant.dimensionsMetres[index], 5);
        });
        let triangles = 0;
        let meshes = 0;
        let outsideCollision = 0;
        model.scene.traverse(object => {
            if (!(object instanceof Mesh)) return;
            meshes++;
            triangles += object.geometry.getAttribute('position').count / 3;
            expect(object.geometry.getAttribute('normal').count).toBe(object.geometry.getAttribute('position').count);
            const positions = object.geometry.getAttribute('position');
            for (let index = 0; index < positions.count; index++) {
                const vertex = new Vector3().fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld).toArray();
                const enclosed = collision.boxes.some(box => vertex.every((value, axis) =>
                    Math.abs(value - box.position[axis]) <= box.size[axis] / 2 + 0.001));
                if (!enclosed) outsideCollision++;
            }
            object.geometry.dispose();
        });
        expect(meshes).toBe(variant.primitives);
        expect(triangles).toBe(variant.triangles);
        expect(outsideCollision).toBe(0);

        const engine = new NullEngine();
        const scene = new Scene(engine);
        scene.useRightHandedSystem = true;
        try {
            const container = await LoadAssetContainerAsync(new Uint8Array(binary), scene, { pluginExtension: '.glb' });
            const geometry = container.meshes.filter(mesh => mesh.getTotalVertices() > 0);
            expect(geometry).toHaveLength(variant.primitives);
            expect(geometry.reduce((total, mesh) => total + mesh.getTotalVertices() / 3, 0)).toBe(variant.triangles);
            expect(container.materials).toHaveLength(manifest.materialCount);
            container.dispose();
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });

    it('keeps reduced geometry and separate collision resources available', () => {
        const [detailed, reduced] = manifest.variants;
        expect(reduced.triangles).toBeLessThan(detailed.triangles / 3);
        expect(reduced.bytes).toBeLessThan(detailed.bytes / 3);
        expect(reduced.dimensionsMetres).toEqual(detailed.dimensionsMetres);
        expect(collision.boxes).toHaveLength(2);
        expect(collision.boxes.every(box => box.size.every(value => value > 0))).toBe(true);
        expect(manifest.externalAssets).toEqual([]);
    });
});
