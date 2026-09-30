import * as zlib from 'node:zlib';
import type { IGLTF, ImageMimeType } from 'babylonjs-gltf2interface';

// The project uses Node 24 at authoring time; inherited Node 20 type declarations predate crc32.
const { crc32 } = zlib as typeof zlib & { crc32: (bytes: Uint8Array) => number };

export const UPHOLSTERY_TILE_METRES = 0.08;
const RESOLUTION = 512;
const THREADS = 32;

/** Original periodic crossing threads; dimensions are metres, not a photographic surface scan. */
function height(x: number, y: number): number {
    const u = x / RESOLUTION * THREADS;
    const v = y / RESOLUTION * THREADS;
    const warp = (0.5 + 0.5 * Math.cos(2 * Math.PI * u)) ** 3;
    const weft = (0.5 + 0.5 * Math.cos(2 * Math.PI * v)) ** 3;
    const over = 0.5 + 0.5 * Math.cos(Math.PI * u) * Math.cos(Math.PI * v);
    return 0.00005 * (warp * (0.5 + over) + weft * (1.5 - over));
}

function chunk(type: string, data: Uint8Array): Uint8Array {
    const bytes = Buffer.alloc(12 + data.length);
    bytes.writeUInt32BE(data.length, 0);
    bytes.write(type, 4, 'ascii');
    bytes.set(data, 8);
    bytes.writeUInt32BE(crc32(new Uint8Array(bytes.subarray(4, bytes.length - 4))), bytes.length - 4);
    return new Uint8Array(bytes);
}

/** Encode only the authored RGBA8, filter-zero, non-interlaced maps; no external image dependency. */
function png(pixels: Uint8Array): Uint8Array {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(RESOLUTION, 0);
    header.writeUInt32BE(RESOLUTION, 4);
    header[8] = 8;
    header[9] = 6;
    const stride = RESOLUTION * 4;
    const rows = Buffer.alloc((stride + 1) * RESOLUTION);
    for (let y = 0; y < RESOLUTION; y++) rows.set(pixels.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
    return new Uint8Array(Buffer.concat([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', new Uint8Array(header)),
        chunk('IDAT', new Uint8Array(zlib.deflateSync(new Uint8Array(rows), { level: 9 }))), chunk('IEND', new Uint8Array())]));
}

export function upholsteryMaps() {
    const normal = new Uint8Array(RESOLUTION * RESOLUTION * 4);
    const roughness = new Uint8Array(normal.length);
    const step = UPHOLSTERY_TILE_METRES / RESOLUTION;
    for (let y = 0; y < RESOLUTION; y++) {
        for (let x = 0; x < RESOLUTION; x++) {
            const dx = (height(x + 1, y) - height(x - 1, y)) / (2 * step);
            const dy = (height(x, y + 1) - height(x, y - 1)) / (2 * step);
            const length = Math.sqrt(dx * dx + dy * dy + 1);
            const offset = (y * RESOLUTION + x) * 4;
            normal.set([Math.round((1 - dx / length) * 127.5), Math.round((1 - dy / length) * 127.5),
                Math.round((1 + 1 / length) * 127.5), 255], offset);
            // glTF: green is perceptual roughness, blue is metallic; both are linear data.
            roughness.set([255, Math.round(255 * (0.88 + 0.08 * height(x, y) / 0.0001)), 0, 255], offset);
        }
    }
    return [
        { file: 'observatory-upholstery-normal.png', role: 'normal', data: png(normal) },
        { file: 'observatory-upholstery-metallic-roughness.png', role: 'metallic-roughness', data: png(roughness) }
    ].map(map => ({ ...map, width: RESOLUTION, height: RESOLUTION, tileMetres: UPHOLSTERY_TILE_METRES, colourSpace: 'linear' }));
}

/** Embed the offline maps after geometry export; avoids DOM/canvas image shims in the Node authoring path. */
export function embedUpholstery(binary: ArrayBuffer, maps: ReturnType<typeof upholsteryMaps>): Uint8Array {
    const input = Buffer.from(binary);
    if (input.readUInt32LE(0) !== 0x46546c67 || input.readUInt32LE(4) !== 2) throw new Error('Expected glTF 2 binary');
    const jsonLength = input.readUInt32LE(12);
    const document: IGLTF = JSON.parse(input.subarray(20, 20 + jsonLength).toString('utf8'));
    const buffer = document.buffers?.[0];
    const cushion = document.materials?.find(material => material.name === 'Observatory cushion');
    if (!buffer || !cushion?.pbrMetallicRoughness) throw new Error('Missing exported cushion or buffer');
    if (document.images?.length || document.textures?.length) throw new Error('Expected geometry-only authoring input');
    const pad = (data: Uint8Array | Buffer, fill = 0) => new Uint8Array(Buffer.concat([new Uint8Array(data),
        new Uint8Array(Buffer.alloc((4 - data.length % 4) % 4, fill))]));
    let payload = pad(input.subarray(28 + jsonLength, 28 + jsonLength + buffer.byteLength));
    document.bufferViews ||= [];
    document.images = [];
    document.textures = [];
    document.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
    for (const map of maps) {
        const view = document.bufferViews.length;
        document.bufferViews.push({ buffer: 0, byteOffset: payload.length, byteLength: map.data.length });
        payload = new Uint8Array(Buffer.concat([payload, pad(map.data)]));
        const source = document.images.length;
        document.images.push({ name: map.file, mimeType: 'image/png' as ImageMimeType, bufferView: view });
        document.textures.push({ sampler: 0, source });
    }
    cushion.normalTexture = { index: 0, scale: 1 };
    cushion.pbrMetallicRoughness.metallicRoughnessTexture = { index: 1 };
    cushion.pbrMetallicRoughness.roughnessFactor = 1;
    buffer.byteLength = payload.length;
    const json = pad(Buffer.from(JSON.stringify(document)), 32);
    const header = Buffer.alloc(20);
    header.writeUInt32LE(0x46546c67, 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(28 + json.length + payload.length, 8);
    header.writeUInt32LE(json.length, 12);
    header.writeUInt32LE(0x4e4f534a, 16);
    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(payload.length, 0);
    binHeader.writeUInt32LE(0x004e4942, 4);
    return new Uint8Array(Buffer.concat([new Uint8Array(header), json, new Uint8Array(binHeader), payload]));
}
