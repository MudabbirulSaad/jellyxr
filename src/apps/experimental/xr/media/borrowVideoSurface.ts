import Events from 'utils/events';

export interface BorrowedSubtitleSurface {
    readonly textElements: readonly (HTMLElement | null | undefined)[];
    readonly unsupportedRenderer: 'ASS' | 'bitmap' | null;
    readonly canvas?: { canvas: HTMLCanvasElement; revision?: string; format: 'ASS' | 'PGS' | 'VobSub' } | null;
}

export interface VideoPresentationPlayer {
    id: string;
    isLocalPlayer?: boolean;
    getVideoPresentationSurface?(): HTMLVideoElement | null;
    getSubtitlePresentationSurface?(): BorrowedSubtitleSurface;
    acquireSubtitlePresentation?(): () => void;
}

export interface VideoPresentationOwner {
    getCurrentPlayer(): VideoPresentationPlayer | null | undefined;
}

export type VideoInvalidationReason = 'playback-stopped' | 'player-changed' | 'media-replaced' | 'media-error';

export interface BorrowedVideoSurface {
    /** Read frames only. Never set source, tracks, muted, autoplay or currentTime here. */
    readonly video: HTMLVideoElement;
    readSubtitles?(): BorrowedSubtitleSurface | undefined;
    isCurrent(): boolean;
    /** Releases observation only; never pauses, unloads or removes the owner's video. */
    release(): void;
}

/** Observes the existing owner without starting media or creating a progress reporter. */
export function borrowVideoSurface(
    owner: VideoPresentationOwner,
    onInvalidated: (reason: VideoInvalidationReason) => void
): BorrowedVideoSurface | null {
    const player = owner.getCurrentPlayer();
    if (!player?.isLocalPlayer || player.id !== 'htmlvideoplayer') return null;
    const video = player.getVideoPresentationSurface?.();
    if (!video) return null;

    let current = true;
    let releaseSubtitles: (() => void) | undefined;
    let observingSubtitles = false;
    const release = () => {
        if (!current) return;
        current = false;
        Events.off(owner, 'playbackstop', stopped);
        Events.off(owner, 'playerchange', changed);
        video.removeEventListener('emptied', replaced);
        video.removeEventListener('error', failed);
        video.removeEventListener('abort', replaced);
        releaseSubtitles?.();
    };
    const invalidate = (reason: VideoInvalidationReason) => {
        if (!current) return;
        release();
        onInvalidated(reason);
    };
    const stopped = () => invalidate('playback-stopped');
    const changed = () => invalidate('player-changed');
    const replaced = () => invalidate('media-replaced');
    const failed = () => invalidate('media-error');

    Events.on(owner, 'playbackstop', stopped);
    Events.on(owner, 'playerchange', changed);
    video.addEventListener('emptied', replaced);
    video.addEventListener('error', failed);
    video.addEventListener('abort', replaced);

    return {
        video,
        readSubtitles() {
            if (!current) return;
            // A video-only media layer does not need the optional subtitle copy.
            if (!observingSubtitles) {
                releaseSubtitles = player.acquireSubtitlePresentation?.();
                observingSubtitles = true;
            }
            return player.getSubtitlePresentationSurface?.();
        },
        isCurrent() {
            if (current && (owner.getCurrentPlayer() !== player || player.getVideoPresentationSurface?.() !== video)) {
                invalidate('media-replaced');
            }
            return current;
        },
        release
    };
}
