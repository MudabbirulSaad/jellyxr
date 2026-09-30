import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from 'three';
import { describe, expect, it, vi } from 'vitest';

import { createBabylonVideoTexture } from './babylonVideoTexture';
import { createThreeVideoTexture } from './threeVideoTexture';
import { DEFAULT_CAPTION_SETTINGS, type CaptionSettings } from './captionSettings';

// Exercise real geometry, materials and resource disposal; artwork drawing has separate tests.
vi.mock('./canvasSubtitles', () => ({
    createCanvasSubtitleArtwork: () => ({ update: () => false, isVisible: () => false, readWarning: () => undefined, readStatus: () => '' })
}));
vi.mock('./textSubtitles', () => ({
    createSubtitleArtwork: () => ({ update: () => false, isVisible: () => false, readStatus: () => '' })
}));

describe('shared video and caption geometry', () => {
    it.each([60, 80, 100].flatMap(percent => [0, -15, 15].map(tilt => ({ percent, tilt }))))('aligns both real renderer resources at $percent%, tilt $tilt without touching the player', ({ percent, tilt }) => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
        const engine = new NullEngine();
        const babylon = new BabylonScene(engine);
        babylon.useRightHandedSystem = true;
        const three = new Scene();
        const video = document.createElement('video');
        Object.defineProperties(video, { videoWidth: { value: 1000 }, videoHeight: { value: 2000 } });
        const surface = { video, isCurrent: () => true, release: vi.fn() };
        const play = vi.spyOn(video, 'play');
        const pause = vi.spyOn(video, 'pause');
        try {
            const pose = { distance: 5, height: 1.8, tilt };
            let settings: CaptionSettings = DEFAULT_CAPTION_SETTINGS;
            const a = createBabylonVideoTexture(surface, babylon, engine, percent, pose, () => settings);
            const b = createThreeVideoTexture(surface, three, percent, pose, () => settings);
            const scale = percent / 100;
            const expected = [
                { name: 'borrowed-video-screen', width: 1.8 * scale, height: 3.6 * scale, position: [0, 0, 0.03] },
                { name: 'borrowed-ass', width: 1.8 * scale, height: 3.6 * scale, position: [0, 0, 0.05] },
                { name: 'borrowed-subtitles', width: 4.8 * scale, height: 1.8 * scale, position: [0, 0.65 * scale, 0.11] }
            ];
            for (const item of expected) {
                const bm = babylon.getMeshByName(item.name)!;
                const tm = three.getObjectByName(item.name) as Mesh<PlaneGeometry>;
                const angle = -tilt * Math.PI / 180;
                const y = item.position[1] * Math.cos(angle) - item.position[2] * Math.sin(angle) + pose.height;
                const z = item.position[1] * Math.sin(angle) + item.position[2] * Math.cos(angle) - pose.distance;
                expect(bm.position.asArray()).toEqual([0, expect.closeTo(y), expect.closeTo(z)]);
                expect(tm.position.toArray()).toEqual(bm.position.asArray());
                expect(bm.rotation.x).toBeCloseTo(angle);
                expect(tm.rotation.x).toBeCloseTo(angle);
                expect(tm.geometry.parameters.width).toBeCloseTo(item.width);
                expect(tm.geometry.parameters.height).toBeCloseTo(item.height);
                expect(bm.getBoundingInfo().boundingBox.extendSize.x * 2).toBeCloseTo(item.width);
                expect(bm.getBoundingInfo().boundingBox.extendSize.y * 2).toBeCloseTo(item.height);
            }
            const bc = babylon.getMeshByName('borrowed-subtitles')!;
            const tc = three.getObjectByName('borrowed-subtitles') as Mesh<PlaneGeometry, MeshBasicMaterial>;
            const bm = bc.material as StandardMaterial;
            const originalTextures = [bm.emissiveTexture, tc.material.map];
            const originalVideo = [babylon.getMeshByName('borrowed-video-screen'), three.getObjectByName('borrowed-video-screen')];
            const originalRich = [babylon.getMeshByName('borrowed-ass')!.position.clone(), three.getObjectByName('borrowed-ass')!.position.clone()];
            for (const position of ['Upper', 'Centre', 'Lower'] as const) {
                settings = { size: 1.5, backing: 0, position };
                a.update();
                b.update();
                const localY = { Upper: 0.65, Centre: 0, Lower: -0.65 }[position] * scale;
                const angle = -tilt * Math.PI / 180;
                expect(bc.position.asArray()).toEqual([0, expect.closeTo(pose.height + Math.cos(angle) * localY - Math.sin(angle) * 0.11),
                    expect.closeTo(-pose.distance + Math.sin(angle) * localY + Math.cos(angle) * 0.11)]);
                expect(tc.position.toArray()).toEqual(bc.position.asArray());
                expect(Math.abs(localY) + 0.9 * scale).toBeLessThan(1.8 * scale);
                expect(bm.emissiveTexture).toBe(originalTextures[0]);
                expect(tc.material.map).toBe(originalTextures[1]);
                expect(bm.opacityTexture).toBe(bm.emissiveTexture);
                expect(bm.opacityTexture?.hasAlpha).toBe(true);
                expect([bm.disableDepthWrite, tc.material.transparent, tc.material.depthWrite]).toEqual([true, true, false]);
                expect(babylon.getMeshByName('borrowed-video-screen')).toBe(originalVideo[0]);
                expect(three.getObjectByName('borrowed-video-screen')).toBe(originalVideo[1]);
                expect(babylon.getMeshByName('borrowed-ass')!.position).toEqual(originalRich[0]);
                expect(three.getObjectByName('borrowed-ass')!.position).toEqual(originalRich[1]);
            }
            a.dispose();
            b.dispose();
            expect(babylon.meshes).toHaveLength(0);
            expect(three.children).toHaveLength(0);
            expect(surface.release).not.toHaveBeenCalled();
            expect(play).not.toHaveBeenCalled();
            expect(pause).not.toHaveBeenCalled();
        } finally {
            babylon.dispose();
            engine.dispose();
        }
    });
});
