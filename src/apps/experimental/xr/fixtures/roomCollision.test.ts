import { describe, expect, it, vi } from 'vitest';

import { aimFloor } from '../input/floorSelection';
import { constrainRemote } from '../input/remoteGrab';

import { boxRayDistance, overlapsBox, rotatePitch } from './boxGeometry';
import { RoomCollision } from './roomCollision';
import { DEFAULT_SCREEN_POSE, screenBox } from './screenFixture';

const viewer = [0, 1.65, 0] as const;
const moved = { distance: 4.5, height: 1.8, tilt: 15 };

describe('screen placement and shared collision queries', () => {
    it('moves only this scene, removes the old obstruction, and rejects floor aims through the new screen', () => {
        const room = new RoomCollision();
        const other = new RoomCollision();
        expect(room.destinationClear([0, 0, -6.5])).toBe(false);
        expect(room.tryScreen(80, moved, viewer)).toBeNull();
        expect(room.destinationClear([0, 0, -6.5])).toBe(true);
        expect(other.destinationClear([0, 0, -6.5])).toBe(false);
        expect(room.destinationClear([0, 0, -4.5])).toBe(false);
        const floor = aimFloor({ origin: [0, 1.65, -3], direction: [0, -1.65, -3] }, undefined, room.read());
        expect(floor.valid).toBe(false);
        const free = constrainRemote([0, 2, -6], [0, 2, -6.7], [0.05, 0.05, 0.05], room.read());
        expect(free).toEqual([0, 2, -6.7]);
        const stopped = constrainRemote([0, 1.8, -3], [0, 1.8, -6], [0.05, 0.05, 0.05], room.read());
        expect(stopped[2]).toBeGreaterThan(-4.5);
        expect(stopped[2]).toBeLessThan(-4.3);
    });

    it('rejects room overlap and invalid tracking without applying or changing the prior placement', () => {
        const apply = vi.fn();
        const room = new RoomCollision(apply);
        const before = room.read();
        expect(room.tryScreen(100, { ...DEFAULT_SCREEN_POSE, height: 1.2 }, viewer)).toContain('meet the room');
        expect(room.tryScreen(100, { ...DEFAULT_SCREEN_POSE, height: 2.8 }, viewer)).toContain('meet the room');
        expect(room.tryScreen(100, DEFAULT_SCREEN_POSE, undefined)).toContain('Tracking unavailable');
        expect(room.tryScreen(100, { ...DEFAULT_SCREEN_POSE, tilt: NaN }, viewer)).toContain('limit');
        expect(room.read()).toBe(before);
        expect(apply).not.toHaveBeenCalled();
    });

    it('refuses to sweep a screen through the viewer or remote and requires clear reset', () => {
        const room = new RoomCollision();
        expect(room.tryScreen(80, moved, viewer, { position: [0, 2, -5.2], half: [0.1, 0.1, 0.1] })).toContain('Remote is in the way');
        expect(room.tryScreen(80, moved, viewer)).toBeNull();
        const previous = room.readScreen();
        expect(room.tryScreen(100, DEFAULT_SCREEN_POSE, [0, 1.65, -4.6])).toContain('cross your position');
        expect(room.tryScreen(80, { ...moved, distance: 4.25 }, [0, 1.65, -3])).toContain('too close');
        expect(room.readScreen()).toBe(previous);
        expect(room.tryScreen(100, DEFAULT_SCREEN_POSE, viewer)).toBeNull();
        expect(room.readScreen().position).toEqual([0, 2, -6.5]);
    });

    it('keeps query state unchanged when the physics adapter rejects a placement', () => {
        const room = new RoomCollision(() => {
            throw new Error('Disposed engine');
        });
        const before = room.read();
        expect(room.tryScreen(80, moved, viewer)).toContain('Previous placement retained');
        expect(room.read()).toBe(before);
    });

    it('uses the oriented surface rather than an oversized axis-aligned screen obstacle', () => {
        const box = screenBox(80, moved);
        const pitch = -Math.PI / 12;
        const centreRay = boxRayDistance([0, 1.8, 0], [0, 0, -1], box);
        expect(centreRay).toBeCloseTo(4.5 - 0.02 / Math.cos(pitch));
        expect(boxRayDistance([4, 1.8, 0], [0, 0, -1], box)).toBeNull();
        expect(boxRayDistance(box.position, [0, 0, -1], box)).toBe(0);
        const corner = rotatePitch([0, 1, 0], pitch);
        expect(overlapsBox([corner[0], corner[1] + 1.8, corner[2] - 4.5], [0.01, 0.01, 0.01], box)).toBe(true);
        expect(overlapsBox([0, 2.8, -4.2], [0.01, 0.01, 0.01], box)).toBe(false);
    });
});
