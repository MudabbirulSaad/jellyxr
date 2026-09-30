import type { ControlAction, ControlTarget } from './controlTargets';

export const SEARCH_LIMIT = 48;
const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', "zxcvbnm-/'"];
const HEADING: ControlTarget = { id: 'search-heading', kind: 'heading', enabled: false,
    label: 'Search technical catalogue', description: 'Local technical records · Cancel keeps your place',
    position: [0, 2.5, -2.5], width: 1.96, height: 0.25 };
const KEYS = ROWS.flatMap((row, index) => [...row].map((character, column): ControlTarget => ({
    id: `search-key-${character}`, label: character.toUpperCase(), kind: 'key',
    position: [(column - (row.length - 1) / 2) * 0.2, 1.75 - index * 0.23, -2.4], width: 0.18, height: 0.2
})));
const DISABLED_KEYS = KEYS.map(target => ({ ...target, enabled: false }));
const BUTTONS = [
    button('search-backspace', 'Backspace', -0.72, 0.78, 'Delete last character'), button('search-space', 'Space', 0, 0.78, 'Insert a space'),
    button('search-clear', 'Clear term', 0.72, 0.78, 'Empty the draft'), button('search-submit', 'Search', -0.6, 0.5, 'Apply this term'),
    button('search-cancel', 'Cancel', 0.6, 0.5, 'Keep previous results')
];
const DISABLED_BUTTONS = BUTTONS.map(target => ({ ...target, enabled: false,
    description: target.id === 'search-space' ? 'Character limit reached' : 'The term is empty' }));

function button(id: ControlAction, label: string, x: number, y: number, description: string): ControlTarget {
    return { id, label, description, position: [x, y, -2.3], width: 0.64, height: 0.2 };
}

/** Local comparison keyboard. Production language/IME support is a separate decision. */
export class SpatialSearch {
    private draft: string | null = null;

    open(query: string): void { this.draft = query; }
    close(): void { this.draft = null; }
    read(): string | null { return this.draft; }
    isOpen(): boolean { return this.draft !== null; }

    edit(action: ControlAction): boolean {
        if (this.draft === null) return false;
        if (action === 'search-clear' && this.draft.length) {
            this.draft = '';
        } else if (action === 'search-backspace' && this.draft.length) {
            this.draft = this.draft.slice(0, -1);
        } else {
            const character = action === 'search-space' ? ' ' : action.replace(/^search-key-/, '');
            if (character.length !== 1 || !`${ROWS.join('')} `.includes(character) || this.draft.length >= SEARCH_LIMIT) return false;
            this.draft += character;
        }
        return true;
    }

    targets(): readonly ControlTarget[] {
        const draft = this.draft || '';
        const full = draft.length >= SEARCH_LIMIT;
        const field: ControlTarget = { id: 'search-field', kind: 'field', enabled: false,
            label: `Search term · ${draft.length}/${SEARCH_LIMIT}${full ? ' · Limit reached' : ''}`,
            description: draft || 'Enter words or a record number', position: [0, 2.1, -2.4], width: 1.96, height: 0.4 };
        const controls = BUTTONS.map((target, index) => {
            const disabled = target.id === 'search-space' ? full :
                !draft.length && (target.id === 'search-backspace' || target.id === 'search-clear');
            return disabled ? DISABLED_BUTTONS[index] : target;
        });
        return [HEADING, field, ...(full ? DISABLED_KEYS : KEYS), ...controls];
    }
}
