// @vitest-environment node
import { readFile } from 'node:fs/promises';

import init, { PgsParser } from 'libbitsub/pkg';
import { expect, it } from 'vitest';

import { createPgsContent } from './pgsContent';

it('decodes the original PGS stream with the installed WASM parser, including placement, alpha and clear intervals', async () => {
    // wasm-bindgen's external API requires this exact property name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await init({ module_or_path: await readFile('node_modules/libbitsub/pkg/libbitsub_bg.wasm') });
    const parser = new PgsParser();
    try {
        expect(parser.parse(new Uint8Array(createPgsContent()))).toBe(4);
        expect([parser.screenWidth, parser.screenHeight]).toEqual([640, 360]);
        expect(Array.from(parser.getTimestamps())).toEqual([500, 2500, 4000, 6500]);
        for (const [time, x, y] of [[1000, 24, 90], [4500, 400, 140]]) {
            const frame = parser.renderAtIndex(parser.findIndexAtTimestamp(time));
            expect(frame?.compositionCount).toBe(1);
            const composition = frame?.getComposition(0);
            expect([composition?.x, composition?.y, composition?.width, composition?.height]).toEqual([x, y, 132, 40]);
            const pixels = composition!.getRgba();
            const alpha = new Set(Array.from(pixels).filter((_, i) => i % 4 === 3));
            expect(alpha).toEqual(new Set([0, 192, 255]));
            expect(parser.lastRenderIssue).toBe('');
            composition?.free();
            frame?.free();
        }
        for (const time of [3000, 7000]) {
            const frame = parser.renderAtIndex(parser.findIndexAtTimestamp(time));
            expect(frame?.compositionCount ?? 0).toBe(0);
            frame?.free();
        }
        expect(parser.lastRenderIssue).toBe('EMPTY_CUE');
    } finally {
        parser.free();
    }
});
