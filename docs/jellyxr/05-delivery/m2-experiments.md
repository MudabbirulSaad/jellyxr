# M2 experiment evidence

Updated: 2026-09-29. Status: comparison workbench preparation passed local checks; G2 remains open. Source revision: d919941b3b, based on xr 8ea4c39a83. The workbench is a disposable experiment, not the production spatial library or an engine-selection decision.

## Reproduce the comparison

Use the existing Node 24.13.0/npm 11.15.0 toolchain and locked dependencies. Run `npm ci --no-audit`, then `npm run serve:xr-experiments -- --host 127.0.0.1 --port 8080`. Open `http://localhost:8080/#/xr-experiments`. The existing two-port USB workflow also makes this address reachable on the authorised Quest connection, but no immersive Quest run is claimed here.

The explicit `JELLYXR_EXPERIMENTS=1` build flag enables this route. Ordinary `serve` and production builds omit it. `npm run build:xr-experiments` writes a separate ignored `.jellyxr-experiments` directory; `npm run escheck:xr-experiments` checks those files with the same inherited worker exclusions. Do not deploy that experiment directory as the release artifact.

## Controlled inputs and current limitations

| Input | Implemented preparation | Boundary |
| --- | --- | --- |
| Room | Original box geometry, metres, right-handed coordinates, +Y up, forward -Z; shared floor/walls/screen/seats/light strips and collision dimensions | Simple comparison geometry, not finished Observatory models or a comfortable-scale claim |
| Physics | Both candidates load native WASM physics, gravity and a 0.18 kg remote; shared fixed 1/72-second clock, maximum four catch-up steps and hidden-page reset | Floor settling observed on PC; grabbing, fast throws, tracking loss and XR visibility remain unqualified |
| Recovery | Recall remote resets its position and velocities; candidate cleanup stops loops/listeners/timers and disposes resources | Complete physical and session-recovery scenarios remain open |
| Catalogue | Deterministic 1,000 labelled local records, 24-item pages, long titles, missing-art cases, search/kind filters | No server records are created; no private metadata/artwork. Network/artwork streaming and spatial catalogue performance are not yet tested |
| Materials | Same palette, roughness and metal intent; corrected Babylon sRGB-to-linear material input | Engine lighting responses still need calibration; these previews do not establish equal visual quality |
| Timing | Bounded 720-sample application-work window and nearest-rank p95; visible count and remote height | Excludes GPU/compositor/video decode; uncontrolled desktop observations are not Quest benchmarks |
| XR entry | Deliberate request, local-floor space and optional hand/layer capability requests | Full input actions, media layers, subtitles and real-headset lifecycle qualification remain pending |

The fixture UI uses actionable technical labels. Normal product routes never show synthetic film descriptions or fake library content. It does not start another media element or create progress reports.

## Candidate versions and provenance

| Package | Exact experimental version | Installed package licence |
| --- | --- | --- |
| @babylonjs/core | 9.27.1 | Apache-2.0 |
| @babylonjs/havok | 1.3.14 | MIT |
| three | 0.186.0 | MIT |
| @types/three | 0.186.0 | MIT |
| @dimforge/rapier3d-compat | 0.20.0 | Apache-2.0 |

These are development dependencies, locked for comparison. Registry publication dates were checked against the repository's seven-day minimum release age. An initial request for Babylon 9.28.0 was rejected by that rule; it was not bypassed. No inherited dependency version changed. The Rapier compatibility package embeds WASM; Havok's WASM is emitted as an explicit asset. No external model or texture has been imported.

Primary implementation references: [Three WebXRManager](https://threejs.org/docs/pages/WebXRManager.html), [Rapier initialization](https://rapier.rs/docs/user_guides/javascript/getting_started_js/), [Havok package](https://github.com/BabylonJS/havok). Exact installed TypeScript declarations and source were also inspected; vendor facilities are not device evidence.

## Executed checks

| Check | Actual result | Evidence class / limits |
| --- | --- | --- |
| TypeScript | Passed | Inherited `build:check`, including experiment files |
| ESLint | Passed; 0 errors, 98 inherited warnings | No new warnings; named vendor-factory exception and guarded XR request only; no blanket XR compatibility exclusion |
| Stylelint | Passed | Inherited styles unchanged |
| Vitest | 171 tests across 14 files passed | Includes catalogue identity/pagination/filter boundaries, destination rejection, clock catch-up/reset and timing-window tests |
| Ordinary production build / ES5 | Passed; 982 files | Existing size warnings remain; no experiment route/data/candidate markers or candidate asset filenames found in ordinary output |
| Experiment build / ES5 | Passed; 989 files | Both candidate bundles compiled; only inherited worker exclusions applied |
| Workflow validation | Passed | Parsed workflow, read-only permissions and comparison commands verified locally |
| PC preview | Both scenes reached ready and rendered geometry; remote settled at displayed 0.017 m | Codex in-app browser on Windows; embedded version not inventoried, so this is a smoke observation |
| PC controls | Switching candidates worked; next page showed records 0025 onward; unsupported XR entry returned actionable state | No actual immersive session or hands test inferred |
| UI review | Removed lingering inherited loading spinner; readable technical labels and honest missing capabilities | Preliminary browser review; not the final spatial/comfort review |

Local build/lint logs are outside Git under `%LOCALAPPDATA%\JellyXR`. The in-app browser logged development-server WebSocket Host/Origin rejection while page assets and scene previews worked. Browser checks used deliberate reloads; no host-validation bypass was applied. This development-tooling observation does not establish Jellyfin media/WebSocket deployment behaviour.

## Remaining experiments

1. Attach the inherited active media surface through a narrow borrowed bridge; compare media layer and texture paths with explicit subtitle composition and lifecycle ownership.
2. Add equal world-space target/control, controller/hand, grab/teleport/snap and tracking-loss fixtures. Prove all required operations on the actual Quest.
3. Calibrate lighting/text and add representative model/texture and incremental artwork cost; retain a plain control scene.
4. Record direct/remux/transcode, audio, text/ASS/bitmap, seek/resume/interruption results, exact device/browser settings and repeated/sustained timing.
5. Apply the [G2 selection rule](../06-decisions/technology-evaluation.md); no renderer is selected by these preparation passes.

Related: [execution ledger](implementation-goal.md), [M1 evidence](m1-readiness.md), [test strategy](test-strategy.md), [source files](../../../src/apps/experimental/xr/ComparisonPage.tsx).
