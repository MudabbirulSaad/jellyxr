import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface PayloadFile { path: string; bytes: number; sha256: string }
export interface PackageManifest {
    schema: 1;
    product: 'JellyXR';
    buildId: string;
    source: { revision: string; upstreamRevision: string; lockSha256: string };
    toolchain: { node: string; npm: string; tar: string; platform: string; architecture: string };
    build: { command: string; mode: 'ordinary-production'; settings: Record<string, string> };
    qualification: 'Not assessed by the packager. Review G4 evidence before release.';
    files: PayloadFile[];
}

const MANIFEST = 'manifest.json';
const CHECKSUMS = 'SHA256SUMS';

export async function hashFile(path: string): Promise<string> {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    return hash.digest('hex');
}

/** Enumerate real files independently of a supplied manifest; never follow links. */
export async function inventory(root: string, prefix = ''): Promise<PayloadFile[]> {
    const rootStat = await lstat(root);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
        throw new Error('Payload root must be a real directory');
    }
    const result: PayloadFile[] = [];
    const names = (await readdir(root)).sort();
    for (const name of names) {
        if (/[\\\r\n\t]/.test(name)) throw new Error('Unsupported payload filename');
        const path = prefix + name;
        const actual = join(root, name);
        const stat = await lstat(actual);
        if (stat.isSymbolicLink()) throw new Error(`Payload links are not allowed: ${path}`);
        if (stat.isDirectory()) result.push(...await inventory(actual, `${path}/`));
        else if (stat.isFile()) result.push({ path, bytes: stat.size, sha256: await hashFile(actual) });
        else throw new Error(`Payload special files are not allowed: ${path}`);
    }
    return result;
}

function checksumText(files: PayloadFile[]): string {
    return files.map(file => `${file.sha256}  ${file.path}\n`).join('');
}

export async function writeManifest(root: string, metadata: Omit<PackageManifest, 'files'>): Promise<PackageManifest> {
    const files = await inventory(root);
    if (files.some(file => file.path === MANIFEST || file.path === CHECKSUMS)) throw new Error('Payload is already sealed');
    const manifest = { ...metadata, files };
    await writeFile(join(root, MANIFEST), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
    await writeFile(join(root, CHECKSUMS), checksumText(await inventory(root)), { flag: 'wx' });
    return manifest;
}

function parseManifest(value: string): PackageManifest {
    const manifest: PackageManifest = JSON.parse(value);
    if (manifest?.schema !== 1 || manifest.product !== 'JellyXR' || !Array.isArray(manifest.files)
        || !/^[a-f0-9]{40}$/.test(manifest.source?.revision || '')) {
        throw new Error('Unsupported package manifest');
    }
    const names = new Set<string>();
    for (const file of manifest.files) {
        if (!file || typeof file.path !== 'string' || !Number.isSafeInteger(file.bytes) || file.bytes < 0
            || !/^[a-f0-9]{64}$/.test(file.sha256) || names.has(file.path)) throw new Error('Invalid manifest file record');
        names.add(file.path);
    }
    return manifest;
}

/** Detect missing, extra, replaced and modified payload files. This is integrity, not authenticity. */
export async function verifyPayload(root: string): Promise<PackageManifest> {
    const actual = await inventory(root);
    const manifest = parseManifest(await readFile(join(root, MANIFEST), 'utf8'));
    const payload = actual.filter(file => file.path !== MANIFEST && file.path !== CHECKSUMS);
    if (JSON.stringify(payload) !== JSON.stringify(manifest.files)) throw new Error('Payload does not match its manifest');
    const expected = checksumText(actual.filter(file => file.path !== CHECKSUMS));
    if (await readFile(join(root, CHECKSUMS), 'utf8') !== expected) throw new Error('Payload checksum list does not match');
    return manifest;
}
