import { describe, expect, it, vi } from 'vitest';

import { ComparisonInput } from './comparisonInput';
import { ControlLayout, isControlPlacementClear, isControlPlacementInView } from './controlLayout';
import { ControlPanels } from './controlPanels';
import { CONTROL_TARGETS, FLOOR_TARGETS, RECOVERY_TARGETS, hitControl, type ControlTarget } from './controlTargets';
import { controlCanvasSize, drawControl, type ControlVisualState } from './controlArtwork';
import { SpatialCatalogue } from './spatialCatalogue';
import { SpatialScreen } from './spatialScreen';
import { SpatialSearch } from './spatialSearch';

const viewer = { position: [0, 1.65, 0] as const, forward: [0, 0, -1] as const };
const idle = { focus: null, hover: null, pressed: null, source: undefined };

function canvasFixture(target: ControlTarget) {
    const [width, height] = controlCanvasSize(target);
    const boxes: { text: string; left: number; right: number; top: number; bottom: number; size: number }[] = [];
    const size = () => Number(context.font.replace('bold ', '').split('px')[0]);
    // Controlled metrics test layout arithmetic; browser/font inspection is separate.
    const measure = (text: string) => [...text].reduce((sum, char) => {
        let factor = 0.6;
        if (char === 'W' || char === 'w') factor = 0.95;
        if (char === ' ') factor = 0.3;
        return sum + size() * factor;
    }, 0);
    const context = {
        font: '', textAlign: '', textBaseline: '', fillStyle: '', strokeStyle: '', lineWidth: 0,
        fillRect: vi.fn(), strokeRect: vi.fn(), measureText: (text: string) => ({ width: measure(text) }),
        fillText(text: string, x: number, y: number) {
            const measured = measure(text);
            const left = context.textAlign === 'center' ? x - measured / 2 : x;
            const top = context.textBaseline === 'middle' ? y - size() / 2 : y;
            boxes.push({ text, left, right: left + measured, top, bottom: top + size(), size: size() });
        }
    };
    return { boxes, canvas: { width, height, getContext: () => context } as unknown as HTMLCanvasElement };
}

function views(): readonly (readonly ControlTarget[])[] {
    const catalogue = new SpatialCatalogue();
    const page = catalogue.handle('catalogue-open')!.targets;
    const detail = catalogue.handle('catalogue-item-jellyxr-fixture-0001')!.targets;
    catalogue.handle('catalogue-back');
    catalogue.handle('catalogue-search');
    for (let i = 0; i < 48; i++) catalogue.handle('search-key-w');
    const empty = catalogue.handle('search-submit')!.targets;
    const search = new SpatialSearch();
    search.open('w'.repeat(48));
    const screen = new SpatialScreen(() => 'Screen overlaps the room. Try a smaller size, greater height or different distance.');
    screen.handle('screen-open');
    const error = screen.handle('screen-smaller')!.targets;
    return [CONTROL_TARGETS, FLOOR_TARGETS, RECOVERY_TARGETS, page, detail, empty, search.targets(), error];
}

function sized(targets: readonly ControlTarget[], steps: number): readonly ControlTarget[] {
    const layout = new ControlLayout();
    for (let n = 0; n < steps; n++) layout.cycleTextSize();
    layout.setContent(targets, true);
    expect(layout.update(viewer)).toBe('placed');
    expect(isControlPlacementClear(layout.read(), layout.targets())).toBe(true);
    expect(isControlPlacementInView(viewer, layout.read(), layout.targets())).toBe(true);
    return layout.targets();
}

interface Rectangle { left: number; right: number; top: number; bottom: number; text: string }
function expectSeparated(boxes: readonly Rectangle[]): void {
    for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i];
        for (const b of boxes.slice(i + 1)) {
            expect(a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
                `${a.text} overlaps ${b.text}`).toBe(false);
        }
    }
}

function expectTextFits(target: ControlTarget, state: ControlVisualState): void {
    const { canvas, boxes } = canvasFixture(target);
    drawControl(target, state, canvas, target.id === 'cancel-floor' ? 'Blocked: choose floor' : undefined);
    const text = boxes.map(box => box.text).join('').replace(/\s/g, '');
    expect(text, target.id).toContain(target.label.replace(/\s/g, ''));
    if (target.kind && ['field', 'heading', 'detail', 'message'].includes(target.kind)) {
        expect(text, target.id).toContain((target.description || '').replace(/\s/g, ''));
    }
    for (const box of boxes) {
        expect(box.left, `${target.id}: ${box.text}`).toBeGreaterThanOrEqual(16);
        expect(box.right, `${target.id}: ${box.text}`).toBeLessThanOrEqual(canvas.width - 16);
        expect(box.top, `${target.id}: ${box.text}`).toBeGreaterThanOrEqual(16);
        expect(box.bottom, `${target.id}: ${box.text}`).toBeLessThanOrEqual(canvas.height - 16);
    }
    expectSeparated(boxes);
    if (!target.kind) expect(boxes[0].size).toBe(36 * (target.textScale || 1));
}

