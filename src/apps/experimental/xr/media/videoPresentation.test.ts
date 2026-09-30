import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_SCREEN_POSE } from '../fixtures/screenFixture';

import { fitVideoScreen, VideoPresentation } from './videoPresentation';

function setup() {
    const video = document.createElement('video');
    Object.defineProperties(video, {
        videoWidth: { value: 1920, configurable: true },
        videoHeight: { value: 1080, configurable: true },
        readyState: { value: 2, configurable: true }
    });
    const surface = { video, isCurrent: vi.fn(() => true), release: vi.fn() };
    const resource = () => ({ update: vi.fn(), dispose: vi.fn() });
    const backend = { createTexture: vi.fn(resource), createLayer: vi.fn(resource) };
    const presentation = new VideoPresentation(backend);
    const session = {} as XRSession;
    const space = {} as XRReferenceSpace;
    return { surface, backend, presentation, session, space };
}

describe('video comparison lifecycle', () => {
    it.each(['media-layer', 'video-texture'] as const)('replaces only presentation on %s resizing, once per change', mode => {
        const { surface, presentation, backend, session, space } = setup();
        surface.video.currentTime = 42;
        const play = vi.spyOn(surface.video, 'play');
        const pause = vi.spyOn(surface.video, 'pause');
        const load = vi.spyOn(surface.video, 'load');
        presentation.attach(surface, mode);
        presentation.update(session, space, 100);
        const factory = mode === 'media-layer' ? backend.createLayer : backend.createTexture;
        const original = factory.mock.results[0].value;
        presentation.update(session, space, 60);
        presentation.update(session, space, 60);
        expect(original.dispose).toHaveBeenCalledOnce();
        expect(factory).toHaveBeenCalledTimes(2);
        expect(factory.mock.calls[1]).toEqual(mode === 'media-layer' ? [surface, session, space, 60, DEFAULT_SCREEN_POSE] : [surface, 60, DEFAULT_SCREEN_POSE]);
        expect(surface.release).not.toHaveBeenCalled();
        expect([surface.video.currentTime, surface.video.paused]).toEqual([42, true]);
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(load).not.toHaveBeenCalled();
        presentation.dispose();
        expect(factory.mock.results[1].value.dispose).toHaveBeenCalledOnce();
        expect(surface.release).toHaveBeenCalledOnce();
    });

    it.each(['media-layer', 'video-texture'] as const)('rebuilds %s once for a pose change, without changing playback or the lease', mode => {
        const { surface, presentation, backend, session, space } = setup();
        const play = vi.spyOn(surface.video, 'play');
        const pause = vi.spyOn(surface.video, 'pause');
        surface.video.currentTime = 18;
        presentation.attach(surface, mode);
        presentation.update(session, space);
        const pose = { distance: 5, height: 1.8, tilt: 10 };
        presentation.update(session, space, 100, pose);
        presentation.update(session, space, 100, { ...pose });
        const factory = mode === 'media-layer' ? backend.createLayer : backend.createTexture;
        expect(factory).toHaveBeenCalledTimes(2);
        expect(factory.mock.results[0].value.dispose).toHaveBeenCalledOnce();
        expect(factory.mock.calls[1]).toEqual(mode === 'media-layer' ? [surface, session, space, 100, pose] : [surface, 100, pose]);
        expect(surface.release).not.toHaveBeenCalled();
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(surface.video.currentTime).toBe(18);
        presentation.dispose();
    });

    it('drops presentation resources immediately on interruption without releasing or controlling the owner', () => {
        const { surface, presentation, backend, session, space } = setup();
        const play = vi.spyOn(surface.video, 'play');
        const pause = vi.spyOn(surface.video, 'pause');
        presentation.attach(surface, 'media-layer');
        presentation.update(session, space);
        presentation.interrupt();
        presentation.interrupt();
        expect(backend.createLayer.mock.results[0].value.dispose).toHaveBeenCalledTimes(1);
        expect(surface.release).not.toHaveBeenCalled();
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(presentation.readStatus()).toContain('interrupted');
        presentation.update(null, null);
        expect(backend.createLayer).toHaveBeenCalledTimes(1);
        presentation.update(session, space);
        expect(backend.createLayer).toHaveBeenCalledTimes(2);
        presentation.dispose();
        expect(surface.release).toHaveBeenCalledTimes(1);
    });

    it('waits for XR when layers are selected, without silently choosing a texture', () => {
        const { surface, presentation, backend, session, space } = setup();
        presentation.attach(surface, 'media-layer');
        presentation.update(null, null);
        expect(backend.createLayer).not.toHaveBeenCalled();
        expect(backend.createTexture).not.toHaveBeenCalled();
        presentation.update(session, space);
        expect(backend.createLayer).toHaveBeenCalledExactlyOnceWith(surface, session, space, 100, DEFAULT_SCREEN_POSE);
        presentation.update(null, null);
        expect(backend.createLayer.mock.results[0].value.dispose).toHaveBeenCalledTimes(1);
        expect(surface.release).not.toHaveBeenCalled();
    });

    it('recreates resources after stream resize and source replacement, with no media writes', () => {
        const { surface, presentation, backend } = setup();
        const play = vi.spyOn(surface.video, 'play');
        const pause = vi.spyOn(surface.video, 'pause');
        presentation.attach(surface, 'video-texture');
        presentation.update(null, null);
        presentation.update(null, null);
        expect(backend.createTexture).toHaveBeenCalledTimes(1);
        Object.defineProperty(surface.video, 'videoWidth', { value: 1280 });
        presentation.update(null, null);
        expect(backend.createTexture).toHaveBeenCalledTimes(2);
        expect(backend.createTexture.mock.results[0].value.dispose).toHaveBeenCalledTimes(1);
        surface.isCurrent.mockReturnValue(false);
        presentation.update(null, null);
        expect(backend.createTexture.mock.results[1].value.dispose).toHaveBeenCalledTimes(1);
        expect(surface.release).toHaveBeenCalledTimes(1);
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
    });

    it('reports rejection once without allocating again on every frame; explicit attachment retries', () => {
        const { surface, presentation, backend, session, space } = setup();
        backend.createLayer.mockImplementationOnce(() => {
            throw new Error('Unavailable');
        });
        presentation.attach(surface, 'media-layer');
        presentation.update(session, space);
        presentation.update(session, space);
        expect(backend.createLayer).toHaveBeenCalledTimes(1);
        expect(presentation.readStatus()).toContain('unavailable or rejected');
        presentation.attach(surface, 'media-layer');
        presentation.update(session, space);
        expect(backend.createLayer).toHaveBeenCalledTimes(2);
    });

    it('releases the lease even if the ending runtime rejects disposal', () => {
        const { surface, presentation, backend } = setup();
        presentation.attach(surface, 'video-texture');
        presentation.update(null, null);
        backend.createTexture.mock.results[0].value.dispose.mockImplementation(() => {
            throw new Error('Session ended');
        });
        presentation.dispose();
        presentation.dispose();
        expect(surface.release).toHaveBeenCalledTimes(1);
    });

    it('waits for decoded dimensions before allocation', () => {
        const { surface, presentation, backend } = setup();
        Object.defineProperty(surface.video, 'readyState', { value: 1 });
        presentation.attach(surface, 'video-texture');
        presentation.update(null, null);
        expect(backend.createTexture).not.toHaveBeenCalled();
    });
});

describe('screen fitting', () => {
    it('preserves source aspect within the reduced envelope and rejects invalid bounds', () => {
        const portrait = fitVideoScreen(1000, 2000, 60);
        expect(portrait.width).toBeCloseTo(1.08);
        expect(portrait.height).toBeCloseTo(2.16);
        const wide = fitVideoScreen(2400, 1000, 70);
        expect(wide.width).toBeCloseTo(4.48);
        expect(wide.width / wide.height).toBeCloseTo(2.4);
        for (const size of [0, 59, 101, NaN, Infinity]) expect(() => fitVideoScreen(640, 360, size)).toThrow('Screen size');
    });

    it('preserves portrait and widescreen aspect ratios inside the same cinema screen', () => {
        expect(fitVideoScreen(1920, 1080)).toEqual({ width: 6.4, height: 3.6 });
        expect(fitVideoScreen(1000, 1000)).toEqual({ width: 3.6, height: 3.6 });
        expect(fitVideoScreen(2000, 1000)).toEqual({ width: 6.4, height: 3.2 });
        expect(() => fitVideoScreen(0, 1080)).toThrow();
        expect(() => fitVideoScreen(Infinity, 1080)).toThrow();
    });
});
