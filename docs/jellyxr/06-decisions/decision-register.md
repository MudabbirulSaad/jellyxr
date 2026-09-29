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
| D-09 | Controllers, one environment, manual screen controls and recenter for v1 | Confirmed | First-release baseline in approved plan |
| D-10 | Numeric NFR targets and participant acceptance protocol | Proposed | Product and validation leads accept or revise at G1 |
| D-11 | Exact Quest model, browser/OS versions and supported Jellyfin server range | Deferred | Product arranges test-hardware access; lead verifies SDK minimum at G1, qualifies at G2 |
| D-12 | Cinema Observatory / Orbital Archive / Living Light | Deferred | Product chooses after comparative review at G1 |
| D-13 | XR renderer, spatial UI, media binding and asset pipeline | Deferred | EXP-01 through EXP-06 evidence, then G2 decision |
| D-14 | Namespace local XR preferences by server, user and viewing device | Proposed | Avoid shared-headset leakage; storage mechanism selected at G2 |
| D-15 | Pause on immersive focus loss or session interruption; explicit resume | Proposed | Predictable interruption handling; verify browser lifecycle at G2 |
| D-16 | Public hosted service, new account service and replacement Jellyfin server | Outside current scope | Any change requires a new business decision |
| D-17 | No telemetry upload by default; local, redacted diagnostics | Proposed | Fits self-hosting and avoids collecting private media history |
| D-18 | Environment quality reductions precede any separately configured stream-quality change | Proposed | Preserve video clarity without hiding network/transcode policy |
| D-19 | PC iteration with ordinary-browser tests and XR emulation, plus early actual Quest qualification | Proposed workflow | Addresses the user's PC-testing request; W-02 establishes the workflow, while NFR-006/010 require actual-device evidence for device claims |
| D-20 | Integrate the documentation branch into `xr`, rooted at the pinned baseline | Confirmed | User requested the roadmap update and merge into `xr`; the branch was absent at inspection, so create it from D-02 and merge `docs/planning` |
| D-21 | Evaluate IWE as the desktop emulator; optionally IWER and browser automation such as Playwright | Proposed tooling | W-02 records versions, reproducibility and production exclusion before adoption; existing Vitest remains inherited. This does not select an XR engine or install new application dependencies |

## Decision process

A deferred decision records alternatives, evidence, owner, impact and deadline in [risks](../05-delivery/risks.md). A selected technology needs a dated entry with experiment results and rejected alternatives; a vendor feature list is not a benchmark.

Confirmed product direction does not approve unmeasured implementation details. G1 resolves product and target proposals; G2 resolves technical choices. Update affected requirements, parity, traceability and work breakdown together.

See [technology evaluation](technology-evaluation.md) and [roadmap gates](../05-delivery/roadmap.md).
