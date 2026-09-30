import { FixedStepClock } from './fixedStepClock';

export interface PhysicsActivity {
    awake(): boolean;
    wake(): void;
}

/** Skips only confirmed native sleep; never guesses rest from a visual/velocity threshold. */
export class PhysicsScheduler {
    private readonly clock = new FixedStepClock();
    private revision: object | undefined;
    private steps = 0;
    private idleFrames = 0;
    private state = 'Preparing';

    constructor(private readonly activity: PhysicsActivity) {}

    reset(): void {
        this.state = 'Suspended';
        this.clock.reset();
    }

    advance(timeMs: number, suspended: boolean, revision: object, simulate: (seconds: number) => void): number {
        if (suspended) {
            this.state = 'Suspended';
            this.clock.reset();
            return 0;
        }
        if (this.revision !== revision) {
            this.revision = revision;
            this.activity.wake();
        }
        if (!this.activity.awake()) {
            this.state = 'Idle (native sleep)';
            this.idleFrames++;
            this.clock.reset();
            return 0;
        }
        this.state = 'Active';
        const count = this.clock.advance(timeMs, simulate);
        this.steps += count;
        return count;
    }

    status(): string {
        return `Physics: ${this.state}; ${this.steps} fixed steps; ${this.idleFrames} idle frames skipped.`;
    }
}
