import { ROOM_FIXTURE, isFixtureDestinationClear, type Point3 } from '../fixtures/roomFixture';

import type { InputRay } from './controlTargets';
import type { ControlViewerPose } from './controlLayout';
import { rotateFloorPoint } from './movement';
import type { SceneSurfaceQuery } from './sceneQuery';

export interface FloorAim { point: Point3 | null; valid: boolean }

/** Slab intersection in normalized ray metres, including a ray starting inside a proxy. */
function boxDistance(ray: InputRay, centre: Point3, size: Point3): number | null {
    let near = 0;
    let far = Infinity;
    for (let axis = 0; axis < 3; axis++) {
        const low = centre[axis] - size[axis] / 2;
        const high = centre[axis] + size[axis] / 2;
        const origin = ray.origin[axis];
        const direction = ray.direction[axis];
        if (Math.abs(direction) < 0.00001) {
            if (origin < low || origin > high) return null;
        } else {
            const a = (low - origin) / direction;
            const b = (high - origin) / direction;
            near = Math.max(near, Math.min(a, b));
            far = Math.min(far, Math.max(a, b));
            if (near > far) return null;
        }
    }
    return near;
}

/** Straight-ray fixture selection: an occluded floor is never a valid destination. */
export function aimFloor(input: InputRay | null, query?: SceneSurfaceQuery): FloorAim {
    if (!input || !input.origin.every(Number.isFinite) || !input.direction.every(Number.isFinite)) return { point: null, valid: false };
    const length = Math.hypot(...input.direction);
    if (length < 0.00001) return { point: null, valid: false };
    const direction = input.direction.map(value => value / length) as unknown as Point3;
    if (direction[1] >= -0.00001 || input.origin[1] <= 0) return { point: null, valid: false };
    const distance = -input.origin[1] / direction[1];
    if (distance > 10) return { point: null, valid: false };
    const point: Point3 = [input.origin[0] + direction[0] * distance, 0, input.origin[2] + direction[2] * distance];
    const ray = { origin: input.origin, direction };
    const surface = query?.(ray, distance);
    const occluded = (surface !== null && surface !== undefined && surface < distance - 0.002) || ROOM_FIXTURE.some(box => {
        if (box.collision !== 'static' || box.id === 'floor') return false;
        const hit = boxDistance(ray, box.position, box.size);
        return hit !== null && hit < distance - 0.001;
    });
    return { point, valid: !occluded && isFixtureDestinationClear(point) };
}

/** Destination remains a proposal until the same source completes an unmoved activation. */
export class FloorSelection {
    private active = false;
    private aim: FloorAim = { point: null, valid: false };
    private held: { source: string; point: Point3 } | null = null;

    constructor(private readonly query?: SceneSurfaceQuery) {}

    arm(): void {
        this.cancel();
        this.active = true;
    }
    isActive(): boolean { return this.active; }
    read(): FloorAim { return this.aim; }
    observe(ray: InputRay | null): void {
        if (!this.active) return;
        this.aim = aimFloor(ray, this.query);
        if (this.held && (!this.aim.valid || !this.aim.point || this.drift(this.held.point, this.aim.point) > 0.15)) this.held = null;
    }
    begin(source: string): void {
        if (this.active && !this.held && this.aim.valid && this.aim.point) this.held = { source, point: this.aim.point };
    }
    commit(source: string): Point3 | null {
        if (!this.held || this.held.source !== source) return null;
        const point = this.aim.valid && this.aim.point && this.drift(this.held.point, this.aim.point) <= 0.15 ? this.aim.point : null;
        this.cancel();
        return point;
    }
    release(source: string): void { if (this.held?.source === source) this.held = null; }
    cancel(): void {
        this.active = false;
        this.aim = { point: null, valid: false };
        this.held = null;
    }
    hint(): string { return this.aim.valid ? 'Clear floor: confirm' : 'Blocked: choose floor'; }
    status(): string {
        if (!this.active) return '';
        return this.aim.valid ? 'Floor ready: confirm to move, or Cancel move.' : 'Floor blocked: aim at clear floor, or Cancel move.';
    }
    keyboard(viewer: ControlViewerPose, x: number, z: number): void {
        if (!this.active) return;
        const yaw = Math.atan2(-viewer.forward[0], -viewer.forward[2]);
        const step = rotateFloorPoint([x, 0, z], yaw);
        const initial = rotateFloorPoint([0, 0, -3.5], yaw);
        const previous = this.aim.point || [viewer.position[0] + initial[0], 0, viewer.position[2] + initial[2]];
        const point: Point3 = [previous[0] + step[0], 0, previous[2] + step[2]];
        this.observe({ origin: viewer.position, direction: [point[0] - viewer.position[0], -viewer.position[1], point[2] - viewer.position[2]] });
    }
    private drift(a: Point3, b: Point3): number { return Math.hypot(a[0] - b[0], a[2] - b[2]); }
}
