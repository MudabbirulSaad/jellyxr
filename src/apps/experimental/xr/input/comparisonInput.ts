import type { Point3 } from '../fixtures/roomFixture';

import { ActivationState } from './activationState';
import { hitControl, type ControlAction, type InputRay } from './controlTargets';
import type { RemoteGrab } from './remoteGrab';
import { ControlLayout, type ControlViewerPose } from './controlLayout';

/** Uses one native select event stream for controller trigger and hand pinch; never gaze. */
export class ComparisonInput {
    readonly state = new ActivationState();
    readonly layout = new ControlLayout();
    private session: XRSession | null = null;
    private space: XRReferenceSpace | null = null;
    private ids = new Map<XRInputSource, string>();
    private nextId = 0;
    private selectionCount = 0;
    private lastAction = 'No spatial action yet.';
    private lastPointer = 'No desktop pointer event.';

    constructor(private readonly onAction: (action: ControlAction) => void, private readonly grab?: RemoteGrab) {}

    summonControls(): void {
        this.cancel();
        this.layout.request();
    }

    private resolveTarget(ray: InputRay | null, near?: Point3): ControlAction | null {
        if (!ray || !ray.origin.every(Number.isFinite) || !ray.direction.every(Number.isFinite)
            || Math.hypot(...ray.direction) < 0.00001) return null;
        return hitControl(ray, near, this.layout.read(), this.layout.targets()) || 'summon-controls';
    }

    private updateLayout(frame?: XRFrame, desktopViewer?: ControlViewerPose): void {
        if (!this.layout.isPending()) return;
        let viewer = desktopViewer;
        if (this.session) {
            const pose = this.space && this.session.visibilityState === 'visible' && frame?.getViewerPose?.(this.space);
            viewer = undefined;
            if (pose) {
                const { position: p, matrix: m } = pose.transform;
                viewer = { position: [p.x, p.y, p.z], forward: [-m[8], -m[9], -m[10]] };
            }
        }
        const result = this.layout.update(viewer);
        if (result === 'placed') this.report('Controls placed here. They remain anchored until recalled.');
        if (result === 'recovery') this.report('Only recovery controls fit here. Return to seat for the full controls, or exit XR.');
        if (result === 'unavailable') this.report('Controls could not be placed safely. Face open room space and try again, or use the headset system exit.');
        if (!this.layout.targets().some(target => target.id === this.state.read().focus)) {
            this.state.observe('layout', this.layout.targets()[0].id);
        }
    }

    private anchor(frame: XRFrame, source: XRInputSource): Point3 | null {
        if (!this.space || source.targetRayMode !== 'tracked-pointer') return null;
        if (!source.hand) {
            const pose = source.gripSpace && frame.getPose(source.gripSpace, this.space);
            return pose ? [pose.transform.position.x, pose.transform.position.y, pose.transform.position.z] : null;
        }
        const index = source.hand.get('index-finger-tip');
        const thumb = source.hand.get('thumb-tip');
        const a = index && frame.getJointPose?.(index, this.space);
        const b = thumb && frame.getJointPose?.(thumb, this.space);
        if (!a || !b) return null;
        const p = a.transform.position;
        const q = b.transform.position;
        return [(p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2];
    }

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
        return this.resolveTarget({ origin: [m[12], m[13], m[14]], direction: [-m[8], -m[9], -m[10]] },
            near || [m[12], m[13], m[14]]);
    }

