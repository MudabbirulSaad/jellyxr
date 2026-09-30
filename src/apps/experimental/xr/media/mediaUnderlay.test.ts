import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { ShaderMaterial as BabylonShader } from '@babylonjs/core/Materials/shaderMaterial';
import { FrontSide, Mesh, NoBlending, PlaneGeometry, Scene, ShaderMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';

import { createBabylonMediaUnderlay } from './babylonMediaUnderlay';
import { createThreeMediaUnderlay } from './threeMediaUnderlay';

vi.mock('./threeSubtitles', () => ({
    createThreeSubtitles: () => ({ update: vi.fn(), readStatus: vi.fn(), dispose: vi.fn() })
}));
vi.mock('./babylonSubtitles', () => ({
    createBabylonSubtitles: () => ({ update: vi.fn(), readStatus: vi.fn(), dispose: vi.fn() })
}));

describe('projection apertures', () => {
    it.each([60, 80, 100])('keeps both %i%% plane geometries aligned, depth-tested and disposable', percent => {
        const engine = new NullEngine();
        const babylon = new BabylonScene(engine);
        babylon.useRightHandedSystem = true;
        const three = new Scene();
        const video = document.createElement('video');
        Object.defineProperties(video, { videoWidth: { value: 1000 }, videoHeight: { value: 1000 } });
        const surface = { video, isCurrent: () => true, release: vi.fn() };
        try {
            const pose = { distance: 4.5, height: 2.1, tilt: 10 };
            const a = createBabylonMediaUnderlay(surface, babylon, percent, pose);
            const b = createThreeMediaUnderlay(surface, three, percent, pose);
            const bm = babylon.getMeshByName('media-underlay-aperture')!;
            const tm = three.getObjectByName('media-underlay-aperture') as Mesh<PlaneGeometry, ShaderMaterial>;
            expect(bm.position.asArray()).toEqual(tm.position.toArray());
            const angle = -Math.PI / 18;
            expect(tm.position.toArray()).toEqual([0, expect.closeTo(2.1 - Math.sin(angle) * 0.03), expect.closeTo(-4.5 + Math.cos(angle) * 0.03)]);
            expect(bm.rotation.x).toBeCloseTo(angle);
            expect(tm.rotation.x).toBeCloseTo(angle);
            expect(tm.geometry.parameters.width).toBeCloseTo(3.6 * percent / 100);
            expect(tm.geometry.parameters.height).toBeCloseTo(3.6 * percent / 100);
            const bounds = bm.getBoundingInfo().boundingBox;
            expect(bounds.extendSize.x * 2).toBeCloseTo(3.6 * percent / 100);
            expect(bounds.extendSize.y * 2).toBeCloseTo(3.6 * percent / 100);
            expect(bm.getVerticesData('normal')?.[2]).toBe(1);
            expect(tm.geometry.attributes.normal.getZ(0)).toBe(1);
            expect((bm.material as BabylonShader).needAlphaBlending()).toBe(false);
            expect(bm.material?.disableDepthWrite).toBe(false);
            expect(bm.material?.backFaceCulling).toBe(true);
            expect([tm.material.transparent, tm.material.depthWrite, tm.material.depthTest]).toEqual([false, true, true]);
            expect(tm.material.blending).toBe(NoBlending);
            expect(tm.material.side).toBe(FrontSide);
            a.dispose();
            b.dispose();
            expect(babylon.getMeshByName('media-underlay-aperture')).toBeNull();
            expect(three.children).toHaveLength(0);
            expect(surface.release).not.toHaveBeenCalled();
        } finally {
            babylon.dispose();
            engine.dispose();
        }
    });
});
