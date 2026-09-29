# Test and validation strategy

Status: M1 unit/build checks passed and initial server/sign-in-screen observations recorded; no complete application/device acceptance scenario below has passed. Updated: 2026-09-29. See [M1 readiness evidence](m1-readiness.md).

## Environments and fixtures

Quest 3 and Jellyfin 10.11.4 are the initial configuration; locked SDK 1.0.0 declares minimum server 10.10.0. G1 must still record Quest OS/Browser and fixture evidence. Test ordinary behaviour on named desktop/mobile browsers as well as Quest Browser. Vision Pro is a later platform gate.

Use an ordinary user, a restricted user and an administrator on a test server. Prepare permissioned movie/series media with known resume positions, alternate editions, multiple audio tracks, chapters and text/ASS/bitmap subtitles. Include a compatible direct-play file, remux/direct-stream case, forced transcode case, prohibited-transcode case and malformed/unavailable source. Record codec/profile, container, resolution, frame rate, bitrate, audio and subtitle properties.

Create a 1,000-item catalogue fixture with long titles, missing artwork and empty collections. Configure network interruption, constrained bandwidth and server restart cases. Optional Live TV/cast/SyncPlay fixtures must be present before claiming those combinations pass.

## Execution across implementation milestones

Follow the [PC and Quest development workflow](development-testing-workflow.md) for setup, emulation, browser automation evaluation and remote debugging. It supports the scenarios below; it does not replace them. Record evidence as ordinary desktop, emulated XR or actual device under NFR-010.

| Stage | Test focus | Evidence needed to proceed |
| --- | --- | --- |
| M1 readiness | Unmodified pinned build/checks, fixture inventory, ordinary baseline and reproducible PC workflow | Capture baseline defects; identify actual Quest access and supported-version candidates |
| M2 feasibility | EXP-01 through EXP-06 with selected AT procedures | Actual Quest media/subtitles/input/performance and deployment evidence before G2; emulator evidence is supplementary |
| M3 foundation | AT-01 through AT-10, AT-14/16 as applicable to ordinary integration | Identify partial runs; XR-transition assertions remain pending W-06 |
| M4-M5 integration | Full journey, session lifecycle, controllers, subtitles and comfort | Complete linked functional scenarios on agreed ordinary/Quest environments before G3 |
| M6 qualification | All first-release scenarios, inherited parity and sustained viewing | Final production build tested with emulation disabled; complete G4 matrix |

Test inherited behaviour when integrating each change, then complete the parity audit at M6. Do not defer the first actual Quest video/subtitle test until release qualification. A scenario may contain several environment/fixture runs; report each separately and keep the overall scenario incomplete while required runs are missing.

## Acceptance scenarios

