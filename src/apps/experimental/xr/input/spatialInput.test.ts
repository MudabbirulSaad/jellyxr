import { describe, expect, it, vi } from 'vitest';

import { ActivationState } from './activationState';
import { CONTROL_TARGETS, hitControl } from './controlTargets';
import { ComparisonInput } from './comparisonInput';
import type { SceneSurfaceQuery } from './sceneQuery';

describe('visible control geometry', () => {
    it('hits each visible centre and rejects the gap, back face and nonfinite rays', () => {
        for (const target of CONTROL_TARGETS) {
            expect(hitControl({ origin: [target.position[0], target.position[1], target.position[2] + 1], direction: [0, 0, -1] })).toBe(target.id);
        }
        expect(hitControl({ origin: [0, 1.18, 0], direction: [0, 0, -1] })).toBeNull();
        expect(hitControl({ origin: [-0.3, 1.18, -2], direction: [0, 0, 1] })).toBeNull();
        expect(hitControl({ origin: [NaN, 1.18, 0], direction: [0, 0, -1] })).toBeNull();
    });

    it('uses a bounded front contact region for near selection', () => {
        expect(hitControl(null, [-0.3, 1.18, -1.38])).toBe('select-fixture');
        expect(hitControl(null, [-0.3, 1.18, -1.5])).toBeNull();
        expect(hitControl(null, [-0.3, 1.18, -1.2])).toBeNull();
    });
});

describe('deliberate activation', () => {
    it('never activates from hovering or a release without a matching press', () => {
        const state = new ActivationState();
        state.observe('left', 'select-fixture');
        expect(state.commit('left', 'select-fixture')).toBeNull();
        state.begin('left', 'select-fixture');
        expect(state.commit('left', 'select-fixture')).toBe('select-fixture');
        expect(state.commit('left', 'select-fixture')).toBeNull();
    });

    it('cancels on loss or target departure and retains logical focus', () => {
        const state = new ActivationState();
        state.begin('controller', 'select-fixture');
        state.observe('controller', null);
        state.observe('controller', 'select-fixture');
        expect(state.commit('controller', 'select-fixture')).toBeNull();
        expect(state.read().focus).toBe('select-fixture');
        state.begin('controller', 'recall-remote');
        state.cancel('controller');
        expect(state.commit('controller', 'recall-remote')).toBeNull();
        expect(state.read().focus).toBe('recall-remote');
    });

    it('prevents another hand/controller from stealing a pending activation', () => {
        const state = new ActivationState();
        state.begin('controller', 'select-fixture');
        state.begin('hand', 'select-fixture');
        expect(state.commit('hand', 'select-fixture')).toBeNull();
        expect(state.commit('controller', 'select-fixture')).toBe('select-fixture');
        expect(state.commit('hand', 'select-fixture')).toBeNull();
    });
});

function fixture(query?: SceneSurfaceQuery) {
    const session = Object.assign(new EventTarget(), {
        visibilityState: 'visible', inputSources: [] as XRInputSource[]
    });
    const space = {} as XRReferenceSpace;
    const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {} } as XRInputSource;
    const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.3, 1.18, 0, 1]);
    const frame = {
        getViewerPose: vi.fn(() => ({ transform: { matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1.65, 0, 1]), position: { x: 0, y: 1.65, z: 0 } } })),
        getPose: vi.fn(() => ({ transform: { matrix } })),
        getJointPose: vi.fn(() => ({ transform: { position: { x: -0.3, y: 1.18, z: -1.38 } } }))
    };
    session.inputSources = [source];
    const action = vi.fn();
    const input = new ComparisonInput(action, undefined, undefined, query);
    const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
    const eventFrame = { ...frame, getViewerPose: vi.fn(() => {
        throw new Error('getViewerPose is forbidden on input-event frames');
    }) };
    const event = (name: string, inputSource = source) => {
        session.dispatchEvent(Object.assign(new Event(name), { inputSource, frame: eventFrame }));
    };
    update();
    return { input, action, session, source, frame, update, event };
}

