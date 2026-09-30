// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';

import { afterEach, expect, it } from 'vitest';

import { hashFile, inventory, verifyPayload, writeManifest, type PackageManifest } from './packageManifest.ts';

const temporary: string[] = [];
const metadata: Omit<PackageManifest, 'files'> = {
    schema: 1, product: 'JellyXR', buildId: 'jellyxr-test-fixture',
    source: { revision: 'a'.repeat(40), upstreamRevision: 'b'.repeat(40), lockSha256: 'c'.repeat(64) },
    toolchain: { node: 'fixture', npm: 'fixture', tar: 'fixture', platform: 'fixture', architecture: 'fixture' },
    build: { command: 'Technical test fixture only', mode: 'ordinary-production', settings: {} },
    qualification: 'Not assessed by the packager. Review G4 evidence before release.'
};

async function fixture(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'jellyxr-manifest-test-'));
    temporary.push(root);
    await mkdir(join(root, 'web'));
    await writeFile(join(root, 'web/index.html'), '<title>Technical packaging fixture</title>');
    await writeFile(join(root, 'LICENSE'), 'Original technical fixture, not the application licence.');
    return root;
}

afterEach(async () => {
    for (const path of temporary.splice(0)) {
        const actual = resolve(path);
        if (!actual.startsWith(resolve(tmpdir()) + sep) || !basename(actual).startsWith('jellyxr-manifest-test-')) {
            throw new Error('Refusing cleanup outside the allocated temporary directory');
        }
        await rm(actual, { recursive: true, force: true });
    }
});

it('seals nested files with exact byte counts and hashes, excluding only the manifest and checksum list', async () => {
    const root = await fixture();
    const manifest = await writeManifest(root, metadata);
    expect(manifest.files.map(file => file.path)).toEqual(['LICENSE', 'web/index.html']);
    expect(manifest.files[1].sha256).toBe(await hashFile(join(root, 'web/index.html')));
    expect(manifest.files[1].bytes).toBe(Buffer.byteLength('<title>Technical packaging fixture</title>'));
    expect(await verifyPayload(root)).toEqual(manifest);
    await expect(writeManifest(root, metadata)).rejects.toThrow('already sealed');
});

it.each(['modify', 'extra', 'missing'] as const)('rejects a %s payload instead of trusting manifest membership', async change => {
    const root = await fixture();
    await writeManifest(root, metadata);
    if (change === 'modify') await writeFile(join(root, 'web/index.html'), 'changed');
    if (change === 'extra') await writeFile(join(root, 'web/local-config.json'), '{"technicalFixture":true}');
    if (change === 'missing') await rm(join(root, 'LICENSE'));
    await expect(verifyPayload(root)).rejects.toThrow('does not match');
});

it('rejects altered manifest metadata unless its checksum also matches', async () => {
    const root = await fixture();
    const manifest = await writeManifest(root, metadata);
    manifest.buildId = 'altered-build';
    await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest));
    await expect(verifyPayload(root)).rejects.toThrow('checksum list does not match');
});

it.each(['duplicate', 'traversal', 'schema'] as const)('rejects %s manifest records without following their paths', async change => {
    const root = await fixture();
    const manifest = await writeManifest(root, metadata);
    if (change === 'duplicate') manifest.files.push(manifest.files[0]);
    if (change === 'traversal') manifest.files[0].path = '../outside';
    const text = JSON.stringify(change === 'schema' ? { ...manifest, schema: 2 } : manifest);
    await writeFile(join(root, 'manifest.json'), text);
    await expect(verifyPayload(root)).rejects.toThrow();
});

it('rejects directory links and a linked payload root before reading external files', async () => {
    const root = await fixture();
    const external = await fixture();
    const link = join(root, 'linked');
    await symlink(external, link, 'junction');
    await expect(inventory(root)).rejects.toThrow('links are not allowed');
    await expect(inventory(link)).rejects.toThrow('real directory');
    expect(await readFile(join(external, 'web/index.html'), 'utf8')).toContain('Technical packaging fixture');
});

it('rejects an altered checksum list even when payload bytes are unchanged', async () => {
    const root = await fixture();
    await writeManifest(root, metadata);
    await writeFile(join(root, 'SHA256SUMS'), 'unverified\n');
    await expect(verifyPayload(root)).rejects.toThrow('checksum list does not match');
});
