import type { FixtureBox, Point3 } from './roomFixture';

/** Comparison boxes may pitch around X; room architecture remains axis-aligned. */
export function rotatePitch(point: Point3, pitch = 0): Point3 {
    const cosine = Math.cos(pitch);
    const sine = Math.sin(pitch);
    return [point[0], cosine * point[1] - sine * point[2], sine * point[1] + cosine * point[2]];
}

export function boxLocalPoint(point: Point3, box: FixtureBox): Point3 {
    return rotatePitch([point[0] - box.position[0], point[1] - box.position[1], point[2] - box.position[2]], -(box.pitch || 0));
}

export function pitchedHalfBounds(half: Point3, pitch = 0): Point3 {
    const cosine = Math.abs(Math.cos(pitch));
    const sine = Math.abs(Math.sin(pitch));
    return [half[0], cosine * half[1] + sine * half[2], sine * half[1] + cosine * half[2]];
}

/** Separating-axis test between a world-axis box and a pitched box; no oversized screen AABB. */
export function overlapsBox(centre: Point3, half: Point3, box: FixtureBox): boolean {
    const offset: Point3 = [centre[0] - box.position[0], centre[1] - box.position[1], centre[2] - box.position[2]];
    const boxHalf = box.size.map(value => value / 2) as unknown as Point3;
    const worldHalf = pitchedHalfBounds(boxHalf, box.pitch);
    if (offset.some((value, axis) => Math.abs(value) >= half[axis] + worldHalf[axis])) return false;
    const local = rotatePitch(offset, -(box.pitch || 0));
    const localHalf = pitchedHalfBounds(half, box.pitch);
    return local.every((value, axis) => Math.abs(value) < boxHalf[axis] + localHalf[axis]);
}

/** Slab intersection in ray metres, including a ray that starts inside the oriented proxy. */
export function boxRayDistance(origin: Point3, direction: Point3, box: FixtureBox): number | null {
    const local = boxLocalPoint(origin, box);
    const axisDirection = rotatePitch(direction, -(box.pitch || 0));
    let near = 0;
    let far = Infinity;
    for (let axis = 0; axis < 3; axis++) {
        const low = -box.size[axis] / 2;
        const high = box.size[axis] / 2;
        if (Math.abs(axisDirection[axis]) < 0.00001) {
            if (local[axis] < low || local[axis] > high) return null;
        } else {
            const a = (low - local[axis]) / axisDirection[axis];
            const b = (high - local[axis]) / axisDirection[axis];
            near = Math.max(near, Math.min(a, b));
            far = Math.min(far, Math.max(a, b));
            if (near > far) return null;
        }
    }
    return near;
}