| ID | Scenario and procedure | Expected evidence |
| --- | --- | --- |
| <a id="at-01"></a>AT-01 | Open HTTPS domain and trusted HTTPS IP deployments; connect through nondefault port/base path; exercise artwork, seek and socket updates | All URLs preserve endpoint configuration; secure XR entry where runtime supports it; range/socket traffic works |
| <a id="at-02"></a>AT-02 | Try LAN HTTP app, HTTPS-to-HTTP endpoint, different HTTPS origin, invalid certificate, denied local-network permission and unreachable host | Accurate known limitations; uncertain failures labelled honestly; no security bypass; ordinary recovery route remains |
| <a id="at-03"></a>AT-03 | Valid/invalid account login, enabled/disabled Quick Connect, expired code, cancellation, expired token and logout | Correct account only; retry available; disabled capability hidden/explained; no credential exposure |
| <a id="at-04"></a>AT-04 | Switch two users and two servers; revoke permission while an item is selected; inspect caches/preferences/queue | No prior-user content or privileged action remains; server denial respected in both modes |
| <a id="at-05"></a>AT-05 | Browse seeded library, Continue Watching and Next Up; search/filter/sort; enter XR and return | Correct results/progress, stable context, incremental loading and responsive input |
| <a id="at-06"></a>AT-06 | Open missing-metadata/long-title items, choose season/episode and media version | Readable detail state; correct item/source selection; no broken placeholder controls |
| <a id="at-07"></a>AT-07 | Resume at known position; play next episode; toggle autoplay; cross ordinary/XR boundary repeatedly; inspect reports | One owner/session reporter; correct server progress and queue; no duplicate audio or reset |
| <a id="at-08"></a>AT-08 | Run direct-play, remux/direct-stream, transcode and prohibited-transcode fixtures | Negotiated delivery matches actual capabilities/policy; failures explain action; session/source IDs remain coherent |
| <a id="at-09"></a>AT-09 | Pause, skip, chapter jump and rapid seek near beginning/end; change bandwidth during playback | Controls reflect true state; pending seek visible; no overlapping streams; resume stays correct |
| <a id="at-10"></a>AT-10 | Switch audio and text/ASS/bitmap subtitles; seek; enter/exit XR; test bright frames and subtitle settings | Tracks remain synchronized/visible; format fallback explicit; customisation limits of burn-in explained |
| <a id="at-11"></a>AT-11 | Enter XR from library and active film; deny request; end session; test unsupported browser | Deliberate activation, usable fallback, preserved title/library state and a single active media path |
| <a id="at-12"></a>AT-12 | Change screen geometry, flat/curved options as qualified, recenter and Reset; reload scoped preferences; reduce environment quality | Correct aspect ratio, reachable controls, recoverable layout and consistent scene across quality tiers |
| <a id="at-13"></a>AT-13 | Complete tasks seated/reclining, with left/right controller, reduced motion, text scaling and controller loss; test ordinary keyboard/screen-reader flows | No forced movement, hover-only action or unlabelled essential control; clear focus; input loss does not activate |
| <a id="at-14"></a>AT-14 | Drop/reconnect network; restart server; expire auth; lose XR focus; end session; restore app | Clear pause/retry/login state; accepted resume behaviour; no hidden playback, duplicated report loop or infinite spinner |
| <a id="at-15"></a>AT-15 | Compare inherited ordinary routes to unmodified pinned client using the same fixture set | Feature-by-feature parity record; music/Live TV/other libraries/admin/cast/SyncPlay/download applicability explicit; pre-existing failures separated |
| <a id="at-16"></a>AT-16 | Trigger connection/media/XR errors and inspect exported diagnostics plus proposed proxy logging | Useful context without passwords, tokens, signed URLs or private media identifiers; no telemetry upload by default |
| <a id="at-17"></a>AT-17 | Future: repeat core interaction with hands, switch inputs, lose tracking | Explicit activation and safe cancellation; controller recovery; prerequisite for FR-023 only |
| <a id="at-18"></a>AT-18 | Future: passthrough with allowed/denied/missing planes, mesh and anchors | Manual placement works independently; no assumption that all room APIs exist |
| <a id="at-19"></a>AT-19 | Future: stereo eye-order and 180/360 fixtures at qualified formats | Correct projection/eye order, saved title setting and explicit unsupported cases |
| <a id="at-20"></a>AT-20 | Future: missing/present thumbnails and segments; reactive screen light on/off | Metadata controls appear only when usable; light effect does not violate accepted frame budget |
| <a id="at-21"></a>AT-21 | Future: two clients, latency variation, host pause/seek/departure | Recorded synchronization tolerance and recovery; scope/threshold defined before extension implementation |
| <a id="at-22"></a>AT-22 | Future: permitted download, quota rejection, offline launch, deletion, account switch and reconnect | Storage and progress behaviour proven before claiming offline support |
| <a id="at-23"></a>AT-23 | Future: core journey on identified Vision Pro browser/device | Separate capability/input/media evidence; no inferred parity from Quest |
| <a id="at-24"></a>AT-24 | 120-minute film run, large-library use and ten XR entry/exit cycles; profile warm and steady state | NFR timing/stability measurements with limitations; memory cleanup observations; actual resolution/rate recorded |
| <a id="at-25"></a>AT-25 | Review a representative upstream connection/player change on an isolated update branch; run relevant checks | Bounded integration changes, traceable conflicts and repeatable build/test procedure |

## Evidence record

For each executed scenario record scenario ID, date, result (pass/fail/blocked/not applicable), build/base SHA, evidence class (ordinary desktop, emulated XR or actual device), device/browser/OS, emulator/runtime version and virtual device if used, server/FFmpeg where relevant, media metadata, network, settings, steps, expected/actual behaviour and redacted logs/captures. Record required runs still pending and justify any not-applicable classification. A blocked fixture is not a pass.

Application timing, video dropped frames and compositor metrics are separate measurements. Record the tool used and what it cannot observe. Compare candidates under identical conditions and repeat representative runs; do not select the most favourable single result.

## Release criteria

G4 requires every P0 FR/NFR scenario to be executed on the agreed matrix, with no unresolved critical playback, identity, access or comfort regression. Any accepted limitation changes the requirements and public support claim explicitly. Future-only AT-17 through AT-23 do not block v1 unless their feature is promoted.

Accepted initial BG-02 usability measure: five representative viewers perform connect/resume and browse/play tasks, with at least four completing without assistance. Report task completion, intervention and discomfort observations; do not claim statistical significance or medical safety.

## Documentation-phase checks

Check local Markdown links/anchors, unique definitions, P0-to-test/work mappings, all business-goal coverage, Mermaid syntax and changed-file scope. Record actual results in [documentation validation](documentation-validation.md). Application tests are not executed just to validate prose when application code is unchanged.
