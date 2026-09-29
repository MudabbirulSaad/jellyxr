export interface BitmapPresentationRenderer {
    canvas?: HTMLCanvasElement | null;
    updateCanvasSize?(): void;
}

export type BitmapPresentationFormat = 'PGS' | 'VobSub';

/** Exact-version presentation seam for libbitsub 1.11.0; never owns its renderer or timeline. */
export class BitmapPresentation {
    private renderer?: BitmapPresentationRenderer | null;
    private format: BitmapPresentationFormat = 'PGS';
    private consumers = 0;
    private canvas?: HTMLCanvasElement;
    private context?: CanvasRenderingContext2D;
    private revision = 0;
    private ready = false;

    constructor(private readonly makeCanvas = () => document.createElement('canvas')) {}

    setRenderer(renderer: BitmapPresentationRenderer | null, format: BitmapPresentationFormat = 'PGS'): void {
        this.clear();
        this.renderer = renderer;
        this.format = format;
        if (this.consumers) this.requestFrame();
    }

    acquire(): () => void {
        this.consumers++;
        if (this.consumers === 1) this.requestFrame();
        let released = false;
        return () => {
            if (released) return;
            released = true;
            this.consumers--;
            if (!this.consumers) this.clear();
        };
    }

    invalidate(renderer?: BitmapPresentationRenderer | null): void {
        if (renderer && renderer === this.renderer) this.setRenderer(null);
    }

    private requestFrame(): void {
        // Existing owner path resets its render index even when paused, without changing settings.
        try {
            this.renderer?.updateCanvasSize?.();
        } catch {
            this.clear();
        }
    }

    /** Call synchronously from this renderer's stats event, before its GPU buffer can clear. */
    capture(renderer?: BitmapPresentationRenderer | null): void {
        if (!this.consumers || !renderer || renderer !== this.renderer) return;
        try {
            const source = renderer.canvas;
            if (!source || !source.width || !source.height || source.width > 4096 || source.height > 4096
                || source.width * source.height > 8847360) {
                this.clear();
                return;
            }
            if (!this.canvas) {
                this.canvas = this.makeCanvas();
                this.context = this.canvas.getContext('2d') || undefined;
            }
            if (!this.context) {
                this.clear();
                return;
            }
            if (this.canvas.width !== source.width) this.canvas.width = source.width;
            if (this.canvas.height !== source.height) this.canvas.height = source.height;
            this.context.clearRect(0, 0, source.width, source.height);
            this.context.drawImage(source, 0, 0);
            // Validate only our snapshot; never export pixels or exception details.
            this.context.getImageData(0, 0, 1, 1);
            this.revision++;
            this.ready = true;
        } catch {
            // Do not let an optional XR consumer interrupt the player's renderer callback.
            this.clear();
        }
    }

    read() {
        return this.ready && this.canvas && this.consumers ?
            { canvas: this.canvas, revision: String(this.revision), format: this.format } : null;
    }

    private clear(): void {
        this.ready = false;
        if (this.canvas) this.canvas.width = this.canvas.height = 0;
        this.canvas = undefined;
        this.context = undefined;
    }
}
