import { screenGeometry } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { attachMediaLayer } from './mediaLayer';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

interface SubmittedLayers {
    layers: XRLayer[];
    ended: boolean;
}

// The comparison owns subsequent composition updates. renderState can lag until the next XR frame.
const submittedLayers = new WeakMap<XRSession, SubmittedLayers>();

function layersForSession(session: XRSession): SubmittedLayers {
    let state = submittedLayers.get(session);
    if (!state) {
        const created = { layers: [...(session.renderState.layers || [])], ended: false };
        const projection = created.layers[0] as XRProjectionLayer | undefined;
        if (created.layers.length !== 1 || !projection || typeof projection.blendTextureSourceAlpha !== 'boolean') {
            // Do not cache an initial renderState whose projection update has not applied yet.
            throw new Error('An alpha-capable renderer projection is required.');
        }
        state = created;
        submittedLayers.set(session, created);
        // Run before ordinary recovery listeners dispose presentation on the same event.
        session.addEventListener('end', () => {
            created.ended = true;
            created.layers = [];
        }, { once: true, capture: true });
    }
    return state;
}

/** The experiment owns the media layer; each renderer retains its projection layer. */
export function createNativeMediaLayer(
    surface: BorrowedVideoSurface, session: XRSession, space: XRReferenceSpace,
    createProjectionContent: (screenPercent: number) => VideoPresentationResource, screenPercent = 100
): VideoPresentationResource {
    if (typeof XRMediaBinding === 'undefined' || typeof XRRigidTransform === 'undefined') {
        throw new Error('Native media layers are unavailable.');
    }
    // Called from a render frame after the renderer's initial projection update has applied.
    const state = layersForSession(session);
    if (state.ended) throw new Error('The XR session has ended.');
    // Each comparison renderer currently supplies exactly one projection layer.
    const projection = state.layers[0] as XRProjectionLayer | undefined;
    if (state.layers.length !== 1 || !projection || typeof projection.blendTextureSourceAlpha !== 'boolean') {
        throw new Error('An alpha-capable renderer projection is required.');
    }
    const priorAlpha = projection.blendTextureSourceAlpha;
    const dimensions = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight, screenPercent);
    const [x, y, z] = screenGeometry(screenPercent).videoPosition;
    const binding = new XRMediaBinding(session);
    const attachment = attachMediaLayer(surface, {
        readLayers: () => state.layers,
        updateLayers(next) {
            void session.updateRenderState({ layers: next });
            state.layers = next;
        },
        isSessionEnded: () => state.ended
    }, video => binding.createQuadLayer(video, {
        space, layout: 'mono', ...dimensions,
        // eslint-disable-next-line compat/compat -- Feature-tested above; this optional path runs only inside XR.
        transform: new XRRigidTransform({ x, y, z })
    }));
    let content: VideoPresentationResource | undefined;
    let disposed = false;
    const dispose = () => {
        if (disposed) return;
        disposed = true;
        try {
            content?.dispose();
        } finally {
            try {
                attachment.detach();
            } finally {
                if (!state.ended) projection.blendTextureSourceAlpha = priorAlpha;
            }
        }
    };
    try {
        projection.blendTextureSourceAlpha = true;
        if (!projection.blendTextureSourceAlpha) throw new Error('Projection alpha was rejected.');
        content = createProjectionContent(screenPercent);
    } catch (error) {
        dispose();
        throw error;
    }
    return {
        update() {
            if (!attachment.isCurrent()) throw new Error('Media presentation ended.');
            content?.update();
        },
        readSubtitleStatus: () => content?.readSubtitleStatus?.() || 'Caption composition is not yet qualified.',
        dispose
    };
}
