import { describe, expect, it, vi } from 'vitest';

import { BitmapPresentation } from 'plugins/htmlVideoPlayer/bitmapPresentation';

function setup() {
    const source = document.createElement('canvas');
    source.width = 640;
    source.height = 360;
    const context = { clearRect: vi.fn(), drawImage: vi.fn(), getImageData: vi.fn() };
    const snapshots: HTMLCanvasElement[] = [];
    const allocate = vi.fn(() => {
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
        snapshots.push(canvas);
        return canvas;
    });
    const renderer = { canvas: source, updateCanvasSize: vi.fn() };
    const presentation = new BitmapPresentation(allocate);
    presentation.setRenderer(renderer);
    return { presentation, renderer, context, allocate, snapshots };
}

describe('bitmap presentation consumers', () => {
    it('allocates only for consumers, requests a fresh owner frame and releases the last copy once', () => {
        const { presentation, renderer, allocate, context, snapshots } = setup();
        presentation.capture(renderer);
        expect(allocate).not.toHaveBeenCalled();
        const first = presentation.acquire();
        const second = presentation.acquire();
        expect(renderer.updateCanvasSize).toHaveBeenCalledExactlyOnceWith();
        expect(presentation.read()).toBeNull();
        presentation.capture(renderer);
        expect(context.drawImage).toHaveBeenCalledExactlyOnceWith(renderer.canvas, 0, 0);
        expect(presentation.read()?.format).toBe('PGS');
        first();
        first();
        expect(presentation.read()).not.toBeNull();
        second();
        expect(presentation.read()).toBeNull();
        expect([snapshots[0].width, snapshots[0].height]).toEqual([0, 0]);
        presentation.capture(renderer);
        expect(context.drawImage).toHaveBeenCalledTimes(1);
        const again = presentation.acquire();
        expect(renderer.updateCanvasSize).toHaveBeenCalledTimes(2);
        presentation.capture(renderer);
        expect(allocate).toHaveBeenCalledTimes(2);
        again();
        expect([renderer.canvas.width, renderer.canvas.height]).toEqual([640, 360]);
    });

    it('clears track replacements and ignores late events from old renderers', () => {
        const { presentation, renderer, context } = setup();
        const release = presentation.acquire();
        presentation.capture(renderer);
        const old = presentation.read();
        const next = { canvas: document.createElement('canvas'), updateCanvasSize: vi.fn() };
        next.canvas.width = 1280;
        next.canvas.height = 720;
        presentation.setRenderer(next, 'VobSub');
        expect(presentation.read()).toBeNull();
        expect(old?.canvas.width).toBe(0);
        presentation.capture(renderer);
        expect(context.drawImage).toHaveBeenCalledTimes(1);
        presentation.capture(next);
        expect(next.updateCanvasSize).toHaveBeenCalledOnce();
        expect(presentation.read()?.format).toBe('VobSub');
        expect(presentation.read()?.revision).not.toBe(old?.revision);
        presentation.invalidate(renderer);
        expect(presentation.read()).not.toBeNull();
        presentation.invalidate(next);
        presentation.capture(next);
        expect(presentation.read()).toBeNull();
        release();
    });

    it('contains origin, allocation, size and redraw failures without touching owner storage', () => {
        const { presentation, renderer, context, allocate } = setup();
        renderer.updateCanvasSize.mockImplementationOnce(() => {
            throw new Error('private source detail');
        });
        const release = presentation.acquire();
        context.getImageData.mockImplementationOnce(() => {
            throw new Error('private origin detail');
        });
        expect(() => presentation.capture(renderer)).not.toThrow();
        expect(presentation.read()).toBeNull();
        renderer.canvas.width = 8192;
        presentation.capture(renderer);
        expect(allocate).toHaveBeenCalledTimes(1);
        renderer.canvas.width = 640;
        allocate.mockImplementationOnce(() => {
            throw new Error('canvas allocation failure');
        });
        expect(() => presentation.capture(renderer)).not.toThrow();
        expect(presentation.read()).toBeNull();
        presentation.capture(renderer);
        expect(presentation.read()).not.toBeNull();
        release();
        expect([renderer.canvas.width, renderer.canvas.height]).toEqual([640, 360]);
    });
});
