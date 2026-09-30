/* eslint-disable compat/compat -- Runs only in the required Node 24 installer, never a browser bundle. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const patchRoot = new URL('../../patches/libbitsub-1.11.0/', import.meta.url);
const packageRoot = new URL('../../node_modules/libbitsub/', import.meta.url);

const read = url => readFileSync(url, 'utf8').replace(/\r\n/g, '\n').replace(/\n?$/, '\n');
const hash = value => createHash('sha256').update(value).digest('hex');

function applyHunk(lines, index, original, cursor, result) {
    while (index < lines.length && !lines[index].startsWith('@@')) {
        const line = lines[index++];
        if (line[0] === ' ' || line[0] === '-') {
            if (original[cursor++] !== line.slice(1)) throw new Error('Bitmap dependency patch context mismatch');
        } else if (line[0] !== '+') {
            throw new Error('Unsupported bitmap dependency patch operation');
        }
        if (line[0] !== '-') result.push(line.slice(1));
    }
    return { index, cursor };
}

/** Apply only text hunks with exact context. Hashes additionally pin both sides. */
function applyExactPatch(source, patch) {
    const original = source.split('\n');
    const lines = patch.trimEnd().split('\n');
    const result = [];
    let cursor = 0;
    let index = 2;
    if (!lines[0].startsWith('--- a/') || !lines[1].startsWith('+++ b/')) {
        throw new Error('Invalid bitmap dependency patch header');
    }
    while (index < lines.length) {
        const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(lines[index++]);
        if (!header) throw new Error('Invalid bitmap dependency patch hunk');
        const start = Number(header[1]) - 1;
        if (start < cursor) throw new Error('Overlapping bitmap dependency patch hunks');
        result.push(...original.slice(cursor, start));
        cursor = start;
        const newStart = result.length;
        if (newStart !== Number(header[3]) - 1) throw new Error('Incorrect new patch position');
        ({ index, cursor } = applyHunk(lines, index, original, cursor, result));
        if (cursor - start !== Number(header[2] ?? 1)
            || result.length - newStart !== Number(header[4] ?? 1)) {
            throw new Error('Incorrect bitmap dependency patch hunk length');
        }
    }
    result.push(...original.slice(cursor));
    return result.join('\n');
}

const manifest = JSON.parse(read(new URL('manifest.json', patchRoot)));
const installed = JSON.parse(read(new URL('package.json', packageRoot)));
if (installed.name !== manifest.package || installed.version !== manifest.version) {
    throw new Error('Bitmap dependency version changed; review its disposal patch before building');
}

// Validate every input and output before writing any file. A partially patched install
// is safe to retry; unknown source content is never overwritten.
const updates = manifest.files.map(entry => {
    if (!['dist/ts/renderers.js', 'dist/ts/webgpu-renderer.js', 'dist/ts/range-loader.js'].includes(entry.path)
        || !['renderers.js.patch', 'webgpu-renderer.js.patch', 'range-loader.js.patch'].includes(entry.patch)) {
        throw new Error('Unexpected bitmap dependency patch target');
    }
    const target = new URL(entry.path, packageRoot);
    const source = read(target);
    if (hash(source) === entry.patchedSha256) return null;
    if (hash(source) !== entry.originalSha256) {
        throw new Error(`Unrecognized libbitsub source: ${entry.path}; reinstall or review the patch`);
    }
    const output = applyExactPatch(source, read(new URL(entry.patch, patchRoot)));
    if (hash(output) !== entry.patchedSha256) throw new Error(`Patched output mismatch: ${entry.path}`);
    return { target, output };
});
for (const update of updates) {
    if (update) writeFileSync(update.target, update.output, 'utf8');
}
console.info(`libbitsub ${manifest.version}: disposal patch verified`);
/* eslint-enable compat/compat */
