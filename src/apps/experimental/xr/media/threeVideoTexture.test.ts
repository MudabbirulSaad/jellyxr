import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene, VideoTexture } from 'three';
import { describe, expect, it, vi } from 'vitest';

import { createThreeVideoTexture } from './threeVideoTexture';

vi.mock('./threeSubtitles', () => ({
    createThreeSubtitles: () => ({ update: vi.fn(), readStatus: vi.fn(), dispose: vi.fn() })
}));

describe('Three borrowed video attachment', () => {
    it('uploads an existing paused frame without waiting for another frame or taking playback ownership', () => {
        const video = document.createElement('video');
        video.currentTime = 4.8;
        Object.defineProperties(video, {
            videoWidth: { value: 640 }, videoHeight: { value: 360 }, readyState: { value: 4 },
            requestVideoFrameCallback: { value: vi.fn(() => 7) },
            cancelVideoFrameCallback: { value: vi.fn() }
        });
        const play = vi.spyOn(video, 'play');
        const pause = vi.spyOn(video, 'pause');
        const load = vi.spyOn(video, 'load');
        const surface = { video, isCurrent: () => true, release: vi.fn() };
        const scene = new Scene();
        const presentation = createThreeVideoTexture(surface, scene);
        const screen = scene.children[0] as Mesh<PlaneGeometry, MeshBasicMaterial>;
        const texture = screen.material.map as VideoTexture;
        // Use the real Three texture: a queued callback has not supplied a new frame.
        expect(video.requestVideoFrameCallback).toHaveBeenCalledOnce();
        expect(texture.image).toBe(video);
        expect(texture.version).toBeGreaterThan(0);
        presentation.update();
        presentation.dispose();
        expect(scene.children).toHaveLength(0);
        expect(video.cancelVideoFrameCallback).toHaveBeenCalledExactlyOnceWith(7);
        expect([video.currentTime, video.paused, video.src, video.muted]).toEqual([4.8, true, '', false]);
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(load).not.toHaveBeenCalled();
        expect(surface.release).not.toHaveBeenCalled();
    });
});
