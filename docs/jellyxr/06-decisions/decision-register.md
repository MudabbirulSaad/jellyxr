# Decision register

Updated: 2026-09-29. Confirmed means established by the approved plan or subsequent user instruction; proposed means a reviewable default; deferred means intentionally awaiting evidence or product choice.

| ID | Decision | Status | Rationale / resolution |
| --- | --- | --- | --- |
| D-01 | Fork jellyfin/jellyfin-web as MudabbirulSaad/jellyxr | Confirmed | Existing official client is the foundation; fork created |
| D-02 | Baseline v12.1 at fae41f33eb7cd636a9ef68984adb82bb247a6e1b | Confirmed | Reproducible source audit; changes require an explicit update record |
| D-03 | Self-hosted browser application using an existing Jellyfin endpoint/account | Confirmed | Approved interpretation of Jellyfin-style deployment |
| D-04 | Quest first; Vision Pro later | Confirmed | Platform sequence from product owner |
| D-05 | First release: spatial movie/series library plus cinema | Confirmed | Complete browse-to-watch journey |
| D-06 | Preserve other inherited features in ordinary mode, subject to validation | Confirmed | No accidental loss of client capability |
| D-07 | Same-origin HTTPS reference deployment; separately served client also documented | Confirmed | Reduces deployment complexity while retaining endpoint flexibility |
| D-08 | Preserve inherited React/TypeScript/SDK constraints; choose XR additions later | Confirmed | Avoid a premature rewrite or framework choice |
| D-09 | Controllers and hands, one explorable Observatory, manual screen controls and recenter for v1 | Confirmed; expanded by M6 plan | Both input methods must pass the complete journey; optional exploration cannot make seated tasks inaccessible |
| D-10 | Documented numeric NFR targets and participant acceptance protocol | Confirmed targets; measurements pending | Product owner accepted the current qualification criteria in the M1 plan. Acceptance is not a benchmark result |
| D-11 | Quest 3 and local Jellyfin 10.11.4 are the first test configuration | Partly resolved | Quest 3 authorised over USB; Android build and active Browser package identifiers recorded in M1 evidence. Server version observed; SDK 1.0.0 minimum is 10.10.0. Horizon OS About label, complete playback checks and runtime qualification remain pending; no broader server range is claimed |
| D-12 | Cinema Observatory | Confirmed | Product owner selected graphite architecture, shallow artwork depth and restrained warm lighting. Other concepts remain reference alternatives |
| D-13 | Exact XR renderer, physics, text, subtitle and media presentation implementation | Deferred | Compare Babylon/Havok and Three/Rapier under D-28; EXP-01 through EXP-06 evidence, then G2 decision before M3 |
| D-14 | Namespace local XR preferences by server, user and viewing device | Confirmed boundary | Approved M6 plan; storage mechanism selected at G2 |
| D-15 | Pause on focus loss, session interruption and change of viewing position; explicit resume | Confirmed behaviour | Approved M6 plan; validate browser lifecycle and movement events at G2 |
| D-16 | Public hosted service, new account service and replacement Jellyfin server | Outside current scope | Any change requires a new business decision |
| D-17 | No telemetry upload by default; local, redacted diagnostics | Confirmed | Approved privacy and diagnostics boundary; do not collect private media history |
| D-18 | Environment quality reductions precede any separately configured stream-quality change | Confirmed | Preserve video/subtitle quality independently of environment effects |
| D-19 | PC iteration with ordinary-browser tests and XR emulation, plus early actual Quest qualification | Confirmed workflow | Approved M1 plan; W-02 establishes the workflow, while NFR-006/010 require actual-device evidence for device claims |
| D-20 | Integrate the documentation branch into `xr`, rooted at the pinned baseline | Confirmed | User requested the roadmap update and merge into `xr`; the branch was absent at inspection, so create it from D-02 and merge `docs/planning` |
| D-21 | IWE browser extension for development; embedded IWER and browser-automation packages deferred | Confirmed tool direction; setup verification pending | Approved M1 plan. Keep emulation outside production bundles, retain Vitest and record actual installation/version evidence. This does not select an XR engine |
| D-22 | Execute M1 on milestone/m1-readiness and deliver a pull request targeting xr | Completed integration; scope superseded by D-25 | PR #1 merged at f82e5c10c2. Its stop-before-M2 boundary is superseded by the approved M6 execution goal; G1 evidence remains open |
| D-23 | Use the owner's existing Jellyfin account for selected baseline playback tests | Confirmed | Owner accepted that resume positions and watched history may change. Normal sign-in only; no credentials, private titles or media in committed evidence |
| D-24 | Merge the current M1 work into xr without waiting for the CI runner | Confirmed integration instruction | Owner explicitly requested integration after reporting successful Quest 3 playback. This supersedes the draft-hold instruction; outstanding M1/G1 checks remain open and no unmeasured result becomes a pass |
| D-25 | Activate implementation goal through M6 with no invented budget | Confirmed; active | User approved execution in Default mode. Goal completes only after G4 and release-ready packaging; see the execution ledger |
| D-26 | True spatial controls, physical movement, valid teleport and 30-degree snap turn | Confirmed | FR-014/030 require scene geometry, depth and explicit activation; no continuous artificial walking, camera bob or forced travel |
| D-27 | Bounded physics for remote, selected artwork and panels | Confirmed | FR-031; stable architecture/screen, button alternatives and recovery; physics engine selected with renderer at G2 |
| D-28 | Compare Babylon.js/Havok with Three.js/Rapier using WebGL and equal fixtures | Confirmed evaluation rule | All mandatory media, subtitle, input, comfort, build and performance gates must pass. Prefer Babylon/Havok if both pass comparably; choose Three/Rapier for a mandatory Babylon failure or material measured advantage without greater player changes. Neither is selected yet |
| D-29 | Original geometry and free assets licensed for redistribution | Confirmed | Prefer original/verified CC0 resources; record source, licence, modifications and attribution for every import; no paid asset assumption |
| D-30 | Focused milestone PRs target xr; merge after local checks without waiting for GitHub Actions | Confirmed; latest owner instruction | Owner explicitly extended runner-independent merging to this goal and requested autonomous work. CI results remain visible; pending device evidence and release gates cannot become passes by assumption |
| D-31 | M6 delivers a versioned static-client archive and qualification documents | Confirmed | Include checksums, provenance, support matrix, install/upgrade/rollback and limitations. Public release publication and production deployment are separate actions |

