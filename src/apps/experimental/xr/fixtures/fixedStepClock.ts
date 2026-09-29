/** Shared experiment clock. Engines receive the same bounded elapsed-time policy. */
export class FixedStepClock {
    private previousTime: number | undefined;
    private accumulator = 0;

    constructor(
        private readonly stepSeconds = 1 / 72,
        private readonly maxSteps = 4
    ) {
        if (!Number.isFinite(stepSeconds) || stepSeconds <= 0
            || !Number.isInteger(maxSteps) || maxSteps < 1) {
            throw new RangeError('Simulation requires a positive step and a positive integer catch-up limit.');
        }
    }

    reset() {
        this.previousTime = undefined;
        this.accumulator = 0;
    }

    advance(timeMs: number, simulate: (seconds: number) => void): number {
        if (!Number.isFinite(timeMs)) {
            this.reset();
            return 0;
        }
        if (this.previousTime === undefined || timeMs < this.previousTime) {
            this.previousTime = timeMs;
            this.accumulator = 0;
            return 0;
        }

        const elapsed = (timeMs - this.previousTime) / 1000;
        this.previousTime = timeMs;
        this.accumulator = Math.min(this.accumulator + elapsed, this.stepSeconds * this.maxSteps);
        let steps = 0;
        while (this.accumulator + Number.EPSILON >= this.stepSeconds && steps < this.maxSteps) {
            simulate(this.stepSeconds);
            this.accumulator = Math.max(0, this.accumulator - this.stepSeconds);
            steps++;
        }
        return steps;
    }
}
