import { describe, expect, it, vi } from 'vitest';

import { ActivationState } from './activationState';
import { MovementSession } from './movementSession';
import { RemoteGrab } from './remoteGrab';
import { SessionRecovery } from './sessionRecovery';

function fixture() {
    const session = Object.assign(new EventTarget(), { visibilityState: 'visible', end: vi.fn(async () => undefined) });
    const reference = new EventTarget();
    const host = { cancelPending: vi.fn(), pause: vi.fn(), report: vi.fn() };
    const recovery = new SessionRecovery(host);
    const bind = (space = reference) => recovery.bind(session as unknown as XRSession, space as XRReferenceSpace);
    bind();
    return { session, reference, host, recovery, bind };
}

describe('event-driven session recovery', () => {
    it.each(['hidden', 'visible-blurred'])('pauses on %s without needing another frame or auto-resuming', state => {
        const { session, host, recovery } = fixture();
        session.visibilityState = state;
        session.dispatchEvent(new Event('visibilitychange'));
        expect(host.pause).toHaveBeenCalledExactlyOnceWith('visibility-lost');
        expect(host.cancelPending).toHaveBeenCalledTimes(1);
        expect(host.cancelPending.mock.invocationCallOrder[0]).toBeLessThan(host.pause.mock.invocationCallOrder[0]);
        expect(recovery.isSuspended()).toBe(true);
        expect(recovery.canPresent()).toBe(state === 'visible-blurred');
        session.visibilityState = 'visible';
        session.dispatchEvent(new Event('visibilitychange'));
        expect(recovery.isSuspended()).toBe(false);
        expect(host.pause).toHaveBeenCalledTimes(1);
        expect(session.end).not.toHaveBeenCalled();
    });

    it('drops queued movement, activation and held objects on a native reset', async () => {
        const { session, reference, recovery, host } = fixture();
        const movement = new MovementSession(vi.fn());
        const activation = new ActivationState();
        const body = {
            read: () => ({ position: [0, 1, 0] as const, half: [0.04, 0.02, 0.1] as const }),
            hold: vi.fn(), move: vi.fn(), release: vi.fn()
        };
        const grab = new RemoteGrab(body);
        movement.request('library-position');
        activation.begin('hand', 'return-seat');
        grab.begin('hand', [0, 1, 0]);
        host.cancelPending.mockImplementation(() => {
            movement.cancel();
            activation.cancel();
            grab.release();
        });
        reference.dispatchEvent(new Event('reset'));
        expect(recovery.isSuspended()).toBe(true);
        expect(host.pause).toHaveBeenCalledExactlyOnceWith('tracking-reset');
        expect(session.end).toHaveBeenCalledTimes(1);
        expect(activation.commit('hand', 'return-seat')).toBeNull();
        expect(activation.read().focus).toBe('return-seat');
        expect(grab.source()).toBeNull();
        expect(body.release).toHaveBeenCalledTimes(1);
        expect(movement.update(null, null, undefined, vi.fn(), vi.fn())).toBe(false);
        reference.dispatchEvent(new Event('reset'));
        session.dispatchEvent(new Event('end'));
        expect(session.end).toHaveBeenCalledTimes(1);
        expect(host.pause).toHaveBeenCalledTimes(1);
        await Promise.resolve();
        recovery.bind(null, null);
        expect(recovery.isSuspended()).toBe(false);
    });

    it('reports pause and exit failures while retaining the suspended state', async () => {
        const { session, reference, recovery, host } = fixture();
        host.pause.mockImplementation(() => {
            throw new Error('owner unavailable');
        });
        session.end.mockRejectedValue(new Error('runtime rejected'));
        reference.dispatchEvent(new Event('reset'));
        expect(host.cancelPending).toHaveBeenCalledTimes(1);
        expect(host.report).toHaveBeenCalledWith('Pause could not be confirmed. Exit XR and pause in the ordinary player.');
        await Promise.resolve();
        expect(host.report).toHaveBeenLastCalledWith('Tracking changed and XR could not close. Use the headset system exit.');
        expect(recovery.isSuspended()).toBe(true);
    });

    it('unbinds old offset spaces, pauses on session end and drops all listeners on disposal', () => {
        const { session, reference, recovery, host, bind } = fixture();
        const offset = new EventTarget();
        bind(offset);
        reference.dispatchEvent(new Event('reset'));
        expect(host.pause).not.toHaveBeenCalled();
        session.dispatchEvent(new Event('end'));
        expect(host.pause).toHaveBeenCalledExactlyOnceWith('session-ended');
        expect(recovery.isSuspended()).toBe(true);
        recovery.dispose();
        offset.dispatchEvent(new Event('reset'));
        session.visibilityState = 'hidden';
        session.dispatchEvent(new Event('visibilitychange'));
        expect(host.pause).toHaveBeenCalledTimes(1);
        expect(session.end).not.toHaveBeenCalled();
    });

    it('pauses an active XR disposal but leaves an ordinary overlay close alone', () => {
        const { host, recovery } = fixture();
        recovery.dispose();
        recovery.dispose();
        expect(host.pause).toHaveBeenCalledExactlyOnceWith('session-ended');
        const ordinary = new SessionRecovery(host);
        ordinary.dispose();
        expect(host.pause).toHaveBeenCalledTimes(1);
    });

    it('pauses once when the ordinary page hides; showing it never requests play', () => {
        const host = { cancelPending: vi.fn(), pause: vi.fn(), report: vi.fn() };
        const recovery = new SessionRecovery(host);
        recovery.pageVisibility(true);
        recovery.pageVisibility(true);
        expect(recovery.isSuspended()).toBe(true);
        expect(host.pause).toHaveBeenCalledExactlyOnceWith('visibility-lost');
        recovery.pageVisibility(false);
        expect(recovery.isSuspended()).toBe(false);
        expect(host.pause).toHaveBeenCalledTimes(1);
    });
});
