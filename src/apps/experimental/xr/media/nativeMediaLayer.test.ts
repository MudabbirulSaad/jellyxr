import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SCREEN_POSE } from '../fixtures/screenFixture';

import { createNativeMediaLayer } from './nativeMediaLayer';

afterEach(() => vi.unstubAllGlobals());

function setup() {
    const video = document.createElement('video');
    video.currentTime = 4.8;
    Object.defineProperties(video, { videoWidth: { value: 1920 }, videoHeight: { value: 1080 } });
    const surface = { video, isCurrent: vi.fn(() => true), release: vi.fn() };
    const projection = { blendTextureSourceAlpha: false } as XRProjectionLayer;
    const layer = { destroy: vi.fn() } as unknown as XRQuadLayer;
    const createQuadLayer = vi.fn(() => layer);
    vi.stubGlobal('XRMediaBinding', vi.fn(() => ({ createQuadLayer })));
    vi.stubGlobal('XRRigidTransform', vi.fn(position => ({ position })));
    const update = vi.fn();
    const dispose = vi.fn();
    const content = vi.fn(() => ({ update, dispose, readSubtitleStatus: () => 'Fixture captions.' }));
    const updateRenderState = vi.fn();
    const session = Object.assign(new EventTarget(), { renderState: { layers: [projection] }, updateRenderState }) as unknown as XRSession;
    const space = {} as XRReferenceSpace;
    return { surface, projection, layer, createQuadLayer, content, update, dispose, session, space, updateRenderState };
}

