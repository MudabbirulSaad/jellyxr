import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { attachMediaLayer } from './mediaLayer';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

/** The experiment owns the media layer; each renderer retains its projection layer. */
export function createNativeMediaLayer(
    surface: BorrowedVideoSurface, session: XRSession, space: XRReferenceSpace
): VideoPresentationResource {
    if (typeof XRMediaBinding === 'undefined' || typeof XRRigidTransform === 'undefined') {
        throw new Error('Native media layers are unavailable.');
    }
    // Called from a render frame after the renderer's initial projection update has applied.
    let layers = [...(session.renderState.layers || [])];
    let ended = false;
    const onEnd = () => {
        ended = true;
    };
    const dimensions = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    const binding = new XRMediaBinding(session);
    const attachment = attachMediaLayer(surface, {
        readLayers: () => layers,
        updateLayers(next) {
            void session.updateRenderState({ layers: next });
            layers = next;
        },
        isSessionEnded: () => ended
    }, video => binding.createQuadLayer(video, {
        space, layout: 'mono', ...dimensions,
        // eslint-disable-next-line compat/compat -- Feature-tested above; this optional path runs only inside XR.
        transform: new XRRigidTransform({ x: 0, y: 2, z: -6.47 })
    }));
    session.addEventListener('end', onEnd);
    return {
        update() {
            if (!attachment.isCurrent()) throw new Error('Media presentation ended.');
        },
        dispose() {
            try {
                attachment.detach();
            } finally {
                session.removeEventListener('end', onEnd);
            }
        }
    };
}
