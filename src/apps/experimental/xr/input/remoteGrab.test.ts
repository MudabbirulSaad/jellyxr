import { describe, expect, it, vi } from 'vitest';

import { constrainRemote, remoteHalfBounds, RemoteGrab, type RemoteBody } from './remoteGrab';
import type { Point3 } from '../fixtures/roomFixture';

const half = [0.04, 0.0175, 0.095] as const;
const body = (): RemoteBody => ({
    read: () => ({ position: [0, 1, -1], half }), hold: vi.fn(), move: vi.fn(), release: vi.fn()
});

describe('deliberate remote release momentum', () => {
    function fixture(start: Point3 = [0, 1, -1]) {
        let position = start;
        const release = vi.fn();
        const remote: RemoteBody = { read: () => ({ position, half }), hold: vi.fn(), release,
            move: next => { position = next; } };
        const grab = new RemoteGrab(remote);
        grab.begin('left', start);
        return { grab, release };
    }

    it('releases with bounded recent motion instead of the unbounded hand displacement', () => {
        const f = fixture();
        f.grab.update('left', [20, 1, -1]);
        f.grab.step(1 / 72);
        f.grab.drop('left');
        expect(f.release).toHaveBeenCalledOnce();
        expect(f.release).toHaveBeenCalledWith([3, 0, 0]);
        expect(f.grab.source()).toBeNull();
    });

    it('uses a vector speed cap for diagonal motion and bounded catch-up', () => {
        const f = fixture();
        f.grab.update('left', [20, 21, -1]);
        for (let i = 0; i < 4; i++) f.grab.step(1 / 72);
        f.grab.drop('left');
        const velocity = f.release.mock.calls[0][0] as Point3;
        expect(Math.hypot(...velocity)).toBeCloseTo(3);
        expect(velocity[0]).toBeCloseTo(3 / Math.sqrt(2));
        expect(velocity[1]).toBeCloseTo(3 / Math.sqrt(2));
    });

    it('does not throw through a wall when the held body is blocked', () => {
        const f = fixture([5.859, 1, -1]);
        f.grab.update('left', [20, 1, -1]);
        f.grab.step(1 / 72);
        f.grab.drop('left');
        expect(f.release).toHaveBeenCalledWith([0, 0, 0]);
    });

    it('discards stale movement rather than flinging after a long input gap', () => {
        const now = vi.spyOn(performance, 'now').mockReturnValue(0);
        try {
            const f = fixture();
            f.grab.update('left', [20, 1, -1]);
            f.grab.step(1 / 72);
            now.mockReturnValue(101);
            f.grab.drop('left');
            expect(f.release).toHaveBeenCalledWith([0, 0, 0]);
        } finally {
            now.mockRestore();
        }
    });

    it('replaces old momentum with a stationary sample and requires motion after reacquisition', () => {
        const f = fixture();
        f.grab.update('left', [20, 1, -1]);
        f.grab.step(1 / 72);
        const stopped = f.grab.readPose().position;
        f.grab.update('left', stopped);
        f.grab.step(1 / 72);
        f.grab.drop('left');
        expect(f.release).toHaveBeenLastCalledWith([0, 0, 0]);
        expect(f.grab.begin('right', stopped)).toBe(true);
        f.grab.drop('right');
        expect(f.release).toHaveBeenLastCalledWith([0, 0, 0]);
    });

    it('keeps interruption releases momentum-free and refuses another source', () => {
        const f = fixture();
        f.grab.update('left', [20, 1, -1]);
        f.grab.step(1 / 72);
        f.grab.drop('right');
        expect(f.release).not.toHaveBeenCalled();
        f.grab.release('left');
        expect(f.release).toHaveBeenCalledWith();
        f.grab.drop('left');
        expect(f.release).toHaveBeenCalledOnce();
    });

    it('cancels a nonfinite body sample before it can become native release velocity', () => {
        const release = vi.fn();
        const read = vi.fn(() => ({ position: [0, 1, -1] as Point3, half }));
        const move = vi.fn();
        const grab = new RemoteGrab({ read, move, release, hold: vi.fn() });
        expect(grab.begin('left', [0, 1, -1])).toBe(true);
        grab.update('left', [20, 1, -1]);
        grab.step(1 / 72);
        read.mockReturnValue({ position: [NaN, 1, -1], half });
        grab.step(1 / 72);
        expect(grab.source()).toBeNull();
        expect(release).toHaveBeenCalledWith();
        expect(move).toHaveBeenCalledOnce();
        grab.drop('left');
        expect(release).toHaveBeenCalledOnce();
    });
});

describe('bounded physical remote fixture', () => {
    it('sweeps through thin static geometry rather than accepting a clear endpoint beyond it', () => {
        const wall = constrainRemote([0, 1, 0], [20, 1, 0], half);
        expect(wall[0]).toBeCloseTo(5.859);
        const seat = constrainRemote([1.25, 0.3, 0], [1.25, 0.3, 3], half);
        // Authored chair proxy starts at z=1.08; the remote half-depth and skin stop it earlier.
        expect(seat[2]).toBeCloseTo(0.984);
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
