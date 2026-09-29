import { describe, expect, it, vi } from 'vitest';

import { constrainRemote, remoteHalfBounds, RemoteGrab, type RemoteBody } from './remoteGrab';

const half = [0.04, 0.0175, 0.095] as const;
const body = (): RemoteBody => ({
    read: () => ({ position: [0, 1, -1], half }), hold: vi.fn(), move: vi.fn(), release: vi.fn()
});

describe('bounded physical remote fixture', () => {
    it('sweeps through thin static geometry rather than accepting a clear endpoint beyond it', () => {
        const wall = constrainRemote([0, 1, 0], [20, 1, 0], half);
        expect(wall[0]).toBeCloseTo(5.859);
        const seat = constrainRemote([1.25, 0.3, 0], [1.25, 0.3, 3], half);
        expect(seat[2]).toBeCloseTo(1.044);
        const floor = constrainRemote([0, 1, 0], [0, -1, 0], half);
        expect(floor[1]).toBeCloseTo(0.0185);
    });

    it('allows a resting body to leave a shallow contact but blocks deeper movement into it', () => {
        expect(constrainRemote([0, 0.017, 0], [0, 1, 0], half)[1]).toBe(1);
        expect(constrainRemote([0, 0.017, 0], [0, -1, 0], half)[1]).toBe(0.017);
        expect(constrainRemote([0, 1, 0], [NaN, 1, 0], half)).toEqual([0, 1, 0]);
    });

    it('accounts for the held orientation when expanding static collision bounds', () => {
        expect(remoteHalfBounds([0, 0, 0, 1])).toEqual(half);
        const rotated = remoteHalfBounds([0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4)]);
        expect(rotated[0]).toBeCloseTo(half[2]);
        expect(rotated[2]).toBeCloseTo(half[0]);
    });

    it('requires near contact, grants one owner and releases on its tracking loss', () => {
        const remote = body();
        const grab = new RemoteGrab(remote);
        expect(grab.begin('left', [0, 1, 0])).toBe(false);
        expect(grab.begin('left', [0, 1, -1])).toBe(true);
        expect(grab.begin('right', [0, 1, -1])).toBe(false);
        grab.release('right');
        expect(grab.source()).toBe('left');
        grab.update('left', null);
        expect(grab.source()).toBeNull();
        expect(remote.release).toHaveBeenCalledTimes(1);
        grab.release();
        expect(remote.release).toHaveBeenCalledTimes(1);
    });

    it('limits catch-up and speed instead of teleporting to a fast-moving hand', () => {
        const remote = body();
        const grab = new RemoteGrab(remote);
        grab.begin('hand', [0, 1, -1]);
        grab.update('hand', [20, 1, -1]);
        grab.step(1);
        expect(remote.move).not.toHaveBeenCalled();
        grab.step(1 / 72);
        expect(remote.move).toHaveBeenCalledWith([3 / 72, 1, -1]);
        grab.release();
        grab.step(1 / 72);
        expect(remote.move).toHaveBeenCalledTimes(1);
    });
});
