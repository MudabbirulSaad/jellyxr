import type { PgsRenderer, SubtitleRendererEvent } from 'libbitsub';

import type { BorrowedSubtitleSurface } from '../media/borrowVideoSurface';
import { createCanvasSubtitleArtwork } from '../media/canvasSubtitles';
import { createPgsContent } from './pgsContent';

/** Copies inside libbitsub's post-render callback before an unpreserved GPU buffer can clear. */
export async function installPgsFixture(video: HTMLVideoElement, onError: () => void, onBackend: (name: string) => void) {
    const { PgsRenderer: Renderer } = await import('libbitsub');
    let disposed = false;
    let failed = false;
    let enabled = true;
    let revision = 0;
    const canvas = document.createElement('canvas');
    // libbitsub 1.11.0 declares this field protected, but it is an ordinary runtime field.
    const ownerCanvas = () => (renderer as unknown as { canvas?: HTMLCanvasElement } | undefined)?.canvas;
    const capture = createCanvasSubtitleArtwork({
        video, isCurrent: () => !disposed, release: () => undefined,
        readSubtitles: () => ({
            textElements: [], unsupportedRenderer: null,
            canvas: ownerCanvas() ? { canvas: ownerCanvas()!, revision: String(revision), format: 'PGS' } : null
        })
    }, canvas);
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
            revision++;
            capture.update();
        }
    };
    const renderer: PgsRenderer = new Renderer({
        video, subContent: createPgsContent(), onLoaded: () => loaded(),
        onEvent: handleEvent,
        onError: () => {
            failed = true;
            rejected();
            onError();
        }
    });
    try {
        // Disposal before this renderer's async init finishes can otherwise leave a late canvas.
        await ready;
    } catch (error) {
        renderer.dispose();
        throw error;
    }
    return {
        read: (): BorrowedSubtitleSurface => ({
            textElements: [], unsupportedRenderer: enabled && (failed || !!capture.readWarning()) ? 'bitmap' : null,
            canvas: enabled && !disposed && capture.isVisible() ? { canvas, revision: String(revision), format: 'PGS' } : null
        }),
        setEnabled(value: boolean) {
            enabled = value;
            const source = ownerCanvas();
            if (source) source.style.visibility = value ? '' : 'hidden';
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            renderer?.dispose();
            canvas.width = canvas.height = 0;
        }
    };
}
