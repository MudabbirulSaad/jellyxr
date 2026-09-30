import { afterEach, describe, expect, it, vi } from 'vitest';
// Regression against the patched range loader used by both inherited renderer classes.
// eslint-disable-next-line sonarjs/no-internal-api-use
import { fetchSubtitleAsset, probeRangeSupport } from '../../../../../node_modules/libbitsub/dist/ts/range-loader';

describe('installed bitmap range loader cancellation', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('rejects an already aborted request without issuing a fetch', async () => {
        // jsdom provides the native API; the inherited legacy entry imports abortcontroller-polyfill.
        // eslint-disable-next-line compat/compat
        const controller = new AbortController();
        controller.abort();
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        await expect(fetchSubtitleAsset('https://fixture.invalid/captions.sup', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('retains HEAD fallback for a live failed range probe', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('Technical range probe failure'))
            .mockResolvedValueOnce(new Response(null, { headers: { 'content-length': '4', 'accept-ranges': 'bytes' } }));
        vi.stubGlobal('fetch', fetchMock);
        const result = await probeRangeSupport('https://fixture.invalid/captions.sup');
        expect(result).toMatchObject({ supportsRange: true, size: 4 });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][1].method).toBe('HEAD');
    });

    it('still loads a live range-capable response', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(null, { status: 206, headers: { 'content-range': 'bytes 0-0/4', 'accept-ranges': 'bytes' } }))
            .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3, 4]).buffer));
        vi.stubGlobal('fetch', fetchMock);
        const result = await fetchSubtitleAsset('https://fixture.invalid/captions.sup');
        expect(Array.from(result.data)).toEqual([1, 2, 3, 4]);
        expect(result.rangeSupported).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