describe('native video underlay ownership', () => {
    it('passes the same bounded size to native video and projection content', () => {
        const f = setup();
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content, 60);
        expect(f.createQuadLayer).toHaveBeenCalledWith(f.surface.video, expect.objectContaining({
            width: expect.closeTo(3.84), height: expect.closeTo(2.16)
        }));
        expect(f.content).toHaveBeenCalledExactlyOnceWith(60, DEFAULT_SCREEN_POSE);
        resource.dispose();
        expect(f.surface.release).not.toHaveBeenCalled();
    });

    it('rotates the native quad about the same centre and local depth as projection content', () => {
        const f = setup();
        const pose = { distance: 5, height: 1.8, tilt: 15 };
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content, 80, pose);
        const angle = -Math.PI / 12;
        expect(XRRigidTransform).toHaveBeenCalledWith({ x: 0, y: expect.closeTo(1.8 - Math.sin(angle) * 0.03), z: expect.closeTo(-5 + Math.cos(angle) * 0.03) },
            { x: expect.closeTo(Math.sin(angle / 2)), y: 0, z: 0, w: expect.closeTo(Math.cos(angle / 2)) });
        expect(f.content).toHaveBeenCalledExactlyOnceWith(80, pose);
        resource.dispose();
        expect(f.surface.video.currentTime).toBe(4.8);
        expect(f.surface.release).not.toHaveBeenCalled();
    });

    it('places borrowed video beneath alpha projection content, then restores state without owning playback', () => {
        const f = setup();
        const play = vi.spyOn(f.surface.video, 'play');
        const pause = vi.spyOn(f.surface.video, 'pause');
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        expect(f.updateRenderState).toHaveBeenLastCalledWith({ layers: [f.layer, f.projection] });
        expect(f.createQuadLayer).toHaveBeenCalledWith(f.surface.video, expect.objectContaining({
            space: f.space, layout: 'mono', width: 6.4, height: 3.6,
            transform: { position: { x: 0, y: 2, z: -6.47 } }
        }));
        expect(f.projection.blendTextureSourceAlpha).toBe(true);
        resource.update();
        expect(f.update).toHaveBeenCalledOnce();
        expect(resource.readSubtitleStatus?.()).toBe('Fixture captions.');
        resource.dispose();
        resource.dispose();
        expect(f.updateRenderState).toHaveBeenLastCalledWith({ layers: [f.projection] });
        expect(f.projection.blendTextureSourceAlpha).toBe(false);
        expect(f.dispose).toHaveBeenCalledOnce();
        expect(f.layer.destroy).toHaveBeenCalledOnce();
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(f.surface.release).not.toHaveBeenCalled();
        expect(f.surface.video.currentTime).toBe(4.8);
    });

    it('rejects missing alpha capability before allocation and rolls back rejected content', () => {
        const f = setup();
        Object.defineProperty(f.projection, 'blendTextureSourceAlpha', { value: undefined, writable: true });
        expect(() => createNativeMediaLayer(f.surface, f.session, f.space, f.content)).toThrow('alpha-capable');
        expect(f.createQuadLayer).not.toHaveBeenCalled();
        f.projection.blendTextureSourceAlpha = false;
        f.content.mockImplementationOnce(() => {
            throw new Error('Caption allocation failed');
        });
        expect(() => createNativeMediaLayer(f.surface, f.session, f.space, f.content)).toThrow('Caption allocation failed');
        expect(f.projection.blendTextureSourceAlpha).toBe(false);
        expect(f.updateRenderState).toHaveBeenLastCalledWith({ layers: [f.projection] });
        expect(f.layer.destroy).toHaveBeenCalledOnce();
    });

    it('cleans presentation on session end without resubmitting layers or restoring dead properties', () => {
        const f = setup();
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        f.session.dispatchEvent(new Event('end'));
        Object.defineProperty(f.projection, 'blendTextureSourceAlpha', {
            set() {
                throw new Error('Dead layer');
            }
        });
        expect(() => resource.update()).toThrow('ended');
        expect(() => resource.dispose()).not.toThrow();
        expect(f.updateRenderState).toHaveBeenCalledOnce();
        expect(f.layer.destroy).toHaveBeenCalledOnce();
        expect(f.dispose).toHaveBeenCalledOnce();
    });

    it('releases the native layer and restores alpha even if scene cleanup throws', () => {
        const f = setup();
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        f.dispose.mockImplementation(() => {
            throw new Error('Scene ended');
        });
        expect(() => resource.dispose()).toThrow('Scene ended');
        expect(f.layer.destroy).toHaveBeenCalledOnce();
        expect(f.projection.blendTextureSourceAlpha).toBe(false);
        resource.dispose();
        expect(f.dispose).toHaveBeenCalledOnce();
    });

    it('recreates within the same frame using the submitted layer list instead of stale renderState', () => {
        const f = setup();
        const first = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        Object.defineProperty(f.session, 'renderState', { value: { layers: [f.layer, f.projection] } });
        first.dispose();
        const replacement = { destroy: vi.fn() } as unknown as XRQuadLayer;
        f.createQuadLayer.mockReturnValueOnce(replacement);
        const second = createNativeMediaLayer(f.surface, f.session, {} as XRReferenceSpace, f.content);
        expect(f.updateRenderState).toHaveBeenLastCalledWith({ layers: [replacement, f.projection] });
        second.dispose();
        expect(f.layer.destroy).toHaveBeenCalledOnce();
        expect(replacement.destroy).toHaveBeenCalledOnce();
    });

    it('allows an explicit retry after the initial projection update becomes visible', () => {
        const f = setup();
        Object.defineProperty(f.session, 'renderState', { configurable: true, value: { layers: [] } });
        expect(() => createNativeMediaLayer(f.surface, f.session, f.space, f.content)).toThrow('alpha-capable');
        Object.defineProperty(f.session, 'renderState', { value: { layers: [f.projection] } });
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        expect(f.createQuadLayer).toHaveBeenCalledOnce();
        resource.dispose();
    });

    it('marks the session ended before an earlier recovery listener disposes presentation', () => {
        const f = setup();
        f.session.addEventListener('end', () => resource.dispose());
        const resource = createNativeMediaLayer(f.surface, f.session, f.space, f.content);
        f.session.dispatchEvent(new Event('end'));
        expect(f.updateRenderState).toHaveBeenCalledOnce();
        expect(f.dispose).toHaveBeenCalledOnce();
        expect(f.layer.destroy).toHaveBeenCalledOnce();
    });
});
