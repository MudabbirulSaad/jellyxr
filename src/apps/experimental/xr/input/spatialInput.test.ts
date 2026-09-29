import { describe, expect, it, vi } from 'vitest';

import { ActivationState } from './activationState';
import { CONTROL_TARGETS, hitControl } from './controlTargets';
import { ComparisonInput } from './comparisonInput';

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

function fixture() {
    const session = Object.assign(new EventTarget(), {
        visibilityState: 'visible', inputSources: [] as XRInputSource[]
    });
    const space = {} as XRReferenceSpace;
    const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {} } as XRInputSource;
    const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.3, 1.18, 0, 1]);
    const frame = {
        getPose: vi.fn(() => ({ transform: { matrix } })),
        getJointPose: vi.fn(() => ({ transform: { position: { x: -0.3, y: 1.18, z: -1.38 } } }))
    };
    session.inputSources = [source];
    const action = vi.fn();
    const input = new ComparisonInput(action);
    const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
    const event = (name: string, inputSource = source) => {
        session.dispatchEvent(Object.assign(new Event(name), { inputSource, frame }));
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
});
