import type { Point3 } from '../fixtures/roomFixture';
import { RoomCollision } from '../fixtures/roomCollision';

import { aimFloor, FloorSelection } from './floorSelection';

import { ActivationState } from './activationState';
import type { ControlAction, InputRay } from './controlTargets';
import type { RemoteGrab } from './remoteGrab';
import { ControlLayout, type ControlViewerPose } from './controlLayout';
import { inspectPointing, type PointingAim } from './pointingAim';
import type { SceneSurfaceQuery } from './sceneQuery';
import { SpatialCatalogue } from './spatialCatalogue';
import { SpatialScreen } from './spatialScreen';

function pointingRank(aim: PointingAim | null): number {
    if (!aim?.action) return 0;
    if (aim.action === 'summon-controls') return 1;
    return aim.near ? 4 : 3;
}

function actionLabel(action: ControlAction | null): string {
    return action?.startsWith('search-key-') ? 'Search key' : action || 'no target';
}

/** Uses one native select event stream for controller trigger and hand pinch; never gaze. */
export class ComparisonInput {
    readonly state = new ActivationState();
    readonly layout: ControlLayout;
    readonly floor: FloorSelection;
    readonly catalogue = new SpatialCatalogue();
    readonly screen: SpatialScreen;
    private pointing: (PointingAim & { source: string }) | null = null;
    private trackedViewer: { position: Point3; sampledAt: number } | null = null;
    private desktopViewer: ControlViewerPose | undefined;
    private session: XRSession | null = null;
    private space: XRReferenceSpace | null = null;
    private ids = new Map<XRInputSource, string>();
    private nextId = 0;
    private selectionCount = 0;
    private lastAction = 'No spatial action yet.';
    private lastPointer = 'No desktop pointer event.';

    constructor(
        private readonly onAction: (action: ControlAction) => void, private readonly grab?: RemoteGrab,
        private readonly onTeleport: (point: Point3) => void = () => undefined,
        private readonly sceneQuery: SceneSurfaceQuery = () => null,
        private readonly room = new RoomCollision()
    ) {
        this.layout = new ControlLayout(room.read);
        this.floor = new FloorSelection(sceneQuery, room.read);
        this.screen = new SpatialScreen((percent, pose) => {
            const position = this.session ? this.recentViewerPosition() : this.desktopViewer?.position;
            const message = room.tryScreen(percent, pose, position, this.grab?.readPose());
            if (!message) this.cancel();
            return message;
        });
    }

    summonControls(): void {
        this.cancel();
        this.layout.request();
    }

    private aimRay(ray: InputRay | null, near?: Point3, viewer?: Point3): PointingAim | null {
        const aim = inspectPointing(ray, near, viewer, this.layout.read(), this.layout.targets(this.floor.isActive()), this.sceneQuery);
        if (!aim || aim.blocked) return aim;
        if (this.floor.isActive()) {
            if (aim.action !== 'summon-controls') return aim;
            const floor = aimFloor(ray, this.sceneQuery, this.room.read());
            return { ...aim, action: floor.valid ? 'confirm-floor' : null, blocked: !floor.valid,
                point: floor.valid && floor.point ? floor.point : aim.point };
        }
        return aim;
    }

    private applyAim(aim: PointingAim | null, source: string): ControlAction | null {
        this.pointing = aim ? { ...aim, source } : null;
        if (this.floor.isActive()) this.floor.observe(aim?.action === 'confirm-floor' ? aim.ray : null);
        return aim?.action || null;
    }

    private sampleViewer(frame?: XRFrame): ControlViewerPose | undefined {
        this.trackedViewer = null;
        if (!this.space || this.session?.visibilityState !== 'visible') return;
        const pose = frame?.getViewerPose?.(this.space);
        if (!pose) return;
        const { position: p, matrix: m } = pose.transform;
        const position: Point3 = [p.x, p.y, p.z];
        const forward: Point3 = [-m[8], -m[9], -m[10]];
        if (position.every(Number.isFinite) && forward.every(Number.isFinite)) {
            this.trackedViewer = { position, sampledAt: performance.now() };
            return { position, forward };
        }
    }

    private recentViewerPosition(): Point3 | undefined {
        const viewer = this.trackedViewer;
        return viewer && performance.now() - viewer.sampledAt <= 100 ? viewer.position : undefined;
    }

