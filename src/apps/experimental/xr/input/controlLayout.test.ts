import { describe, expect, it, vi } from 'vitest';

import { ControlLayout, isControlPlacementClear, isControlPlacementInView, type ControlViewerPose } from './controlLayout';
import { CONTROL_TARGETS, hitControl } from './controlTargets';
import { rotateFloorPoint, viewerWorldPosition } from './movement';
import { ComparisonInput } from './comparisonInput';
import { controlVisualState } from './controlArtwork';

describe('stable control recall', () => {
    it('places a clear, level bank after all twelve snap orientations at the seat and library', () => {
        for (const z of [0, 6.2]) {
            for (let step = 0; step < 12; step++) {
                const layout = new ControlLayout();
                const yaw = step * Math.PI / 6;
                const viewer: ControlViewerPose = { position: [0, 1.3, z], forward: [-Math.sin(yaw), 0.4, -Math.cos(yaw)] };
                layout.request();
                const result = layout.update(viewer);
                expect(['placed', 'recovery']).toContain(result);
                const anchor = layout.read();
                expect(isControlPlacementClear(anchor, layout.targets())).toBe(true);
                expect(isControlPlacementInView(viewer, anchor, layout.targets())).toBe(true);
                const target = layout.targets()[0];
                const centre = viewerWorldPosition(anchor, target.position);
                const normal = rotateFloorPoint([0, 0, 1], anchor.yaw);
                const front = centre.map((value, axis) => value + normal[axis] * 0.1) as [number, number, number];
                const back = centre.map((value, axis) => value - normal[axis] * 0.1) as [number, number, number];
                expect(hitControl({ origin: front, direction: [-normal[0], 0, -normal[2]] }, undefined, anchor, layout.targets())).toBe(target.id);
                expect(hitControl({ origin: back, direction: normal }, undefined, anchor, layout.targets())).toBeNull();
                expect(hitControl(null, front, anchor, layout.targets())).toBeNull();
                const contact = centre.map((value, axis) => value + normal[axis] * 0.02) as [number, number, number];
                expect(hitControl(null, contact, anchor, layout.targets())).toBe(target.id);
                expect(layout.update({ position: [1, 1.8, -1], forward: [1, 0, 0] })).toBe('unchanged');
                expect(layout.read()).toBe(anchor);
            }
        }
    });

    it('rejects missing, vertical, invalid or obstructed poses without moving or retrying later', () => {
        const layout = new ControlLayout();
        const original = layout.read();
        const poses = [
            undefined,
            { position: [0, 1.6, 0], forward: [0, 1, 0] },
            { position: [NaN, 1.6, 0], forward: [0, 0, -1] },
            { position: [20, 1.6, 0], forward: [0, 0, -1] }
        ] as (ControlViewerPose | undefined)[];
        for (const pose of poses) {
            layout.request();
            expect(layout.update(pose)).toBe('unavailable');
            expect(layout.read()).toBe(original);
            expect(layout.update({ position: [0, 1.6, 0], forward: [0, 0, -1] })).toBe('unchanged');
        }
        layout.request();
        layout.cancel();
        expect(layout.update({ position: [0, 1.6, 0], forward: [0, 0, -1] })).toBe('unchanged');
    });

    it('requires a completed empty-space click and a current pose; Home provides an alternative', () => {
        const action = vi.fn();
        const input = new ComparisonInput(action);
        const ray = { origin: [0, 1.6, 0] as const, direction: [0, 0, 1] as const };
        const viewer = { position: [0, 1.6, 0] as const, forward: [0, 0, 1] as const };
        input.pointer('move', ray);
        expect(input.layout.isPending()).toBe(false);
        input.pointer('down', ray);
        input.pointer('cancel', null);
        input.pointer('up', ray);
        expect(action).not.toHaveBeenCalled();
        input.pointer('down', ray);
        input.pointer('up', ray);
        expect(action).toHaveBeenCalledExactlyOnceWith('summon-controls');
        input.update(null, null, undefined, viewer);
        expect(input.layout.read().yaw).toBeCloseTo(-Math.PI);
        expect(isControlPlacementClear(input.layout.read())).toBe(true);
        input.key('down', 'Home');
        expect(input.layout.isPending()).toBe(true);
        input.cancel();
        input.update(null, null, undefined, { ...viewer, forward: [0, 0, -1] });
        expect(input.layout.read().yaw).toBeCloseTo(-Math.PI);
        input.dispose();
    });

    it('keeps the keyboard focus indicator when hover is cancelled for recovery', () => {
        const input = new ComparisonInput(vi.fn());
        input.key('down', 'ArrowRight');
        input.cancel();
        expect(controlVisualState(CONTROL_TARGETS[0], input.state.read())).toBe('focus');
        input.dispose();
    });

    it('offers only visible recovery actions to the keyboard when the full bank cannot fit', () => {
        const action = vi.fn();
        const input = new ComparisonInput(action);
        input.summonControls();
        input.update(null, null, undefined, { position: [0, 1.3, 6.2], forward: [0, 0, 1] });
        expect(input.layout.targets().map(target => target.id)).toEqual(['return-seat', 'exit-xr']);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        input.key('down', 'ArrowRight');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        input.key('down', 'ArrowRight');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(action.mock.calls.map(call => call[0])).toEqual(['return-seat', 'exit-xr', 'return-seat']);
        input.dispose();
    });

    it.each([false, true])('recalls from a completed native selection (hand=%s) using the current head pose', hand => {
        const source = {
            targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined
        } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const space = {} as XRReferenceSpace;
        const backMatrix = new Float32Array([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 1.6, 0, 1]);
        const frontMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1.6, 0, 1]);
        const frame = {
            getPose: vi.fn(() => ({ transform: { matrix: backMatrix } })),
            getJointPose: vi.fn(() => ({ transform: { position: { x: 0, y: 1.6, z: 0.1 } } })),
            getViewerPose: vi.fn(() => ({ transform: { position: { x: 0, y: 1.6, z: 0 }, matrix: frontMatrix } }))
        };
        const action = vi.fn();
        const input = new ComparisonInput(action);
        const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        const original = input.layout.read();
        event('selectstart');
        frame.getPose.mockReturnValueOnce(null as never);
        update();
        event('select');
        expect(action).not.toHaveBeenCalled();
        expect(input.layout.read()).toBe(original);
        event('selectstart');
        event('select');
        event('selectend');
        frame.getViewerPose.mockReturnValue({ transform: { position: { x: 0, y: 1.6, z: 0 }, matrix: backMatrix } });
        update();
        expect(action).toHaveBeenCalledExactlyOnceWith('summon-controls');
        expect(Math.abs(input.layout.read().yaw)).toBeCloseTo(Math.PI);
        expect(isControlPlacementClear(input.layout.read(), input.layout.targets())).toBe(true);
        const recalled = input.layout.read();
        frame.getViewerPose.mockReturnValue({ transform: { position: { x: 1, y: 1.6, z: 0 }, matrix: frontMatrix } });
        update();
        expect(input.layout.read()).toBe(recalled);
        input.dispose();
    });
});
