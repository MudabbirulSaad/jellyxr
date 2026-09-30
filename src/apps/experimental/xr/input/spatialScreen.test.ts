import { describe, expect, it, vi } from 'vitest';

import { SpatialScreen } from './spatialScreen';
import { ComparisonInput } from './comparisonInput';
import { ControlLayout, isControlPlacementClear, isControlPlacementInView } from './controlLayout';
import { hitControl, type ControlAction } from './controlTargets';
import { controlVisualState } from './controlArtwork';
import { screenGeometry } from '../fixtures/screenFixture';
import { RoomCollision } from '../fixtures/roomCollision';

const viewer = { position: [0, 1.65, 0] as const, forward: [0, 0, -1] as const };

describe('spatial screen size', () => {
    it('steps each placement setting within its bounds and resets size and pose together', () => {
        const screen = new SpatialScreen();
        screen.handle('screen-open');
        screen.handle('screen-smaller');
        screen.handle('screen-next-setting');
        for (let i = 0; i < 10; i++) screen.handle('screen-closer');
        expect(screen.readPose().distance).toBe(4);
        expect(screen.handle('screen-closer')).toBeNull();
        screen.handle('screen-next-setting');
        for (let i = 0; i < 8; i++) screen.handle('screen-lower');
        expect(screen.readPose().height).toBe(1.2);
        expect(screen.handle('screen-lower')).toBeNull();
        screen.handle('screen-next-setting');
        for (let i = 0; i < 3; i++) screen.handle('screen-tilt-up');
        expect(screen.readPose().tilt).toBe(15);
        expect(screen.handle('screen-tilt-up')).toBeNull();
        const result = screen.handle('screen-reset')!;
        expect(screen.readSize()).toBe(100);
        expect(screen.readPose()).toEqual({ distance: 6.5, height: 2, tilt: 0 });
        expect(result.targets.find(target => target.id === 'screen-reset')?.enabled).toBe(false);
        expect(result.targets.find(target => target.id === result.focus)?.enabled).not.toBe(false);
    });

    it('leaves the controls and query geometry at the previous valid pose with actionable rejection text', () => {
        const room = new RoomCollision();
        const screen = new SpatialScreen((percent, pose) => room.tryScreen(percent, pose, viewer.position));
        screen.handle('screen-open');
        screen.handle('screen-next-setting');
        screen.handle('screen-next-setting');
        screen.handle('screen-lower');
        expect(screen.readPose().height).toBe(1.9);
        const prior = room.readScreen();
        const blocked = screen.handle('screen-lower')!;
        expect(blocked.targets[0].description).toContain('Screen would meet the room');
        expect(screen.readPose().height).toBe(1.9);
        expect(room.readScreen()).toBe(prior);
        screen.handle('screen-reset');
        expect(screen.readPose().height).toBe(2);
    });

    it('bounds adjustment, retains size across closing, and resets without changing other state', () => {
        const screen = new SpatialScreen();
        expect(screen.handle('screen-smaller')).toBeNull();
        const initial = screen.handle('screen-open')!;
        expect(initial.targets.find(target => target.id === 'screen-larger')?.enabled).toBe(false);
        for (let step = 0; step < 4; step++) screen.handle('screen-smaller');
        expect(screen.readSize()).toBe(60);
        expect(screen.handle('screen-smaller')).toBeNull();
        screen.handle('screen-close');
        expect(screen.handle('screen-larger')).toBeNull();
        const reopened = screen.handle('screen-open')!;
        expect(reopened.targets[0].label).toBe('Screen size · 60%');
        expect(reopened.targets[0].description).toContain('3.84 × 2.16 m');
        // Reopening at the minimum must not focus an unavailable action.
        expect(reopened.targets.find(target => target.id === reopened.focus)?.enabled).not.toBe(false);
        screen.handle('screen-reset');
        expect(screen.readSize()).toBe(100);
        expect(screen.handle('screen-larger')).toBeNull();
    });

    it('keeps visible geometry, disabled hit targets and stable seated placement in agreement', () => {
        const screen = new SpatialScreen();
        const layout = new ControlLayout();
        const opened = screen.handle('screen-open')!;
        layout.setContent(opened.targets, opened.reanchor);
        expect(layout.update(viewer)).toBe('placed');
        const anchor = layout.read();
        for (let step = 0; step < 4; step++) {
            const result = screen.handle('screen-smaller')!;
            layout.setContent(result.targets, result.reanchor);
            expect(layout.update(viewer)).toBe('unchanged');
            expect(layout.read()).toBe(anchor);
            expect(isControlPlacementClear(anchor, result.targets)).toBe(true);
            expect(isControlPlacementInView(viewer, anchor, result.targets)).toBe(true);
            const heading = result.targets[0];
            const captions = screenGeometry(screen.readSize()).captions;
            const captionBottom = (captions.position[1] - captions.height / 2 - viewer.position[1]) / -captions.position[2];
            const headingTop = (heading.position[1] + heading.height / 2 - viewer.position[1]) / -heading.position[2];
            // At the reference seat, the size heading must not cover the plain-text caption panel.
            expect(captionBottom).toBeGreaterThan(headingTop);
            for (const target of result.targets) {
                const ray = { origin: [target.position[0], target.position[1], 0] as const, direction: [0, 0, -1] as const };
                expect(hitControl(ray, undefined, anchor, result.targets)).toBe(target.enabled === false ? null : target.id);
            }
        }
        const smaller = layout.targets().find(target => target.id === 'screen-smaller')!;
        expect(controlVisualState(smaller, { source: undefined, hover: null, focus: null, pressed: null })).toBe('disabled');
    });

    it('requires deliberate activation, cancels a pending resize and closes via Escape', () => {
        const input = new ComparisonInput(vi.fn());
        input.update(null, null, undefined, viewer);
        const activate = (action: ControlAction) => {
            input.state.observe('keyboard', action);
            input.key('down', 'Enter');
            input.key('up', 'Enter');
        };
        activate('screen-open');
        input.update(null, null, undefined, viewer);
        input.state.observe('keyboard', 'screen-smaller');
        input.key('up', 'Enter');
        expect(input.screen.readSize()).toBe(100);
        activate('screen-smaller');
        input.key('up', 'Enter');
        expect(input.screen.readSize()).toBe(90);
        input.key('down', 'Enter');
        input.cancel();
        input.key('up', 'Enter');
        expect(input.screen.readSize()).toBe(90);
        input.key('down', 'Escape');
        input.key('up', 'Escape');
        input.update(null, null, undefined, viewer);
        expect(input.screen.isOpen()).toBe(false);
        expect(input.layout.targets().some(target => target.id === 'catalogue-open')).toBe(true);
        expect(input.readStatus()).toContain('Screen size: 90%.');
    });
});
