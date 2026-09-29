import type { PgsRenderer, SubtitleRendererEvent } from 'libbitsub';
import { BitmapPresentation, type BitmapPresentationRenderer } from 'plugins/htmlVideoPlayer/bitmapPresentation';

import type { BorrowedSubtitleSurface } from '../media/borrowVideoSurface';
import { createPgsContent } from './pgsContent';

/** Copies inside libbitsub's post-render callback before an unpreserved GPU buffer can clear. */
export async function installPgsFixture(video: HTMLVideoElement, onError: () => void, onBackend: (name: string) => void) {
    const { PgsRenderer: Renderer } = await import('libbitsub');
    let disposed = false;
    let failed = false;
    let enabled = true;
    const presentation = new BitmapPresentation();
    // libbitsub 1.11.0 declares this field protected, but it is an ordinary runtime field.
    const ownerCanvas = () => (renderer as unknown as { canvas?: HTMLCanvasElement } | undefined)?.canvas;
    let loaded: () => void;
    let rejected: () => void;
    const ready = new Promise<void>((resolve, reject) => {
        loaded = resolve;
        rejected = () => reject(new Error('PGS fixture could not load.'));
    });
    const handleEvent = (event: SubtitleRendererEvent) => {
        if (disposed) return;
        if (event.type === 'renderer-change') onBackend(event.renderer);
        if (event.type === 'stats') {
            presentation.capture(renderer as unknown as BitmapPresentationRenderer);
        }
    };
    const renderer: PgsRenderer = new Renderer({
        video, subContent: createPgsContent(), onLoaded: () => loaded(),
        onEvent: handleEvent,
        onError: () => {
            failed = true;
            presentation.setRenderer(null);
            rejected();
            onError();
        }
    });
    presentation.setRenderer(renderer as unknown as BitmapPresentationRenderer, 'PGS');
    try {
        // Disposal before this renderer's async init finishes can otherwise leave a late canvas.
        await ready;
    } catch (error) {
        presentation.setRenderer(null);
        renderer.dispose();
        throw error;
    }
    return {
        acquire: () => presentation.acquire(),
        read: (): BorrowedSubtitleSurface => {
            const canvas = enabled && !disposed && !failed ? presentation.read() : null;
            return { textElements: [], unsupportedRenderer: enabled && !canvas ? 'bitmap' : null, canvas };
        },
        setEnabled(value: boolean) {
            enabled = value;
            const source = ownerCanvas();
            if (source) source.style.visibility = value ? '' : 'hidden';
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            presentation.setRenderer(null);
            renderer?.dispose();
        }
    };
}
