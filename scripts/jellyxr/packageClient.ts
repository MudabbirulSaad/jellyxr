import { execFileSync } from 'node:child_process';
import { cp, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hashFile, inventory, verifyPayload, writeManifest } from './packageManifest.ts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const upstreamRevision = 'fae41f33eb7cd636a9ef68984adb82bb247a6e1b';

function git(...args: string[]): string {
    // The developer supplies Git through PATH; arguments never pass through a shell.
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
}

function checkSource(revision?: string): string {
    if (git('status', '--porcelain', '--untracked-files=no') || git('ls-files', '--others', '--', 'src')) {
        throw new Error('Commit tracked changes and remove extra source files before packaging');
    }
    const current = git('rev-parse', 'HEAD');
    if (revision && current !== revision) throw new Error('Source revision changed during packaging');
    return current;
}

async function prepareDestination(value: string): Promise<string> {
    const output = resolve(value);
    const parent = await realpath(dirname(output));
    const actual = join(parent, basename(output));
    const fromRoot = relative(await realpath(root), actual);
    if (!isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`)) {
        throw new Error('Package output must be outside the repository');
    }
    await mkdir(actual); // Refuse an existing output; never overwrite or delete a prior build.
    return actual;
}

function runBuild(buildId: string): { npm: string; settings: Record<string, string> } {
    const npmCli = process.env.npm_execpath;
    if (!npmCli) throw new Error('Run this command through npm run package:client');
    const settings = { NODE_ENV: 'production', JELLYXR_EXPERIMENTS: '0', USE_SYSTEM_FONTS: '0', JELLYFIN_VERSION: buildId };
    const env: NodeJS.ProcessEnv = { ...process.env, ...settings };
    delete env.WEBPACK_SERVE;
    const npm = execFileSync(process.execPath, [npmCli, '--version'], { encoding: 'utf8', env }).trim();
    for (const command of ['build:production', 'escheck']) {
        execFileSync(process.execPath, [npmCli, 'run', command], { cwd: root, env, stdio: 'inherit' });
    }
    return { npm, settings };
}

async function copyWeb(destination: string): Promise<void> {
    const dist = join(root, 'dist');
    const files = await inventory(dist);
    if (!files.some(file => file.path === 'index.html') || !files.some(file => file.path === 'serviceworker.js')) {
        throw new Error('Production entry points are missing');
    }
    if (await hashFile(join(dist, 'config.json')) !== await hashFile(join(root, 'src/config.json'))) {
        throw new Error('Packaged configuration differs from the tracked default');
    }
    await cp(dist, join(destination, 'web'), { recursive: true, errorOnExist: true, force: false });
}

async function copyProvenance(destination: string, revision: string): Promise<void> {
    for (const file of ['LICENSE', 'CONTRIBUTORS.md', 'package-lock.json']) await cp(join(root, file), join(destination, file));
    await cp(join(root, 'docs/jellyxr/05-delivery/package-installation.md'), join(destination, 'INSTALL.md'));
    await mkdir(join(destination, 'source'));
    git('archive', '--format=tar.gz', `--output=${join(destination, 'source/jellyxr-source.tar.gz')}`, revision);
    const lock = JSON.parse(await readFile(join(root, 'package-lock.json'), 'utf8')) as {
        packages: Record<string, { version?: string; license?: string }>;
    };
    const dependencies = Object.entries(lock.packages).filter(([path]) => path).map(([path, entry]) => ({
        path, version: entry.version || null, license: entry.license || null
    }));
    await writeFile(join(destination, 'dependency-inventory.json'), JSON.stringify(dependencies, null, 2) + '\n');
    await writeFile(join(destination, 'NOTICE.md'), '# JellyXR build notices\n\n'
        + 'JellyXR derives from Jellyfin Web under GPL-2.0-or-later. Preserve LICENSE and CONTRIBUTORS.md. '
        + 'The source snapshot matches the manifest revision and contains build instructions and local dependency patches.\n\n'
        + 'web/ retains emitted dependency notices. dependency-inventory.json records lockfile metadata, including development packages; '
        + 'missing licence metadata is null. This inventory is not a complete redistribution or corresponding-source audit. '
        + 'The final M6 audit must review dependency licences and any required additional source before distribution.\n');
}

function archiveTool(): { version: string; options: string[] } {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    const version = execFileSync('tar', ['--version'], { encoding: 'utf8' }).split(/\r?\n/)[0].trim();
    let owner: string[];
    if (version.startsWith('bsdtar ')) owner = ['--uid', '0', '--gid', '0'];
    else if (version.startsWith('tar (GNU tar) ')) owner = ['--owner=0', '--group=0'];
    else throw new Error('Packaging requires bsdtar or GNU tar');
    return { version, options: ['--format=ustar', '--numeric-owner', ...owner] };
}

async function packageClient(outputArgument: string): Promise<void> {
    const revision = checkSource();
    const tar = archiveTool();
    const output = await prepareDestination(outputArgument);
    const buildId = `jellyxr-${revision.slice(0, 12)}`;
    const destination = join(output, buildId);
    const lockSha256 = await hashFile(join(root, 'package-lock.json'));
    const { npm, settings } = runBuild(buildId);
    checkSource(revision);
    await mkdir(destination);
    await copyWeb(destination);
    await copyProvenance(destination, revision);
    await writeManifest(destination, {
        schema: 1, product: 'JellyXR', buildId,
        source: { revision, upstreamRevision, lockSha256 },
        toolchain: { node: process.version, npm, tar: tar.version, platform: process.platform, architecture: process.arch },
        build: { command: 'npm run build:production && npm run escheck', mode: 'ordinary-production', settings },
        qualification: 'Not assessed by the packager. Review G4 evidence before release.'
    });
    await verifyPayload(destination);
    checkSource(revision);
    const archiveName = `${buildId}.tar.gz`;
    // Use the platform's installed tar with fixed argument boundaries, never shell text.
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    execFileSync('tar', ['-czf', join(output, archiveName), ...tar.options, '-C', output, buildId], {
        stdio: 'inherit', env: { ...process.env, TAR_OPTIONS: '' }
    });
    await writeFile(join(output, 'SHA256SUMS'), `${await hashFile(join(output, archiveName))}  ${archiveName}\n`, { flag: 'wx' });
    console.log(`Package created: ${join(output, archiveName)}\nPayload verified. G4 qualification is not assessed.`);
}

const [mode, value, ...extra] = process.argv.slice(2);
if (!value || extra.length || !['--output', '--verify'].includes(mode)) {
    throw new Error('Usage: npm run package:client -- --output NEW_DIRECTORY | --verify EXTRACTED_PAYLOAD');
}
if (mode === '--verify') {
    if (!(await lstat(resolve(value))).isDirectory()) throw new Error('Verification needs an extracted payload directory');
    const manifest = await verifyPayload(resolve(value));
    console.log(`Verified ${manifest.files.length} files for ${manifest.buildId}. ${manifest.qualification}`);
} else {
    await packageClient(value);
}
