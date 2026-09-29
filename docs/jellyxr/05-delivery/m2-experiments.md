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

The fixture UI uses actionable technical labels. Normal product routes never show synthetic film descriptions or fake library content. It creates no competing Jellyfin player or progress reporter; a separate, silent calibration clip is opt-in and refuses to start while ordinary playback is active.

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

1. Extend the implemented borrowed-video paths with explicit subtitle composition and complete native-layer/media qualification. PC video attachment is recorded below.
2. Extend the shared control/grab/fixed-destination fixtures to complete locomotion and recovery; prove required operations with controllers and hands on the actual Quest.
3. Calibrate lighting/text and add representative model/texture and incremental artwork cost; retain a plain control scene.
4. Record direct/remux/transcode, audio, text/ASS/bitmap, seek/resume/interruption results, exact device/browser settings and repeated/sustained timing.
5. Apply the [G2 selection rule](../06-decisions/technology-evaluation.md); no renderer is selected by these preparation passes.

Related: [execution ledger](implementation-goal.md), [M1 evidence](m1-readiness.md), [test strategy](test-strategy.md), [source files](../../../src/apps/experimental/xr/ComparisonPage.tsx).

## Borrowed media contract increment

Source revision: 794d1b2610, based on xr 5efb2609aa; merged in PR #4 at xr 6a108272fd. This increment adds the narrow `HtmlVideoPlayer.getVideoPresentationSurface()` accessor and experimental ownership helpers. Renderer attachment was pending at that revision and is extended below; actual Jellyfin video attachment is still unverified.

The borrowing helper accepts only the current local HTML video player, retains the original element and listens for player change, stop, emptied, abort and error events. It invalidates once, removes its observers and never changes source, autoplay, looping, mute, position or playback. A per-frame identity check can detect replacement even when an event was missed. Releasing a borrow does not stop or unload the owner.

The media-layer helper accepts a feature-tested binding from the renderer adapter. It requires an existing renderer projection-layer list, submits the borrowed element, cleans up a rejected layer, removes only its own layer on detach and preserves later subtitle/renderer additions. After session end it destroys its layer without submitting new render state. The host must retain its submitted layer list, including updates awaiting the next XR frame; reading only the runtime's previous render state is insufficient. Video-last layer ordering, geometry occlusion, subtitle composition and runtime support remain experiments, not qualified behaviour.

Source inspection of installed Babylon 9.27.1 `VideoTexture` found default autoplay/loop changes and disposal pause behaviour; even `independentVideoSource` still passes the element through CORS setup. A direct stock-helper attachment is therefore not accepted for Jellyfin's borrowed video. Investigate media layers first and a manually managed GPU texture upload that leaves the element untouched; record measured outcomes before choosing either.

Validation: TypeScript passed; changed-file lint passed with four existing player warnings; all 181 tests in 16 files passed, including ten new ownership/layer-contract cases. Ordinary production and ES5 checks passed for 982 files with inherited size warnings. The getter is the only ordinary-player change; it has no effect until called. Actual player transitions, decoded frames, audio/subtitle integrity, real compositor behaviour and device timing remain untested by this increment.

## Video presentation increment — 2026-09-30

Source revision: 715330ab1c, based on xr 6a108272fd.

Both candidate scenes now accept the borrowed local-player video or a labelled, silent calibration clip. The comparison page offers explicit **Media layer** and **Video texture** paths. Select the path before attaching. Layers wait for an immersive session; failure is reported without silently changing paths. Detach removes only presentation resources and releases observation. Jellyfin still owns source, transport, tracks and progress. No second Jellyfin video or progress reporter is created.

The opt-in fixture is H.264, 640 × 360, 24 fps, eight seconds, with no audio/subtitles. Its source recipe, font provenance, licence and checksum are recorded in the [fixture inventory](../../../src/apps/experimental/xr/fixtures/README.md). The clip is excluded from the ordinary build alongside the comparison route.

