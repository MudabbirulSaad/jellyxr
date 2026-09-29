import { ROOM_FIXTURE, type Point3 } from '../fixtures/roomFixture';

import { CONTROL_TARGETS, INITIAL_CONTROL_ANCHOR, RECOVERY_TARGETS, controlLocalPoint, type ControlAnchor, type ControlTarget } from './controlTargets';
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
export function isControlPlacementClear(anchor: ControlAnchor, targets = CONTROL_TARGETS): boolean {
    if (!anchor.origin.every(Number.isFinite) || !Number.isFinite(anchor.yaw)) return false;
    return targets.every(target => {
        const centre = viewerWorldPosition(anchor, target.position);
        const half = [
            Math.abs(Math.cos(anchor.yaw)) * target.width / 2 + 0.015,
            target.height / 2 + 0.015,
            Math.abs(Math.sin(anchor.yaw)) * target.width / 2 + 0.015
        ];
        if (Math.abs(centre[0]) + half[0] > 5.85 || Math.abs(centre[2]) + half[2] > 6.85
            || centre[1] - half[1] < 0.15 || centre[1] + half[1] > 3.9) return false;
        return !ROOM_FIXTURE.some(box => box.collision === 'static'
            && centre.every((value, axis) => Math.abs(value - box.position[axis]) < half[axis] + box.size[axis] / 2));
    });
}

/** Reanchors only on a deliberate request. Ordinary head movement never moves controls. */
export class ControlLayout {
    private anchor: ControlAnchor = INITIAL_CONTROL_ANCHOR;
    private visibleTargets = CONTROL_TARGETS;
    private pending = false;

    read(): ControlAnchor { return this.anchor; }
    targets(): readonly ControlTarget[] { return this.visibleTargets; }
    isPending(): boolean { return this.pending; }
    request(): void { this.pending = true; }
    cancel(): void { this.pending = false; }

    update(viewer?: ControlViewerPose): 'unchanged' | 'placed' | 'recovery' | 'unavailable' {
        if (!this.pending) return 'unchanged';
        this.pending = false;
        if (!viewer || !viewer.position.every(Number.isFinite) || !viewer.forward.every(Number.isFinite)
            || Math.hypot(viewer.forward[0], viewer.forward[2]) < 0.1) return 'unavailable';
        const yaw = Math.atan2(-viewer.forward[0], -viewer.forward[2]);
        for (const variant of [
            { targets: CONTROL_TARGETS, distances: [1.4, 1.05, 0.7], result: 'placed' as const },
            { targets: RECOVERY_TARGETS, distances: [0.65, 0.45], result: 'recovery' as const }
        ]) {
            const anchor = this.findAnchor(viewer, yaw, variant.targets, variant.distances);
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
                if (isControlPlacementClear(candidate, targets) && isControlPlacementInView(viewer, candidate, targets)) return candidate;
            }
        }
        return null;
    }
}
