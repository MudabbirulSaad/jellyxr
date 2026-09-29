import { describe, expect, it, vi } from 'vitest';

import { MovementSession } from './movementSession';

describe('movement frame scheduling', () => {
    it('applies one deliberate desktop movement and never repeats it on later frames', () => {
        const pause = vi.fn();
        const desktop = vi.fn();
        const space = vi.fn();
        const movement = new MovementSession(pause);
        movement.request('library-position');
        expect(movement.update(null, null, undefined, space, desktop)).toBe(true);
        expect(pause).toHaveBeenCalledTimes(1);
        expect(desktop).toHaveBeenCalledExactlyOnceWith({ origin: [0, 0, 6.2], yaw: 0 });
        expect(movement.update(null, null, undefined, space, desktop)).toBe(false);
        expect(space).not.toHaveBeenCalled();
        movement.dispose();
    });

    it('discards queued movement on session visibility loss, including before another frame', () => {
        const pause = vi.fn();
        const desktop = vi.fn();
        const setSpace = vi.fn();
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible' });
        const reference = {} as XRReferenceSpace;
        const frame = { getViewerPose: vi.fn() } as unknown as XRFrame;
        const movement = new MovementSession(pause);
        movement.update(session as unknown as XRSession, reference, frame, setSpace, desktop);
        movement.request('turn-left');
        session.dispatchEvent(new Event('visibilitychange'));
        expect(movement.update(session as unknown as XRSession, reference, frame, setSpace, desktop)).toBe(false);
        expect(pause).not.toHaveBeenCalled();
        expect(frame.getViewerPose).not.toHaveBeenCalled();
        movement.dispose();
    });

    it('does not defer a requested teleport until missing head tracking returns', () => {
        const pause = vi.fn();
        const desktop = vi.fn();
        const setSpace = vi.fn();
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible' });
        const reference = {} as XRReferenceSpace;
        const frame = { getViewerPose: vi.fn(() => null) } as unknown as XRFrame;
        const movement = new MovementSession(pause);
        movement.update(session as unknown as XRSession, reference, frame, setSpace, desktop);
        movement.request('return-seat');
        expect(movement.update(session as unknown as XRSession, reference, frame, setSpace, desktop)).toBe(false);
        expect(movement.update(session as unknown as XRSession, reference, frame, setSpace, desktop)).toBe(false);
        expect(frame.getViewerPose).toHaveBeenCalledTimes(1);
        expect(pause).not.toHaveBeenCalled();
        expect(setSpace).not.toHaveBeenCalled();
        movement.dispose();
    });
});
