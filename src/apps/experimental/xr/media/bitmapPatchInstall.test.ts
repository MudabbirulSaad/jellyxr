// @vitest-environment node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const original = 'start\nold\nmiddle\nkeep\nbefore\nold tail\nend\n';
const patched = 'start\nnew\nadded\nmiddle\nkeep\nbefore\nnew tail\nend\n';
const patch = '--- a/fixture\n+++ b/fixture\n@@ -1,3 +1,4 @@\n start\n-old\n+new\n+added\n middle\n@@ -6,2 +7,2 @@\n-old tail\n+new tail\n end\n';
const digest = (content: string) => createHash('sha256').update(content).digest('hex');

describe('bitmap dependency patch installer', () => {
    let root: string;
    const write = (path: string, content: string) => writeFileSync(join(root, path), content);
    const read = (name: string) => readFileSync(join(root, 'node_modules/libbitsub/dist/ts', name), 'utf8');
    const run = () => spawnSync(process.execPath, [join(root, 'scripts/jellyxr/patchBitmapDependency.mjs')], { encoding: 'utf8' });

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), 'jellyxr-bitmap-patch-'));
        for (const directory of ['scripts/jellyxr', 'patches/libbitsub-1.11.0', 'node_modules/libbitsub/dist/ts']) {
            mkdirSync(join(root, directory), { recursive: true });
        }
        cpSync('scripts/jellyxr/patchBitmapDependency.mjs', join(root, 'scripts/jellyxr/patchBitmapDependency.mjs'));
        write('node_modules/libbitsub/package.json', JSON.stringify({ name: 'libbitsub', version: '1.11.0' }));
        const files = ['renderers.js', 'webgpu-renderer.js'].map(name => {
            write(`node_modules/libbitsub/dist/ts/${name}`, original);
            write(`patches/libbitsub-1.11.0/${name}.patch`, patch);
            return { path: `dist/ts/${name}`, patch: `${name}.patch`, originalSha256: digest(original), patchedSha256: digest(patched) };
        });
        write('patches/libbitsub-1.11.0/manifest.json', JSON.stringify({ package: 'libbitsub', version: '1.11.0', files }));
    });
    afterEach(() => {
        // Only remove the temporary checkout created by this test.
        if (resolve(root).startsWith(join(resolve(tmpdir()), 'jellyxr-bitmap-patch-'))) {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it('applies multiple exact hunks with CRLF input, then verifies idempotently', () => {
        write('node_modules/libbitsub/dist/ts/renderers.js', original.replace(/\n/g, '\r\n'));
        expect(run().status).toBe(0);
        expect(read('renderers.js')).toBe(patched);
        expect(read('webgpu-renderer.js')).toBe(patched);
        expect(run().status).toBe(0);
    });

    it('can resume when one target is already patched', () => {
        write('node_modules/libbitsub/dist/ts/renderers.js', patched);
        expect(run().status).toBe(0);
        expect(read('webgpu-renderer.js')).toBe(patched);
    });

    it('rejects unknown source before modifying any target', () => {
        write('node_modules/libbitsub/dist/ts/webgpu-renderer.js', 'unknown source\n');
        const result = run();
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('Unrecognized libbitsub source');
        expect(read('renderers.js')).toBe(original);
    });

    it('rejects a patch with valid context but an unexpected result', () => {
        write('patches/libbitsub-1.11.0/webgpu-renderer.js.patch', patch.replace('+new tail', '+different tail'));
        const result = run();
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('Patched output mismatch');
        expect(read('renderers.js')).toBe(original);
    });

    it('requires review when the installed version changes', () => {
        write('node_modules/libbitsub/package.json', JSON.stringify({ name: 'libbitsub', version: '2.0.0' }));
        const result = run();
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain('version changed');
        expect(read('renderers.js')).toBe(original);
    });
});
