import { readCatalogueFixture, type CatalogueFixtureItem } from '../fixtures/catalogueFixture';

import { CONTROL_TARGETS, type ControlAction, type ControlTarget } from './controlTargets';
import { SpatialSearch } from './spatialSearch';

const PAGE_SIZE = 6;
const cardId = (item: CatalogueFixtureItem): ControlAction => `catalogue-item-${item.id}`;
const typeLabel = (kind?: CatalogueFixtureItem['kind']) => ({ movie: 'Movies', episode: 'Episodes', all: 'All types' })[kind || 'all'];

/** Disposable M2 presentation state. No server, account, playback or invented movie data. */
export class SpatialCatalogue {
    private offset = 0;
    private kind: CatalogueFixtureItem['kind'] | undefined;
    private page = readCatalogueFixture({ offset: 0, limit: PAGE_SIZE });
    private selected: CatalogueFixtureItem | null = null;
    private open = false;
    readonly search = new SpatialSearch();
    private query = '';

    handle(action: ControlAction): { targets: readonly ControlTarget[]; focus: ControlAction; reanchor: boolean } | null {
        let focus: ControlAction | null;
        if (action === 'catalogue-open') {
            this.open = true;
            focus = this.firstFocus();
        } else {
            if (!this.open) return null;
            if (action === 'catalogue-close') {
                this.open = false;
                this.search.close();
                return { targets: CONTROL_TARGETS, focus: 'catalogue-open', reanchor: true };
            }
            focus = this.navigate(action);
            if (!focus) return null;
        }
        if (this.selected) focus = 'catalogue-back';
        const targets = this.targets();
        if (!targets.some(target => target.id === focus && (this.search.isOpen() || target.enabled !== false))) {
            focus = targets.find(target => target.enabled !== false)?.id || 'catalogue-close';
        }
        return { targets, focus, reanchor: action === 'catalogue-open' };
    }

    private navigate(action: ControlAction): ControlAction | null {
        if (this.search.isOpen()) return this.editSearch(action);
        if (action === 'catalogue-back' && this.selected) {
            const focus = cardId(this.selected);
            this.selected = null;
            return focus;
        }
        if (this.selected) return null;
        switch (action) {
            case 'catalogue-search':
                this.search.open(this.query);
                return 'search-key-1';
            case 'catalogue-clear-search':
                if (!this.query) return null;
                this.query = '';
                this.offset = 0;
                break;
            case 'catalogue-next':
                if (this.page.nextOffset === null) return null;
                this.offset = this.page.nextOffset;
                break;
            case 'catalogue-previous':
                if (this.offset === 0) return null;
                this.offset = Math.max(0, this.offset - PAGE_SIZE);
                break;
            case 'catalogue-filter': {
                const types: Array<CatalogueFixtureItem['kind'] | undefined> = [undefined, 'movie', 'episode'];
                this.kind = types[(types.indexOf(this.kind) + 1) % types.length];
                this.offset = 0;
                break;
            }
            default: {
                const item = this.page.items.find(value => cardId(value) === action);
                if (!item) return null;
                this.selected = item;
                return 'catalogue-back';
            }
        }
        this.load();
        return action;
    }

    private load(): void {
        this.page = readCatalogueFixture({ offset: this.offset, limit: PAGE_SIZE, kind: this.kind, search: this.query });
    }

    private firstFocus(): ControlAction {
        return this.page.items.length ? cardId(this.page.items[0]) : 'catalogue-search';
    }

    private editSearch(action: ControlAction): ControlAction | null {
        if (action === 'search-cancel') {
            this.search.close();
            return 'catalogue-search';
        }
        if (action === 'search-submit') {
            this.query = (this.search.read() || '').trim();
            this.search.close();
            this.offset = 0;
            this.load();
            return this.firstFocus();
        }
        return this.search.edit(action) ? action : null;
    }

    private range(): string {
        return this.page.total ? `${this.offset + 1}–${this.offset + this.page.items.length} of ${this.page.total}` : '0 results';
    }

    status(): string {
        const detail = this.selected ? `; detail ${this.selected.id}` : '';
        const search = this.search.isOpen() ? '; editing search' : '';
        return `Technical catalogue ${this.open ? 'open' : 'closed'}; ${typeLabel(this.kind)}; ${this.range()}; ${this.page.items.length} resident records${detail}${this.query ? '; search active' : ''}${search}.`;
    }

    private targets(): readonly ControlTarget[] {
        if (this.search.isOpen()) return this.search.targets();
        const queryLabel = this.query ? ` · Search: ${this.query}` : '';
        const heading: ControlTarget = { id: 'catalogue-heading', label: 'Technical catalogue',
            description: `${this.range()} · ${typeLabel(this.kind)}${queryLabel}`,
            kind: 'heading', enabled: false, width: 1.96, height: 0.52, position: [0, 2.52, -2.5] };
        if (this.selected) {
            return [heading, { id: 'catalogue-detail', label: this.selected.title, kind: 'detail', enabled: false,
                description: `Type: ${this.selected.kind}. ${this.selected.artwork === 'missing' ? 'No artwork is available.' : 'Artwork is an original calibration pattern.'} Technical record only; no media is attached.`,
                artwork: this.selected.artwork, width: 1.96, height: 1.42, position: [0, 1.5, -2.4] },
            this.button('catalogue-back', 'Back to catalogue', -0.6), this.button('catalogue-close', 'Close catalogue', 0.6)];
        }
        const items: ControlTarget[] = this.page.items.map((item, index): ControlTarget => ({ id: cardId(item), label: item.title,
            description: item.kind === 'movie' ? 'Technical movie record' : 'Technical episode record',
            artwork: item.artwork, kind: 'card', width: 0.6, height: 0.64,
            position: [(index % 3 - 1) * 0.68, index < 3 ? 1.87 : 1.1, -2.4] }));
        if (!items.length) {
            items.push({ id: 'catalogue-detail', kind: 'message', enabled: false,
                label: 'No results for this search.', description: 'Edit the term, change the type filter or clear search to browse again.',
                width: 1.96, height: 1.42, position: [0, 1.5, -2.4] });
        }
        return [heading, ...items, ...this.searchActions(),
            this.button('catalogue-previous', 'Previous page', -0.9, this.offset > 0),
            this.button('catalogue-next', 'Next page', -0.3, this.page.nextOffset !== null),
            this.button('catalogue-filter', typeLabel(this.kind), 0.3),
            this.button('catalogue-close', 'Close catalogue', 0.9)];
    }

    private searchActions(): ControlTarget[] {
        const actions: ControlTarget[] = [{ id: 'catalogue-search', label: this.query ? 'Edit search' : 'Search',
            width: 0.5, height: 0.25, position: [1.3, 2.4, -2.4] }];
        if (this.query) {
            actions.push({ id: 'catalogue-clear-search', label: 'Clear search',
                width: 0.5, height: 0.25, position: [1.3, 2.03, -2.4] });
        }
        return actions;
    }

    private button(id: ControlAction, label: string, x: number, enabled = true): ControlTarget {
        return { id, label, enabled, width: 0.52, height: 0.22, position: [x, 0.5, -2.3],
            description: id === 'catalogue-filter' ? 'Change type filter' : undefined };
    }
}
