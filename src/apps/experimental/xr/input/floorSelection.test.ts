import { describe, expect, it, vi } from 'vitest';

import type { Point3 } from '../fixtures/roomFixture';

import { aimFloor, FloorSelection } from './floorSelection';
import { ComparisonInput } from './comparisonInput';
import { CONTROL_TARGETS, type InputRay } from './controlTargets';
import { MovementSession } from './movementSession';

const viewer = { position: [0, 1.65, 0] as Point3, forward: [0, 0, -1] as Point3 };
const rayTo = (point: Point3): InputRay => ({
    origin: viewer.position, direction: [point[0], -1.65, point[2]]
});

describe('floor destination proposals', () => {
    it('accepts normalized clear-floor rays and rejects blocked, outside or invalid destinations', () => {
        const ray = rayTo([2, 0, -2]);
        expect(aimFloor(ray)).toEqual({ point: [2, 0, -2], valid: true });
        expect(aimFloor({ ...ray, direction: ray.direction.map(value => value * 7) as unknown as Point3 }).valid).toBe(true);
        for (const point of [[0.35, 0, -1.2], [1.25, 0, 1.5], [0, 0, 5.2], [5.8, 0, -1]] as Point3[]) {
            expect(aimFloor(rayTo(point)).valid).toBe(false);
        }
        // The destination itself is clear, but the ray crosses the library plinth.
        expect(aimFloor(rayTo([0, 0, 6.2])).valid).toBe(false);
        for (const direction of [[0, 0, 0], [0, 1, 0], [0, -0.01, -1], [NaN, -1, 0]] as Point3[]) {
            expect(aimFloor({ origin: viewer.position, direction }).valid).toBe(false);
        }
        expect(aimFloor({ origin: [0.35, 0.4, -1.2], direction: [2, -0.4, -1] }).valid).toBe(false);
    });

    it('requires one matching source and rejects drift, invalidation and cancelled presses', () => {
        const floor = new FloorSelection();
        floor.observe(rayTo([2, 0, -2]));
        expect(floor.read().valid).toBe(false);
        floor.arm();
        floor.observe(rayTo([2, 0, -2]));
        floor.begin('left');
        expect(floor.commit('right')).toBeNull();
        floor.observe(rayTo([2.1, 0, -2]));
        expect(floor.commit('left')).toEqual([2.1, 0, -2]);
        expect(floor.isActive()).toBe(false);
        for (const interruption of ['drift', 'invalid', 'release', 'cancel']) {
            floor.arm();
            floor.observe(rayTo([2, 0, -2]));
            floor.begin('left');
            if (interruption === 'drift') floor.observe(rayTo([3, 0, -2]));
            if (interruption === 'invalid') floor.observe(null);
            if (interruption === 'release') floor.release('left');
            if (interruption === 'cancel') floor.cancel();
            floor.observe(rayTo([2, 0, -2]));
            expect(floor.commit('left')).toBeNull();
        }
    });

    it('offers keyboard selection, pause-before-move and Escape without any automatic resume', () => {
        const events: string[] = [];
        const movement = new MovementSession(() => events.push('pause'));
        const input = new ComparisonInput(vi.fn(), undefined, point => movement.requestDestination(point));
        input.update(null, null, undefined, viewer);
        const choose = CONTROL_TARGETS.findIndex(target => target.id === 'choose-floor');
        for (let n = 0; n <= choose; n++) input.key('down', 'ArrowRight');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(input.floor.isActive()).toBe(true);
        input.key('down', 'ArrowLeft');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        const root = vi.fn((value: unknown) => {
            events.push('move');
            return value;
        });
        expect(movement.update(null, null, undefined, vi.fn(), root)).toBe(true);
        expect(events).toEqual(['pause', 'move']);
        expect(root.mock.calls[0][0]).toEqual({ origin: [expect.closeTo(-0.25), 0, expect.closeTo(-3.5)], yaw: 0 });
        expect(movement.update(null, null, undefined, vi.fn(), root)).toBe(false);
        input.floor.arm();
        input.key('down', 'Escape');
        expect(input.floor.isActive()).toBe(false);
        input.dispose();
        movement.dispose();
    });

    it('keeps the viewer in place if pause fails or a queued destination is invalid', () => {
        const pause = vi.fn(() => {
            throw new Error('owner unavailable');
        });
        const movement = new MovementSession(pause);
        const root = vi.fn();
        movement.requestDestination([0.35, 0, -1.2]);
        expect(movement.update(null, null, undefined, vi.fn(), root)).toBe(false);
        expect(pause).not.toHaveBeenCalled();
        movement.requestDestination([2, 0, -2]);
        expect(() => movement.update(null, null, undefined, vi.fn(), root)).toThrow('owner unavailable');
        expect(root).not.toHaveBeenCalled();
        expect(movement.update(null, null, undefined, vi.fn(), root)).toBe(false);
        movement.dispose();
    });

    it.each([false, true])('uses completed native selection and cancels tracking loss (hand=%s)', hand => {
        const source = {
            targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined
        } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, -2, 1.65, 2, 0, 0, 1.65, 0, 1]);
        const frame = {
            getPose: vi.fn(() => ({ transform: { matrix } })),
            getJointPose: vi.fn(() => ({ transform: { position: { x: 0, y: 1.65, z: 0 } } })),
            getViewerPose: vi.fn(() => null)
        };
        const teleport = vi.fn();
        const input = new ComparisonInput(vi.fn(), undefined, teleport);
        const update = () => input.update(session as unknown as XRSession, {} as XRReferenceSpace, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        input.floor.arm();
        const away = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1.65, 0, 1]);
        frame.getPose.mockReturnValueOnce({ transform: { matrix: away } });
        update();
        expect(input.floor.isActive()).toBe(true);
        expect(input.floor.read().valid).toBe(false);
        event('selectstart');
        if (hand) frame.getJointPose.mockReturnValueOnce(null as never);
        else frame.getPose.mockReturnValueOnce(null as never);
        update();
        event('select');
        expect(teleport).not.toHaveBeenCalled();
        expect(input.floor.isActive()).toBe(false);
        input.floor.arm();
        event('selectstart');
        event('select');
        event('selectend');
        expect(teleport).toHaveBeenCalledTimes(1);
        expect(teleport.mock.calls[0][0][0]).toBeCloseTo(2);
        expect(teleport.mock.calls[0][0][2]).toBeCloseTo(-2);
        input.dispose();
    });

    it('does not expose hidden full-bank controls as floor-mode hit targets', () => {
        const input = new ComparisonInput(vi.fn());
        input.floor.arm();
        expect(input.layout.targets(true).map(target => target.id)).toEqual(['cancel-floor', 'return-seat', 'exit-xr']);
        const ray: InputRay = { origin: [-0.3, 1.18, 0], direction: [0, 0, -1] };
        input.pointer('down', ray);
        input.pointer('up', ray);
        expect(input.readStatus()).toContain('0 deliberate fixture selections');
        expect(input.floor.isActive()).toBe(true);
        input.dispose();
    });
});