## Decision process

### Implementation record — bitmap startup disposal, 2026-09-30

Under the approved FR-012/018 recovery scope, preserve libbitsub 1.11.0 and carry a narrow local startup-disposal patch with source hashes, provenance and unattended tests against its installed public classes. Tests reproduced late canvas creation in both PGS/VobSub and late GPU allocation or null-device errors at five asynchronous backend stages. This is an implementation repair, not a product-scope change or G2 renderer decision. Reassess the patch against upstream on dependency updates; parser/worker cancellation and actual-device subtitle qualification remain open.

The in-flight loading follow-up reproduced ten renderer failures and a canceled range probe issuing two further fetch attempts. Extend the same pinned repair with abort signals, guarded continuations, cancelable parser scheduling, owned worker-session disposal and ignored late frame/index results. Keep the shared worker alive for other renderers; already-executing synchronous worker parsing may finish before queued disposal. Tests of ownership and normal/error paths do not prove codec fidelity, measured memory recovery or Quest compatibility.

The inherited text-player follow-up uses per-slot request identity and the existing AbortController polyfill, preserving both primary/secondary selection and Jellyfin error ownership. Native slot reservation and video-scoped custom elements handle either completion order. This is an R-23 repair, not a change to the subtitle support matrix; controlled regression cases do not establish browser/server/device qualification.

Deferred subtitle defaults and OSD initialization now retain source/selection ownership. Primary ASS/bitmap lifetime is independent of secondary cleanup; actual server and device transition qualification stays open. These repairs preserve existing playback ownership and change no support claim.

A deferred decision records alternatives, evidence, owner, impact and deadline in [risks](../05-delivery/risks.md). A selected technology needs a dated entry with experiment results and rejected alternatives; a vendor feature list is not a benchmark.

Confirmed product direction does not approve unmeasured implementation details. M1 resolves the product direction and target decisions above; G1 remains open until its remaining environment/fixture evidence is recorded. G2 resolves technical choices. Update affected requirements, parity, traceability and work breakdown together.

See [technology evaluation](technology-evaluation.md) and [roadmap gates](../05-delivery/roadmap.md).

### Implementation record — bounded screen placement, 2026-09-30

