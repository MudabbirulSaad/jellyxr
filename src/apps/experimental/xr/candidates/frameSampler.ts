export interface FrameObservations {
    scope: 'desktop-preview' | 'immersive-xr' | 'suspended';
    frames: number;
    windowSamples: number;
    p95WorkMs: number | null;
}

/** Bounded application-work samples; never labelled GPU/compositor or motion-to-photon timing. */
export class FrameSampler {
    private samples: number[] = [];
    private cursor = 0;
    private frames = 0;
    private session: object | null = null;
    private scope: FrameObservations['scope'] = 'desktop-preview';

    /** Identity is enough; the sampler does not request or operate an XR session. */
    synchronize(session: object | null, suspended: boolean): void {
        let scope: FrameObservations['scope'] = session ? 'immersive-xr' : 'desktop-preview';
        if (suspended) scope = 'suspended';
        if (session !== this.session || scope !== this.scope) this.reset();
        this.session = session;
        this.scope = scope;
    }

    /** Called by interruption events even if the runtime supplies no further frames. */
    suspend(): void {
        if (this.scope !== 'suspended') this.reset();
        this.scope = 'suspended';
    }

    reset(): void {
        this.samples = [];
        this.cursor = 0;
        this.frames = 0;
    }

    record(milliseconds: number) {
        if (this.scope === 'suspended' || !Number.isFinite(milliseconds) || milliseconds < 0) return;
        this.samples[this.cursor] = milliseconds;
        this.cursor = (this.cursor + 1) % 720;
        this.frames++;
    }

    read(): FrameObservations {
        const sorted = this.samples.slice().sort((a, b) => a - b);
        return {
            scope: this.scope,
            frames: this.frames,
            windowSamples: sorted.length,
            p95WorkMs: sorted.length ? sorted[Math.ceil(sorted.length * 0.95) - 1] : null
        };
    }
}
