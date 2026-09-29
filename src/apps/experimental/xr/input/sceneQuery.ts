import type { Point3 } from '../fixtures/roomFixture';
import type { InputRay } from './controlTargets';

/** Nearest visible opaque surface in normalized ray metres; feedback geometry is excluded. */
export type SceneSurfaceQuery = (ray: InputRay, limit: number) => number | null;

export function unitRay(ray: InputRay | null): InputRay | null {
    if (!ray || !ray.origin.every(Number.isFinite) || !ray.direction.every(Number.isFinite)) return null;
    const length = Math.hypot(...ray.direction);
    if (!Number.isFinite(length) || length < 0.00001) return null;
    return { origin: ray.origin, direction: ray.direction.map(value => value / length) as unknown as Point3 };
}

export function rayPoint(ray: InputRay, distance: number): Point3 {
    return [ray.origin[0] + ray.direction[0] * distance, ray.origin[1] + ray.direction[1] * distance,
        ray.origin[2] + ray.direction[2] * distance];
}

export function segmentBlocked(origin: Point3, end: Point3, query: SceneSurfaceQuery): boolean {
    const direction: Point3 = [end[0] - origin[0], end[1] - origin[1], end[2] - origin[2]];
    const distance = Math.hypot(...direction);
    const ray = unitRay({ origin, direction });
    if (!ray) return false;
    const hit = query(ray, distance);
    return hit !== null && hit < distance - 0.002;
}
