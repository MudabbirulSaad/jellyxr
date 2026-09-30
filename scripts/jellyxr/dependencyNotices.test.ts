// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { copyDependencyNotices } from './dependencyNotices.ts';
import { hashFile } from './packageManifest.ts';

const temporary: string[] = [];
type Entry = { version: string; license?: string; optional?: boolean; link?: boolean };

async function fixture(packages: Record<string, Entry>): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'jellyxr-notices-test-'));
    temporary.push(root);
    await writeFile(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': {}, ...packages } }));
    return root;
}

async function install(root: string, path: string, version = '1.0.0'): Promise<string> {
    const directory = join(root, path);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'package.json'), JSON.stringify({ version }));
    return directory;
}

afterEach(async () => {
    for (const path of temporary.splice(0)) {
        const actual = resolve(path);
        if (!actual.startsWith(resolve(tmpdir()) + sep) || !basename(actual).startsWith('jellyxr-notices-test-')) {
            throw new Error('Refusing cleanup outside the allocated temporary directory');
        }
        await rm(actual, { recursive: true, force: true });
    }
});

it('copies exact notices for scoped and nested packages with relative identity and hashes', async () => {
    const packages = {
        'node_modules/@scope/first': { version: '1.0.0', license: 'Technical fixture metadata' },
        'node_modules/@scope/first/node_modules/second': { version: '1.0.0' }
    };
    const root = await fixture(packages);
    for (const path of Object.keys(packages)) {
        const directory = await install(root, path);
        await writeFile(join(directory, 'LICENSE-MIT'), new TextEncoder().encode('Original technical fixture\r\n©\r\n'));
        await writeFile(join(directory, 'NOTICE.txt'), 'Technical notice fixture, not legal terms.\n');
        await writeFile(join(directory, 'README.md'), 'Must not be copied.');
    }
    const output = join(root, 'collected');
    const result = await copyDependencyNotices(root, output);
    expect(result.packages).toHaveLength(2);
    for (const item of result.packages) {
        expect(item.state).toBe('collected');
        expect(item.files.map(file => file.source)).toEqual(['LICENSE-MIT', 'NOTICE.txt']);
        for (const file of item.files) {
            const original = join(root, item.path, file.source);
            const copied = join(output, file.destination);
            expect(await readFile(copied)).toEqual(await readFile(original));
            expect(file.sha256).toBe(await hashFile(original));
            expect(file.bytes).toBe((await readFile(original)).length);
        }
    }
    expect(JSON.stringify(result)).not.toContain(root);
    expect(result.packages[1].license).toBeNull();
    expect(JSON.parse(await readFile(join(output, 'inventory.json'), 'utf8'))).toEqual(result);
    await expect(readFile(join(output, 'node_modules/@scope/first/README.md'))).rejects.toThrow();
    await expect(copyDependencyNotices(root, output)).rejects.toThrow('EEXIST');
});

it('retains the required combined libass notice beyond top-level licences', async () => {
    const path = 'node_modules/@jellyfin/libass-wasm';
    const root = await fixture({ [path]: { version: '1.0.0' } });
    const directory = await install(root, path);
    await mkdir(join(directory, 'dist/js'), { recursive: true });
    await writeFile(join(directory, 'LICENSE'), 'Technical top-level fixture.');
    await writeFile(join(directory, 'dist/js/COPYRIGHT'), 'Technical embedded-dependency fixture.');
    const result = await copyDependencyNotices(root, join(root, 'collected'));
    expect(result.packages[0].files.map(file => file.source)).toEqual(['LICENSE', 'dist/js/COPYRIGHT']);
    await rm(join(directory, 'dist/js/COPYRIGHT'));
    await expect(copyDependencyNotices(root, join(root, 'second'))).rejects.toThrow('ENOENT');
});

