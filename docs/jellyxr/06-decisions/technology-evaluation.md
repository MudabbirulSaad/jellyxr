# Technology evaluation brief

Status: comparison workbench and candidate versions recorded in [M2 evidence](../05-delivery/m2-experiments.md); no production XR technology selected. Updated: 2026-09-29.

## Fixed foundation and open choices

The [upstream assessment](../04-architecture/upstream-assessment.md) records React, TypeScript, SDK, playback and build dependencies. A new XR engine does not justify replacing all of them. Existing Jellyfin behaviour and server compatibility are constraints.

Compare these categories after G1:

| Choice | Candidate approaches to investigate | Evidence needed |
| --- | --- | --- |
| Scene/rendering | Babylon.js with Havok; Three.js with Rapier, using the same WebGL fixture | Media-layer support, profiling, maintenance and integration cost |
| Spatial UI | Scene-native controls; declarative 3D UI; selective browser overlays where supported | Readability, input, accessibility and library scalability |
| Video presentation | WebXR media layers; texture-based fallback | Stream/HLS compatibility, sharpness, colour, subtitle visibility and ownership |
| Assets | Optimised authored scene with baked lighting; controlled real-time additions | Load size, material cost, quality tiers and artist workflow |
| Input | WebXR input profiles plus custom intent layer; framework input facilities | Controllers, hands, near/ray input, grabbing, locomotion and clean lifecycle |
| Deployment | Existing asset serving/proxy infrastructure | Base paths, updates, trusted HTTPS and endpoint compatibility |

Candidate families are confirmed; exact versions and the winner require current primary documentation and measured experiments. WebGL is the release baseline; WebGPU is outside the critical path. Prefer Babylon/Havok when both pass comparably because this scope benefits from integrated XR/physics facilities. Choose Three/Rapier if Babylon fails a mandatory gate or a material measured advantage avoids greater inherited-player changes. If neither passes, record a revised approach; do not drop a mandatory feature silently.

## Evaluation criteria

First apply pass/fail constraints: existing Jellyfin integration, working video plus subtitles, secure self-hosting, acceptable sustained performance and usable controller and hand navigation, seated movement/recovery, bounded physics and inherited build/ES5 compatibility.

Then compare video/text clarity, measured frame cost, startup/memory, integration complexity, maintainability, asset tooling, licence compatibility and future platform support. Record raw evidence and tradeoffs before assigning any scores. An unsupported essential capability disqualifies a candidate regardless of visual polish.

## Experiments

| ID | Controlled comparison | Evidence / decision |
| --- | --- | --- |
| <a id="exp-01"></a>EXP-01 | Same known film through media-layer and texture paths; enter from ordinary playback and start within XR | Sharpness, geometry support, single audio/session ownership, HLS seek and lifecycle; choose media bridge/presentation |
| <a id="exp-02"></a>EXP-02 | Text, ASS and bitmap subtitle fixtures with direct and converted playback | Visibility, timing, seek, appearance limits and burn-in fallback; choose subtitle path |
| <a id="exp-03"></a>EXP-03 | Same chosen environment at static/baked baseline with matched materials, colliders, active/sleeping bodies and quality tiers, plus 1,000-item library | Frame/asset/memory cost and 120-minute stability; choose rendering/asset budget |
| <a id="exp-04"></a>EXP-04 | Same home-to-film/control tasks with left/right controller and hands, including near/ray selection, grab, teleport, snap turn and seated recovery | Selection errors, reach, input switching, tracking-loss cancellation, valid destinations, collisions, focus and cleanup; choose input/spatial UI |
| <a id="exp-05"></a>EXP-05 | Reference HTTPS origin, trusted IP, subpath and separate endpoint; optional MR capability probes | Network/media/socket behaviour, permission states and manual fallback; qualify topology/capabilities |
| <a id="exp-06"></a>EXP-06 | Ordinary-mode regression and capability-isolated design review for future Vision Pro | Identify portability blockers; actual Vision Pro support remains unclaimed until AT-23 |

EXP-06 at G2 is a portability review; it does not require purchasing or pretending to test a future device.

## Execution order and minimum evidence

W-02 first establishes the [development testing workflow](../05-delivery/development-testing-workflow.md) and unmodified baseline. G1 precedes feasibility experiments; run EXP-01/02 before substantial scene-asset work. Use representative geometry/material complexity for EXP-03 rather than requiring finished W-07 assets. Experiments may use disposable adapters and fixtures before product W-03 through W-07 exist.

