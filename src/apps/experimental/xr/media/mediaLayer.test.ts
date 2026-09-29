import { describe, expect, it, vi } from 'vitest';

import { attachMediaLayer } from './mediaLayer';

const createFixture = () => {
    const video = document.createElement('video');
    const surface = { video, isCurrent: vi.fn(() => true), release: vi.fn() };
    const projection = {} as XRLayer;
    const subtitle = {} as XRLayer;
    const layer = { destroy: vi.fn() } as unknown as XRQuadLayer;
    let layers: XRLayer[] = [projection];
    const host = {
        readLayers: () => layers,
        updateLayers: vi.fn((value: XRLayer[]) => { layers = value; }),
        isSessionEnded: vi.fn(() => false)
    };
    const createLayer = vi.fn(() => layer);
    return { surface, projection, subtitle, layer, host, createLayer };
};

describe('borrowed-video compositor attachment', () => {
    it('uses the same video and preserves later renderer/subtitle layers on detach', () => {
        const { surface, projection, subtitle, layer, host, createLayer } = createFixture();
        const attachment = attachMediaLayer(surface, host, createLayer);
        expect(createLayer).toHaveBeenCalledExactlyOnceWith(surface.video);
        expect(host.readLayers()).toEqual([layer, projection]);
        host.updateLayers([...host.readLayers(), subtitle]);
        attachment.detach();
        attachment.detach();
        expect(host.readLayers()).toEqual([projection, subtitle]);
        expect(layer.destroy).toHaveBeenCalledTimes(1);
        expect(surface.release).not.toHaveBeenCalled();
    });

    it('cleans up an unsubmitted layer when the runtime rejects the update', () => {
        const { surface, host, layer, createLayer } = createFixture();
        host.updateLayers.mockImplementation(() => {
            throw new Error('Runtime rejected layers');
        });
        expect(() => attachMediaLayer(surface, host, createLayer)).toThrow('Runtime rejected layers');
        expect(layer.destroy).toHaveBeenCalledTimes(1);
        expect(surface.release).not.toHaveBeenCalled();
    });

    it('refuses a stale source or missing projection before allocating a layer', () => {
        const { surface, host, createLayer } = createFixture();
        surface.isCurrent.mockReturnValue(false);
        expect(() => attachMediaLayer(surface, host, createLayer)).toThrow('no longer current');
        surface.isCurrent.mockReturnValue(true);
        host.updateLayers([]);
        expect(() => attachMediaLayer(surface, host, createLayer)).toThrow('projection layer');
        expect(createLayer).not.toHaveBeenCalled();
    });

    it('removes its layer when the player invalidates the borrowed element', () => {
        const { surface, projection, host, layer, createLayer } = createFixture();
        const attachment = attachMediaLayer(surface, host, createLayer);
        surface.isCurrent.mockReturnValue(false);
        expect(attachment.isCurrent()).toBe(false);
        expect(host.readLayers()).toEqual([projection]);
        expect(layer.destroy).toHaveBeenCalledTimes(1);
    });

    it('destroys its layer without submitting to an ended session', () => {
        const { surface, host, layer, createLayer } = createFixture();
        const attachment = attachMediaLayer(surface, host, createLayer);
        host.isSessionEnded.mockReturnValue(true);
        expect(attachment.isCurrent()).toBe(false);
        expect(host.updateLayers).toHaveBeenCalledTimes(1);
        expect(layer.destroy).toHaveBeenCalledTimes(1);
    });

    it('still destroys the layer when render-state removal is rejected', () => {
        const { surface, host, layer, createLayer } = createFixture();
        const attachment = attachMediaLayer(surface, host, createLayer);
        host.updateLayers.mockImplementation(() => {
            throw new Error('Session is ending');
        });
        expect(() => attachment.detach()).toThrow('Session is ending');
        attachment.detach();
        expect(layer.destroy).toHaveBeenCalledTimes(1);
    });
});
