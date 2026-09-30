import { describe, expect, it, vi } from 'vitest';

import { SpatialCatalogue } from './spatialCatalogue';
import { ControlLayout, isControlPlacementClear, isControlPlacementInView } from './controlLayout';
import { ControlPanels } from './controlPanels';
import { hitControl, traceControl, type ControlTarget } from './controlTargets';
import { ComparisonInput } from './comparisonInput';
import { controlVisualState, wrapControlText } from './controlArtwork';

const idle = { focus: null, hover: null, pressed: null, source: undefined };
const viewer = { position: [0, 1.65, 0] as const, forward: [0, 0, -1] as const };
const cards = (targets: readonly ControlTarget[]) => targets.filter(target => target.kind === 'card');

describe('bounded world-space technical catalogue', () => {
    it('visits all 1,000 records with at most six resident cards and twelve panels', () => {
        const catalogue = new SpatialCatalogue();
        let view = catalogue.handle('catalogue-open');
        const ids = new Set<string>();
        let alive = 0;
        let maximum = 0;
        const owners = new Set<unknown>();
        const paint = vi.fn();
        const panels = new ControlPanels(() => {
            const owner = {};
            owners.add(owner);
            alive++;
            maximum = Math.max(maximum, alive);
            return { paint, dispose() {
                expect(owners.delete(owner)).toBe(true);
                alive--;
            } };
        });
        while (view) {
            expect(cards(view.targets).length).toBeLessThanOrEqual(6);
            expect(view.targets.length).toBeLessThanOrEqual(12);
            for (const item of cards(view.targets)) ids.add(item.id);
            panels.update(view.targets, idle);
            paint.mockClear();
            panels.update(view.targets, idle);
            expect(paint).not.toHaveBeenCalled();
            view = catalogue.handle('catalogue-next');
        }
        expect(ids.size).toBe(1000);
        expect(maximum).toBe(12);
        expect(catalogue.status()).toContain('997–1000 of 1000; 4 resident records');
        panels.dispose();
        panels.dispose();
        expect(alive).toBe(0);
    });

    it('restores page, selected card and filter through detail and closing the presentation', () => {
        const catalogue = new SpatialCatalogue();
        catalogue.handle('catalogue-open');
        const filtered = catalogue.handle('catalogue-filter');
        expect(filtered?.targets[0].description).toContain('of 666 · Movies');
        const page = catalogue.handle('catalogue-next');
        const selected = cards(page!.targets)[3];
        const detail = catalogue.handle(selected.id);
        expect(detail?.targets.find(target => target.kind === 'detail')?.label).toBe(selected.label);
        expect(detail?.focus).toBe('catalogue-back');
        expect(catalogue.handle('catalogue-next')).toBeNull();
        catalogue.handle('catalogue-close');
        expect(catalogue.handle(selected.id)).toBeNull();
        const restored = catalogue.handle('catalogue-open');
        expect(restored?.targets.find(target => target.kind === 'detail')?.label).toBe(selected.label);
        const back = catalogue.handle('catalogue-back');
        expect(back?.focus).toBe(selected.id);
        expect(back?.targets[0].description).toContain('7–12 of 666');
        expect(cards(back!.targets).map(target => target.id)).toEqual(cards(page!.targets).map(target => target.id));
        expect(catalogue.handle('catalogue-filter')?.targets[0].description).toContain('of 334 · Episodes');
        expect(catalogue.handle('catalogue-filter')?.targets[0].description).toContain('of 1000 · All types');
    });

    it('rejects stale card identities and disabled boundaries without activating through them', () => {
        const catalogue = new SpatialCatalogue();
        const first = catalogue.handle('catalogue-open')!;
        const disabled = first.targets.find(target => target.id === 'catalogue-previous')!;
        const ray = { origin: [disabled.position[0], disabled.position[1], 0] as const, direction: [0, 0, -1] as const };
        expect(traceControl(ray, undefined, undefined, first.targets)?.action).toBeNull();
        expect(traceControl(ray, undefined, undefined, first.targets)?.point[2]).toBe(disabled.position[2]);
        expect(controlVisualState(disabled, { ...idle, focus: disabled.id })).toBe('disabled');
        expect(catalogue.handle('catalogue-previous')).toBeNull();
        catalogue.handle('catalogue-next');
        expect(catalogue.handle(cards(first.targets)[0].id)).toBeNull();
        expect(catalogue.handle('catalogue-item-not-a-record')).toBeNull();
    });

    it('fits a stable forward presentation at the seat and falls back to recovery near the rear wall', () => {
        const catalogue = new SpatialCatalogue();
        const first = catalogue.handle('catalogue-open')!;
        const layout = new ControlLayout();
        layout.setContent(first.targets, true);
        expect(layout.update(viewer)).toBe('placed');
        expect(isControlPlacementClear(layout.read(), layout.targets())).toBe(true);
        expect(isControlPlacementInView(viewer, layout.read(), layout.targets())).toBe(true);
        const anchor = layout.read();
        const next = catalogue.handle('catalogue-next')!;
        layout.setContent(next.targets, next.reanchor);
        expect(layout.update({ ...viewer, position: [0.5, 1.5, 0.5] })).toBe('unchanged');
        expect(layout.read()).toBe(anchor);
        for (const target of cards(next.targets)) {
            expect(hitControl({ origin: [target.position[0], target.position[1], 0], direction: [0, 0, -1] }, undefined, anchor, next.targets)).toBe(target.id);
        }
        layout.request();
        expect(layout.update({ position: [0, 1.3, 6.2], forward: [0, 0, 1] })).toBe('recovery');
        expect(layout.targets().map(target => target.id)).toEqual(['return-seat', 'exit-xr']);
    });

    it('supports keyboard paging and detail return without repeating an unmatched release', () => {
        const input = new ComparisonInput(vi.fn());
        input.update(null, null, undefined, viewer);
        const activate = () => {
            input.key('down', 'Enter');
            input.key('up', 'Enter');
        };
        input.state.observe('keyboard', 'catalogue-open');
        activate();
        input.update(null, null, undefined, viewer);
        const selected = input.state.read().focus;
        expect(selected).toContain('catalogue-item-');
        activate();
        expect(input.state.read().focus).toBe('catalogue-back');
        activate();
        expect(input.state.read().focus).toBe(selected);
        input.state.observe('keyboard', 'catalogue-next');
        activate();
        expect(input.catalogue.status()).toContain('7–12');
        expect(input.state.read().pressed).toBeNull();
        input.key('up', 'Enter');
        expect(input.catalogue.status()).toContain('7–12');
        input.state.observe('keyboard', 'catalogue-close');
        activate();
        input.update(null, null, undefined, viewer);
        expect(input.state.read().focus).toBe('catalogue-open');
        input.dispose();
    });

    it.each([false, true])('selects spatial records through native events and cancels on tracking loss (hand=%s)', hand => {
        const input = new ComparisonInput(vi.fn());
        input.update(null, null, undefined, viewer);
        input.state.observe('keyboard', 'catalogue-open');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        input.update(null, null, undefined, viewer);
        const source = { targetRayMode: 'tracked-pointer', targetRaySpace: {},
            hand: hand ? new Map([['index-finger-tip', {}]]) : undefined } as XRInputSource;
        const session = Object.assign(new EventTarget(), { visibilityState: 'visible', inputSources: [source] });
        const space = {} as XRReferenceSpace;
        const matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -0.68, 1.87, 0, 1]);
        const frame = {
            getPose: vi.fn(() => ({ transform: { matrix } })),
            getJointPose: () => ({ transform: { position: { x: matrix[12], y: matrix[13], z: matrix[14] } } }),
            getViewerPose: () => ({ transform: { matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1.65, 0, 1]), position: { x: 0, y: 1.65, z: 0 } } })
        };
        const update = () => input.update(session as unknown as XRSession, space, frame as unknown as XRFrame);
        const event = (name: string) => session.dispatchEvent(Object.assign(new Event(name), { inputSource: source, frame }));
        update();
        event('selectstart');
        event('select');
        event('selectend');
        expect(input.catalogue.status()).toContain('detail jellyxr-fixture-0001');
        matrix[12] = -0.6;
        matrix[13] = 0.5;
        update();
        event('selectstart');
        frame.getPose.mockReturnValueOnce(null as never);
        event('select');
        event('selectend');
        expect(input.catalogue.status()).toContain('detail jellyxr-fixture-0001');
        update();
        event('selectstart');
        event('select');
        event('selectend');
        expect(input.catalogue.status()).not.toContain('detail');
        expect(input.state.read().focus).toBe('catalogue-item-jellyxr-fixture-0001');
        input.dispose();
    });

    it('does not activate catalogue content before its new placement is presented', () => {
        const input = new ComparisonInput(vi.fn());
        input.update(null, null, undefined, viewer);
        input.state.observe('keyboard', 'catalogue-open');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(input.catalogue.status()).not.toContain('detail');
        input.update(null, null, undefined, viewer);
        input.key('down', 'Enter');
        input.key('up', 'Enter');
        expect(input.catalogue.status()).toContain('detail jellyxr-fixture-0001');
        input.dispose();
    });

    it('wraps the full long title and unbroken identifiers without inserting invented content', () => {
        const title = 'Technical catalogue fixture 0001 / episode / Long-title wrapping and text-scale calibration';
        const lines = wrapControlText(title, 24, text => text.length);
        expect(lines.every(line => line.length <= 24)).toBe(true);
        expect(lines.join(' ')).toBe(title);
        expect(wrapControlText('abcdefghijklmnop', 4, text => text.length)).toEqual(['abcd', 'efgh', 'ijkl', 'mnop']);
    });
});
