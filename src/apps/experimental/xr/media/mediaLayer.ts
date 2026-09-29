import type { BorrowedVideoSurface } from './borrowVideoSurface';

export interface MediaLayerHost {
    /** Owner's submitted list, including pending updates; a legacy base layer is insufficient. */
    readLayers(): readonly XRLayer[];
    updateLayers(layers: XRLayer[]): void;
    isSessionEnded(): boolean;
}

export interface MediaLayerAttachment {
    isCurrent(): boolean;
    detach(): void;
}

/** The caller supplies the feature-tested XRMediaBinding operation and reference-space geometry. */
export function attachMediaLayer(
    surface: BorrowedVideoSurface,
    host: MediaLayerHost,
    createLayer: (video: HTMLVideoElement) => XRQuadLayer
): MediaLayerAttachment {
    if (host.isSessionEnded()) throw new Error('The XR session has ended.');
    if (!surface.isCurrent()) throw new Error('The borrowed video is no longer current.');
    const layers = host.readLayers();
    if (!layers.length) throw new Error('A renderer projection layer is required before attaching video.');

    const layer = createLayer(surface.video);
    try {
        host.updateLayers([...layers, layer]);
    } catch (error) {
        layer.destroy();
        throw error;
    }

    let attached = true;
    const detach = () => {
        if (!attached) return;
        // Remove only our layer; preserve renderer/subtitle layers added after attachment.
        attached = false;
        try {
            if (!host.isSessionEnded()) {
                host.updateLayers(host.readLayers().filter(candidate => candidate !== layer));
            }
        } finally {
            layer.destroy();
        }
    };

    return {
        isCurrent() {
            if (attached && (host.isSessionEnded() || !surface.isCurrent())) detach();
            return attached;
        },
        detach
    };
}
