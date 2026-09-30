import { describe, expect, it, vi } from 'vitest';

import { createSubtitleArtwork, TextSubtitleReader, wrapSubtitle } from './textSubtitles';
import type { BorrowedSubtitleSurface } from './borrowVideoSurface';
import { DEFAULT_CAPTION_SETTINGS, type CaptionSettings } from './captionSettings';

function setup() {
    const video = document.createElement('video');
    const fragment = document.createDocumentFragment();
    const text = document.createTextNode('Technical caption');
    fragment.append(text);
    const cue = { text: 'Technical caption', getCueAsHTML: vi.fn(() => fragment) };
    const track = { mode: 'showing', kind: 'subtitles', activeCues: [cue] };
    Object.defineProperty(video, 'textTracks', { value: [track] });
    let subtitleSurface: BorrowedSubtitleSurface = { textElements: [], unsupportedRenderer: null };
    const surface = {
        video, isCurrent: vi.fn(() => true), release: vi.fn(), readSubtitles: () => subtitleSurface
    };
    return {
        video, cue, text, fragment, track, surface,
        setCustom: (value: BorrowedSubtitleSurface) => { subtitleSurface = value; },
        reader: new TextSubtitleReader(surface)
    };
}

describe('borrowed subtitle presentation', () => {
    it('repaints a paused cue on style changes, outlines unbacked text, and keeps gaps and warnings honest', () => {
        const { surface, track } = setup();
        let settings: CaptionSettings = DEFAULT_CAPTION_SETTINGS;
        const warning = { message: undefined as string | undefined };
        const context = {
            font: '', fillStyle: '', clearRect: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), strokeText: vi.fn(),
            measureText: (value: string) => ({ width: value.length * 25 })
        };
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
        const artwork = createSubtitleArtwork(surface, canvas, () => warning.message, () => settings);
        expect(artwork.update()).toBe(true);
        expect(context.font).toContain('50px');
        settings = { ...settings, size: 1.5, backing: 0.75 };
        expect(artwork.update()).toBe(true);
        expect(context.font).toContain('75px');
        expect(context.fillRect).toHaveBeenLastCalledWith(0, 216, 1600, 168);
        expect(artwork.update()).toBe(false);
        settings = { ...settings, position: 'Lower' };
        expect(artwork.update()).toBe(false); // Moving the existing mesh needs no texture upload.
        settings = { ...settings, backing: 0 };
        context.fillRect.mockClear();
        context.strokeText.mockClear();
        expect(artwork.update()).toBe(true);
        expect(context.fillRect).not.toHaveBeenCalled();
        expect(context.strokeText).toHaveBeenCalledExactlyOnceWith('Technical caption', 800, 300);
        track.activeCues = [];
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(false);
        warning.message = 'Caption renderer unavailable. Use the ordinary player.';
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(true);
        expect(context.font).toContain('50px');
        expect(context.fillRect).toHaveBeenCalled();
        expect(surface.release).not.toHaveBeenCalled();
    });

    it.each([1, 1.25, 1.5] as const)('keeps five complete lines within the canvas at caption size %s', size => {
        const { surface, cue, text } = setup();
        cue.text = text.textContent = 'First line\nSecond line\nThird line\nFourth line\nFifth line';
        const context = {
            font: '', clearRect: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), strokeText: vi.fn(),
            measureText: (value: string) => ({ width: value.length * 25 * size })
        };
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
        const artwork = createSubtitleArtwork(surface, canvas, undefined, () => ({ ...DEFAULT_CAPTION_SETTINGS, size }));
        artwork.update();
        expect(context.font).toContain(`${50 * size}px`);
        expect(context.fillText.mock.calls.map(call => call[0])).toEqual(cue.text.split('\n'));
        for (const [, , y] of context.fillText.mock.calls) {
            expect(y - 25 * size).toBeGreaterThan(0);
            expect(y + 25 * size).toBeLessThan(canvas.height);
        }
        expect(context.fillRect.mock.calls[0][1]).toBeGreaterThan(0);
        expect(context.fillRect.mock.calls[0][1] + context.fillRect.mock.calls[0][3]).toBeLessThan(canvas.height);
    });

    it('follows owner cue changes, track off and seeking without changing the source', () => {
        const { reader, surface, track, video, cue, text } = setup();
        expect(reader.read().text).toBe('Technical caption');
        reader.read();
        expect(cue.getCueAsHTML).toHaveBeenCalledTimes(1);
        cue.text = 'Changed';
        text.textContent = 'Changed';
        expect(reader.read().text).toBe('Changed');
        Object.defineProperty(video, 'seeking', { configurable: true, value: true });
        expect(reader.read().text).toBe('');
        Object.defineProperty(video, 'seeking', { value: false });
        track.mode = 'disabled';
        expect(reader.read().text).toBe('');
        track.mode = 'showing';
        track.activeCues = [];
        expect(reader.read().text).toBe('');
        expect(surface.release).not.toHaveBeenCalled();
        expect(video.currentTime).toBe(0);
        expect(track.mode).toBe('showing');
    });

    it('reads safe text with line breaks and both active tracks, never injecting HTML', () => {
        const { reader, fragment, setCustom } = setup();
        fragment.append(document.createElement('br'), document.createTextNode('Second line'));
        const custom = document.createElement('div');
        custom.innerHTML = '<b>Secondary text</b><br><script>not caption text</script>Next line';
        setCustom({ textElements: [null, custom], unsupportedRenderer: null });
        expect(reader.read().text).toBe('Technical caption\nSecond line\nSecondary text\nNext line');
        custom.classList.add('hide');
        expect(reader.read().text).toBe('Technical caption\nSecond line');
    });

    it('clears stale captions and reports unsupported renderers without leaking cue content', () => {
        const { reader, setCustom, surface } = setup();
        for (const unsupportedRenderer of ['ASS', 'bitmap'] as const) {
            setCustom({ textElements: [], unsupportedRenderer });
            expect(reader.read()).toEqual({
                text: '', status: `${unsupportedRenderer} subtitles need a separate composition test. Use the ordinary player.`, warning: true
            });
        }
        surface.isCurrent.mockReturnValue(false);
        expect(reader.read()).toEqual({ text: '', status: 'Subtitle source ended.' });
    });

    it('bounds long, unbroken and multiline layouts without silently dropping words', () => {
        const measure = (value: string) => value.length;
        expect(wrapSubtitle('one two three', measure, 7)).toEqual(['one two', 'three']);
        expect(wrapSubtitle('abcdefgh', measure, 4)).toEqual(['abcd', 'efgh']);
        expect(wrapSubtitle('a\nb', measure, 4)).toEqual(['a', 'b']);
        expect(wrapSubtitle('x\n'.repeat(6), measure, 40)).toBeNull();
        expect(wrapSubtitle('x'.repeat(2001), measure, 40)).toBeNull();
    });

    it('uploads only changed frames, clears cue gaps and reports overflow once', () => {
        const { surface, track, cue, text } = setup();
        const context = {
            clearRect: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), strokeText: vi.fn(),
            measureText: (value: string) => ({ width: value.length * 30 })
        };
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
        const artwork = createSubtitleArtwork(surface, canvas);
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(true);
        expect(context.fillText).toHaveBeenCalledExactlyOnceWith('Technical caption', 800, 300);
        expect(artwork.update()).toBe(false);
        cue.text = 'x'.repeat(2001);
        text.textContent = cue.text;
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(true);
        expect(artwork.readStatus()).toContain('exceeds');
        expect(context.fillText).toHaveBeenCalledWith('Subtitle layout unavailable.', 800, 268);
        expect(artwork.update()).toBe(false);
        track.activeCues = [];
        expect(artwork.update()).toBe(true);
        expect(artwork.isVisible()).toBe(false);
        expect(artwork.readStatus()).toContain('No active');
    });
});
