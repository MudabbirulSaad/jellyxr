import { describe, expect, it, vi } from 'vitest';

import { ComparisonInput } from './comparisonInput';
import { RemoteGrab } from './remoteGrab';

function fixture(hand: boolean) {
    const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [] as XRInputSource[] });
    const source = {
        targetRayMode: 'tracked-pointer', targetRaySpace: {}, gripSpace: {},
        hand: hand ? new Map([['index-finger-tip', {}], ['thumb-tip', {}]]) : undefined
    } as unknown as XRInputSource;
    session.inputSources = [source];
    const space = {} as XRReferenceSpace;
    const position = { x: 0, y: 1, z: -1 };
    const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, -1, 1]);
    const frame = {
        getPose: vi.fn(() => ({ transform: { position, matrix } })),
        getJointPose: vi.fn(() => ({ transform: { position } }))
    };
    const release = vi.fn();
    const grab = new RemoteGrab({
        read: () => ({ position: [0, 1, -1], half: [0.04, 0.0175, 0.095] }),
        hold: vi.fn(), move: vi.fn(), release
    });
    const action = vi.fn();
    const input = new ComparisonInput(action, grab);
    const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
    const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { frame, inputSource: source }));
    update();
    return { session, source, frame, grab, release, action, input, event, update };
}

describe('native near-grab ownership', () => {
    it('uses controller squeeze, blocks selection while held and releases on source removal', () => {
        const f = fixture(false);
        f.event('squeezestart');
        expect(f.grab.source()).not.toBeNull();
        f.event('selectstart');
        f.event('select');
        expect(f.action).not.toHaveBeenCalled();
        f.session.dispatchEvent(Object.assign(new Event('inputsourceschange'), { removed: [f.source] }));
        expect(f.grab.source()).toBeNull();
        expect(f.release).toHaveBeenCalledTimes(1);
        f.input.dispose();
        f.event('squeezestart');
        expect(f.grab.source()).toBeNull();
    });

    it('uses near hand pinch without committing a button and drops safely at pinch end', () => {
        const f = fixture(true);
        f.event('selectstart');
        expect(f.grab.source()).not.toBeNull();
        f.event('select');
        expect(f.action).not.toHaveBeenCalled();
        f.event('selectend');
        expect(f.grab.source()).toBeNull();
        expect(f.release).toHaveBeenCalledTimes(1);
        f.input.dispose();
    });

    it('requires both pinch joints and cancels without re-grabbing when tracking returns', () => {
        const f = fixture(true);
        f.event('selectstart');
        f.frame.getJointPose.mockReturnValueOnce(null as never);
        f.update();
        expect(f.grab.source()).toBeNull();
        f.update();
        f.event('select');
        expect(f.grab.source()).toBeNull();
        expect(f.action).not.toHaveBeenCalled();
        f.input.dispose();
    });

    it('cancels immediately on hidden sessions before the next simulation frame', () => {
        const f = fixture(false);
        f.event('squeezestart');
        f.session.visibilityState = 'hidden';
        f.session.dispatchEvent(new Event('visibilitychange'));
        expect(f.grab.source()).toBeNull();
        expect(f.release).toHaveBeenCalledTimes(1);
        f.input.dispose();
    });
});