Exact-version source inspection found that Babylon's `VideoTexture` helper changes video CORS properties even with its independent-source option. The experiment instead owns a raw GPU texture, uses `Engine.updateVideoTexture`, and disposes only its plane/material/texture. Three's `VideoTexture` observes frames and cancels its own callback on disposal. Both paths fit the encoded aspect ratio inside the shared 6.4 × 3.6 m screen. The shared lifecycle replaces presentation resources when dimensions, session or reference space change.

The native path invokes `XRMediaBinding.createQuadLayer` with the borrowed element. Babylon enables its optional projection-layer feature; Three uses its existing layers support. Attachment occurs in the renderer frame after the projection state applies. This experiment is the sole additional compositor-layer writer; production subtitle-layer coordination still needs an owner. Video currently follows the projection layer in composition order: scene-object occlusion and subtitle depth are **unqualified**, so this is not a production presentation decision.

| Check | Observed result / limit |
| --- | --- |
| Desktop Babylon calibration | Video visibly plays; labels upright and unmirrored after correcting additive emissive colour and plane rotation |
| Desktop Three calibration | Video visibly plays; labels upright and unmirrored |
| Candidate change / detach | Fixture pauses on change/detach, presentation clears, new scene can attach again |
| Media layer on PC without XR | Explicit waiting state; no texture fallback and no native-layer pass claimed |
| No active Jellyfin video | Action reports an unavailable local surface; no invented playback state |
| Lifecycle unit checks | Stream resize, stopped/replaced lease, session transition, allocation rejection, explicit retry, cleanup rejection and aspect preservation pass |
| Local checks | Type check and 188 tests in 17 files pass; changed-code lint has no errors. Ordinary build plus ES5 check passes 982 files; experimental build plus ES5 check passes 989 files, with only the four inherited worker exclusions |

Desktop observations are from the in-app browser without XR emulation. They do not qualify colour accuracy, HDR, Quest decoding, audio, subtitles, tracked depth or native layers. Attaching actual Jellyfin playback through ordinary navigation is still unverified. The existing development WebSocket Host/Origin rejection remains; HTTP assets load and manual reload was used without weakening host validation.

