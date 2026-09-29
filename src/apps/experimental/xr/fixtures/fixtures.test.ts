import { describe, expect, it, vi } from 'vitest';

import { CATALOGUE_FIXTURE_SIZE, readCatalogueFixture } from './catalogueFixture';
import { FixedStepClock } from './fixedStepClock';
import { FIXTURE_LIBRARY, FIXTURE_SEAT, isFixtureDestinationClear, ROOM_FIXTURE } from './roomFixture';

describe('comparison catalogue', () => {
    it('pages through exactly 1,000 unique labelled fixtures without returning the whole catalogue', () => {
        const identifiers = new Set<string>();
        let offset: number | null = 0;
        while (offset !== null) {
            const page = readCatalogueFixture({ offset, limit: 24 });
            expect(page.total).toBe(CATALOGUE_FIXTURE_SIZE);
            expect(page.items.length).toBeLessThanOrEqual(24);
            for (const item of page.items) {
                expect(item.title).toMatch(/^Technical catalogue fixture /);
                expect(identifiers.has(item.id)).toBe(false);
                identifiers.add(item.id);
            }
            offset = page.nextOffset;
        }
        expect(identifiers.size).toBe(1000);
    });

    it('applies query/filter before pagination and preserves repeatable identity', () => {
        const query = { offset: 0, limit: 24, search: ' LONG-TITLE ', kind: 'episode' as const };
        const first = readCatalogueFixture(query);
        expect(first.items.length).toBeGreaterThan(0);
        expect(first.items.every(item => item.kind === 'episode' && item.title.includes('Long-title'))).toBe(true);
        expect(readCatalogueFixture(query)).toEqual(first);
        expect(readCatalogueFixture({ offset: 0, limit: 24, search: 'no matching fixture' })).toEqual({
            items: [], total: 0, nextOffset: null
        });
        expect(readCatalogueFixture({ offset: 1000, limit: 24 }).items).toEqual([]);
    });

    it('rejects invalid paging instead of allocating an unbounded result', () => {
        expect(() => readCatalogueFixture({ offset: -1, limit: 24 })).toThrow(RangeError);
        expect(() => readCatalogueFixture({ offset: 0, limit: 1000 })).toThrow(RangeError);
        expect(() => readCatalogueFixture({ offset: NaN, limit: 1 })).toThrow(RangeError);
    });
});

describe('comparison room', () => {
    it('keeps seat/library recovery anchors clear and rejects furniture/outside destinations', () => {
        expect(isFixtureDestinationClear(FIXTURE_SEAT)).toBe(true);
        expect(isFixtureDestinationClear(FIXTURE_LIBRARY)).toBe(true);
        expect(isFixtureDestinationClear([-1.25, 0, 1.5])).toBe(false);
        expect(isFixtureDestinationClear([0, 0, 5.2])).toBe(false);
        expect(isFixtureDestinationClear([6, 0, 0])).toBe(false);
        expect(isFixtureDestinationClear([0, 1, 0])).toBe(false);
        expect(isFixtureDestinationClear([NaN, 0, 0])).toBe(false);
    });

    it('gives both candidates unique, finite geometry with only the remote dynamic', () => {
        expect(new Set(ROOM_FIXTURE.map(box => box.id)).size).toBe(ROOM_FIXTURE.length);
        for (const box of ROOM_FIXTURE) {
            expect(box.position.every(Number.isFinite)).toBe(true);
            expect(box.size.every(value => Number.isFinite(value) && value > 0)).toBe(true);
        }
        expect(ROOM_FIXTURE.filter(box => box.collision === 'dynamic').map(box => box.id)).toEqual(['remote']);
    });
});

describe('bounded simulation clock', () => {
    it('accumulates partial frames and discards excess catch-up after a stall', () => {
        const clock = new FixedStepClock(0.01, 4);
        const step = vi.fn();
        expect(clock.advance(0, step)).toBe(0);
        expect(clock.advance(5, step)).toBe(0);
        expect(clock.advance(10, step)).toBe(1);
        expect(clock.advance(10000, step)).toBe(4);
        expect(clock.advance(10000, step)).toBe(0);
        expect(step).toHaveBeenCalledTimes(5);
        expect(step).toHaveBeenLastCalledWith(0.01);
    });

    it('does not replay hidden time after reset or a broken clock', () => {
        const clock = new FixedStepClock();
        const step = vi.fn();
        clock.advance(0, step);
        clock.reset();
        expect(clock.advance(120000, step)).toBe(0);
        expect(clock.advance(119000, step)).toBe(0);
        expect(clock.advance(Infinity, step)).toBe(0);
        expect(clock.advance(240000, step)).toBe(0);
        expect(step).not.toHaveBeenCalled();
    });
});
