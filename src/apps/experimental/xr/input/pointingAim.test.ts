import { describe, expect, it } from 'vitest';

import { CONTROL_TARGETS, INITIAL_CONTROL_ANCHOR, traceControl, type InputRay } from './controlTargets';
import { inspectPointing } from './pointingAim';
import { aimFloor } from './floorSelection';
import { unitRay } from './sceneQuery';

const ray: InputRay = { origin: [-0.3, 1.18, 0], direction: [0, 0, -1] };
const viewer = [0, 1.65, 0] as const;

describe('visible pointing and input bounds', () => {
    it('keeps normalized ray limits in metres and returns the actual world hit', () => {
        expect(traceControl({ ...ray, direction: [0, 0, -100] })).toEqual(traceControl(ray));
        expect(traceControl({ origin: [-0.3, 1.18, 10], direction: [0, 0, -100] })).toBeNull();
        const hit = traceControl({ origin: [0, 1.18, -0.3], direction: [1, 0, 0] }, undefined,
            { origin: [0, 0, 0], yaw: -Math.PI / 2 });
        expect(hit?.action).toBe('select-fixture');
        expect(hit?.point[0]).toBeCloseTo(1.4);
        expect(hit?.point[2]).toBeCloseTo(-0.3);
        for (const direction of [[0, 0, 0], [0, NaN, 0], [Number.MAX_VALUE, Number.MAX_VALUE, 0]] as const) {
            expect(unitRay({ ...ray, direction })).toBeNull();
        }
    });

    it('rejects control activation on either an input-path or viewer-sightline blocker', () => {
        const clear = inspectPointing(ray, undefined, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => null);
        expect(clear).toMatchObject({ action: 'select-fixture', blocked: false, point: [-0.3, 1.18, -1.4] });
        const sourceBlocked = inspectPointing(ray, undefined, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => 0.5);
        expect(sourceBlocked).toMatchObject({ action: null, blocked: true, point: [-0.3, 1.18, -0.5] });
        const viewerBlocked = inspectPointing(ray, undefined, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS,
            value => value.origin[0] === 0 ? 0.5 : null);
        expect(viewerBlocked).toMatchObject({ action: null, blocked: true, point: [-0.3, 1.18, -1.4] });
    });

    it('checks near contact depth and bounds the neutral ray at the first surface', () => {
        const near = [-0.3, 1.18, -1.38] as const;
        const clear = inspectPointing(ray, near, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => null);
        expect(clear).toMatchObject({ near: true, action: 'select-fixture', ray: { origin: near } });
        const blocked = inspectPointing(ray, near, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => 0.01);
        expect(blocked).toMatchObject({ near: true, action: null, blocked: true });
        const emptyRay: InputRay = { origin: [3, 1, 0], direction: [0, 0, -100] };
        expect(inspectPointing(emptyRay, undefined, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => 2))
            .toMatchObject({ action: 'summon-controls', point: [3, 1, -2] });
        expect(inspectPointing(emptyRay, undefined, viewer, INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => null)?.point)
            .toEqual([3, 1, -4]);
        expect(inspectPointing(ray, undefined, [NaN, 1, 0], INITIAL_CONTROL_ANCHOR, CONTROL_TARGETS, () => null)).toBeNull();
    });

    it('also rejects a clear proxy floor when visible geometry crosses the ray', () => {
        const floorRay: InputRay = { origin: viewer, direction: [2, -1.65, -2] };
        expect(aimFloor(floorRay).valid).toBe(true);
        expect(aimFloor(floorRay, () => 0.5).valid).toBe(false);
        expect(aimFloor(floorRay, (_input, distance) => distance).valid).toBe(true);
    });
});