    private updateLayout(viewer?: ControlViewerPose): void {
        if (!this.layout.isPending()) return;
        const result = this.layout.update(viewer);
        if (result === 'placed') this.report('Controls placed here. They remain anchored until recalled.');
        if (result === 'recovery') this.report('Only recovery controls fit here. Return to seat for the full controls, or exit XR.');
        if (result === 'unavailable') this.report('Controls could not be placed safely. Face open room space and try again, or use the headset system exit.');
        if (!this.layout.targets(this.floor.isActive()).some(target => target.id === this.state.read().focus && target.enabled !== false)) {
            this.state.observe('layout', this.layout.targets(this.floor.isActive()).find(target => target.enabled !== false)?.id || null);
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

    private aim(frame: XRFrame, source: XRInputSource): PointingAim | null {
        if (!this.space || source.targetRayMode !== 'tracked-pointer') return null;
        const owner = this.state.read().source;
        if (owner && owner !== this.id(source)) return null;
        const pose = frame.getPose(source.targetRaySpace, this.space);
        // Input-event frames forbid getViewerPose(). Use only the last active animation sample.
        const viewer = this.recentViewerPosition();
        if (!pose || !viewer) return null;
        let near: Point3 | undefined;
        if (source.hand) {
            const joint = source.hand.get('index-finger-tip');
            const tip = joint && frame.getJointPose?.(joint, this.space);
            // A stale emulated hand ray cannot keep an activation alive after joint loss.
            if (!tip) return null;
            const { x, y, z } = tip.transform.position;
            near = [x, y, z];
            if (!near.every(Number.isFinite)) return null;
        }
        const m = pose.transform.matrix;
        return this.aimRay({ origin: [m[12], m[13], m[14]], direction: [-m[8], -m[9], -m[10]] },
            near || [m[12], m[13], m[14]], viewer);
    }

    private target(frame: XRFrame, source: XRInputSource): ControlAction | null {
        const owner = this.state.read().source;
        if (owner && owner !== this.id(source)) return null;
        return this.applyAim(this.aim(frame, source), this.id(source));
    }

    private start = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible' || this.grab?.source() || this.layout.isPending()) return;
        const target = this.target(event.frame, event.inputSource);
        if (event.inputSource.hand && target === 'summon-controls' && this.beginGrab(event)) return;
        const id = this.id(event.inputSource);
        this.state.begin(id, target);
        if (target === 'confirm-floor' && this.state.read().source === id) this.floor.begin(id);
    };

    private select = (event: XRInputSourceEvent) => {
        if (this.session?.visibilityState !== 'visible' || this.grab?.source() || this.layout.isPending()) return;
        const id = this.id(event.inputSource);
        this.perform(this.state.commit(id, this.target(event.frame, event.inputSource)), id);
    };

    private end = (event: XRInputSourceEvent) => {
        this.state.cancel(this.id(event.inputSource));
        this.floor.release(this.id(event.inputSource));
        if (event.inputSource.hand) this.grab?.release(this.id(event.inputSource));
    };
    private beginGrab = (event: XRInputSourceEvent): boolean => {
        if (this.session?.visibilityState !== 'visible' || !this.recentViewerPosition() || this.state.read().source) return false;
        const began = this.grab?.begin(this.id(event.inputSource), this.anchor(event.frame, event.inputSource)) || false;
        if (began) {
            this.pointing = null;
            this.state.cancel();
            this.floor.cancel();
        }
        return began;
    };
    private squeeze = (event: XRInputSourceEvent) => {
        if (!event.inputSource.hand) this.beginGrab(event);
    };
    private unsqueeze = (event: XRInputSourceEvent) => {
        if (!event.inputSource.hand) this.grab?.release(this.id(event.inputSource));
    };
    cancel = (): void => {
        this.pointing = null;
        this.trackedViewer = null;
        this.state.cancel();
        this.grab?.release();
        this.layout.cancel();
        this.floor.cancel();
    };
    private changed = (event: XRInputSourcesChangeEvent) => {
        if (event.removed.length) this.floor.cancel();
        for (const source of event.removed) {
            if (this.pointing?.source === this.id(source)) this.pointing = null;
            this.state.cancel(this.id(source));
            this.grab?.release(this.id(source));
            this.ids.delete(source);
        }
    };

    private perform(action: ControlAction | null, source = 'keyboard'): void {
        if (!action) return;
        const content = this.screen.handle(action) || this.catalogue.handle(action);
        if (content) {
            this.state.cancel();
            this.pointing = null;
            this.layout.setContent(content.targets, content.reanchor);
            this.state.observe(source, content.focus);
        }
        if (action === 'choose-floor') {
            this.cancel();
            this.floor.arm();
            if (!this.session && this.desktopViewer) this.floor.keyboard(this.desktopViewer, 0, 0);
        }
        if (action === 'cancel-floor') this.floor.cancel();
        if (action === 'confirm-floor') {
            const destination = this.floor.commit(source);
            if (destination) this.onTeleport(destination);
        }
        if (action === 'select-fixture') this.selectionCount++;
        if (action === 'reset-count') this.selectionCount = 0;
        if (action === 'summon-controls') this.summonControls();
        this.lastAction = actionLabel(action);
        this.onAction(action);
    }

    update(session: XRSession | null, space: XRReferenceSpace | null, frame?: XRFrame, desktopViewer?: ControlViewerPose): void {
        this.desktopViewer = desktopViewer;
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
        this.updateLayout(session ? this.sampleViewer(frame) : desktopViewer);
        if (!session || !frame || session.visibilityState !== 'visible' || !this.trackedViewer) {
            if (session) this.cancel();
            return;
        }
        const grabOwner = this.grab?.source();
        if (grabOwner) {
            this.pointing = null;
            const source = Array.from(session.inputSources).find(value => this.id(value) === grabOwner);
            this.grab?.update(grabOwner, source ? this.anchor(frame, source) : null);
            this.state.cancel();
            return;
        }
        this.updatePointing(session, frame);
    }

    private updatePointing(session: XRSession, frame: XRFrame): void {
        const owner = this.state.read().source;
        let chosen: { id: string; aim: PointingAim | null; rank: number } | undefined;
        for (const source of session.inputSources) {
            const id = this.id(source);
            if (owner && owner !== id) continue;
            const aim = this.aim(frame, source);
            const rank = pointingRank(aim);
            if (owner || (aim && (!chosen || rank > chosen.rank))) chosen = { id, aim, rank };
            if (owner) break;
        }
        if (chosen) {
            this.state.observe(chosen.id, this.applyAim(chosen.aim, chosen.id));
            if (!chosen.aim) this.floor.cancel();
        } else {
            this.pointing = null;
            this.state.cancel();
            this.floor.cancel();
        }
    }

    /** Desktop ray uses the same world-space hit bounds and explicit down/up policy. */
    pointer(phase: 'move' | 'down' | 'up' | 'cancel', ray: InputRay | null): void {
        if (this.session) return;
        if (this.layout.isPending()) {
            this.state.cancel();
            return;
        }
        const target = this.applyAim(this.aimRay(ray, undefined, this.desktopViewer?.position), 'desktop');
        this.lastPointer = `${phase}: ${actionLabel(target)}`;
        if (phase === 'move') this.state.observe('desktop', target);
        if (phase === 'down') {
            this.state.begin('desktop', target);
            if (target === 'confirm-floor') this.floor.begin('desktop');
        }
        if (phase === 'up') this.perform(this.state.commit('desktop', target), 'desktop');
        if (phase === 'cancel') this.cancel();
    }

    key(phase: 'down' | 'up', key: string): void {
        if (this.session) return;
        this.pointing = null;
        const focus = this.state.read().focus;
        const targets = this.layout.targets(this.floor.isActive()).filter(target => target.enabled !== false);
        if (key === 'Home' && phase === 'down') this.perform('summon-controls');
        if (key === 'Escape') {
            if (phase === 'down') this.escape();
            return;
        }
        if (this.layout.isPending()) return;
        if (this.floor.isActive()) {
            this.floorKey(phase, key);
            return;
        }
        if (phase === 'down' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
            const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
            const index = targets.findIndex(target => target.id === focus);
            const next = (index + direction + targets.length) % targets.length;
            this.state.cancel();
            this.state.observe('keyboard', targets[next].id);
        }
        if (key === 'Enter' || key === ' ') {
            this.activateKey(phase, focus, targets);
        }
    }

    private escape(): void {
        this.cancel();
        if (this.catalogue.search.isOpen()) this.perform('search-cancel');
        if (this.screen.isOpen()) this.perform('screen-close');
    }

    private activateKey(phase: 'down' | 'up', focus: ControlAction | null, targets: readonly { id: ControlAction }[]): void {
        const target = focus ? targets.find(value => value.id === focus)?.id || null : targets[0].id;
        if (phase === 'down') this.state.begin('keyboard', target);
        else this.perform(this.state.commit('keyboard', target));
    }

    private floorKey(phase: 'down' | 'up', key: string): void {
        const steps: Record<string, readonly [number, number]> = {
            ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25]
        };
        const step = steps[key];
        if (phase === 'down' && this.desktopViewer && step) {
            this.state.cancel();
            this.floor.release('keyboard');
            this.floor.keyboard(this.desktopViewer, ...step);
        }
        if (key !== 'Enter' && key !== ' ') return;
        const target = this.floor.read().valid ? 'confirm-floor' : null;
        if (phase === 'down') {
            this.state.begin('keyboard', target);
            this.floor.begin('keyboard');
        } else {
            this.perform(this.state.commit('keyboard', target));
        }
    }

    readStatus(): string {
        return `${this.selectionCount} deliberate fixture selections. Last action: ${this.lastAction} Pointer: ${this.lastPointer} Remote: ${this.grab?.source() ? 'held' : 'released'}. ${this.floor.status()} ${this.catalogue.status()} ${this.screen.status()}`;
    }

    readPointing(): (PointingAim & { pressed: boolean }) | null {
        const pressed = this.state.read().pressed;
        return this.pointing ? { ...this.pointing, pressed: !!pressed && pressed === this.pointing.action } : null;
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
