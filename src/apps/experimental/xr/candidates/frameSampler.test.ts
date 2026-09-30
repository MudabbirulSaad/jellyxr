import { describe, expect, it, vi } from 'vitest';

import { FrameSampler } from './frameSampler';
import { SessionRecovery } from '../input/sessionRecovery';

describe('application frame observations', () => {
    it('uses the nearest-rank p95 and ignores invalid observations', () => {
        const sampler = new FrameSampler();
        for (let work = 1; work <= 100; work++) sampler.record(work);
        sampler.record(NaN);
        sampler.record(-1);
        expect(sampler.read()).toMatchObject({ frames: 100, windowSamples: 100, p95WorkMs: 95 });
    });

    it('evicts old work values from the bounded window while preserving the frame count', () => {
        const sampler = new FrameSampler();
        for (let index = 0; index < 720; index++) sampler.record(100);
        for (let index = 0; index < 720; index++) sampler.record(1);
        expect(sampler.read()).toMatchObject({ frames: 1440, windowSamples: 720, p95WorkMs: 1 });
    });

    it('starts fresh windows for desktop, XR entry and XR exit', () => {
        const sampler = new FrameSampler();
        sampler.record(90);
        sampler.synchronize({}, false);
        expect(sampler.read()).toEqual({ scope: 'immersive-xr', frames: 0, windowSamples: 0, p95WorkMs: null });
        sampler.record(4);
        expect(sampler.read()).toMatchObject({ frames: 1, p95WorkMs: 4 });
        sampler.synchronize(null, false);
        expect(sampler.read()).toEqual({ scope: 'desktop-preview', frames: 0, windowSamples: 0, p95WorkMs: null });
        sampler.record(2);
        expect(sampler.read()).toMatchObject({ frames: 1, p95WorkMs: 2 });
    });

    it('separates different immersive sessions but preserves a stable session window', () => {
        const sampler = new FrameSampler();
        const session = {};
        sampler.synchronize(session, false);
        sampler.record(90);
        sampler.synchronize(session, false);
        sampler.record(2);
        expect(sampler.read()).toMatchObject({ frames: 2, windowSamples: 2, p95WorkMs: 90 });
        sampler.synchronize({}, false);
        expect(sampler.read()).toMatchObject({ scope: 'immersive-xr', frames: 0, p95WorkMs: null });
    });

    it.each(['hidden', 'visible-blurred'])('clears %s observations through a native event without another animation frame', visibility => {
        const sampler = new FrameSampler();
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', end: vi.fn() });
        const recovery = new SessionRecovery({ cancelPending: () => sampler.suspend(), pause: vi.fn(), report: vi.fn() });
        recovery.bind(session as unknown as XRSession, null);
        sampler.synchronize(session, recovery.isSuspended());
        sampler.record(90);
        session.visibilityState = visibility;
        session.dispatchEvent(new Event('visibilitychange'));
        expect(sampler.read()).toEqual({ scope: 'suspended', frames: 0, windowSamples: 0, p95WorkMs: null });
        sampler.record(40);
        expect(sampler.read().frames).toBe(0);
        session.visibilityState = 'visible';
        session.dispatchEvent(new Event('visibilitychange'));
        sampler.synchronize(session, recovery.isSuspended());
        sampler.record(3);
        expect(sampler.read()).toEqual({ scope: 'immersive-xr', frames: 1, windowSamples: 1, p95WorkMs: 3 });
        recovery.dispose();
    });

    it('suspends ordinary-page observations and resumes without retaining the old workload', () => {
        const sampler = new FrameSampler();
        sampler.record(90);
        sampler.synchronize(null, true);
        sampler.record(80);
        sampler.synchronize(null, true);
        expect(sampler.read()).toMatchObject({ scope: 'suspended', frames: 0, p95WorkMs: null });
        sampler.synchronize(null, false);
        sampler.record(1);
        expect(sampler.read()).toEqual({ scope: 'desktop-preview', frames: 1, windowSamples: 1, p95WorkMs: 1 });
    });

    it.each(['end', 'reset'])('keeps %s timing suspended after a manual reset until presentation recovers', event => {
        const sampler = new FrameSampler();
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', end: vi.fn(async () => undefined) });
        const space = new EventTarget();
        const recovery = new SessionRecovery({ cancelPending: () => sampler.suspend(), pause: vi.fn(), report: vi.fn() });
        recovery.bind(session as unknown as XRSession, space as XRReferenceSpace);
        sampler.synchronize(session, recovery.isSuspended());
        sampler.record(90);
        (event === 'end' ? session : space).dispatchEvent(new Event(event));
        sampler.reset();
        sampler.synchronize(session, recovery.isSuspended());
        sampler.record(40);
        expect(sampler.read()).toEqual({ scope: 'suspended', frames: 0, windowSamples: 0, p95WorkMs: null });
        recovery.bind(null, null);
        sampler.synchronize(null, recovery.isSuspended());
        sampler.record(2);
        expect(sampler.read()).toMatchObject({ scope: 'desktop-preview', frames: 1, p95WorkMs: 2 });
        recovery.dispose();
    });

    it('clears warmup history on manual/media reset without changing the current scope', () => {
        const sampler = new FrameSampler();
        const session = {};
        sampler.synchronize(session, false);
        for (let index = 0; index < 800; index++) sampler.record(90);
        sampler.reset();
        expect(sampler.read()).toEqual({ scope: 'immersive-xr', frames: 0, windowSamples: 0, p95WorkMs: null });
        sampler.synchronize(session, false);
        sampler.record(2);
        expect(sampler.read()).toMatchObject({ frames: 1, windowSamples: 1, p95WorkMs: 2 });
    });

    it('distinguishes pending observations from a valid zero-duration sample', () => {
        const sampler = new FrameSampler();
        sampler.record(Infinity);
        sampler.record(NaN);
        sampler.record(-1);
        expect(sampler.read()).toEqual({ scope: 'desktop-preview', frames: 0, windowSamples: 0, p95WorkMs: null });
        sampler.record(0);
        expect(sampler.read()).toEqual({ scope: 'desktop-preview', frames: 1, windowSamples: 1, p95WorkMs: 0 });
    });
});
