/** Bounded application-work samples; never labelled GPU/compositor or motion-to-photon timing. */
export class FrameSampler {
    private samples: number[] = [];
    private cursor = 0;
    private frames = 0;

    record(milliseconds: number) {
        if (!Number.isFinite(milliseconds) || milliseconds < 0) return;
        this.samples[this.cursor] = milliseconds;
        this.cursor = (this.cursor + 1) % 720;
        this.frames++;
    }

    read() {
        const sorted = this.samples.slice().sort((a, b) => a - b);
        return {
            frames: this.frames,
            p95WorkMs: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] || 0
        };
    }
}
