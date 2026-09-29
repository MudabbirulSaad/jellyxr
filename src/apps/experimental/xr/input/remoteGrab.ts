import { REMOTE_SIZE, ROOM_FIXTURE, type Point3 } from '../fixtures/roomFixture';

export interface RemotePose {
    position: Point3;
    /** World-axis bounds of the current, frozen grab orientation. */
    half: Point3;
}

export interface RemoteBody {
    read(): RemotePose;
    hold(): void;
    move(position: Point3): void;
    release(): void;
}

const finite = (point: Point3) => point.every(Number.isFinite);

/** Conservative world-axis bounds for the original remote, including rotated corners. */
export function remoteHalfBounds(q: readonly [number, number, number, number]): Point3 {
    const [x, y, z, w] = q;
    const h = REMOTE_SIZE.map(v => v / 2);
    return [
        Math.abs(1 - 2 * (y * y + z * z)) * h[0] + Math.abs(2 * (x * y - z * w)) * h[1] + Math.abs(2 * (x * z + y * w)) * h[2],
        Math.abs(2 * (x * y + z * w)) * h[0] + Math.abs(1 - 2 * (x * x + z * z)) * h[1] + Math.abs(2 * (y * z - x * w)) * h[2],
        Math.abs(2 * (x * z - y * w)) * h[0] + Math.abs(2 * (y * z + x * w)) * h[1] + Math.abs(1 - 2 * (x * x + y * y)) * h[2]
    ];
}

function entryFraction(from: Point3, delta: Point3, min: Point3, max: Point3): number {
    const inside = from.every((v, i) => v >= min[i] && v <= max[i]);
    if (inside) {
        // Small solver penetration may slide along or leave its nearest contact face.
        const faces = from.flatMap((v, i) => [
            { depth: v - min[i], outward: -delta[i] }, { depth: max[i] - v, outward: delta[i] }
        ]).sort((a, b) => a.depth - b.depth);
        return faces[0].depth < 0.006 && faces[0].outward >= 0 ? 1 : 0;
    }
    let enter = 0;
    let leave = 1;
    for (let i = 0; i < 3; i++) {
        if (Math.abs(delta[i]) < 0.0000001) {
            if (from[i] < min[i] || from[i] > max[i]) return 1;
        } else {
            const a = (min[i] - from[i]) / delta[i];
            const b = (max[i] - from[i]) / delta[i];
            enter = Math.max(enter, Math.min(a, b));
            leave = Math.min(leave, Math.max(a, b));
            if (enter > leave) return 1;
        }
    }
    return enter;
}

/** Swept box against the comparison's static proxies, not merely an end-point overlap test. */
export function constrainRemote(from: Point3, to: Point3, half: Point3): Point3 {
    if (!finite(from) || !finite(to) || !finite(half) || half.some(v => v <= 0)) return from;
    const delta: Point3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
    let fraction = 1;
    for (const box of ROOM_FIXTURE) {
        if (box.collision !== 'static') continue;
        const min = box.position.map((v, i) => v - box.size[i] / 2 - half[i] - 0.001) as unknown as Point3;
        const max = box.position.map((v, i) => v + box.size[i] / 2 + half[i] + 0.001) as unknown as Point3;
        fraction = Math.min(fraction, entryFraction(from, delta, min, max));
    }
    return [from[0] + delta[0] * fraction, from[1] + delta[1] * fraction, from[2] + delta[2] * fraction];
}

/** One near-grab owner; tracking loss releases without retaining throw velocity. */
export class RemoteGrab {
    private owner: string | null = null;
    private offset: Point3 = [0, 0, 0];
    private target: Point3 | null = null;

    constructor(private readonly body: RemoteBody) {}

    begin(source: string, anchor: Point3 | null): boolean {
        if (this.owner || !anchor || !finite(anchor)) return false;
        const { position } = this.body.read();
        const distance = Math.hypot(...position.map((v, i) => v - anchor[i]));
        if (distance > 0.18 || !Number.isFinite(distance)) return false;
        this.body.hold();
        this.owner = source;
        this.offset = [position[0] - anchor[0], position[1] - anchor[1], position[2] - anchor[2]];
        this.target = position;
        return true;
    }

    update(source: string, anchor: Point3 | null): void {
        if (source !== this.owner) return;
        if (!anchor || !finite(anchor)) {
            this.release(source);
            return;
        }
        this.target = [anchor[0] + this.offset[0], anchor[1] + this.offset[1], anchor[2] + this.offset[2]];
    }

    /** Called before each fixed physics step; bounded speed and exponential settling. */
    step(seconds: number): void {
        if (!this.owner || !this.target || !Number.isFinite(seconds) || seconds <= 0 || seconds > 1 / 30) return;
        const { position, half } = this.body.read();
        const delta = this.target.map((v, i) => v - position[i]);
        const distance = Math.hypot(...delta);
        const fraction = distance > 0 ? Math.min(1 - Math.exp(-20 * seconds), 3 * seconds / distance) : 0;
        const next: Point3 = [position[0] + delta[0] * fraction, position[1] + delta[1] * fraction, position[2] + delta[2] * fraction];
        this.body.move(constrainRemote(position, next, half));
    }

    source(): string | null {
        return this.owner;
    }

    release(source?: string): void {
        if (!this.owner || (source && source !== this.owner)) return;
        this.owner = null;
        this.target = null;
        this.body.release();
    }
}
