import type { Point3 } from '../fixtures/roomFixture';

import { traceControl, type ControlAction, type ControlAnchor, type ControlTarget, type InputRay } from './controlTargets';
import { rayPoint, segmentBlocked, unitRay, type SceneSurfaceQuery } from './sceneQuery';

export interface PointingAim {
    ray: InputRay;
    point: Point3;
    near: boolean;
    blocked: boolean;
    action: ControlAction | null;
}

/** Hit and visible feedback share one normalized, bounded result. It never activates anything. */
export function inspectPointing(
    input: InputRay | null, near: Point3 | undefined, viewer: Point3 | undefined,
    anchor: ControlAnchor, targets: readonly ControlTarget[], query: SceneSurfaceQuery
): PointingAim | null {
    const ray = unitRay(input);
    if (!ray || (viewer && !viewer.every(Number.isFinite))) return null;
    const hit = traceControl(ray, near, anchor, targets);
    if (hit) {
        const origin = hit.near && near ? near : ray.origin;
        const distance = Math.hypot(hit.point[0] - origin[0], hit.point[1] - origin[1], hit.point[2] - origin[2]);
        const toward = unitRay({ origin, direction: [hit.point[0] - origin[0], hit.point[1] - origin[1], hit.point[2] - origin[2]] });
        const stop = toward && query(toward, distance);
        const blocked = (stop !== null && stop < distance - 0.002) || (!!viewer && segmentBlocked(viewer, hit.point, query));
        return { ray: { ...ray, origin }, point: toward && stop !== null ? rayPoint(toward, stop) : hit.point,
            near: hit.near, blocked, action: blocked ? null : hit.action };
    }
    const distance = query(ray, 4);
    return { ray, point: rayPoint(ray, distance ?? 4), near: false, blocked: false, action: 'summon-controls' };
}
