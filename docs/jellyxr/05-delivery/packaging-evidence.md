# Packaging rehearsal evidence

Date: 2026-09-30. Final tooling source: eb9eee362a807fd1592a3d4227194921c2882b4a, including 81cde7a584, based on xr 60e356e1fc (PR #28). Scope: independent W-08/W-09 preparation under D-31, NFR-004/005/007/010 and the [packaging contract](../04-architecture/deployment-security.md#packaging-contract).

This is an ordinary-client packaging rehearsal. M2/G2 remains open, no production XR engine is selected, and the archive is not a qualified JellyXR v1 release. No public release was published and no production service was changed.

## Implemented process

`npm run package:client -- --output <new-directory>` checks source ownership, rebuilds the ordinary production client, runs its inherited ES5 check, copies only the dedicated payload, writes the manifest/checksum list and creates a tar archive. Output must be outside the repository; an existing destination is rejected. No workspace sweep, deletion, deployment or dependency upgrade occurs. The [installation procedure](package-installation.md) keeps the static root, source/provenance and deployment copy separate.

The manifest records the full build revision, pinned upstream SHA, lockfile hash, Node/npm/tar versions, platform, fixed build settings and exact file hashes/sizes. The package retains default tracked configuration, emitted dependency notices, licence, contributors, lockfile metadata and a matching Git source archive. The verifier enumerates real files independently of supplied paths, rejects links, and checks exact membership plus the checksum list. These checks establish integrity; a separately trusted source is still needed for authenticity.

## Actual results

| Check | Observed result / boundary |
| --- | --- |
| Toolchain | Windows x64, Node 24.13.0, npm 11.15.0, bsdtar/libarchive 3.8.8. The existing locked dependency installation was reused; a full npm reinstall was not repeated in this slice |
| Automated regression | Ten new manifest cases pass: normal nested payload, modified/extra/missing file, altered metadata checksum, duplicate/traversal/unsupported-schema records, directory/root links and changed checksum list. Full suite: 412 tests in 47 files |
| Types/lint | Application and offline Node authoring TypeScript pass. Full lint passes with 98 inherited warnings and zero errors; final path adjustment also passes focused lint/types. No application or stylesheet source changed |
| Builds | Both rehearsal invocations rebuild successfully and pass the inherited ES5 check on 984 files. Each emits the two existing bundle-size warnings. Experimental build checks were not repeated because no experimental source/build configuration changed |
| Input guards | Uncommitted tracked source, an existing output directory, an output inside the repository and an extra ignored `src/` fixture are rejected before packaging. No rejected output directory was created; the existing archive hash stayed unchanged. The temporary source fixture was removed |
| Archive extraction | Both archives extract successfully and verify 2,357 payload files. Final archive headers contain only ordinary files/directories, numeric owner/group zero and no local account names. Source archive has 1,825 members, including the packager and local subtitle dependency patch; it excludes node_modules and the untracked skill bytecode cache |
| Integrity failure | Appending a labelled technical line to the first extracted INSTALL.md makes CLI verification fail. Restoring its exact original bytes makes verification pass again. The original archive remains unchanged |
| Ordinary bundle exclusion | Final extracted `web/` has no comparison GLBs or selected spatial-catalogue marker. Its configuration and lockfile hashes match the recorded inputs. This is a packaging exclusion check, not a comprehensive credential or licence audit |
| Documentation | Thirty-two Markdown files pass 418 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed |
| PC bootstrap | The first extracted `web/` was served only on loopback port 8081 with Python's temporary static server. The in-app browser loaded the production client, fonts and server-selection screen with Add Server. No account or media was entered. The temporary tab/server were closed. Authenticated playback, HTTPS, server base paths and cache/rollback were not tested in this run |

Review corrected the output basename calculation for a destination whose parent is a filesystem root. The final archive uses the corrected code. No cross-platform, GNU-tar or root-directory installation pass is inferred from the Windows rehearsal.

## Artifact identity

The final local rehearsal is `jellyxr-eb9eee362a80.tar.gz`, 41,246,336 bytes, stored under `%LOCALAPPDATA%/JellyXR/package-rehearsal-20260930-b/`. The same directory retains its sealed payload, a separately extracted copy and the outer checksum list. This local path is an execution record, not a published download endpoint.

```text
Archive SHA-256:
60215e2058389931d47cd1ae1c2529274d299ba6fd64d487d7c24dc3a299611f

Package lock SHA-256:
883a2e2d1bef285bf7abdc98547b16c778640c4b2d16fa8a64efe73c51bbb485
```

The first rehearsal remains `jellyxr-81cde7a584c1.tar.gz` under the corresponding `package-rehearsal-20260930-a` directory; it supplied the browser and tampered-copy integrity checks above. Neither archive is published. Archive byte identity is not promised across hosts or tar versions.

## Open release work

G4 still requires the integrated spatial journey, real Quest controllers/hands/comfort/media evidence, sustained and five-viewer runs, full ordinary parity, HTTPS domain/trusted-IP/separate-origin/base-path/range/WebSocket tests, real upgrade/cache/rollback and upstream-update rehearsal. Dependency/source redistribution obligations and a complete credential/diagnostic audit remain unapproved; the lockfile inventory explicitly leaves absent licence metadata null. A new archive must be built from the final qualified source and accompanied by the reviewed support matrix and limitations.

This slice changes offline tooling and instructions. UI/UX Pro Max was reviewed for applicability; its instruction to skip non-visual infrastructure applies. No application interface, new visual preset or filler content was introduced.


## Fresh-install rehearsal — 2026-09-30

Source: xr `c729c0e52d913177aeef804e39e6d1ad08538f7e` (PR #32). An isolated managed checkout began with no node_modules directory; the active development checkout and server were preserved. This closes the earlier fresh-install evidence gap for this exact Windows source/toolchain combination. It does not claim cross-platform or byte-identical archive reproducibility.

| Check | Actual result / boundary |
| --- | --- |
| Locked installation | Node 24.13.0 and npm 11.15.0; `npm ci --no-audit` installed 1,782 packages successfully. Existing package deprecation warnings and npm's unknown min-release-age-exclude configuration warning remain. Registry/cache conditions were uncontrolled; elapsed time is not a benchmark |
| Source identity | Full revision stayed c729c0e52d913177aeef804e39e6d1ad08538f7e, Git tracked state remained clean and package-lock SHA-256 remained 883a2e2d1bef285bf7abdc98547b16c778640c4b2d16fa8a64efe73c51bbb485 |
| Dependency repair | With repository ignore-scripts enabled, all three installed libbitsub 1.11.0 files initially matched the manifest's original hashes. Explicit `npm run patch:dependencies` produced the expected repaired hashes; running it again succeeded unchanged. Build/test configuration also verifies the repair. No install hook, ignored lifecycle script or dependency upgrade was assumed |
| Checks | Application and offline-authoring TypeScript pass. Full lint: 98 inherited warnings, zero errors. Stylelint passes. All 427 tests in 49 files pass from the new installation, including actual parser/loader and ownership cases |
| Ordinary package build | The packager's production build succeeds with two inherited size warnings; ES5 check passes 984 files. The sealed payload verifies, then extraction into a new empty directory and CLI verification pass again for all 2,357 payload files |
| Experimental build | Separate opt-in production build succeeds with two inherited size warnings; its ES5 check passes 994 files. This does not add experiments to the ordinary archive |
| Archive/provenance | Outer tar has 2,376 file/directory members, numeric owner/group zero and no account names. The matching Git source snapshot has 1,841 members, including the original room recipe and dependency patch, with no node_modules or Python bytecode cache. No imported source/build inputs were copied from the working development tree |
| Static payload | Extracted web/ has no GLBs or room comparison marker. Packaged config.json matches the tracked default hash. These focused checks do not replace the full credential, dependency/source redistribution or media audit |

Artifact: `jellyxr-c729c0e52d91.tar.gz`, 41,836,442 bytes, under `%LOCALAPPDATA%/JellyXR/fresh-package-c729c0e52d/`. The sealed payload and separately extracted copy remain alongside it. SHA-256:

```text
4edc48e297442ddf1efa0e9c97963578b8709b93e7b4a4453b1b48856ebd66e4
```

No browser, authentication, media, network topology or real-device scenario was executed in this fresh-install slice. ADB returned no connected device. The earlier PC bootstrap and owner-reported Quest results retain their original dates and scope. This is another ordinary-client rehearsal archive, not the final integrated XR artifact or a public release.

A read-only upstream merge preview separately exposed package.json/package-lock.json conflicts against development tip e466eb93f0. See the [upstream inspection](../04-architecture/upstream-assessment.md#update-inspection--2026-09-30). No upstream application change or dependency resolution was adopted at this checkpoint. The subsequent isolated representative update/retest is recorded in the upstream assessment; final integrated media regression remains open.

Documentation validation passes 433 relative links/anchors across 32 Markdown files, unique requirement definitions, all P0/work/scenario mappings and 17 unchanged dependency edges. No diagrams or application code changed in the evidence commit; whitespace checks pass.