    private start = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible' || this.grab?.source()) return;
        const target = this.target(event.frame, event.inputSource);
        if (event.inputSource.hand && target === 'summon-controls' && this.beginGrab(event)) return;
        this.state.begin(this.id(event.inputSource), target);
    };

    private select = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible' || this.grab?.source()) return;
        this.perform(this.state.commit(this.id(event.inputSource), this.target(event.frame, event.inputSource)));
    };

    private end = (event: XRInputSourceEvent) => {
        this.state.cancel(this.id(event.inputSource));
        if (event.inputSource.hand) this.grab?.release(this.id(event.inputSource));
    };
    private beginGrab = (event: XRInputSourceEvent): boolean => {
        if (this.session?.visibilityState !== 'visible' || this.state.read().source) return false;
        const began = this.grab?.begin(this.id(event.inputSource), this.anchor(event.frame, event.inputSource)) || false;
        if (began) this.state.cancel();
        return began;
    };
    private squeeze = (event: XRInputSourceEvent) => {
        if (!event.inputSource.hand) this.beginGrab(event);
    };
    private unsqueeze = (event: XRInputSourceEvent) => {
        if (!event.inputSource.hand) this.grab?.release(this.id(event.inputSource));
    };
    cancel = (): void => {
        this.state.cancel();
        this.grab?.release();
        this.layout.cancel();
    };
    private changed = (event: XRInputSourcesChangeEvent) => {
        for (const source of event.removed) {
            this.state.cancel(this.id(source));
            this.grab?.release(this.id(source));
            this.ids.delete(source);
        }
    };

    private perform(action: ControlAction | null): void {
        if (!action) return;
        if (action === 'select-fixture') this.selectionCount++;
        if (action === 'reset-count') this.selectionCount = 0;
        if (action === 'summon-controls') this.summonControls();
        this.lastAction = action;
        this.onAction(action);
    }

    update(session: XRSession | null, space: XRReferenceSpace | null, frame?: XRFrame, desktopViewer?: ControlViewerPose): void {
        if (session !== this.session) {
            this.unbind();
            this.session = session;
            session?.addEventListener('selectstart', this.start);
            session?.addEventListener('select', this.select);
            session?.addEventListener('selectend', this.end);
            session?.addEventListener('squeezestart', this.squeeze);
            session?.addEventListener('squeezeend', this.unsqueeze);
            session?.addEventListener('inputsourceschange', this.changed);
            session?.addEventListener('visibilitychange', this.cancel);
            session?.addEventListener('end', this.cancel);
            this.layout.request();
        }
        this.space = space;
        this.updateLayout(frame, desktopViewer);
        if (!session || !frame || session.visibilityState !== 'visible') {
            if (session) this.cancel();
            return;
        }
        const grabOwner = this.grab?.source();
        if (grabOwner) {
            const source = Array.from(session.inputSources).find(value => this.id(value) === grabOwner);
            this.grab?.update(grabOwner, source ? this.anchor(frame, source) : null);
            this.state.cancel();
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
        const target = this.resolveTarget(ray);
        this.lastPointer = `${phase}: ${target || 'no target'}`;
        if (phase === 'move') this.state.observe('desktop', target);
        if (phase === 'down') this.state.begin('desktop', target);
        if (phase === 'up') this.perform(this.state.commit('desktop', target));
        if (phase === 'cancel') this.cancel();
    }

    key(phase: 'down' | 'up', key: string): void {
        if (this.session) return;
        const focus = this.state.read().focus;
        const targets = this.layout.targets();
        if (key === 'Home' && phase === 'down') this.perform('summon-controls');
        if (key === 'Escape') this.state.cancel();
        if (phase === 'down' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
            const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
            const index = targets.findIndex(target => target.id === focus);
            const next = (index + direction + targets.length) % targets.length;
            this.state.cancel();
            this.state.observe('keyboard', targets[next].id);
        }
        if (key === 'Enter' || key === ' ') {
            if (phase === 'down') this.state.begin('keyboard', focus || targets[0].id);
            else this.perform(this.state.commit('keyboard', this.state.read().focus));
        }
    }

    readStatus(): string {
        return `${this.selectionCount} deliberate fixture selections. Last action: ${this.lastAction} Pointer: ${this.lastPointer} Remote: ${this.grab?.source() ? 'held' : 'released'}.`;
    }

    report(message: string): void {
        this.lastAction = message;
    }

    private unbind(): void {
        this.session?.removeEventListener('selectstart', this.start);
        this.session?.removeEventListener('select', this.select);
        this.session?.removeEventListener('selectend', this.end);
        this.session?.removeEventListener('squeezestart', this.squeeze);
        this.session?.removeEventListener('squeezeend', this.unsqueeze);
        this.session?.removeEventListener('inputsourceschange', this.changed);
        this.session?.removeEventListener('visibilitychange', this.cancel);
        this.session?.removeEventListener('end', this.cancel);
        this.ids.clear();
        this.cancel();
    }

    dispose(): void {
        this.unbind();
        this.session = null;
        this.space = null;
    }
}
