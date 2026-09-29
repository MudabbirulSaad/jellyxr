import { describe, expect, it, vi } from 'vitest';

import {
    applyMovement, INITIAL_VIEWER_ROOT, inverseReferenceTransform, rotateFloorPoint,
    SNAP_RADIANS, snapViewer, teleportViewer, viewerWorldPosition
} from './movement';

describe('deliberate room movement', () => {
    it('teleports the floor projection while retaining real tracked height and yaw', () => {
        const tracked = [0.7, 1.23, -0.4] as const;
        const root = teleportViewer({ origin: [1, 0, 2], yaw: Math.PI / 2 }, tracked, [0, 0, 6.2]);
        expect(root).not.toBeNull();
        const position = viewerWorldPosition(root!, tracked);
        expect(position[0]).toBeCloseTo(0);
        expect(position[1]).toBeCloseTo(1.23);
        expect(position[2]).toBeCloseTo(6.2);
        expect(root!.yaw).toBe(Math.PI / 2);
    });

    it('rejects outside-room, obstructed, elevated and invalid destinations', () => {
        const tracked = [0, 1.65, 0] as const;
        expect(teleportViewer(INITIAL_VIEWER_ROOT, tracked, [7, 0, 0])).toBeNull();
        expect(teleportViewer(INITIAL_VIEWER_ROOT, tracked, [1.25, 0, 1.5])).toBeNull();
        expect(teleportViewer(INITIAL_VIEWER_ROOT, tracked, [0, 0.5, 0])).toBeNull();
        expect(teleportViewer(INITIAL_VIEWER_ROOT, [NaN, 1, 0], [0, 0, 0])).toBeNull();
    });

    it('snap turns exactly thirty degrees around the head without position drift', () => {
        const tracked = [0.65, 1.8, -0.45] as const;
        const root = { origin: [1.3, 0, 2.1] as const, yaw: 0.2 };
        const next = snapViewer(root, tracked, 1)!;
        expect(next.yaw - root.yaw).toBeCloseTo(SNAP_RADIANS);
        const before = viewerWorldPosition(root, tracked);
        const after = viewerWorldPosition(next, tracked);
        after.forEach((value, index) => {
            expect(value).toBeCloseTo(before[index]);
        });
        const back = snapViewer(next, tracked, -1)!;
        back.origin.forEach((value, index) => {
            expect(value).toBeCloseTo(root.origin[index]);
        });
        expect(back.yaw).toBeCloseTo(root.yaw);
    });

    it('produces the inverse native-reference transform for the same world mapping', () => {
        const root = { origin: [2, 0, -3] as const, yaw: Math.PI / 3 };
        const native = inverseReferenceTransform(root);
        const restored = rotateFloorPoint(native.position, root.yaw);
        restored.forEach((value, index) => {
            expect(value + root.origin[index]).toBeCloseTo(0);
        });
        expect(native.orientation[1]).toBeCloseTo(-0.5);
        expect(native.orientation[3]).toBeCloseTo(Math.sqrt(3) / 2);
    });

    it('pauses before movement, never resumes and performs no work for a rejected destination', () => {
        const order: string[] = [];
        const host = {
            pauseForMovement: vi.fn(() => { order.push('pause'); }),
            applyRoot: vi.fn(() => { order.push('move'); })
        };
        expect(applyMovement(null, host)).toBe(false);
        expect(order).toEqual([]);
        expect(applyMovement(INITIAL_VIEWER_ROOT, host)).toBe(true);
        expect(order).toEqual(['pause', 'move']);
        host.pauseForMovement.mockImplementation(() => {
            throw new Error('Pause rejected');
        });
        expect(() => applyMovement(INITIAL_VIEWER_ROOT, host)).toThrow('Pause rejected');
        expect(host.applyRoot).toHaveBeenCalledTimes(1);
    });
});
