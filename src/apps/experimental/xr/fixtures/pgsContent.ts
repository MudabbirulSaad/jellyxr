/** Original two-cue PGS test stream. Coordinates, palette and pixels are deliberately synthetic. */
const GLYPHS: Record<string, readonly string[]> = {
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    G: ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111']
};

const WIDTH = 132;
const HEIGHT = 40;
const be = (value: number, bytes = 2): number[] => Array.from({ length: bytes }, (_, i) => (value >>> ((bytes - i - 1) * 8)) & 255);

function pixelAt(label: string, x: number, y: number): number {
    if ((x < 4 || x >= WIDTH - 4) && (y < 4 || y >= HEIGHT - 4)) return 0;
    const character = Math.floor((x - 6) / 24);
    const column = Math.floor(((x - 6) % 24) / 4);
    const row = Math.floor((y - 6) / 4);
    if (x >= 6 && y >= 6 && GLYPHS[label[character]]?.[row]?.[column] === '1') return 1;
    return y >= HEIGHT - 4 ? 2 : 3;
}

function pixels(label: string): number[] {
    const result: number[] = [];
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            // Literal nonzero palette indices; transparent corners test alpha preservation.
            const colour = pixelAt(label, x, y);
            if (colour === 0) result.push(0, 1);
            else result.push(colour);
        }
        result.push(0, 0); // End of scanline.
    }
    return result;
}

export function createPgsContent(): ArrayBuffer {
    const bytes: number[] = [];
    let sequence = 0;
    const segment = (time: number, type: number, body: number[]) => {
        bytes.push(0x50, 0x47, ...be(time * 90000, 4), 0, 0, 0, 0, type, ...be(body.length), ...body);
    };
    const frame = (time: number, label?: string, x = 24, y = 90) => {
        const objects = label ? [0, 1, 0, 0, ...be(x), ...be(y)] : [];
        segment(time, 0x16, [...be(640), ...be(360), 0x10, ...be(sequence++), 0x80, 0, 0, label ? 1 : 0, ...objects]);
        if (label) {
            segment(time, 0x17, [1, 0, ...be(x), ...be(y), ...be(WIDTH), ...be(HEIGHT)]);
            // Y/Cr/Cb/alpha: transparent, white, warm accent, translucent black.
            segment(time, 0x14, [0, 0, 0, 16, 128, 128, 0, 1, 235, 128, 128, 255, 2, 174, 145, 91, 255, 3, 16, 128, 128, 192]);
            const rle = pixels(label);
            segment(time, 0x15, [0, 1, 0, 0xc0, ...be(4 + rle.length, 3), ...be(WIDTH), ...be(HEIGHT), ...rle]);
        }
        segment(time, 0x80, []);
    };
    frame(0.5, 'PGS 1');
    frame(2.5);
    frame(4, 'PGS 2', 400, 140);
    frame(6.5);
    return new Uint8Array(bytes).buffer;
}
