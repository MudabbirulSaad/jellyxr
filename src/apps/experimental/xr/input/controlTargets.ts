import type { Point3 } from '../fixtures/roomFixture';

export type ControlAction = 'select-fixture' | 'reset-count' | 'recall-remote' | 'exit-xr';
export interface ControlTarget {
    id: ControlAction;
    label: string;
    position: Point3;
    width: number;
    height: number;
}
export interface InputRay { origin: Point3; direction: Point3 }

/** Shared visible geometry and hit bounds; these metre values are not comfort-qualified. */
export const CONTROL_TARGETS: readonly ControlTarget[] = [
    { id: 'select-fixture', label: 'Select fixture', position: [-0.3, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'reset-count', label: 'Reset count', position: [0.3, 1.18, -1.4], width: 0.52, height: 0.22 },
    { id: 'recall-remote', label: 'Recall remote', position: [-0.3, 0.92, -1.4], width: 0.52, height: 0.22 },
    { id: 'exit-xr', label: 'Exit XR', position: [0.3, 0.92, -1.4], width: 0.52, height: 0.22 }
];

export function hitControl(ray: InputRay | null, near?: Point3): ControlAction | null {
    if (near?.every(Number.isFinite)) {
        const hit = CONTROL_TARGETS.find(target => near[2] >= target.position[2] && near[2] - target.position[2] <= 0.05
            && Math.abs(near[0] - target.position[0]) <= target.width / 2
            && Math.abs(near[1] - target.position[1]) <= target.height / 2);
        if (hit) return hit.id;
    }
    if (!ray || !ray.origin.every(Number.isFinite) || !ray.direction.every(Number.isFinite)
        || ray.direction[2] >= -0.00001) return null;
    // Panels face +Z. No activation through the back or from an unbounded/gaze ray.
    let closest = 10;
    let result: ControlAction | null = null;
    for (const target of CONTROL_TARGETS) {
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
