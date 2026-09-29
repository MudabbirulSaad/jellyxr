import { afterEach, describe, expect, it, vi } from 'vitest';

import { show } from './actionSheet';
import { ignoreActionSheetCancellation } from './actionSheetErrors';

vi.mock('../dialogHelper/dialogHelper', () => ({ default: {
    createDialog: () => {
        const dialog = document.createElement('div');
        document.body.appendChild(dialog);
        return dialog;
    },
    open: () => Promise.resolve(),
    close: (dialog: HTMLElement) => dialog.dispatchEvent(new Event('close'))
} }));
vi.mock('../layoutManager', () => ({ default: { tv: false } }));
vi.mock('../../lib/globalize', () => ({ default: { translate: (key: string) => key } }));
vi.mock('../../utils/dom', () => ({ default: {
    parentWithClass: (element: HTMLElement | null, name: string) => {
        while (element && !element.classList.contains(name)) element = element.parentElement;
        return element;
    }
} }));
vi.mock('../../elements/emby-button/emby-button', () => ({}));

afterEach(() => {
    document.body.textContent = '';
});

describe('playback track-menu cancellation contract', () => {
    it('dismisses without selecting a track and still performs caller cleanup', async () => {
        const select = vi.fn();
        const cleanup = vi.fn();
        const result = show({ items: [{ id: '2', name: 'Technical audio track' }] })
            .then(select).catch(ignoreActionSheetCancellation).finally(cleanup);
        document.querySelector('.actionSheet')!.dispatchEvent(new Event('close'));
        await expect(result).resolves.toBeUndefined();
        expect(select).not.toHaveBeenCalled();
        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('retains the selected track identifier through normal close', async () => {
        const result = show({ items: [{ id: '2', name: 'Technical audio track' }] })
            .catch(ignoreActionSheetCancellation);
        document.querySelector<HTMLButtonElement>('.actionSheetMenuItem')!.click();
        await expect(result).resolves.toBe('2');
    });

    it('does not turn a selection failure into a successful dismissal', async () => {
        const failure = new Error('Technical playback command failure');
        const result = show({ items: [{ id: '2', name: 'Technical audio track' }] })
            .then(() => { throw failure; }).catch(ignoreActionSheetCancellation);
        document.querySelector<HTMLButtonElement>('.actionSheetMenuItem')!.click();
        await expect(result).rejects.toBe(failure);
    });
});