describe('native controller and hand event adapter', () => {
    it('offers deliberate keyboard selection and cancels Escape before release', () => {
        const action = vi.fn();
        const input = new ComparisonInput(action);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        input.key('down', 'ArrowRight');
        input.key('down', 'Enter');
        input.key('down', 'Escape');
        input.key('up', 'Enter');
        expect(action).toHaveBeenCalledTimes(1);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(action).toHaveBeenLastCalledWith('reset-count');
        input.dispose();
    });
    it('uses select for a completed trigger; selectend alone is cancellation', () => {
        const { input, action, event } = fixture();
        event('selectstart');
        event('selectend');
        expect(action).not.toHaveBeenCalled();
        event('selectstart');
        event('select');
        event('selectend');
        expect(action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        input.dispose();
        event('selectstart');
        event('select');
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('requires a tracked hand joint and cancels a pinch when tracking disappears', () => {
        const { input, action, source, frame, update, event } = fixture();
        Object.assign(source, { hand: new Map([['index-finger-tip', {}]]) });
        event('selectstart');
        frame.getJointPose.mockReturnValueOnce(null as never);
        update();
        event('select');
        expect(action).not.toHaveBeenCalled();
        event('selectstart');
        event('select');
        expect(action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        input.dispose();
    });

    it('rejects gaze and drops a pending press when session visibility is lost', () => {
        const { input, action, source, session, update, event } = fixture();
        Object.assign(source, { targetRayMode: 'gaze' });
        event('selectstart');
        event('select');
        expect(action).not.toHaveBeenCalled();
        Object.assign(source, { targetRayMode: 'tracked-pointer' });
        event('selectstart');
        session.visibilityState = 'hidden';
        update();
        session.visibilityState = 'visible';
        event('select');
        expect(action).not.toHaveBeenCalled();
        input.dispose();
    });

    it('keeps hover on a valid target even if another input misses', () => {
        const { input, session, frame, update } = fixture();
        session.inputSources.push({ targetRayMode: 'gaze' } as XRInputSource);
        update();
        expect(input.state.read().hover).toBe('select-fixture');
        frame.getPose.mockReturnValueOnce(null as never);
        update();
        expect(input.state.read().hover).toBeNull();
        input.dispose();
    });

    it('prioritizes an aimed second controller over an empty first ray, then keeps the pressed owner', () => {
        const f = fixture();
        const idle = { targetRayMode: 'tracked-pointer', targetRaySpace: {} } as XRInputSource;
        const hit = f.frame.getPose();
        const empty = new Float32Array(hit.transform.matrix);
        empty[12] = 3;
        f.frame.getPose.mockImplementation((space?: XRSpace) => space === idle.targetRaySpace ? { transform: { matrix: empty } } : hit);
        f.session.inputSources.unshift(idle);
        f.update();
        expect(f.input.readPointing()?.action).toBe('select-fixture');
        expect(f.input.state.read().hover).toBe('select-fixture');
        f.event('selectstart');
        expect(f.input.readPointing()?.pressed).toBe(true);
        f.event('selectstart', idle);
        f.event('select', idle);
        expect(f.action).not.toHaveBeenCalled();
        expect(f.input.readPointing()?.pressed).toBe(true);
        f.event('select');
        expect(f.action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        f.input.dispose();
    });

    it('cancels a held selection when geometry blocks it, and does not commit after clearance returns', () => {
        let blocked = false;
        const f = fixture(() => blocked ? 0.4 : null);
        f.event('selectstart');
        blocked = true;
        f.update();
        expect(f.input.readPointing()).toMatchObject({ blocked: true, pressed: false, action: null });
        expect(f.input.state.read().focus).toBe('select-fixture');
        blocked = false;
        f.event('select');
        expect(f.action).not.toHaveBeenCalled();
        f.event('selectstart');
        f.event('select');
        expect(f.action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        f.input.dispose();
    });

    it('prefers a tracked near hand contact over another controller ray', () => {
        const f = fixture();
        const hand = { targetRayMode: 'tracked-pointer', targetRaySpace: {}, hand: new Map([['index-finger-tip', {}]]) } as XRInputSource;
        f.session.inputSources.push(hand);
        f.update();
        expect(f.input.readPointing()).toMatchObject({ action: 'select-fixture', near: true });
        f.input.dispose();
    });

    it('rejects an event when no recent animation-frame head sample exists', () => {
        const f = fixture();
        f.event('selectstart');
        const now = vi.spyOn(performance, 'now').mockReturnValue(performance.now() + 101);
        try {
            f.event('select');
            expect(f.action).not.toHaveBeenCalled();
            expect(f.input.readPointing()).toBeNull();
        } finally {
            now.mockRestore();
            f.input.dispose();
        }
    });

    it.each(['viewer', 'source', 'removed', 'hidden', 'ended'])('removes stale pointing on %s loss while retaining logical focus', loss => {
        const f = fixture();
        f.event('selectstart');
        if (loss === 'viewer') f.frame.getViewerPose.mockReturnValueOnce(null as never);
        if (loss === 'source') f.frame.getPose.mockReturnValueOnce(null as never);
        if (loss === 'viewer' || loss === 'source') f.update();
        if (loss === 'removed') f.session.dispatchEvent(Object.assign(new Event('inputsourceschange'), { removed: [f.source] }));
        if (loss === 'hidden') f.session.dispatchEvent(new Event('visibilitychange'));
        if (loss === 'ended') f.session.dispatchEvent(new Event('end'));
        expect(f.input.readPointing()).toBeNull();
        expect(f.input.state.read().focus).toBe('select-fixture');
        f.event('select');
        expect(f.action).not.toHaveBeenCalled();
        f.input.dispose();
    });
});
