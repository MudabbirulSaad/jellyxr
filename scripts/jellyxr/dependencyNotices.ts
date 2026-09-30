import { createHash } from 'node:crypto';
import { lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

interface LockedPackage { version: string; license?: string; optional?: boolean; link?: boolean }
interface NoticeFile { source: string; destination: string; bytes: number; sha256: string }
interface PackageNotices {
    path: string;
    version: string;
    license: string | null;
    state: 'collected' | 'no-matching-notice' | 'not-installed-optional';
    files: NoticeFile[];
}
export interface NoticeInventory {
    schema: 1;
    scope: 'Installed locked dependencies, including development packages; not a runtime SBOM or redistribution approval.';
    packages: PackageNotices[];
}

const NOTICE_NAME = /^(?:licen[sc]e|copying|notice|copyright|ofl|unlicense)(?:[._-].*)?$/i;
const SUPPLEMENTAL: Record<string, string[]> = {
    'node_modules/@jellyfin/libass-wasm': ['dist/js/COPYRIGHT']
};

function segments(path: string): string[] {
    const parts = path.split('/');
    if (/[\\:]/.test(path) || [...path].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
        || parts.some(part => !part || part === '.' || part === '..')) {
        throw new Error(`Invalid notice path: ${path}`);
    }
    return parts;
}

/** Check every component, including intermediate directories, before reading installed files. */
async function checkedPath(root: string, path: string, allowMissing = false): Promise<string | undefined> {
    const parts = segments(path);
    let current = root;
    for (let index = 0; index < parts.length; index++) {
        current = join(current, parts[index]);
        let stat;
        try {
            stat = await lstat(current);
        } catch (error) {
            if (allowMissing && (error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
            throw error;
        }
        if (stat.isSymbolicLink()) throw new Error(`Notice links are not allowed: ${path}`);
        if (index < parts.length - 1 && !stat.isDirectory()) throw new Error(`Invalid notice directory: ${path}`);
    }
    return current;
}

function lockedPackages(text: string): [string, LockedPackage][] {
    const lock = JSON.parse(text) as { lockfileVersion?: number; packages?: Record<string, LockedPackage> };
    if (lock.lockfileVersion !== 3 || !lock.packages || typeof lock.packages !== 'object' || Array.isArray(lock.packages)) {
        throw new Error('Notice collection requires a version 3 package lock');
    }
    return Object.entries(lock.packages).filter(([path]) => path).sort(([left], [right]) => left.localeCompare(right)).map(([path, entry]) => {
        segments(path);
        if (!/^node_modules\/(?:@[^/]+\/)?[^/]+(?:\/node_modules\/(?:@[^/]+\/)?[^/]+)*$/.test(path)
            || !entry || entry.link || typeof entry.version !== 'string' || !entry.version
            || (entry.license !== undefined && typeof entry.license !== 'string')
            || (entry.optional !== undefined && typeof entry.optional !== 'boolean')) {
            throw new Error(`Invalid locked package: ${path}`);
        }
        return [path, entry];
    });
}

async function copyNotice(root: string, output: string, packagePath: string, source: string): Promise<NoticeFile> {
    const input = await checkedPath(root, `${packagePath}/${source}`);
    if (!input || !(await lstat(input)).isFile()) throw new Error(`Notice must be a regular file: ${packagePath}/${source}`);
    const bytes = Uint8Array.from(await readFile(input));
    const destination = `${packagePath}/${source}`;
    await mkdir(dirname(join(output, destination)), { recursive: true });
    await writeFile(join(output, destination), bytes, { flag: 'wx' });
    return { source, destination, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}

async function collectPackage(root: string, output: string, path: string, entry: LockedPackage): Promise<PackageNotices> {
    const record: PackageNotices = { path, version: entry.version, license: entry.license ?? null, state: 'no-matching-notice', files: [] };
    const directory = await checkedPath(root, path, true);
    if (!directory) {
        if (!entry.optional) throw new Error(`Required locked package is missing: ${path}`);
        record.state = 'not-installed-optional';
        return record;
    }
    if (!(await lstat(directory)).isDirectory()) throw new Error(`Package must be a directory: ${path}`);
    const packageJson = await checkedPath(root, `${path}/package.json`);
    if (!packageJson || !(await lstat(packageJson)).isFile()) throw new Error(`Package metadata must be a regular file: ${path}`);
    const metadata = JSON.parse(await readFile(packageJson, 'utf8')) as { version?: unknown };
    if (metadata.version !== entry.version) throw new Error(`Installed package version differs from lock: ${path}`);
    const names = [...new Set([
        ...(await readdir(directory)).filter(name => NOTICE_NAME.test(name)),
        ...(SUPPLEMENTAL[path] ?? [])
    ])].sort();
    for (const name of names) record.files.push(await copyNotice(root, output, path, name));
    if (record.files.length) record.state = 'collected';
    return record;
}

/** Preserve exact notice bytes. Absence is evidence for an audit, never an inferred licence. */
export async function copyDependencyNotices(root: string, output: string): Promise<NoticeInventory> {
    const rootStat = await lstat(root);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new Error('Notice source must be a real directory');
    const lockPath = await checkedPath(root, 'package-lock.json');
    if (!lockPath || !(await lstat(lockPath)).isFile()) throw new Error('Package lock must be a regular file');
    const packages = lockedPackages(await readFile(lockPath, 'utf8'));
    await mkdir(output); // Reject reused output rather than merging or overwriting prior evidence.
    const result: NoticeInventory = {
        schema: 1,
        scope: 'Installed locked dependencies, including development packages; not a runtime SBOM or redistribution approval.',
        packages: []
    };
    for (const [path, entry] of packages) result.packages.push(await collectPackage(root, output, path, entry));
    await writeFile(join(output, 'inventory.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    await writeFile(join(output, 'README.md'), '# Installed dependency notices\n\n'
        + 'inventory.json identifies locked package versions and exact notice paths, byte counts and SHA-256 hashes. '
        + 'node_modules/ here contains notice files only, not executable dependency code. '
        + 'All installed dependencies, including development packages, are included; absent optional packages and packages '
        + 'with no top-level matching notice are recorded explicitly. The combined libass-wasm dist/js/COPYRIGHT is also retained.\n\n'
        + 'This collection does not identify every emitted module, complete all nested vendor notices, supply all corresponding '
        + 'source or approve redistribution. Preserve emitted bundle notices and review the final M6 audit before distribution.\n', { flag: 'wx' });
    return result;
}