| Experiment | Desktop contribution | Minimum G2 evidence |
| --- | --- | --- |
| EXP-01/02 | Repeatable lifecycle and track-selection checks; compare integration approaches | Real Quest video/subtitle/seek/transition results for chosen media paths, including fallback and server-negotiated delivery |
| EXP-03 | Reproducible scene/library fixtures and relative cost exploration | Actual Quest sustained rendering/video observations at accepted targets, with plain-scene control and measurement limits; final production qualification repeats at G4 |
| EXP-04 | Simulated controller tasks, focus and cancellation | Actual left/right controller and hands-only journeys, readable spatial UI, movement/physics recovery and input switching without duplicate actions |
| EXP-05 | Configure origins/base paths and diagnose failures | Named Quest Browser network/media/socket and permission results for required topologies; optional MR probes cannot block v1 |
| EXP-06 | Pinned ordinary-client comparison and architecture review | Recorded ordinary regressions and portability assumptions; Vision Pro device testing remains deferred |

An emulator's advertised feature or desktop frame rate is not a candidate's Quest benchmark. Evaluate test tooling independently: IWE is the selected development extension, IWER an optional runtime, and browser automation a proposed workflow addition. D-21 is not a rendering-stack decision. If hardware is unavailable, report the affected experiment blocked and continue independent desktop preparation; leave G2 open.

## Experiment protocol

Use the same device, browser, server, media and network settings for candidate comparisons. Record warmup, repeated runs, tool limitations and changed variables. Measure video presentation separately from environment rendering. Include a plain dark environment as a control.

The [timing boundary contract](../04-architecture/system-blueprint.md#comparison-timing-observation-boundaries) separates desktop and each XR session, discards interrupted/media-attachment history and exposes a manual reset after warmup. Use its scope and sample count when recording runs; the [PC/software evidence](../05-delivery/m2-experiments.md#timing-observation-scope-increment--2026-09-30) qualifies observation ownership, not device performance. Record the selected native refresh interval and external profiling evidence independently of this synchronous-work p95.

Do not put credentials or copyrighted test media into the repository. Record permissioned fixture metadata and hashes where useful. A result includes steps, expected behaviour, observed behaviour, measurements, build SHA and limitations.

## Decision output

At G2, create a dated decision record naming chosen versions, evidence, rejected alternatives and consequences for the blueprint. If no candidate satisfies a P0 constraint, revise the proposed implementation or obtain a recorded scope decision before application development proceeds.

Related: [NFR targets](../02-requirements/nonfunctional-requirements.md), [test strategy](../05-delivery/test-strategy.md), [risks](../05-delivery/risks.md).

## Spatial catalogue comparison contract

For FR-005/006/007/014 and EXP-03/04, present the existing labelled 1,000-record technical catalogue inside each candidate scene. Both candidates use the same bounded page, selectable card geometry, detail state and explicit previous/next/filter/back actions. No fabricated movie metadata, server request, real media playback or production renderer decision is implied by this fixture.

Keep at most six catalogue cards resident, with a bounded set of navigation/detail panels; reuse or dispose replaced textures, materials and geometry. Paging, filtering and detail return preserve deliberate focus, selected identity and page context. A press begun on an earlier view cannot select replacement content. Disabled boundaries must look disabled and reject ray, near and keyboard activation. The heading identifies technical data and the actual filtered range; missing artwork is labelled honestly.

The catalogue opens through an explicit world-space action, settles into a clear forward workspace and remains anchored while the viewer moves. Page/detail changes do not continuously reposition it. Recovery controls remain available if the full presentation cannot fit. Both candidates share exact canvas artwork, geometry/hit bounds and input ownership. Review perspective/depth, readable wrapping, keyboard operation, resource bounds and return flow on PC; only actual Quest evidence can establish hand/controller reach, spatial clarity and catalogue performance. Production search, server collections and playback integration remain M4 requirements.

### Spatial search input comparison

Extend EXP-04 with a common scene-rendered keyboard for the technical catalogue under FR-006/014/023. Use individual hit-tested letter, number and punctuation keys, a labelled term display, Backspace, Space, Clear term, Search and Cancel. The fixture's Latin keyboard is an input comparison, not a production multilingual/IME decision. Bound the draft to 48 characters and keep its complete text visible; no account or server input moves into this experiment.

Editing changes a separate draft without querying or replacing the existing result set. Search commits it against the labelled local records and resets pagination; Cancel restores the prior query, filter, page and selected identity. Display the committed query and active type alongside results. A zero-result state offers Edit search and Clear search without fabricating suggestions or movie metadata. Clear search retains the type filter. Detail return and close/reopen preserve the committed search context.

Both renderers must share key geometry, focus/press feedback, cancellation, resource ownership and text presentation. Limit the keyboard to its finite controls and dispose outgoing catalogue panels. Keep a settled anchor when the replacement geometry fits; recheck placement when it does not. No held activation may carry into a replacement view or survive tracking loss. Diagnostic status must not echo search terms or characters. Controller/hand typing, binocular readability, near/ray reach, resource cost and a complete seated task remain actual-Quest evidence; a PC keyboard test cannot close those gates.
