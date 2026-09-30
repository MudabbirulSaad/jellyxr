import { describe, expect, it, vi } from 'vitest';

import { PhysicsScheduler } from './physicsScheduler';

describe('native sleep scheduling', () => {
    it('keeps an awake body running and caps catch-up at four fixed steps', () => {
        const activity = { awake: () => true, wake: vi.fn() };
        const scheduler = new PhysicsScheduler(activity);
        const revision = {};
        const step = vi.fn();
        expect(scheduler.advance(0, false, revision, step)).toBe(0);
        expect(scheduler.advance(20, false, revision, step)).toBe(1);
        expect(scheduler.advance(120000, false, revision, step)).toBe(4);
        expect(activity.wake).toHaveBeenCalledTimes(1);
        expect(step).toHaveBeenCalledTimes(5);
        expect(scheduler.status()).toBe('Physics: Active; 5 fixed steps; 0 idle frames skipped.');
    });

    it('skips sleeping frames and discards idle time before the next deliberate wake', () => {
        let awake = false;
        const activity = { awake: () => awake, wake: vi.fn() };
        const scheduler = new PhysicsScheduler(activity);
        const revision = {};
        const step = vi.fn();
        for (const time of [0, 1000, 120000]) expect(scheduler.advance(time, false, revision, step)).toBe(0);
        expect(scheduler.status()).toBe('Physics: Idle (native sleep); 0 fixed steps; 3 idle frames skipped.');
        awake = true;
        expect(scheduler.advance(7200000, false, revision, step)).toBe(0);
        expect(scheduler.advance(7200020, false, revision, step)).toBe(1);
        expect(step).toHaveBeenCalledTimes(1);
    });

    it('defers collider wake-up while suspended and never replays hidden time', () => {
        let awake = true;
        const activity = { awake: () => awake, wake: vi.fn(() => {
            awake = true;
        }) };
        const scheduler = new PhysicsScheduler(activity);
        const oldRoom = {};
        const newRoom = {};
        const step = vi.fn();
        scheduler.advance(0, false, oldRoom, step);
        scheduler.advance(20, false, oldRoom, step);
        awake = false;
        scheduler.reset();
        expect(scheduler.advance(1000, true, newRoom, step)).toBe(0);
        expect(activity.wake).toHaveBeenCalledTimes(1);
        expect(scheduler.status()).toContain('Suspended');
        expect(scheduler.advance(7200000, false, newRoom, step)).toBe(0);
        expect(activity.wake).toHaveBeenCalledTimes(2);
        expect(scheduler.advance(7200020, false, newRoom, step)).toBe(1);
        expect(step).toHaveBeenCalledTimes(2);
    });
});
