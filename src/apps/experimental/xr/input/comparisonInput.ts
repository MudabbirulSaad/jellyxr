import type { Point3 } from '../fixtures/roomFixture';

import { ActivationState } from './activationState';
import { CONTROL_TARGETS, hitControl, type ControlAction, type InputRay } from './controlTargets';

/** Uses one native select event stream for controller trigger and hand pinch; never gaze. */
export class ComparisonInput {
    readonly state = new ActivationState();
    private session: XRSession | null = null;
    private space: XRReferenceSpace | null = null;
    private ids = new Map<XRInputSource, string>();
    private nextId = 0;
    private selectionCount = 0;
    private lastAction = 'No spatial action yet.';
    private lastPointer = 'No desktop pointer event.';

    constructor(private readonly onAction: (action: ControlAction) => void) {}

    private id(source: XRInputSource): string {
        let id = this.ids.get(source);
        if (!id) {
            id = `input-${this.nextId++}`;
            this.ids.set(source, id);
        }
        return id;
    }

    private target(frame: XRFrame, source: XRInputSource): ControlAction | null {
        if (!this.space || source.targetRayMode !== 'tracked-pointer') return null;
        const pose = frame.getPose(source.targetRaySpace, this.space);
        if (!pose) return null;
        let near: Point3 | undefined;
        if (source.hand) {
            const joint = source.hand.get('index-finger-tip');
            const tip = joint && frame.getJointPose?.(joint, this.space);
            // A stale emulated hand ray cannot keep an activation alive after joint loss.
            if (!tip) return null;
            const { x, y, z } = tip.transform.position;
            near = [x, y, z];
        }
        const m = pose.transform.matrix;
        return hitControl({ origin: [m[12], m[13], m[14]], direction: [-m[8], -m[9], -m[10]] },
            near || [m[12], m[13], m[14]]);
    }

    private start = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible') return;
        this.state.begin(this.id(event.inputSource), this.target(event.frame, event.inputSource));
    };

    private select = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible') return;
        this.perform(this.state.commit(this.id(event.inputSource), this.target(event.frame, event.inputSource)));
    };

    private end = (event: XRInputSourceEvent) => this.state.cancel(this.id(event.inputSource));
    private visibility = () => this.state.cancel();
    private changed = (event: XRInputSourcesChangeEvent) => {
        for (const source of event.removed) {
            this.state.cancel(this.id(source));
            this.ids.delete(source);
        }
    };

    private perform(action: ControlAction | null): void {
        if (!action) return;
        if (action === 'select-fixture') this.selectionCount++;
        if (action === 'reset-count') this.selectionCount = 0;
        this.lastAction = action;
        this.onAction(action);
    }

    update(session: XRSession | null, space: XRReferenceSpace | null, frame?: XRFrame): void {
        if (session !== this.session) {
            this.unbind();
            this.session = session;
            session?.addEventListener('selectstart', this.start);
            session?.addEventListener('select', this.select);
            session?.addEventListener('selectend', this.end);
            session?.addEventListener('inputsourceschange', this.changed);
            session?.addEventListener('visibilitychange', this.visibility);
            session?.addEventListener('end', this.visibility);
        }
        this.space = space;
        if (!session || !frame || session.visibilityState !== 'visible') {
            if (session) this.state.cancel();
            return;
        }
        const owner = this.state.read().source;
        let observed = false;
        for (const source of session.inputSources) {
            const id = this.id(source);
            if (owner && owner !== id) continue;
            const target = this.target(frame, source);
            if (owner || target) {
                this.state.observe(id, target);
                observed = true;
                break;
            }
        }
        if (!observed) this.state.cancel();
    }

    /** Desktop ray uses the same world-space hit bounds and explicit down/up policy. */
    pointer(phase: 'move' | 'down' | 'up' | 'cancel', ray: InputRay | null): void {
        if (this.session) return;
        const target = hitControl(ray);
        this.lastPointer = `${phase}: ${target || 'no target'}`;
        if (phase === 'move') this.state.observe('desktop', target);
        if (phase === 'down') this.state.begin('desktop', target);
        if (phase === 'up') this.perform(this.state.commit('desktop', target));
        if (phase === 'cancel') this.state.cancel();
    }

    key(phase: 'down' | 'up', key: string): void {
        if (this.session) return;
        const focus = this.state.read().focus;
        if (key === 'Escape') this.state.cancel();
        if (phase === 'down' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
            const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
            const index = CONTROL_TARGETS.findIndex(target => target.id === focus);
            const next = (index + direction + CONTROL_TARGETS.length) % CONTROL_TARGETS.length;
            this.state.cancel();
            this.state.observe('keyboard', CONTROL_TARGETS[next].id);
        }
        if (key === 'Enter' || key === ' ') {
            if (phase === 'down') this.state.begin('keyboard', focus || CONTROL_TARGETS[0].id);
            else this.perform(this.state.commit('keyboard', this.state.read().focus));
        }
    }

    readStatus(): string {
        return `${this.selectionCount} deliberate fixture selections. Last action: ${this.lastAction} Pointer: ${this.lastPointer}`;
    }

    report(message: string): void {
        this.lastAction = message;
    }

    private unbind(): void {
        this.session?.removeEventListener('selectstart', this.start);
        this.session?.removeEventListener('select', this.select);
        this.session?.removeEventListener('selectend', this.end);
        this.session?.removeEventListener('inputsourceschange', this.changed);
        this.session?.removeEventListener('visibilitychange', this.visibility);
        this.session?.removeEventListener('end', this.visibility);
        this.ids.clear();
        this.state.cancel();
    }

    dispose(): void {
        this.unbind();
        this.session = null;
        this.space = null;
    }
}
