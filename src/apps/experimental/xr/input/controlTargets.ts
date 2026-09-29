import type { Point3 } from '../fixtures/roomFixture';
import type { MovementAction } from './movementSession';
import { rotateFloorPoint } from './movement';

export type ControlAction = 'select-fixture' | 'reset-count' | 'recall-remote' | 'exit-xr' | 'resume-media' | 'summon-controls' | 'choose-floor' | 'cancel-floor' | 'confirm-floor' | MovementAction;
export interface ControlTarget {
    id: ControlAction;
    label: string;
    position: Point3;
    width: number;
    height: number;
}
export interface InputRay { origin: Point3; direction: Point3 }
export interface ControlAnchor { origin: Point3; yaw: number }
export const INITIAL_CONTROL_ANCHOR: ControlAnchor = { origin: [0, 0, 0], yaw: 0 };

/** Shared visible geometry and hit bounds; these metre values are not comfort-qualified. */
export const CONTROL_TARGETS: readonly ControlTarget[] = [
    { id: 'select-fixture', label: 'Select fixture', position: [-0.3, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'reset-count', label: 'Reset count', position: [0.3, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'recall-remote', label: 'Recall remote', position: [-0.3, 0.92, -1.4], width: 0.52, height: 0.22 },
    { id: 'exit-xr', label: 'Exit XR', position: [0.3, 0.92, -1.4], width: 0.52, height: 0.22 },
    { id: 'turn-left', label: 'Turn left 30°', position: [-0.9, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'turn-right', label: 'Turn right 30°', position: [0.9, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'library-position', label: 'Library position', position: [-0.9, 0.92, -1.4], width: 0.52, height: 0.22 },
    { id: 'return-seat', label: 'Return to seat', position: [0.9, 0.92, -1.4], width: 0.52, height: 0.22 },
    { id: 'resume-media', label: 'Resume video', position: [0, 1.46, -1.4], width: 0.52, height: 0.22 },
    { id: 'choose-floor', label: 'Choose floor', position: [-0.6, 1.46, -1.4], width: 0.52, height: 0.22 },
    { id: 'cancel-floor', label: 'Cancel move', position: [0.6, 1.46, -1.4], width: 0.52, height: 0.22 }
];

export const RECOVERY_TARGETS: readonly ControlTarget[] = [
    { id: 'return-seat', label: 'Return to seat', position: [0, 1.8, -1.4], width: 0.52, height: 0.22 },
    { id: 'exit-xr', label: 'Exit XR', position: [0, 1.5, -1.4], width: 0.52, height: 0.22 }
];

export const FLOOR_TARGETS: readonly ControlTarget[] = [
    { id: 'cancel-floor', label: 'Cancel move', position: [-0.6, 1.46, -1.4], width: 0.52, height: 0.22 },
    { id: 'return-seat', label: 'Return to seat', position: [0, 1.46, -1.4], width: 0.52, height: 0.22 },
    { id: 'exit-xr', label: 'Exit XR', position: [0.6, 1.46, -1.4], width: 0.52, height: 0.22 }
];

export function controlLocalPoint(point: Point3, anchor: ControlAnchor): Point3 {
    return rotateFloorPoint([point[0] - anchor.origin[0], point[1] - anchor.origin[1], point[2] - anchor.origin[2]], -anchor.yaw);
}

export function hitControl(worldRay: InputRay | null, worldNear?: Point3, anchor = INITIAL_CONTROL_ANCHOR, targets = CONTROL_TARGETS): ControlAction | null {
    const ray = worldRay && { origin: controlLocalPoint(worldRay.origin, anchor), direction: rotateFloorPoint(worldRay.direction, -anchor.yaw) };
    const near = worldNear && controlLocalPoint(worldNear, anchor);
    if (near?.every(Number.isFinite)) {
        const hit = targets.find(target => near[2] >= target.position[2] && near[2] - target.position[2] <= 0.05
            && Math.abs(near[0] - target.position[0]) <= target.width / 2
            && Math.abs(near[1] - target.position[1]) <= target.height / 2);
        if (hit) return hit.id;
    }
    if (!ray || !ray.origin.every(Number.isFinite) || !ray.direction.every(Number.isFinite)
        || ray.direction[2] >= -0.00001) return null;
    // Panels face +Z. No activation through the back or from an unbounded/gaze ray.
    let closest = 10;
    let result: ControlAction | null = null;
    for (const target of targets) {
        const distance = (target.position[2] - ray.origin[2]) / ray.direction[2];
        if (distance < 0 || distance > closest) continue;
        const x = ray.origin[0] + distance * ray.direction[0];
        const y = ray.origin[1] + distance * ray.direction[1];
        if (Math.abs(x - target.position[0]) <= target.width / 2 && Math.abs(y - target.position[1]) <= target.height / 2) {
            result = target.id;
            closest = distance;
        }
    }
    return result;
}
