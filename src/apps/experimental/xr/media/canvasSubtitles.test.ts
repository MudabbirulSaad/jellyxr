import { describe, expect, it, vi } from 'vitest';

import { readAssPresentation } from 'plugins/htmlVideoPlayer/assPresentation';

import { createCanvasSubtitleArtwork } from './canvasSubtitles';
import type { BorrowedSubtitleSurface } from './borrowVideoSurface';

function setup() {
    const video = document.createElement('video');
    Object.defineProperties(video, { videoWidth: { value: 640 }, videoHeight: { value: 360 }, seeking: { value: false, configurable: true } });
    const ownerCanvas = document.createElement('canvas');
    ownerCanvas.width = 640;
    ownerCanvas.height = 360;
    const borrowed = { canvas: ownerCanvas, revision: '1', format: 'ASS' as const };
    const custom: BorrowedSubtitleSurface = { textElements: [], unsupportedRenderer: null, canvas: borrowed };
    const surface = { video, isCurrent: vi.fn(() => true), release: vi.fn(), readSubtitles: vi.fn(() => custom) };
    const copy = document.createElement('canvas');
    const context = { clearRect: vi.fn(), drawImage: vi.fn(), getImageData: vi.fn() };
    vi.spyOn(copy, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    return { video, ownerCanvas, borrowed, surface, copy, context, artwork: createCanvasSubtitleArtwork(surface, copy) };
}

describe('borrowed ASS canvas', () => {
    it('reads only the active 2D renderer and identifies exact render-ahead draw/clear revisions', () => {
        const canvas = document.createElement('canvas');
        const renderer = {
            canvas, ctx: { canvas } as CanvasRenderingContext2D,
            renderAhead: 90, oneshotState: { iteration: 1, eventStart: 0.25 as number | null, eventOver: false }
        };
        const initial = readAssPresentation(renderer);
        expect(initial?.canvas).toBe(canvas);
        expect(readAssPresentation(renderer)?.revision).toBe(initial?.revision);
        renderer.oneshotState.eventOver = true;
        expect(readAssPresentation(renderer)?.revision).not.toBe(initial?.revision);
        renderer.oneshotState.eventStart = null;
        expect(readAssPresentation(renderer)?.revision).toContain('null');
        renderer.renderAhead = 0;
        expect(readAssPresentation(renderer)?.revision).toBeUndefined();
        expect(readAssPresentation({ canvas })).toBeNull();
        expect(readAssPresentation(null)).toBeNull();
    });

    it('copies changed authored frames, clears gaps and resumes after a seek without owning playback', () => {
        const { video, borrowed, surface, copy, context, artwork, ownerCanvas } = setup();
        expect(artwork.update()).toBe(true);
        expect(context.drawImage).toHaveBeenCalledExactlyOnceWith(ownerCanvas, 0, 0);
        expect([copy.width, copy.height]).toEqual([640, 360]);
        expect(artwork.update()).toBe(false);
        borrowed.revision = '2-empty-gap';
        expect(artwork.update()).toBe(true);
        expect(context.clearRect).toHaveBeenCalledTimes(2);
        Object.defineProperty(video, 'seeking', { value: true });
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(false);
        Object.defineProperty(video, 'seeking', { value: false });
        expect(artwork.update()).toBe(true);
        surface.isCurrent.mockReturnValue(false);
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(false);
        expect(surface.release).not.toHaveBeenCalled();
        expect([ownerCanvas.width, ownerCanvas.height, video.currentTime]).toEqual([640, 360, 0]);
    });

    it('replaces owner canvases and sizes, hides track-off, and handles unknown revisions without freezing', () => {
        const { surface, artwork, borrowed, context } = setup();
        artwork.update();
        const replacement = document.createElement('canvas');
        replacement.width = 1280;
        replacement.height = 720;
        borrowed.canvas = replacement;
        expect(artwork.update()).toBe(true);
        expect(context.drawImage).toHaveBeenLastCalledWith(replacement, 0, 0);
        surface.readSubtitles.mockReturnValue({ textElements: [], unsupportedRenderer: null });
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(false);
        surface.readSubtitles.mockReturnValue({ textElements: [], unsupportedRenderer: null, canvas: { canvas: replacement, format: 'ASS' } });
        expect(artwork.update()).toBe(true);
        expect(artwork.update()).toBe(true);
    });

    it('fails visibly on excessive size, layout mismatch or unreadable pixels without changing the source', () => {
        const { ownerCanvas, context, artwork, surface } = setup();
        ownerCanvas.width = 8192;
        expect(artwork.update()).toBe(false);
        expect(artwork.readWarning()).toContain('size');
        ownerCanvas.width = 360;
        expect(artwork.update()).toBe(false);
        expect(artwork.readWarning()).toContain('layout');
        ownerCanvas.width = 640;
        context.getImageData.mockImplementationOnce(() => {
            throw new Error('private URL must not leak');
        });
        expect(artwork.update()).toBe(false);
        expect(artwork.readWarning()).toContain('could not be copied');
        expect(artwork.readWarning()).not.toContain('private URL');
        expect(artwork.update()).toBe(true);
        expect(artwork.readWarning()).toBeUndefined();
        expect(surface.release).not.toHaveBeenCalled();
        expect(ownerCanvas.width).toBe(640);
    });
});
