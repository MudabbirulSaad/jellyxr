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
| D-10 | Documented numeric NFR targets and participant acceptance protocol | Confirmed targets; measurements pending | Product owner accepted the current qualification criteria in the M1 plan. Acceptance is not a benchmark result |
| D-11 | Quest 3 and local Jellyfin 10.11.4 are the first test configuration | Partly resolved | Hardware model confirmed by owner; server version observed. SDK 1.0.0 declares minimum 10.10.0. Exact Quest OS/Browser and runtime qualification remain pending; no broader server range is claimed |
| D-12 | Cinema Observatory | Confirmed | Product owner selected graphite architecture, shallow artwork depth and restrained warm lighting. Other concepts remain reference alternatives |
| D-13 | XR renderer, spatial UI, media binding and asset pipeline | Deferred | EXP-01 through EXP-06 evidence, then G2 decision |
| D-14 | Namespace local XR preferences by server, user and viewing device | Proposed | Avoid shared-headset leakage; storage mechanism selected at G2 |
| D-15 | Pause on immersive focus loss or session interruption; explicit resume | Proposed | Predictable interruption handling; verify browser lifecycle at G2 |
| D-16 | Public hosted service, new account service and replacement Jellyfin server | Outside current scope | Any change requires a new business decision |
| D-17 | No telemetry upload by default; local, redacted diagnostics | Proposed | Fits self-hosting and avoids collecting private media history |
| D-18 | Environment quality reductions precede any separately configured stream-quality change | Proposed | Preserve video clarity without hiding network/transcode policy |
| D-19 | PC iteration with ordinary-browser tests and XR emulation, plus early actual Quest qualification | Confirmed workflow | Approved M1 plan; W-02 establishes the workflow, while NFR-006/010 require actual-device evidence for device claims |
| D-20 | Integrate the documentation branch into `xr`, rooted at the pinned baseline | Confirmed | User requested the roadmap update and merge into `xr`; the branch was absent at inspection, so create it from D-02 and merge `docs/planning` |
| D-21 | IWE browser extension for development; embedded IWER and browser-automation packages deferred | Confirmed tool direction; setup verification pending | Approved M1 plan. Keep emulation outside production bundles, retain Vitest and record actual installation/version evidence. This does not select an XR engine |
| D-22 | Execute M1 on milestone/m1-readiness and deliver a pull request targeting xr | Confirmed | User approved the M1 implementation plan; xr is now the fork's default branch. Stop before M2 technology experiments |
| D-23 | Use the owner's existing Jellyfin account for selected baseline playback tests | Confirmed | Owner accepted that resume positions and watched history may change. Normal sign-in only; no credentials, private titles or media in committed evidence |

## Decision process

A deferred decision records alternatives, evidence, owner, impact and deadline in [risks](../05-delivery/risks.md). A selected technology needs a dated entry with experiment results and rejected alternatives; a vendor feature list is not a benchmark.

Confirmed product direction does not approve unmeasured implementation details. M1 resolves the product direction and target decisions above; G1 remains open until its remaining environment/fixture evidence is recorded. G2 resolves technical choices. Update affected requirements, parity, traceability and work breakdown together.

See [technology evaluation](technology-evaluation.md) and [roadmap gates](../05-delivery/roadmap.md).