Under FR-016, extend both disposable candidates with explicit size, distance, height and tilt controls. The backing and fixed collision body now follow the screen; architecture stays fixed, and placement is rejected when room/viewer/remote clearance fails. Button changes settle immediately without camera travel or player commands. The [comparison contract and evidence](../05-delivery/m2-experiments.md#screen-placement-increment--2026-09-30) supersede the earlier size-only fixed-backing implementation, while preserving those historical results. Bounds remain experimental. D-27's stable screen means no uncontrolled dynamic screen motion; this deliberate adjustment does not select a production engine or close G2.

### Implementation record — native sleep scheduling, 2026-09-30

Under FR-031, skip simulation calls only after the installed engine confirms that the comparison's dynamic remote is asleep. Keep held bodies active, wake on deliberate body/static changes and clear the clock across idle/hidden intervals. Rapier provides public sleep/wake methods. Babylon's pinned body declarations lack a public sleep query, so the [guarded experiment adapter](../../../src/apps/experimental/xr/input/havokActivity.ts) isolates its native handle and Havok activation operations; unknown state keeps simulation running. Actual WASM and PC evidence is recorded in the M2 report. This maintenance seam must be included in the G2 comparison and retested on upgrades; it is not a renderer selection or a measured Quest performance gain.

### Implementation record — plain-text caption controls, 2026-09-30

FR-012's comparison now exposes scene-local text size, backing and placement with explicit Back/Reset. Settings affect the borrowed plain-text presentation only; authored ASS/bitmap layout, track selection, timeline and server preferences retain their existing owners. The [comparison evidence](../05-delivery/m2-experiments.md#plain-text-caption-settings-increment--2026-09-30) includes paused-cue PC checks and open minification/readability questions. No subtitle support class, production preference policy or G2 decision is approved by this increment.

### Implementation record — canvas filtering, 2026-09-30

The [minification repair](../05-delivery/m2-experiments.md#canvas-minification-filtering-increment--2026-09-30) corrects a demonstrated Babylon/Three canvas-sampling mismatch under FR-012/014/017. Enable trilinear mipmap sampling only when it preserves the canvas dimensions; restricted contexts retain bilinear sampling and authored layout. Tests cover resource replacement, unchanged-update ownership and disposal, with selected original PC media fixtures. Production text strategy, exact GPU cost, native alpha and actual-headset clarity remain G2 decisions/evidence; this does not select a renderer.

### Implementation record — installed dependency notices, 2026-09-30

Under D-31 and NFR-007/010, [preserve exact installed notice files](../05-delivery/package-installation.md#dependency-notice-collection-contract) in the served package with locked identity and hashes. The [archive evidence](../05-delivery/packaging-evidence.md#installed-dependency-notices--2026-09-30) demonstrates concrete libbitsub, combined libass and font-notice gaps closed by this collection. Include development dependencies and explicit absence states instead of asserting runtime coverage. Do not interpret file collection as redistribution approval, corresponding-source completion or G4 qualification; final production runtime coverage and remaining terms/source need review before release. No dependency or technology choice changes.

### Implementation record — original remote model, 2026-09-30

Under D-27 and FR-015/031, [load one original remote GLB](../04-architecture/asset-pipeline.md#remote-model-comparison-contract--2026-09-30) in both disposable candidates. Replace visible proxy rendering while retaining its single body, dimensions, mass, grabbing, recovery and native sleep scheduling. A named material owns bounded held feedback; missing feedback/load failure retains the visible proxy. No inactive buttons or replacement playback controls are added. [Actual-loader, file and PC evidence](../05-delivery/m2-experiments.md#remote-model-increment--2026-09-30) prepares an object reference, not a production renderer selection or real-hand/close-range visual pass. Final material detail, controls and Quest qualification remain open.

### Implementation record — deliberate remote release, 2026-09-30

Under D-27 and FR-021/023/031, [distinguish deliberate gesture ends from cancellation](../04-architecture/system-blueprint.md#deliberate-remote-release-comparison). Use recent collision-constrained fixed-step motion for bounded linear momentum; preserve zero throw momentum for tracking loss, session/movement cancellation, Recall and disposal. Both existing native adapters use their public velocity setters after switching back to dynamic motion. [Controlled and actual-WASM evidence](../05-delivery/m2-experiments.md#deliberate-remote-release-increment--2026-09-30) does not qualify physical Quest gestures, arbitrary impacts or final orientation/angular behaviour. No renderer, physics version or playback ownership changes.
