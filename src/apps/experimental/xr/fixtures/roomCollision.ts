import { boxLocalPoint, overlapsBox, pitchedHalfBounds } from './boxGeometry';
import { ROOM_FIXTURE, isFixtureDestinationClear, type FixtureBox, type Point3 } from './roomFixture';
import { screenBox, type ScreenPose } from './screenFixture';

function worldBounds(box: FixtureBox) {
    return pitchedHalfBounds(box.size.map(value => value / 2) as unknown as Point3, box.pitch);
}

function sweepEnvelope(before: FixtureBox, after: FixtureBox): FixtureBox {
    const a = worldBounds(before);
    const b = worldBounds(after);
    const low = a.map((value, axis) => Math.min(before.position[axis] - value, after.position[axis] - b[axis]) - 0.025);
    const high = a.map((value, axis) => Math.max(before.position[axis] + value, after.position[axis] + b[axis]) + 0.025);
    return { ...after, pitch: 0, position: low.map((value, axis) => (value + high[axis]) / 2) as unknown as Point3,
        size: low.map((value, axis) => high[axis] - value) as unknown as Point3 };
}

/** Scene-scoped proxies; no candidate may mutate the shared baseline fixture. */
export class RoomCollision {
    private boxes = ROOM_FIXTURE;
    private screen = ROOM_FIXTURE.find(box => box.id === 'screen')!;

    constructor(private readonly apply: (next: FixtureBox) => void = () => undefined) {}

    read = (): readonly FixtureBox[] => this.boxes;
    readScreen(): FixtureBox { return this.screen; }
    destinationClear = (point: Point3): boolean => isFixtureDestinationClear(point, this.boxes);

    tryScreen(percent: number, pose: ScreenPose, viewer: Point3 | undefined, remote?: { position: Point3; half: Point3 }): string | null {
        if (!viewer?.every(Number.isFinite)) return 'Tracking unavailable. Face the screen and try again.';
        let next: FixtureBox;
        try {
            next = screenBox(percent, pose);
        } catch {
            return 'Placement limit reached. Choose another adjustment.';
        }
        const blocked = this.boxes.some(box => box.id !== 'screen' && box.collision === 'static'
            && overlapsBox(box.position, box.size.map(value => value / 2 + 0.025) as unknown as Point3, next));
        if (blocked) return 'Screen would meet the room. Reduce size or adjust height or distance.';

        // Keep freshly placed panels beyond the comparison's 1.4 m control bank.
        const localViewer = boxLocalPoint(viewer, next);
        const nearest = localViewer.map((value, axis) => Math.max(0, Math.abs(value) - next.size[axis] / 2));
        if (Math.hypot(...nearest) < 1.75) return 'Screen is too close. Move it farther away or return to seat.';
        const sweep = sweepEnvelope(this.screen, next);
        if (overlapsBox([viewer[0], viewer[1] / 2, viewer[2]], [0.35, Math.max(0.9, viewer[1] / 2 + 0.1), 0.35], sweep)) {
            return 'Screen would cross your position. Return to seat before resetting.';
        }
        if (remote && overlapsBox(remote.position, remote.half, sweep)) return 'Remote is in the way. Recall it before moving the screen.';
        try {
            this.apply(next);
        } catch {
            return 'Screen could not be placed. Previous placement retained; try again or exit XR.';
        }
        this.screen = next;
        this.boxes = this.boxes.map(box => box.id === 'screen' ? next : box);
        return null;
    }
}
