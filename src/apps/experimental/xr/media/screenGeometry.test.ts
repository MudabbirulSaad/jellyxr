import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { Mesh, PlaneGeometry, Scene } from 'three';
import { describe, expect, it, vi } from 'vitest';

import { createBabylonVideoTexture } from './babylonVideoTexture';
import { createThreeVideoTexture } from './threeVideoTexture';

// Exercise real geometry, materials and resource disposal; artwork drawing has separate tests.
vi.mock('./canvasSubtitles', () => ({
    createCanvasSubtitleArtwork: () => ({ update: () => false, isVisible: () => false, readWarning: () => undefined, readStatus: () => '' })
}));
vi.mock('./textSubtitles', () => ({
    createSubtitleArtwork: () => ({ update: () => false, isVisible: () => false, readStatus: () => '' })
}));

describe('shared video and caption geometry', () => {
    it.each([60, 80, 100])('aligns both real renderer resources at %i%% without touching the player', percent => {
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
            const a = createBabylonVideoTexture(surface, babylon, engine, percent);
            const b = createThreeVideoTexture(surface, three, percent);
            const scale = percent / 100;
            const expected = [
                { name: 'borrowed-video-screen', width: 1.8 * scale, height: 3.6 * scale, position: [0, 2, -6.47] },
                { name: 'borrowed-ass', width: 1.8 * scale, height: 3.6 * scale, position: [0, 2, -6.45] },
                { name: 'borrowed-subtitles', width: 4.8 * scale, height: 1.2 * scale, position: [0, 2 + 0.65 * scale, -6.39] }
            ];
            for (const item of expected) {
                const bm = babylon.getMeshByName(item.name)!;
                const tm = three.getObjectByName(item.name) as Mesh<PlaneGeometry>;
                expect(bm.position.asArray()).toEqual(item.position);
                expect(tm.position.toArray()).toEqual(item.position);
                expect(tm.geometry.parameters.width).toBeCloseTo(item.width);
                expect(tm.geometry.parameters.height).toBeCloseTo(item.height);
                expect(bm.getBoundingInfo().boundingBox.extendSize.x * 2).toBeCloseTo(item.width);
                expect(bm.getBoundingInfo().boundingBox.extendSize.y * 2).toBeCloseTo(item.height);
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