it('records absent optional packages and installed packages without notices explicitly', async () => {
    const root = await fixture({
        'node_modules/absent': { version: '1.0.0', optional: true },
        'node_modules/present': { version: '1.0.0', license: 'MIT' }
    });
    await install(root, 'node_modules/present');
    const result = await copyDependencyNotices(root, join(root, 'collected'));
    expect(result.packages.map(item => [item.state, item.files])).toEqual([
        ['not-installed-optional', []], ['no-matching-notice', []]
    ]);
});

it('rejects missing required packages and version mismatches', async () => {
    const root = await fixture({ 'node_modules/required': { version: '1.0.0' } });
    await expect(copyDependencyNotices(root, join(root, 'missing'))).rejects.toThrow('Required locked package is missing');
    await install(root, 'node_modules/required', '2.0.0');
    await expect(copyDependencyNotices(root, join(root, 'mismatch'))).rejects.toThrow('differs from lock');
});

it.each(['../outside', 'node_modules/../outside', 'node_modules\\outside', 'node_modules/a//b', 'node_modules/a/extra', 'C:/outside', 'node_modules/a\n'])('rejects invalid lock path %s before creating output', async path => {
    const root = await fixture({ [path]: { version: '1.0.0' } });
    await expect(copyDependencyNotices(root, join(root, 'collected'))).rejects.toThrow(/Invalid (notice path|locked package)/);
    await expect(readFile(join(root, 'collected/inventory.json'))).rejects.toThrow('ENOENT');
});

it('rejects linked-package lock metadata and unsupported lock formats', async () => {
    const root = await fixture({ 'node_modules/linked': { version: '1.0.0', link: true } });
    await expect(copyDependencyNotices(root, join(root, 'linked'))).rejects.toThrow('Invalid locked package');
    await writeFile(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 2, packages: {} }));
    await expect(copyDependencyNotices(root, join(root, 'old'))).rejects.toThrow('version 3');
});

it('rejects malformed optional metadata instead of treating a required missing package as optional', async () => {
    const root = await fixture({});
    await writeFile(join(root, 'package-lock.json'), JSON.stringify({
        lockfileVersion: 3, packages: { 'node_modules/first': { version: '1.0.0', optional: 'true' } }
    }));
    await expect(copyDependencyNotices(root, join(root, 'collected'))).rejects.toThrow('Invalid locked package');
});

it('rejects a linked source root before reading its lockfile', async () => {
    const root = await fixture({});
    const external = await fixture({});
    await symlink(external, join(root, 'linked-root'), 'junction');
    await expect(copyDependencyNotices(join(root, 'linked-root'), join(root, 'collected'))).rejects.toThrow('real directory');
});

it.each(['package', 'parent', 'notice', 'supplemental-parent'] as const)('rejects %s links before copying external files', async kind => {
    const path = kind === 'supplemental-parent' ? 'node_modules/@jellyfin/libass-wasm' : 'node_modules/first';
    const root = await fixture({ [path]: { version: '1.0.0', optional: true } });
    const external = await fixture({});
    if (kind === 'parent') {
        await symlink(external, join(root, 'node_modules'), 'junction');
    } else if (kind === 'package') {
        await mkdir(join(root, 'node_modules'));
        await symlink(external, join(root, path), 'junction');
    } else {
        const directory = await install(root, path);
        if (kind === 'notice') await symlink(external, join(directory, 'LICENSE'), 'junction');
        else await symlink(external, join(directory, 'dist'), 'junction');
    }
    await expect(copyDependencyNotices(root, join(root, 'collected'))).rejects.toThrow('Notice links are not allowed');
    expect(await readFile(join(external, 'package-lock.json'), 'utf8')).toContain('lockfileVersion');
});

it('rejects a notice-named directory rather than treating it as a licence file', async () => {
    const root = await fixture({ 'node_modules/first': { version: '1.0.0' } });
    const directory = await install(root, 'node_modules/first');
    await mkdir(join(directory, 'LICENSE'));
    await expect(copyDependencyNotices(root, join(root, 'collected'))).rejects.toThrow('Notice must be a regular file');
});
