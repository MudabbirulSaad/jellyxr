# Static client packaging and installation

Status: packaging and extraction exercised on Windows with Node 24.13.0, npm 11.15.0 and bsdtar 3.8.8. This document does not approve a JellyXR release or a hosting configuration. G2, G3 and G4 remain open; the current ordinary production client has no production spatial journey. An archive from this stage is a rehearsal build.

## Build and inspect an archive

Use the repository's required Node 24 and npm 11, Git and bsdtar or GNU tar. Install the existing lockfile with `npm ci --no-audit`, then run the local checks required for the change. The packager invokes the ordinary production build and inherited ES5 check; it does not install dependencies or replace the test/lint/qualification workflow.

Commit the intended source first. Tracked modifications or extra files under `src/`, including ignored files, block packaging. Other workspace files are never copied wholesale. Choose a new output directory outside the repository, with an existing parent. For example, in PowerShell:

```powershell
npm run package:client -- --output "$env:LOCALAPPDATA/JellyXR/package-rehearsal-01"
```

The command creates a directory and `.tar.gz` named `jellyxr-<12-character-commit>`, plus an outer `SHA256SUMS`. Existing output directories are rejected. A failed run may leave its output for diagnosis; use a new output directory after fixing the failure. No existing deployment is deleted or changed.

The payload contains:

| Path | Purpose |
| --- | --- |
| `web/` | Static client assets, default tracked configuration and emitted dependency notices; this is the only directory to serve |
| `manifest.json` | Build/source/toolchain identity, fixed build settings, exact payload file sizes and SHA-256 hashes |
| `SHA256SUMS` | Checksums for the payload and manifest |
| `source/jellyxr-source.tar.gz` | Git source snapshot at the manifest revision, including build instructions, original asset sources and dependency patches |
| `LICENSE`, `CONTRIBUTORS.md`, `NOTICE.md` | Inherited licence, contributor attribution and notice boundaries |
| `package-lock.json`, `dependency-inventory.json` | Locked dependency identity and available licence metadata; missing metadata is recorded as null |
| `INSTALL.md` | This procedure |

The build sets the commit-based label, bundled fonts and ordinary production mode explicitly. Experimental XR scenes are excluded. The manifest makes no G4 claim, captures no account, server endpoint, machine username or media history, and does not record the developer's complete environment. Dependency installation remains a prerequisite, not a verified packager action. Archive bytes may differ between operating systems or tar versions; the checksums identify the actual output, not a promise of byte-for-byte reproducible archives.

The outer archive uses USTAR metadata with numeric owner/group zero and no local account names. The two supported command variants follow the [libarchive tar manual](https://github.com/libarchive/libarchive/blob/master/tar/bsdtar.1) and [GNU tar options](https://www.gnu.org/s/tar/manual/html_node/Option-Summary.html). Actual tool versions and platform are recorded in the manifest; another platform's successful build is not inferred.

## Verify before installation

Compare the downloaded archive's SHA-256 with a checksum from a trusted source. In PowerShell, use `Get-FileHash -Algorithm SHA256 <archive-path>`. On systems providing GNU checksum tools, run `sha256sum -c SHA256SUMS` alongside the archive. A checksum delivered by an untrusted source is not proof of authenticity.

List the trusted archive with `tar -tzf <archive-path>` and extract it to a new, empty directory with `tar -xzf <archive-path> -C <empty-directory>`. Do not overlay an existing installation. From a matching source checkout with Node/npm available, verify the extracted payload:

```text
npm run package:client -- --verify <extracted-jellyxr-directory>
```

Verification rejects missing, extra, changed, linked or unsupported payload files and inconsistent manifests/checksum lists. It does not certify media compatibility, licence completeness, G4 acceptance or the trustworthiness of whoever supplied the archive. Keep the original verified artifact unchanged; any site-specific configuration belongs to an explicitly documented deployment copy.

## Install and qualify a deployment copy

1. Retain the existing Jellyfin client and server configuration as rollback inputs. JellyXR uses that server and its accounts; the static package performs no server database migration.
2. Place the verified `web/` contents in a new versioned static directory. Keep the source, manifest and other provenance outside the served root. Do not merge old and new asset trees.
3. Configure the existing user-managed server or reverse proxy to serve the new static root. For a separate static host, use the inherited server-selection screen to connect to the intended Jellyfin endpoint. Do not add account credentials or signed stream URLs to `config.json`.
4. Validate the exact app URL and server endpoint, including scheme, port and base paths. Prefer same-origin trusted HTTPS. A trusted HTTPS IP requires a certificate valid for that IP and accepted by the headset. LAN HTTP does not qualify for immersive WebXR merely because it is local.
5. Test fresh and returning browser sessions, authentication, libraries, direct and converted media, seeking/ranges, subtitles, secure WebSockets, and the configured base path. Separate origins additionally require the browser's actual CORS/local-network behaviour. Never solve a setup by disabling browser security or bypassing certificate warnings.

Exact Jellyfin asset-directory locations and reverse-proxy rules depend on the installation. No universal path or untested proxy configuration is prescribed here. The final M6 installation guide must name and qualify the supported topology and software versions before it can claim these steps pass.

## Upgrade and rollback

Stage and verify each version alongside the prior one. Switch the configured static root only after its smoke test passes. Preserve the previous whole directory until returning clients, cached assets and interrupted requests have been tested. Do not remove old hashed assets while an active client may still request them.

Check the actual service-worker/cache behaviour during an upgrade; a new directory on the server alone does not prove that existing tabs loaded it. Record the client build identity, close active playback deliberately and reload through the normal browser flow. If an old client remains, inspect application cache/service-worker state in the browser's supported developer tools. Clearing site data can remove authentication and preferences, so include that effect in any tested recovery instructions.

To roll back, restore the previous static-root configuration and repeat fresh/returning-client and playback checks against the prior build. Keep the Jellyfin endpoint unchanged unless a separate server change was deliberately planned. Rollback is not complete until browser asset/cache state and playback are verified.

Before release, review all P0 evidence and the support matrix, dependency/source redistribution obligations, credential/diagnostic audit and upstream update rehearsal. Package creation is neither public publication nor permission to deploy production automatically.
