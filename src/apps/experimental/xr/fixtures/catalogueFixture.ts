export interface CatalogueFixtureItem {
    id: string;
    title: string;
    kind: 'movie' | 'episode';
    collection: 'technical-movies' | 'technical-series';
    artwork: 'calibration' | 'missing';
    progress: number;
}

export interface CatalogueFixtureQuery {
    offset: number;
    limit: number;
    search?: string;
    kind?: CatalogueFixtureItem['kind'];
}

export const CATALOGUE_FIXTURE_SIZE = 1000;
export const CATALOGUE_FIXTURE_PAGE_SIZE = 24;

const createItem = (index: number): CatalogueFixtureItem => {
    const kind = index % 3 === 0 ? 'episode' : 'movie';
    const number = (`0000${index + 1}`).slice(-4);
    const suffix = index % 31 === 0 ? ' / Long-title wrapping and text-scale calibration' : '';
    return {
        id: `jellyxr-fixture-${number}`,
        title: `Technical catalogue fixture ${number} / ${kind}${suffix}`,
        kind,
        collection: kind === 'movie' ? 'technical-movies' : 'technical-series',
        artwork: index % 7 === 0 ? 'missing' : 'calibration',
        progress: index % 5 === 0 ? 0.25 : 0
    };
};

/** Local synthetic data only: never queries or populates a Jellyfin server. */
export function readCatalogueFixture(query: CatalogueFixtureQuery) {
    if (!Number.isInteger(query.offset) || query.offset < 0
        || !Number.isInteger(query.limit) || query.limit < 1
        || query.limit > CATALOGUE_FIXTURE_PAGE_SIZE) {
        throw new RangeError('Fixture pages require a nonnegative offset and a limit from 1 to 24.');
    }

    const search = query.search?.trim().toLowerCase() || '';
    const items: CatalogueFixtureItem[] = [];
    let total = 0;
    for (let index = 0; index < CATALOGUE_FIXTURE_SIZE; index++) {
        const item = createItem(index);
        if ((query.kind && item.kind !== query.kind) || !item.title.toLowerCase().includes(search)) {
            continue;
        }
        if (total >= query.offset && items.length < query.limit) items.push(item);
        total++;
    }

    return {
        items,
        total,
        nextOffset: query.offset + items.length < total ? query.offset + items.length : null
    };
}
