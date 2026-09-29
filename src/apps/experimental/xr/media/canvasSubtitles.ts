import type { BorrowedVideoSurface } from './borrowVideoSurface';

/** Copies presentation pixels only. Its canvas is disposable; the source belongs to the player. */
export function createCanvasSubtitleArtwork(surface: BorrowedVideoSurface, canvas: HTMLCanvasElement) {
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Subtitle canvas copy is unavailable.');
    let source: HTMLCanvasElement | undefined;
    let revision: string | undefined;
    let visible = false;
    let warning: string | undefined;
    let format: 'ASS' | 'PGS' | 'VobSub' = 'ASS';
    const clear = () => {
        const changed = visible;
        if (visible) context.clearRect(0, 0, canvas.width, canvas.height);
        visible = false;
        source = undefined;
        revision = undefined;
        return changed;
    };
    return {
        update(force = false): boolean {
            warning = undefined;
            if (!surface.isCurrent() || surface.video.seeking) return clear();
            const presentation = surface.readSubtitles?.()?.canvas;
            if (!presentation) return clear();
            const next = presentation.canvas;
            const width = next.width;
            const height = next.height;
            if (!width || !height || width > 4096 || height > 4096 || width * height > 8847360) {
                warning = 'Subtitle canvas size is unavailable for this comparison. Use the ordinary player.';
                return clear();
            }
            const aspect = surface.video.videoWidth / surface.video.videoHeight;
            if (!Number.isFinite(aspect) || Math.abs(width / height / aspect - 1) > 0.02) {
                warning = 'Subtitle canvas does not match the video layout. Use the ordinary player.';
                return clear();
            }
            if (!force && visible && source === next && presentation.revision !== undefined && revision === presentation.revision
                && canvas.width === width && canvas.height === height) return false;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            try {
                context.clearRect(0, 0, width, height);
                context.drawImage(next, 0, 0);
                // Validate origin access once per source, without retaining/exporting pixel data.
                if (source !== next) context.getImageData(0, 0, 1, 1);
            } catch {
                // A failed origin check taints the destination too. Reset only our copy.
                canvas.width = width;
                warning = 'Subtitle canvas could not be copied. Use the ordinary player.';
                return clear();
            }
            source = next;
            revision = presentation.revision;
            format = presentation.format;
            visible = true;
            return true;
        },
        isVisible: () => visible,
        readWarning: () => warning,
        readStatus: () => `Borrowed ${format} canvas; timing and headset readability remain unqualified.`
    };
}
