import { describe, expect, it, vi } from 'vitest';

import { SpatialCatalogue } from './spatialCatalogue';
import { SEARCH_LIMIT } from './spatialSearch';
import { ControlPanels } from './controlPanels';
import { ControlLayout, isControlPlacementClear, isControlPlacementInView } from './controlLayout';
import { hitControl, type ControlAction, type ControlTarget } from './controlTargets';
import { ComparisonInput } from './comparisonInput';
import { controlVisualState } from './controlArtwork';

const viewer = { position: [0, 1.65, 0] as const, forward: [0, 0, -1] as const };
const idle = { focus: null, hover: null, pressed: null, source: undefined };
const cards = (targets: readonly ControlTarget[]) => targets.filter(target => target.kind === 'card');
function type(catalogue: SpatialCatalogue, text: string): void {
    for (const character of text) catalogue.handle(character === ' ' ? 'search-space' : `search-key-${character}`);
}

function keyboardInput() {
    const input = new ComparisonInput(vi.fn());
    input.update(null, null, undefined, viewer);
    const activate = (action?: ControlAction) => {
        if (action) input.state.observe('keyboard', action);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
    };
    activate('catalogue-open');
    input.update(null, null, undefined, viewer);
    activate('catalogue-search');
    input.update(null, null, undefined, viewer);
    return { input, activate };
}

