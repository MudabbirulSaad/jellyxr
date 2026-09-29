import { FIXTURE_LIBRARY, FIXTURE_SEAT, type Point3 } from '../fixtures/roomFixture';

import { applyMovement, INITIAL_VIEWER_ROOT, inverseReferenceTransform, snapViewer, teleportViewer, type ViewerRoot } from './movement';

export type MovementAction = 'turn-left' | 'turn-right' | 'library-position' | 'return-seat';

export function movementAction(action: string): MovementAction | null {
    switch (action) {
        case 'turn-left':
        case 'turn-right':
        case 'library-position':
        case 'return-seat':
            return action;
        default:
            return null;
    }
}

/** Queues deliberate movement for a valid animation frame; never retains an expired XRFrame. */
export class MovementSession {
    private root: ViewerRoot = INITIAL_VIEWER_ROOT;
    private session: XRSession | null = null;
    private baseSpace: XRReferenceSpace | null = null;
    private pending: MovementAction | Point3 | null = null;

    constructor(private readonly pauseForMovement: () => void) {}

    request(action: MovementAction): void {
        this.pending = action;
    }

    requestDestination(point: Point3): void {
        this.pending = [point[0], point[1], point[2]];
    }

    update(
        session: XRSession | null, space: XRReferenceSpace | null, frame: XRFrame | undefined,
        setSpace: (space: XRReferenceSpace) => void, setDesktopRoot: (root: ViewerRoot) => void
    ): boolean {
        if (session !== this.session) {
            this.session?.removeEventListener('visibilitychange', this.cancel);
            this.session?.removeEventListener('end', this.cancel);
            this.session = session;
            session?.addEventListener('visibilitychange', this.cancel);
            session?.addEventListener('end', this.cancel);
            this.baseSpace = space;
            this.root = INITIAL_VIEWER_ROOT;
            this.pending = null;
        }
        if (!this.pending) return false;
        if (session && (!frame || !this.baseSpace || session.visibilityState !== 'visible')) {
            this.pending = null;
            return false;
        }
        let tracked: Point3 = [0, 1.65, 0];
        if (session && frame && this.baseSpace) {
            const pose = frame.getViewerPose(this.baseSpace);
            if (!pose) {
                this.pending = null;
                return false;
            }
            const { x, y, z } = pose.transform.position;
            tracked = [x, y, z];
        }
        const action = this.pending;
        this.pending = null;
        const next = this.plan(action, tracked);
        if (!next) return false;
        const nextSpace = this.offsetSpace(next);
        if (session && !nextSpace) return false;
        return applyMovement(next, {
            pauseForMovement: this.pauseForMovement,
            applyRoot: root => {
                if (nextSpace) setSpace(nextSpace);
                else setDesktopRoot(root);
                this.root = root;
            }
        });
    }

    private plan(action: MovementAction | Point3, tracked: Point3): ViewerRoot | null {
        if (typeof action !== 'string') return teleportViewer(this.root, tracked, action);
        if (action === 'turn-left') return snapViewer(this.root, tracked, 1);
        if (action === 'turn-right') return snapViewer(this.root, tracked, -1);
        return teleportViewer(this.root, tracked, action === 'return-seat' ? FIXTURE_SEAT : FIXTURE_LIBRARY);
    }

    private offsetSpace(root: ViewerRoot): XRReferenceSpace | undefined {
        if (!this.session || !this.baseSpace || typeof XRRigidTransform === 'undefined') return undefined;
        const { position: p, orientation: q } = inverseReferenceTransform(root);
        // eslint-disable-next-line compat/compat -- Guarded optional WebXR experiment; ordinary preview uses its desktop camera.
        return this.baseSpace.getOffsetReferenceSpace(new XRRigidTransform(
            { x: p[0], y: p[1], z: p[2] }, { x: q[0], y: q[1], z: q[2], w: q[3] }
        ));
    }

    cancel = (): void => {
        this.pending = null;
    };

    dispose(): void {
        this.cancel();
        this.session?.removeEventListener('visibilitychange', this.cancel);
        this.session?.removeEventListener('end', this.cancel);
        this.session = null;
        this.baseSpace = null;
    }
}
