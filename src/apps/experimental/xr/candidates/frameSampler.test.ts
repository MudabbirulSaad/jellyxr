import { describe, expect, it } from 'vitest';

import { FrameSampler } from './frameSampler';

describe('application frame observations', () => {
    it('uses the nearest-rank p95 and ignores invalid observations', () => {
        const sampler = new FrameSampler();
        for (let work = 1; work <= 100; work++) sampler.record(work);
        sampler.record(NaN);
        sampler.record(-1);
        expect(sampler.read()).toEqual({ frames: 100, p95WorkMs: 95 });
    });

    it('evicts old work values from the bounded window while preserving the frame count', () => {
        const sampler = new FrameSampler();
        for (let index = 0; index < 720; index++) sampler.record(100);
        for (let index = 0; index < 720; index++) sampler.record(1);
        expect(sampler.read()).toEqual({ frames: 1440, p95WorkMs: 1 });
    });
});
