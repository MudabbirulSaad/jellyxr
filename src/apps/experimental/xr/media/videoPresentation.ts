import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';

export type VideoPresentationMode = 'media-layer' | 'video-texture';

export interface VideoPresentationResource {
    update(): void;
    readSubtitleStatus?(): string;
    dispose(): void;
}

export interface VideoPresentationBackend {
    createTexture(surface: BorrowedVideoSurface, screenPercent: number, pose: ScreenPose): VideoPresentationResource;
    createLayer(surface: BorrowedVideoSurface, session: XRSession, space: XRReferenceSpace, screenPercent: number, pose: ScreenPose): VideoPresentationResource;
}

/** Letterbox within the shared screen; never stretch the video's encoded aspect ratio. */
export function fitVideoScreen(width: number, height: number, screenPercent = 100): { width: number; height: number } {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error('Video dimensions are unavailable.');
    }
    const screen = screenGeometry(screenPercent);
    const scale = Math.min(screen.width / width, screen.height / height);
    return { width: width * scale, height: height * scale };
}

/** Owns presentation resources and observation, never the media element's playback state. */
export class VideoPresentation {
    private surface?: BorrowedVideoSurface;
    private mode: VideoPresentationMode = 'media-layer';
    private resource?: VideoPresentationResource;
    private session: XRSession | null = null;
    private space: XRReferenceSpace | null = null;
    private dimensions = '';
    private screenPercent = 100;
    private screenPose = DEFAULT_SCREEN_POSE;
    private failed = false;
    private status = 'No video attached.';

    constructor(private readonly backend: VideoPresentationBackend) {}

    attach(surface: BorrowedVideoSurface | null, mode: VideoPresentationMode): void {
        this.dispose();
        this.surface = surface || undefined;
        this.mode = mode;
        this.failed = false;
        this.status = surface ? 'Waiting for video frames.' : 'No video attached.';
    }

    readStatus(): string {
        return this.status;
    }

    update(session: XRSession | null, space: XRReferenceSpace | null, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE): void {
        const surface = this.surface;
        if (!surface) return;
        if (!surface.isCurrent()) {
            this.dispose();
            this.status = 'The player changed or stopped. Attach the current video again.';
            return;
        }
        const { video } = surface;
        const dimensions = `${video.videoWidth}x${video.videoHeight}`;
        // Replace only owned resources on session, stream or deliberate screen-placement changes.
        if (session !== this.session || space !== this.space || dimensions !== this.dimensions || screenPercent !== this.screenPercent
            || pose.distance !== this.screenPose.distance || pose.height !== this.screenPose.height || pose.tilt !== this.screenPose.tilt) {
            this.clearResource();
            this.session = session;
            this.space = space;
            this.dimensions = dimensions;
            this.screenPercent = screenPercent;
            this.screenPose = { ...pose };
            this.failed = false;
        }
        if (this.failed) return;
        if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
            this.status = 'Waiting for video frames.';
            return;
        }
        if (this.mode === 'media-layer' && (!session || !space)) {
            this.status = 'Video attached. Enter XR to test the media layer.';
            return;
        }
        try {
            if (!this.resource) {
                this.resource = this.mode === 'media-layer' && session && space ?
                    this.backend.createLayer(surface, session, space, screenPercent, pose) : this.backend.createTexture(surface, screenPercent, pose);
            }
            this.resource.update();
            this.status = this.mode === 'media-layer' ?
                `Media underlay attached. ${this.resource.readSubtitleStatus?.() || 'Caption composition remains unqualified.'} Alpha and occlusion need headset testing.` :
                `Video texture attached. ${this.resource.readSubtitleStatus?.() || 'Subtitle and colour qualification remain open.'}`;
        } catch {
            this.clearResource();
            this.failed = true;
            this.status = this.mode === 'media-layer' ?
                'Media layer unavailable or rejected. Select Video texture and attach again to compare.' :
                'Video upload failed. Check media-origin access, then attach again.';
        }
    }

    private clearResource(): void {
        const resource = this.resource;
        this.resource = undefined;
        // A dying XR session may reject a render-state change; still release the lease below.
        try {
            resource?.dispose();
        } catch {
            // Session recovery is reported by the next attachment.
        }
    }

    /** Drop session/GPU resources immediately, keeping the borrowed owner available for recovery. */
    interrupt(): void {
        this.clearResource();
        this.session = null;
        this.space = null;
        this.dimensions = '';
        this.failed = false;
        this.status = this.surface ? 'Video presentation interrupted. Resume deliberately after recovery.' : 'No video attached.';
    }

    dispose(): void {
        this.interrupt();
        this.surface?.release();
        this.surface = undefined;
        this.status = 'No video attached.';
    }
}
