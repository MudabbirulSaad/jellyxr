import { ROOM_FIXTURE, type Point3, type CollisionSource } from '../fixtures/roomFixture';
import { overlapsBox } from '../fixtures/boxGeometry';

import { CONTROL_TARGETS, FLOOR_TARGETS, INITIAL_CONTROL_ANCHOR, RECOVERY_TARGETS, controlLocalPoint, type ControlAnchor, type ControlTarget, type ControlTextScale } from './controlTargets';
import { rotateFloorPoint, viewerWorldPosition } from './movement';

export interface ControlViewerPose { position: Point3; forward: Point3 }

/** Keep the complete bank in the level preview's forward workspace; headset comfort is separate. */
export function isControlPlacementInView(viewer: ControlViewerPose, anchor: ControlAnchor, targets: readonly ControlTarget[]): boolean {
    return targets.every(target => {
        const centre = controlLocalPoint(viewerWorldPosition(anchor, target.position), { origin: viewer.position, yaw: anchor.yaw });
        const distance = -centre[2];
        return distance > 0.3
            && Math.abs(centre[0]) + target.width / 2 <= distance * Math.tan(48 * Math.PI / 180)
            && Math.abs(centre[1]) + target.height / 2 <= distance * Math.tan(33 * Math.PI / 180);
    });
}

/** Conservative axis-aligned proxy check for the complete bank, including rotated corners. */
export function isControlPlacementClear(anchor: ControlAnchor, targets = CONTROL_TARGETS, boxes = ROOM_FIXTURE): boolean {
    if (!anchor.origin.every(Number.isFinite) || !Number.isFinite(anchor.yaw)) return false;
    return targets.every(target => {
        const centre = viewerWorldPosition(anchor, target.position);
        const half: Point3 = [
            Math.abs(Math.cos(anchor.yaw)) * target.width / 2 + 0.015,
            target.height / 2 + 0.015,
            Math.abs(Math.sin(anchor.yaw)) * target.width / 2 + 0.015
        ];
        if (Math.abs(centre[0]) + half[0] > 5.85 || Math.abs(centre[2]) + half[2] > 6.85
            || centre[1] - half[1] < 0.15 || centre[1] + half[1] > 3.9) return false;
        return !boxes.some(box => box.collision === 'static' && overlapsBox(centre, half, box));
    });
}

/** Reanchors only on a deliberate request. Ordinary head movement never moves controls. */
export class ControlLayout {
    private anchor: ControlAnchor = INITIAL_CONTROL_ANCHOR;
    private visibleTargets = CONTROL_TARGETS;
    private contentTargets = CONTROL_TARGETS;
    private pending = false;
    private textScale: ControlTextScale = 1;
    private textTargets = new WeakMap<readonly ControlTarget[], readonly ControlTarget[]>();
    private textItems = new WeakMap<ControlTarget, ControlTarget>();

    constructor(private readonly collisions: CollisionSource = () => ROOM_FIXTURE) {}

    read(): ControlAnchor { return this.anchor; }
    targets(floorMode = false): readonly ControlTarget[] {
        return this.sizedTargets(floorMode && this.visibleTargets === CONTROL_TARGETS ? FLOOR_TARGETS : this.visibleTargets);
    }
    readTextScale(): ControlTextScale { return this.textScale; }
    cycleTextSize(): void {
        const sizes: readonly ControlTextScale[] = [1, 1.25, 1.5];
        this.textScale = sizes[(sizes.indexOf(this.textScale) + 1) % sizes.length];
        this.textTargets = new WeakMap();
        this.textItems = new WeakMap();
        this.request();
    }
    private sizedTargets(targets: readonly ControlTarget[]): readonly ControlTarget[] {
        if (this.textScale === 1) return targets;
        let sized = this.textTargets.get(targets);
        if (!sized) {
            sized = targets.map(target => {
                const cached = this.textItems.get(target);
                if (cached) return cached;
                const value = { ...target, textScale: this.textScale };
                if (target.id === 'text-size') value.description = `${this.textScale * 100}% · Change size`;
                if (target.id === 'catalogue-heading') {
                    value.height = 0.7;
                    value.position = [0, 2.62, -2.5];
                }
                if (target.id === 'search-heading') {
                    value.height = 0.48;
                    value.position = [0, 2.78, -2.65];
                }
                if (target.id === 'search-field') {
                    value.height = 0.6;
                    value.position = [0, 2.2, -2.4];
                }
                if (!target.kind && target.id.startsWith('search-')) value.height = 0.24;
                if (target.id === 'screen-heading') {
                    value.height = 0.42;
                    value.position = [-0.275, 1.7, -1.4];
                }
                if (target.width === 0.64 && ['screen-close', 'return-seat', 'exit-xr'].includes(target.id)) value.height = 0.28;
                this.textItems.set(target, value);
                return value;
            });
            this.textTargets.set(targets, sized);
        }
        return sized;
    }
    isPending(): boolean { return this.pending; }
    request(): void { this.pending = true; }
    cancel(): void { this.pending = false; }
    setContent(targets: readonly ControlTarget[], reanchor: boolean): void {
        this.contentTargets = targets;
        if (reanchor || !isControlPlacementClear(this.anchor, this.sizedTargets(targets), this.collisions())) this.request();
        else this.visibleTargets = targets;
    }

    update(viewer?: ControlViewerPose): 'unchanged' | 'placed' | 'recovery' | 'unavailable' {
        if (!this.pending) return 'unchanged';
        this.pending = false;
        if (!viewer || !viewer.position.every(Number.isFinite) || !viewer.forward.every(Number.isFinite)
            || Math.hypot(viewer.forward[0], viewer.forward[2]) < 0.1) return 'unavailable';
        const yaw = Math.atan2(-viewer.forward[0], -viewer.forward[2]);
        for (const variant of [
            { targets: this.contentTargets, distances: [1.4, 1.05, 0.7], result: 'placed' as const },
            { targets: RECOVERY_TARGETS, distances: [0.65, 0.45], result: 'recovery' as const }
        ]) {
            const anchor = this.findAnchor(viewer, yaw, this.sizedTargets(variant.targets), variant.distances);
            if (!anchor) continue;
            this.anchor = anchor;
            this.visibleTargets = variant.targets;
            return variant.result;
        }
        return 'unavailable';
    }

    private findAnchor(viewer: ControlViewerPose, yaw: number, targets: readonly ControlTarget[], distances: number[]): ControlAnchor | null {
        for (const distance of distances) {
            for (const lift of [0, 0.3, 0.6, -0.2]) {
                const shift = rotateFloorPoint([0, viewer.position[1] - 1.65 + lift, 1.4 - distance], yaw);
                const candidate: ControlAnchor = {
                    origin: [viewer.position[0] + shift[0], shift[1], viewer.position[2] + shift[2]], yaw
                };
                if (isControlPlacementClear(candidate, targets, this.collisions()) && isControlPlacementInView(viewer, candidate, targets)) return candidate;
            }
        }
        return null;
    }
}