describe('spatial technical search', () => {
    it('applies a draft only on Search and retains the term through details and type filtering', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-search');
        type(catalogue, '0001');
        expect(catalogue.status()).toContain('1–6 of 1000');
        expect(catalogue.handle('catalogue-item-jellyxr-fixture-0001')).toBeNull();
        const result = catalogue.handle('search-submit')!;
        expect(cards(result.targets).map(target => target.id)).toEqual(['catalogue-item-jellyxr-fixture-0001']);
        expect(result.targets[0].description).toContain('Search: 0001');
        catalogue.handle(cards(result.targets)[0].id);
        expect(catalogue.handle('catalogue-back')?.focus).toBe('catalogue-item-jellyxr-fixture-0001');
        expect(catalogue.handle('catalogue-filter')?.targets[0].description).toContain('0 results · Movies');
        expect(catalogue.handle('catalogue-filter')?.targets[0].description).toContain('1–1 of 1 · Episodes');
    });

    it('Cancel restores the previous page/filter/query without exposing draft text in status', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-filter');
        const previous = catalogue.handle('catalogue-next')!;
        catalogue.handle('catalogue-search');
        type(catalogue, 'do not report this term');
        expect(catalogue.status()).not.toContain('do not report');
        expect(catalogue.status()).toContain('7–12 of 666');
        const cancelled = catalogue.handle('search-cancel')!;
        expect(cancelled.targets).toEqual(previous.targets);
        expect(cancelled.focus).toBe('catalogue-search');
        catalogue.handle('catalogue-search');
        expect(catalogue.search.read()).toBe('');
    });

    it('recovers from zero results after close/reopen and clears only the search constraint', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-filter');
        catalogue.handle('catalogue-search');
        type(catalogue, 'zzzz');
        const empty = catalogue.handle('search-submit')!;
        expect(empty.focus).toBe('catalogue-search');
        expect(cards(empty.targets)).toHaveLength(0);
        expect(empty.targets.find(target => target.kind === 'message')?.label).toBe('No results for this search.');
        expect(empty.targets.filter(target => ['catalogue-previous', 'catalogue-next'].includes(target.id)).every(target => target.enabled === false)).toBe(true);
        catalogue.handle('catalogue-close');
        expect(catalogue.handle('catalogue-open')?.targets).toEqual(empty.targets);
        const restored = catalogue.handle('catalogue-clear-search')!;
        expect(restored.targets[0].description).toBe('1–6 of 666 · Movies');
        expect(catalogue.handle('search-key-z')).toBeNull();
    });

    it('bounds the term and gives explicit editing actions without accepting arbitrary action strings', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-search');
        type(catalogue, 'w'.repeat(SEARCH_LIMIT - 1));
        const full = catalogue.handle('search-key-w')!;
        expect(catalogue.search.read()).toHaveLength(SEARCH_LIMIT);
        expect(full.focus).toBe('search-key-w');
        expect(full.targets.filter(target => target.kind === 'key').every(target => target.enabled === false)).toBe(true);
        expect(full.targets.find(target => target.kind === 'field')?.description).toBe('w'.repeat(SEARCH_LIMIT));
        expect(catalogue.handle('search-key-z')).toBeNull();
        expect(catalogue.handle('search-space')).toBeNull();
        catalogue.handle('search-backspace');
        catalogue.handle('search-space');
        expect(catalogue.search.read()).toBe('w'.repeat(SEARCH_LIMIT - 1) + ' ');
        catalogue.handle('search-clear');
        expect(catalogue.search.read()).toBe('');
        expect(catalogue.handle('search-key-injected')).toBeNull();
        expect(catalogue.handle('search-key-😀')).toBeNull();
    });

    it('keeps all visible key hits distinct, anchored and within the seated preview placement', () => {
        const catalogue = new SpatialCatalogue();
        const layout = new ControlLayout();
        layout.setContent(catalogue.handle('catalogue-open')!.targets, true);
        expect(layout.update(viewer)).toBe('placed');
        const anchor = layout.read();
        const keyboard = catalogue.handle('catalogue-search')!;
        layout.setContent(keyboard.targets, keyboard.reanchor);
        expect(layout.update(viewer)).toBe('unchanged');
        expect(layout.read()).toBe(anchor);
        expect(isControlPlacementClear(anchor, keyboard.targets)).toBe(true);
        expect(isControlPlacementInView(viewer, anchor, keyboard.targets)).toBe(true);
        const keys = keyboard.targets.filter(target => target.kind === 'key');
        expect(keys).toHaveLength(39);
        for (const key of keys) {
            const ray = { origin: [key.position[0], key.position[1], 0] as const, direction: [0, 0, -1] as const };
            expect(hitControl(ray, undefined, anchor, keyboard.targets)).toBe(key.id);
            expect(hitControl(null, key.position, anchor, keyboard.targets)).toBe(key.id);
        }
    });

    it('bounds and releases panel owners across repeated edit, submit, clear and cancel views', () => {
        const catalogue = new SpatialCatalogue();
        let active = 0;
        let maximum = 0;
        const panels = new ControlPanels(() => {
            active++;
            maximum = Math.max(maximum, active);
            return { paint: vi.fn(), dispose: () => {
                active--;
            } };
        });
        const update = (action: ControlAction) => {
            const view = catalogue.handle(action);
            if (view) panels.update(view.targets, idle);
            return view;
        };
        update('catalogue-open');
        for (let cycle = 0; cycle < 20; cycle++) {
            update('catalogue-search');
            update('search-key-z');
            update('search-submit');
            update('catalogue-clear-search');
            update('catalogue-search');
            update('search-cancel');
        }
        expect(maximum).toBe(46);
        expect(active).toBe(12);
        panels.dispose();
        expect(active).toBe(0);
    });

    it('keeps a disabled key inert, cancels a held press with Escape and redacts key diagnostics', () => {
        const { input, activate } = keyboardInput();
        for (let index = 0; index < SEARCH_LIMIT; index++) activate('search-key-w');
        expect(input.state.read().focus).toBe('search-key-w');
        activate();
        expect(input.catalogue.search.read()).toHaveLength(SEARCH_LIMIT);
        const key = input.layout.targets().find(target => target.id === 'search-key-w')!;
        expect(controlVisualState(key, input.state.read())).toBe('disabled');
        input.pointer('move', { origin: [key.position[0], key.position[1], 0], direction: [0, 0, -1] });
        expect(input.readStatus()).not.toContain('search-key-w');
        expect(input.readStatus()).not.toContain('www');
        input.state.observe('keyboard', 'search-backspace');
        input.key('down', 'Enter');
        input.key('down', 'Escape');
        input.key('up', 'Enter');
        expect(input.catalogue.search.isOpen()).toBe(false);
        expect(input.catalogue.status()).not.toContain('search active');
        expect(input.state.read().focus).toBe('catalogue-search');
        input.dispose();
    });

    it('discards an unfinished draft when the catalogue closes but retains the applied search', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-search');
        type(catalogue, 'movie');
        catalogue.handle('search-submit');
        catalogue.handle('catalogue-search');
        type(catalogue, ' changed');
        catalogue.handle('catalogue-close');
        expect(catalogue.handle('catalogue-open')?.targets[0].description).toContain('Search: movie');
        expect(catalogue.search.isOpen()).toBe(false);
    });

    it('redraws only the changed term when keyboard geometry and interaction state are unchanged', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        catalogue.handle('catalogue-search');
        const paint = vi.fn();
        const panels = new ControlPanels(() => ({ paint, dispose: vi.fn() }));
        panels.update(catalogue.handle('search-key-a')!.targets, idle);
        paint.mockClear();
        panels.update(catalogue.handle('search-key-b')!.targets, idle);
        expect(paint.mock.calls.map(([target]) => target.id)).toEqual(['search-field']);
        panels.dispose();
    });

    it.each([false, true])('types through controlled native events without repeating or committing a lost press (hand=%s)', hand => {
        const { input } = keyboardInput();
        const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const space = {} as XRReferenceSpace;
        const key = input.layout.targets().find(target => target.id === 'search-key-1')!;
        const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, key.position[0], key.position[1], 0, 1]);
        const frame = {
            getPose: vi.fn(() => ({ transform: { matrix } })),
            getJointPose: () => ({ transform: { position: { x: matrix[12], y: matrix[13], z: 0 } } }),
            getViewerPose: () => ({ transform: { matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1.65, 0, 1]), position: { x: 0, y: 1.65, z: 0 } } })
        };
        const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        event('selectstart');
        event('select');
        event('select');
        event('selectend');
        expect(input.catalogue.search.read()).toBe('1');
        event('selectstart');
        frame.getPose.mockReturnValueOnce(null as never);
        event('select');
        event('selectend');
        expect(input.catalogue.search.read()).toBe('1');
        update();
        event('selectstart');
        event('select');
        event('selectend');
        expect(input.catalogue.search.read()).toBe('11');
        expect(input.readStatus()).not.toContain('search-key-1');
        input.dispose();
    });
});
