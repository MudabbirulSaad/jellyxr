// @vitest-environment node
/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync"] }] */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import type { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import { Box3, Mesh, MeshStandardMaterial, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import manifest from './observatory/manifest.json';
import collision from './observatory/observatory-chair-collision.json';
import { disposeChairModel } from './disposeChairModel';

/** Decode the authored PNG's IDAT rows. GPU upload remains a browser/device check. */
function decodeMap(bytes: Uint8Array) {
    const data = Buffer.from(bytes);
    expect(Array.from(data.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    expect([data[24], data[25], data[28]]).toEqual([8, 6, 0]);
    const idat: Uint8Array[] = [];
    for (let offset = 8; offset < data.length;) {
        const length = data.readUInt32BE(offset);
        if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT') idat.push(new Uint8Array(data.subarray(offset + 8, offset + 8 + length)));
        offset += length + 12;
    }
    const rows = inflateSync(new Uint8Array(Buffer.concat(idat)));
    expect(rows.length).toBe(height * (width * 4 + 1));
    const pixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
        const start = y * (width * 4 + 1);
        expect(rows[start]).toBe(0);
        pixels.set(rows.subarray(start + 1, start + 1 + width * 4), y * width * 4);
    }
    return { width, height, pixels };
}

describe('original Observatory GLB assets', () => {
    beforeAll(() => {
        vi.stubGlobal('self', globalThis);
        // Node has no GPU ImageBitmap. Decode the actual PNG bytes, then supply only its resource boundary.
        vi.stubGlobal('createImageBitmap', async (blob: Blob) => ({
            // Node-only decode boundary, excluded from application bundles.
            // eslint-disable-next-line compat/compat
            ...decodeMap(new Uint8Array(await blob.arrayBuffer())), close: vi.fn()
        }));
    });
    afterAll(() => {
        vi.unstubAllGlobals();
    });
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
            if (object.name === 'chair-cushion') {
                expect(object.geometry.getAttribute('tangent').count).toBe(object.geometry.getAttribute('position').count);
                const material = object.material as MeshStandardMaterial;
                expect(material.normalMap).toBeInstanceOf(Texture);
                expect(material.roughnessMap).toBeInstanceOf(Texture);
                expect(material.roughnessMap).toBe(material.metalnessMap);
                expect(material.normalMap?.colorSpace).toBe('');
                expect(material.normalMap?.generateMipmaps).toBe(true);
                const normal = object.geometry.getAttribute('normal');
                const tangent = object.geometry.getAttribute('tangent');
                for (let vertex = 0; vertex < tangent.count; vertex++) {
                    const n = new Vector3().fromBufferAttribute(normal, vertex);
                    const t = new Vector3().fromBufferAttribute(tangent, vertex);
                    expect(t.length()).toBeCloseTo(1, 4);
                    expect(n.dot(t)).toBeCloseTo(0, 4);
                    expect(Math.abs(tangent.getW(vertex))).toBe(1);
                }
            }
        });
        disposeChairModel(model.scene);
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
            expect(container.textures).toHaveLength(manifest.textureCount);
            const cushion = container.materials.find(material => material.name === 'Observatory cushion') as PBRMaterial;
            expect(cushion.bumpTexture).toBeTruthy();
            expect(cushion.metallicTexture).toBeTruthy();
            expect(cushion.useRoughnessFromMetallicTextureGreen).toBe(true);
            expect(cushion.useRoughnessFromMetallicTextureAlpha).toBe(false);
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
    it.each(manifest.textures)('preserves original $role pixels and declared provenance', async texture => {
        const data = new Uint8Array(await readFile(`src/apps/experimental/xr/assets/observatory/${texture.file}`));
        expect(createHash('sha256').update(data).digest('hex')).toBe(texture.sha256);
        const { width, height, pixels } = decodeMap(data);
        expect([width, height]).toEqual([texture.width, texture.height]);
        expect(texture.tileMetres).toBe(0.08);
        expect(texture.colourSpace).toBe('linear');
        let invalid = 0;
        for (let index = 0; index < pixels.length; index += 4) {
            if (pixels[index + 3] !== 255) invalid++;
            if (texture.role === 'normal') {
                const length = Math.hypot(...Array.from(pixels.slice(index, index + 3), value => value / 127.5 - 1));
                if (Math.abs(length - 1) >= 0.005 || pixels[index + 2] <= 240) invalid++;
            } else if (pixels[index + 1] < 220 || pixels[index + 1] > 250 || pixels[index + 2] !== 0) {
                invalid++;
            }
        }
        expect(invalid).toBe(0);
    });

    it('releases shared material textures and decoded images once', async () => {
        const bytes = new Uint8Array(await readFile(`src/apps/experimental/xr/assets/observatory/${manifest.variants[1].file}`));
        const model = await new GLTFLoader().parseAsync(bytes.buffer, '');
        const cushion = model.scene.getObjectByName('chair-cushion') as Mesh;
        const material = cushion.material as MeshStandardMaterial;
        const normal = material.normalMap!;
        const roughness = material.roughnessMap!;
        const normalDispose = vi.spyOn(normal, 'dispose');
        const roughnessDispose = vi.spyOn(roughness, 'dispose');
        const closeNormal = (normal.source.data as { close: ReturnType<typeof vi.fn> }).close;
        const closeRoughness = (roughness.source.data as { close: ReturnType<typeof vi.fn> }).close;
        disposeChairModel(model.scene);
        expect(normalDispose).toHaveBeenCalledOnce();
        expect(roughnessDispose).toHaveBeenCalledOnce();
        expect(closeNormal).toHaveBeenCalledOnce();
        expect(closeRoughness).toHaveBeenCalledOnce();
    });
});