describe('spatial text-size comparison', () => {
    it('keeps enlarged targets separated and reachable at both named positions and tested eye heights', () => {
        const poses = [1.3, 1.65].flatMap(height => [0, 6.2].map(z => ({ ...viewer, position: [0, height, z] as const })));
        for (const steps of [0, 1, 2]) {
            for (const view of views()) {
                const targets = sized(view, steps);
                for (const pose of poses) {
                    const layout = new ControlLayout();
                    layout.setContent(targets, true);
                    expect(layout.update(pose), `${steps}: ${view[0].id}, pose ${pose.position}`).toBe('placed');
                    expect(isControlPlacementInView(pose, layout.read(), layout.targets())).toBe(true);
                }
                expectSeparated(targets.map(target => ({ text: target.id,
                    left: target.position[0] - target.width / 2, right: target.position[0] + target.width / 2,
                    top: target.position[1] - target.height / 2, bottom: target.position[1] + target.height / 2 })));
            }
        }
    });

    it.each([0, 1, 2])('keeps complete fixture text inside its canvas without overlap at size step %s', steps => {
        for (const view of views()) {
            for (const target of sized(view, steps)) {
                for (const state of ['idle', 'focus', 'pressed', 'disabled'] as ControlVisualState[]) expectTextFits(target, state);
            }
        }
    });

    it('uses matching visible and hit geometry, retains focus/context and cycles back to default', () => {
        const action = vi.fn();
        const input = new ComparisonInput(action);
        const activate = (id: Parameters<typeof input.state.observe>[1]) => {
            input.state.observe('keyboard', id);
            input.key('down', 'Enter');
            input.key('up', 'Enter');
            input.update(null, null, undefined, viewer);
        };
        input.update(null, null, undefined, viewer);
        activate('catalogue-open');
        activate('catalogue-next');
        activate('catalogue-close');
        for (const scale of [1.25, 1.5, 1]) {
            activate('text-size');
            expect(input.layout.readTextScale()).toBe(scale);
            expect(input.state.read().focus).toBe('text-size');
            input.key('up', 'Enter');
            expect(input.layout.readTextScale()).toBe(scale);
            expect(input.readStatus()).toContain(`Text size: ${scale * 100}%`);
            activate('catalogue-open');
            expect(input.catalogue.status()).toContain('7–12 of 1000');
            for (const target of input.layout.targets().filter(value => value.enabled !== false)) {
                expect(hitControl({ origin: [target.position[0], target.position[1], 0], direction: [0, 0, -1] },
                    undefined, input.layout.read(), input.layout.targets())).toBe(target.id);
            }
            activate('catalogue-close');
        }
        expect(action.mock.calls.filter(([id]) => id === 'text-size')).toHaveLength(3);
        input.dispose();
    });

    it('retains enlarged key textures when only the draft changes and releases all panels', () => {
        const search = new SpatialSearch();
        search.open('a');
        const layout = new ControlLayout();
        layout.cycleTextSize();
        layout.cycleTextSize();
        const paint = vi.fn();
        const dispose = vi.fn();
        const create = vi.fn(() => ({ paint, dispose }));
        const panels = new ControlPanels(create);
        layout.setContent(search.targets(), true);
        layout.update(viewer);
        panels.update(layout.targets(), idle);
        expect(create).toHaveBeenCalledTimes(46);
        paint.mockClear();
        search.edit('search-key-b');
        layout.setContent(search.targets(), false);
        panels.update(layout.targets(), idle);
        expect(paint.mock.calls.map(([target]) => target.id)).toEqual(['search-field']);
        expect(create).toHaveBeenCalledTimes(46);
        panels.dispose();
        expect(dispose).toHaveBeenCalledTimes(46);
    });

    it.each([false, true])('changes text size once per completed native action (hand: %s)', hand => {
        const input = new ComparisonInput(vi.fn());
        const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const space = {} as XRReferenceSpace;
        const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.6, 1.74, 0, 1]);
        const frame = {
            getPose: () => ({ transform: { matrix } }),
            getJointPose: () => ({ transform: { position: { x: -0.6, y: 1.74, z: 0 } } }),
            getViewerPose: () => ({ transform: { matrix, position: { x: 0, y: 1.65, z: 0 } } })
        };
        const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        event('selectstart');
        event('select');
        event('select');
        event('selectend');
        expect(input.layout.readTextScale()).toBe(1.25);
        update();
        expect(input.state.read().focus).toBe('text-size');
        event('selectstart');
        input.cancel();
        event('select');
        event('selectend');
        expect(input.layout.readTextScale()).toBe(1.25);
        input.dispose();
    });
});