Sources reviewed: installed Babylon 9.27.1 and Three 0.186.0 implementation; [Meta video guidance](https://developers.meta.com/horizon/documentation/web/browser-video/) and [Layers guidance](https://developers.meta.com/horizon/documentation/web/webxr-layers/), accessed 2026-09-30. Vendor recommendations are not JellyXR measurements. G2 remains open.

## Spatial input increment — 2026-09-30

Source revision: 1a23681e9f, based on xr f9323ff789; merged in PR #6 at xr d5d590d571.

Both candidates render the same four opaque, labelled controls as world-space planes: Select fixture, Reset count, Recall remote and Exit XR. Their visible dimensions and analytic ray/near hit bounds come from one fixture. Buttons sit at a fixed room anchor and do not follow the head. Target dimensions, font size, reach and depth still require headset validation. These are technical controls, not the production library or playback tray.

The shared input adapter accepts tracked controller/hand sources and rejects gaze. It uses native `selectstart` to begin, `select` to commit, and `selectend` to cancel any remaining press, following the WebXR event sequence. A hand must have a current index-finger joint pose as well as a ray. A single pending action prevents two sources from activating the same press; target departure, tracking/source loss, visibility loss, blur and disposal cancel it. Logical focus remains available after cancellation. Near selection requires explicit activation; proximity alone does nothing. Grabbing, teleportation, snap turning and visual hand/controller models are still pending.

Desktop controls use the same target geometry. Canvas keyboard access supports arrows, Enter/Space and Escape, with explicit focus/held labels and outline changes. The fixture selection count measures actual actions; it is not a product statistic. Recall has both ordinary-button and spatial-button paths. UI/UX Pro Max's dragging-alternatives guidance supports keeping those recovery actions independent of grabbing.

| Check | Observed result / limit |
| --- | --- |
| Desktop visual | Both renderers show four opaque controls in the room; focus changes the outline and state label |
| Keyboard | Babylon selection and reset observed; Three selection observed; no head or hover activation used |
| Pointer browser check | In-app coordinate clicks did not deliver pointer events to the canvas, as reported by the fixture diagnostic; actual pointer selection remains unverified |
| Input unit tests | Twelve cases cover visible-centre/gap/back-face/nonfinite hits, bounded near contact, explicit activation, tracking loss, switching ownership, native select cancellation, hand joint loss, gaze rejection, visibility loss, keyboard cancellation, canvas coordinate mapping and listener removal |
| Local checks | TypeScript, changed-code lint and all 200 tests in 19 files pass |
| Build compatibility | Ordinary output remains at 982 ES5-checked files; comparison output is 990, with only inherited worker exclusions |

The normal client remains unchanged. This prepares FR-021/023 and EXP-04; it does not close AT-17/26/27 or G2. Actual hands/controllers, occlusion beyond this unobstructed fixture, seated/reclining reach, input latency and physical movement remain pending.

Primary references: [WebXR primary-action events](https://immersive-web.github.io/webxr/#events), [Meta hand input](https://developers.meta.com/horizon/documentation/web/webxr-hands/), accessed 2026-09-30. Source documentation describes available APIs; only the observations above are claimed as tested.

## Deliberate movement increment — 2026-09-30

Source revision: 82a5e40afa, based on xr d5d590d571; merged in PR #7 at xr dc18e92a06. Implements part of FR-030 / EXP-04; AT-26 remains open.

Both candidates now expose Turn left 30°, Turn right 30°, Library position, Return to seat and Resume video in addition to the four earlier controls. Identical controls are anchored at the seat and library destinations. This duplication supports the fixed-destination experiment; summoned controls and recovery after arbitrary orientation remain unfinished.

Teleporting moves the viewer's floor projection to a validated destination while preserving tracked height and yaw. Snap turning rotates around the tracked viewer's position, avoiding lateral head translation. The native path offsets the reference space instead of moving the room. Commands are consumed once in a valid animation frame and discarded on session/visibility or tracking loss, so restoring tracking cannot execute an old teleport. There is no continuous movement, camera bob or automatic travel.

Movement first pauses the attached media owner. The labelled fixture uses its own video; a borrowed Jellyfin surface uses the existing playback manager and checks pause before moving. Resume is explicit. This is a transport command through the existing owner, not a second progress reporter. Actual Jellyfin command delivery remains unverified.

| Check | Observed result / limit |
| --- | --- |
| Desktop Babylon and Three | Keyboard actions visibly turn the room perspective, move to the library and return to the seat |
| Playback safety | The fixture reports paused after movement and playing after explicit Resume in both candidates; inspected the visible source video's paused state |
| Unit checks | Eight new cases cover retained height/yaw, obstacle/boundary rejection, exact snap angle with no head-position drift, inverse native transform, pause-before-move, pause failure and discarded stale commands |
| Local checks | TypeScript, full lint (98 inherited warnings, no errors), styles and 208 tests in 21 files pass; ordinary build/ES5 passes 982 files and comparison build/ES5 passes 990 files with inherited exclusions only |

No headset movement is claimed as tested. Native reference-space offsets/reset events, media-layer alignment through movement, arbitrary valid-floor selection, all-angle recovery, tracked-space boundaries, hands/controllers and comfort remain G2 work. PC previews test the desktop camera adapter, not the XR compositor. The additional XRRigidTransform compatibility suppression is limited to a feature-guarded call in the optional experiment; ordinary browser requirements are unchanged.

Full local lint initially scanned the generated comparison bundles. The generated `.jellyxr-experiments` directory is now excluded alongside `dist`; all experiment source remains linted. The corrected full run passed. Documentation checks found 371 valid relative links and no requirement/traceability errors.

## Physical remote increment — 2026-09-30

Source revision: 42b56f1c99, based on xr dc18e92a06; merged in PR #8 at xr 1f286b0ad5. Implements part of FR-031 / EXP-04; AT-27 remains open.

The shared fixture adds a small stand so the remote settles above the floor. A controller can grip it within 18 cm; a hand uses a deliberate near pinch, requiring both thumb-tip and index-tip poses. One source owns the grab, and button selection is suppressed while it is held. Source removal, pose loss, hidden/end events, movement and disposal release ownership immediately. Tracking restoration cannot restart a previous grab. Recall remains available through ordinary and spatial buttons.

While held, the remote retains its initial orientation. A fixed-step target uses exponential settling, caps travel at 3 m/s and sweeps its orientation-expanded box through the room's static proxies. This detects a thin wall even when a requested endpoint lies beyond it. The fixture permits shallow resting contact to move out or slide; it refuses deeper penetration. Havok uses animated-body targets and Rapier uses position-based kinematic targets. Release restores a dynamic body with zero inherited throw velocity. Free orientation, authored remote controls, artwork/panel constraints and fast throws remain future experiments; this is not the finished physical interface.

Source inspection found that the previous Babylon recall call was ignored with the default disabled pre-step state. Recall now temporarily requests the explicit teleport pre-step, restores its prior setting and clears velocity. This is a deliberate recovery action; ordinary grabbing uses bounded targets.

| Check | Observed result / limit |
| --- | --- |
| Constraint tests | Thin-wall/furniture/floor sweeps, shallow-contact escape, nonfinite input, rotated bounds, single ownership, cancellation and bounded catch-up pass |
| Native-event adapter tests | Controller squeeze and near hand pinch remain distinct; held inputs cannot commit buttons; source loss, joint loss and hidden sessions release safely |
| Actual engine tests on PC | Havok with Babylon NullEngine and Rapier both settle on the stand, hold, stop before a wall, drop and recall using the same fixture and 72 Hz simulation steps; no GPU, browser XR or headset involved |
| Desktop preview | Babylon scene starts and displays a settled remote height of 0.717 m; this is a fixture observation, not a comfort/performance measurement |
| Local checks | TypeScript, full lint (98 inherited warnings, no errors), styles and 219 tests in 24 files pass; ordinary production/ES5 passes 982 files and comparison production/ES5 passes 990 files with existing exclusions |

UI/UX Pro Max's dragging-alternatives guidance was reviewed again: recall and ordinary/spatial button operation remain independent of grabbing. Held state has a visual change plus an explicit diagnostic label. Quest near reach, pinch reliability, source switching with real hardware, no-jitter behaviour over long sessions, physics cost and final feedback latency still need device evidence.

Implementation references: exact installed Havok/Babylon and Rapier sources, plus [Rapier rigid bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/), accessed 2026-09-30. The online guide currently describes a newer Rapier version; adapter calls were checked against the installed 0.20.0 declarations and exercised in the tests above.

## Player-preserving overlay increment — 2026-09-30

Source revision: df1846c073, based on xr 1f286b0ad5; merged in PR #9 at xr 27c2f023cd. The comparison route remains useful for synthetic fixtures. Actual media testing now uses **Open XR media test**, shown only in an experiment build while a local HTML video surface exists. It opens the same workbench in an overlay, leaving the ordinary video route mounted. Source inspection found that the inherited Page/view-hide lifecycle invokes stop-on-back for active video; navigating to a separate comparison route was therefore an unsuitable way to retain its surface.

The overlay loads the workbench on demand. Closing it disposes presentation resources and restores focus without issuing Stop to Jellyfin. Keyboard/wheel/click propagation is contained so canvas navigation does not also invoke the ordinary player's shortcuts. Initial testing caught Enter being intercepted by those global handlers; the input boundary was corrected before the following checks.

| Check | Actual observation / limit |
| --- | --- |
| Actual Jellyfin video | F-01's existing 3840 × 2160 decoded surface visibly appears in both Babylon and Three texture scenes; no media copy or separate server request is created by the bridge |
| Owner commands | Babylon movement paused the active video at 28.37 s; five preceding arrow presses did not seek (before value 28.29 s). Explicit Resume made that same surface play again |
| Candidate change and close | Jellyfin kept playing during candidate change. Closing the overlay left one non-muted playing video; the muted, paused technical source was removed with the workbench |
| Ordinary seek | A later paused ordinary-player seek advanced currentTime from 158.832 to 188.832 s, with readyState 4 |
| Reported delivery | Jellyfin Playback Info reported HLS direct streaming, HEVC video direct and AAC target audio from EAC3; reasons included unsupported audio codec and video range type. This is a server-conversion case, not a direct-play or HDR-output pass |
| Cleanup | Leaving the ordinary video route stopped playback; DOM contained no video element afterward |
| Local checks | TypeScript, full lint/styles and 219 tests pass; ordinary production/ES5 passes 982 files and experiment production/ES5 passes 991. Ordinary output contains none of the checked comparison route, launcher, remote-copy or catalogue markers |

These PC observations do not qualify audible synchronization, subtitle composition, HDR colour, actual Quest layers or sustained timing. SUBRIP remained selected in ordinary playback, but no synchronized XR subtitle pass is claimed. Screenshots were inspected only during the test; private media, titles, identifiers and artwork are not stored in the repository.

Cancelling the inherited audio-selection sheet subsequently raised `ActionSheet closed without resolving` in the development error overlay. That sheet code was unchanged by this increment. The test stream was stopped through browser Back. R-22 tracks reproducing and fixing cancellation before declaring complete ordinary-player regression; this is not hidden as a passed audio-switching scenario.


## Ordinary menu cancellation follow-up — 2026-09-30

Source revision: 46d022623a, based on xr 27c2f023cd. R-22 was reproduced in the inherited audio-selection flow. Closing a sheet without a selection rejected its promise, and the player did not handle that normal dismissal. Audio, primary/secondary subtitle and playback-settings handlers now consume only a specifically named cancellation error. Other selection/loading failures still propagate; no track is changed on cancellation, and existing idle cleanup still runs.

An initial Error-subclass check passed unit tests but failed in the browser under the inherited ES5 transform. The final implementation uses a named plain Error, matching existing error-name discrimination elsewhere in this client. The actual browser retest closed the audio menu through Back without a new action-sheet error; leaving playback then removed its video element. This does not qualify audible track switching or all ordinary feature parity.

Three regression tests exercise the real action-sheet DOM with only its dialog host mocked: dismissal performs cleanup without selection, a chosen identifier is preserved, and an actual selection failure remains rejected. TypeScript, full lint/styles and all 222 tests in 25 files pass. Ordinary production/ES5 passes 982 files and experiment production/ES5 passes 991. Actual-device menu/input regression remains part of G4.

## Text subtitle comparison increment — 2026-09-30

Source revision: 728c4c8ef7, based on xr b8c2174263 (PR #10's cancellation fix). This increment advances FR-012 / EXP-02; it does not close the subtitle or G2 gates.

The HTML player exposes its current custom-text elements and whether an ASS/bitmap renderer is active. The borrowed surface reads this presentation state and native `TextTrack.activeCues`; it does not fetch subtitle files, select tracks, change modes, duplicate a subtitle timeline or report playback progress. Native cue fragments become plain text without inserting HTML. Active primary/secondary text is combined; authored regions, ruby annotation, styling and karaoke are not preserved by this comparison.

Both texture candidates draw the same opaque Noto Sans caption panel at a stable screen anchor. It updates on changed text/state, clears during seeking or cue gaps, and clears on track-off. The browser review found the initial low panel occluded by the permanent test controls, so its fixture anchor moved to y=2.65 m, z=-6.39 m. This is an experimental placement, not the final subtitle preference or comfort decision. Unsupported ASS/bitmap and excessive layout display a recovery message in the scene. Native media-layer captions remain unimplemented and explicitly labelled before testing that path.

| Check | Actual observation / limit |
| --- | --- |
| Labelled browser fixture | Three original WebVTT cues and deliberate gaps are attached only to the eight-second technical clip. Both PC texture candidates visibly show caption 3 while paused. Babylon native-control seeking, caption-off and caption restoration were observed |
| Existing Jellyfin source | F-01's active text captions visibly appeared in Babylon while its existing video played. Three borrowed the same source and displayed cue gaps during the observed portion; a real active Three caption was not captured, so no separate pass is claimed |
| Return and stop | Closing the workbench left one non-muted playing video with readyState 4. Ordinary Back then removed all video elements |
| Automated coverage | Five cases cover cue edits/cache, seeking, cue gaps, track-off, primary/secondary text, unsafe markup omission, source invalidation, unsupported renderers and bounded layout/repaint behaviour |
| Checks | TypeScript, full lint (98 inherited warnings), styles and 227 tests in 26 files pass. Ordinary production/ES5 passes 982 files; final experiment production/ES5 passes 991. Checked caption/renderer fixture markers are absent from the ordinary output |

UI/UX Pro Max's verified contrast guidance informed opaque backing and light text. Its mobile pixel minima were not treated as XR angular-size evidence. Quest readability, timing against audio, fonts/languages, server track changes, subtitle offsets, rich formats, user placement/size preferences and native-layer composition all remain open. Private dialogue and media screenshots were inspected transiently, not saved in the repository or diagnostics.

Sources inspected 2026-09-30: the inherited HTML player; [MDN active cues](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/activeCues) and [cue fragments](https://developer.mozilla.org/en-US/docs/Web/API/VTTCue/getCueAsHTML). Original fixture provenance is in the [fixture inventory](../../../src/apps/experimental/xr/fixtures/README.md#text-subtitle-fixture).

## Original GLB asset increment — 2026-09-30

Source revision: e115770cf5, based on xr f0e37f7f75 (PR #11's subtitle comparison). The [asset pipeline](../04-architecture/asset-pipeline.md) records the reproducible source, licence, variants and outstanding production work. This advances EXP-03/04 and FR-015/031 without selecting a renderer or closing a performance gate.

Both candidates now load the same original chair GLBs into the existing room. Detailed/reduced choices preserve overall dimensions and materials; two separate collision boxes replace the old seat proxy dimensions. Geometry outside collision bounds would fail the asset test. The swept-remote test was adjusted to the deliberately wider new seat footprint; the collision algorithm did not change.

| Check | Actual result / limit |
| --- | --- |
| Reproducibility and provenance | Repeated generation produced identical detailed/reduced GLB hashes. Source recipe and manifest are committed; no external model/texture/artwork was imported |
| File validity | Khronos Validator 2.0.0-dev.3.10: zero errors/warnings for both files; five informational unused-UV notices each |
| Real loader tests | Three GLTFLoader and Babylon NullEngine/glTF loader parse both assets. Hashes, byte counts, triangles, materials, dimensions and collision enclosure pass |
| Browser appearance | Detailed chairs visibly render in Babylon and Three. The reduced Three variant visibly retains the shape with coarser bevels. This is not a Quest visual/comfort pass |
| Comparison limitations discovered | Babylon currently shows control backs that Three culls; room lighting also differs. Normalize these before comparative visual scoring. No ranking is inferred from uncontrolled loading labels |
| Checks | Application and authoring TypeScript, full lint (98 inherited warnings), styles and 230 tests pass. Ordinary production/ES5 passes 982 files; experiment production/ES5 passes 992. Chair GLBs and checked model-control markers are absent from ordinary output |

The first experiment ES5 check failed on the new Babylon loader chunk. Adding that exact package to the existing Babel transpilation list resolved it; no application compatibility check or XR source directory was exempted. The separate Node authoring script has its own typecheck and a Node-only lint compatibility setting. Texture detail/compression, baked lighting/reflections, room-scale asset loading and actual-device budgets remain pending.

## Panel-facing and lighting comparison follow-up — 2026-09-30

Source revision: 892f920477, based on xr 1a941de17b (PR #12's original chair assets). This resolves the two comparison inconsistencies observed above; it does not establish identical renderer output or close EXP-03/04.

Both candidates now receive the same four directional sources, intensities and linear colours. Exposure is one and output is sRGB without tone mapping. Babylon uses exact sRGB conversions. The previous Babylon hemisphere and Three ambient source were different shader paths, so matching their numeric intensity alone was insufficient. This fill rig is a technical reference; production baked lighting, shadows and reflection assets remain open. PBR BRDF differences still need controlled visual assessment.

Babylon's default plane faced away from the shared +Z hit regions. Double-sided rendering concealed that discrepancy but exposed mirrored labels from behind. The shared Babylon panel now reverses its geometry side without rotating the artwork, keeps back-face culling and is used by controls, video and text captions.

| Check | Actual observation / limit |
| --- | --- |
| PC room views | Front and rear views inspected in both candidates, using six deliberate 30-degree turns. Rear control labels are absent in both; chairs and room surfaces remain visible |
| Video and captions | Babylon's paused technical video preserves the top-left label and non-mirrored caption 3 after the plane change |
| Geometry regression | Both real panel geometries have +Z normals and matching UVs at the same vertex positions; front-only hit regions accept the front and reject the back |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 231 tests in 28 files pass. Ordinary production/ES5 passes 982 files; experiment production/ES5 passes 992 |

UI/UX Pro Max's targeted focus-indicator guidance informed agreement between visible controls and actionable geometry. Access after arbitrary turns, summon/recovery controls and actual Quest readability remain required work. No private media was used in this follow-up. Primary documentation reviewed: [Three lighting](https://threejs.org/manual/pages/lights.html) and [Babylon PBR](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/materials/using/masterPBR.md); actual implementation behaviour was checked against the pinned installed engine sources.

## Session interruption and reset increment — 2026-09-30

Source revision: bd2782ca28, based on xr aaaf4d472c (PR #13's scene comparison corrections). This advances FR-018/030/031; it does not close native-session, hand or comfort qualification.

Both candidates share an event-driven recovery controller. Hidden/blurred XR visibility, ordinary-page hiding and session end cancel pending movement, selection and held objects, reset the simulation clock and request Pause through the existing owner. Presentation resources release immediately while the borrowed owner remains available. Visibility restoration never calls Play. Blurred but still visible sessions retain head-tracked drawing with input/physics suspended; hidden or invalidated sessions skip frame work.

A native reference-space reset cancels stale actions, pauses and closes the immersive session. Re-entry is explicit. This conservative comparison fallback makes no claim of seamless world-anchor compensation. Failed Pause or session-end requests produce actionable diagnostics and do not turn into a reported success. Active XR disposal reaches the owner before the attachment is cleared; closing a desktop overlay retains the earlier ordinary-playback contract.

| Check | Actual result / limit |
| --- | --- |
| Automated native-event cases | Hidden/blurred events, reset, cancellation of real movement/activation/grab state, rejected Pause/end, offset-space listener replacement, session end and disposal are exercised with synthetic EventTargets. They are unit evidence, not runtime/headset events |
| Media resource lifecycle | Interruption disposes a presentation resource once without releasing, playing or pausing the borrowed surface; later explicit session attachment recreates it; final disposal releases once |
| PC smoke | Technical texture playback, deliberate library-position pause and explicit Resume observed in both candidates. Both sources report paused=true after movement and paused=false after Resume, with readyState 4. No private media used |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and 239 tests in 29 files pass. Ordinary production/ES5 passes 982 files and experiment production/ES5 passes 992 |

Actual Quest system overlays, headset removal, native resets and session exit remain untested. The ordinary-page hide path is covered by unit events, not a claimed browser visibility test. Full recovery controls after arbitrary turns, floor selection and seamless tracking-origin compensation remain in EXP-04/G2. Platform references reviewed 2026-09-30: [reference-space reset](https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace/reset_event), [reset transforms](https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpaceEvent/transform) and [XR visibility](https://developer.mozilla.org/en-US/docs/Web/API/XRSession/visibilityState).
