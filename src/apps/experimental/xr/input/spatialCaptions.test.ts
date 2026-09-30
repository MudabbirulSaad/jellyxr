import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_CAPTION_SETTINGS } from '../media/captionSettings';

import { ComparisonInput } from './comparisonInput';
import type { ControlAction } from './controlTargets';

const viewer = { position: [0, 1.65, 0] as const, forward: [0, 0, -1] as const };

function setup() {
    const action = vi.fn();
    const input = new ComparisonInput(action);
    const update = () => input.update(null, null, undefined, viewer);
    const activate = (id: ControlAction) => {
        input.state.observe('keyboard', id);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        update();
    };
    update();
    activate('screen-open');
    activate('caption-open');
    return { input, activate, update, action };
}

describe('spatial caption settings', () => {
    it('changes only presentation, retains settings through Back and screen resize, and restores explicit defaults', () => {
        const { input, activate, update } = setup();
        const screen = input.screen;
        const originalPose = screen.readPose();
        const anchor = input.layout.read();
        activate('caption-size');
        activate('caption-backing');
        activate('caption-position');
        expect(screen.captions.read()).toEqual({ size: 1.25, backing: 0.75, position: 'Centre' });
        expect(input.layout.read()).toBe(anchor);
        expect(screen.readPose()).toBe(originalPose);
        expect(screen.readSize()).toBe(100);
        input.key('down', 'Escape');
        update();
        expect(screen.isCaptionsOpen()).toBe(false);
        expect(input.state.read().focus).toBe('caption-open');
        activate('screen-smaller');
        activate('screen-close');
        activate('screen-open');
        activate('caption-open');
        expect(screen.captions.read().size).toBe(1.25);
        activate('caption-reset');
        expect(screen.captions.read()).toEqual(DEFAULT_CAPTION_SETTINGS);
        expect(screen.readSize()).toBe(90);
        expect(input.layout.targets().find(target => target.id === 'caption-reset')?.enabled).toBe(false);
        input.dispose();
    });

    it('cancels an unfinished setting activation and does not apply it to replacement controls', () => {
        const { input, activate } = setup();
        input.state.observe('keyboard', 'caption-size');
        input.key('down', 'Enter');
        input.cancel();
        input.key('up', 'Enter');
        expect(input.screen.captions.read()).toEqual(DEFAULT_CAPTION_SETTINGS);
        for (let i = 0; i < 3; i++) {
            activate('caption-size');
            activate('caption-backing');
            activate('caption-position');
        }
        expect(input.screen.captions.read()).toEqual(DEFAULT_CAPTION_SETTINGS);
        activate('caption-close');
        input.key('up', 'Enter');
        expect(input.screen.isCaptionsOpen()).toBe(false);
        input.dispose();
    });

    it.each([false, true])('activates once and cancels native tracking loss (hand: %s)', hand => {
        const { input } = setup();
        const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const space = {} as XRReferenceSpace;
        let tracked = true;
        const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1.7, 1.96, 0, 1]);
        const frame = {
            getPose: () => ({ transform: { matrix } }),
            getJointPose: () => ({ transform: { position: { x: 1.7, y: 1.96, z: 0 } } }),
            getViewerPose: () => tracked ? { transform: { matrix, position: { x: 0, y: 1.65, z: 0 } } } : null
        };
        const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        event('selectstart');
        event('select');
        event('select');
        event('selectend');
        expect(input.screen.captions.read().size).toBe(1.25);
        update();
        event('selectstart');
        tracked = false;
        update();
        event('select');
        expect(input.screen.captions.read().size).toBe(1.25);
        input.dispose();
    });
});
