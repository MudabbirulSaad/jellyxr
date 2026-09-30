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


## Stable control recall increment — 2026-09-30

Source revision: 395b24a42b, based on xr 7d73026268 (PR #14's interruption recovery). This advances FR-014/018/030 and AT-17/26 without closing Quest input or comfort qualification.

A single control bank replaces the duplicated fixed banks. Completed empty-space trigger/pinch or desktop click requests a fresh, level placement in front of the viewer; Home and Bring controls here provide alternatives. A nearby hand grab retains priority. The bank remains world-anchored after placement, and deliberate movement recalls it. Rendered geometry and hit regions use the same transform. A bounded collision/view check offers only Return to seat and Exit XR where the full bank cannot fit; hidden actions leave both hit testing and keyboard navigation. Missing or unsuitable poses consume the request without applying a stale transform later.

The browser review caught the initial compact pair falling below the forward view near the rear wall. Moving it around eye level and checking complete rectangles against the desktop preview bounds corrected that case. This geometric check does not establish headset convergence, reach or readability.

| Check | Actual result / limit |
| --- | --- |
| Placement and hit tests | Twelve snap orientations at both fixture destinations pass collision/view bounds; front, back and near hits agree with rotated geometry. Invalid/missing poses and cancelled requests retain the previous anchor |
| Activation and focus | Seven new cases cover explicit recall, stable anchors, keyboard focus/visible-action navigation and synthetic controller/hand event sequences with tracking loss. They do not represent real device input |
| PC browser | Both candidates complete six snap turns, library-position movement, compact recovery display and return to the full bank. Three's browser button and Home alternative were also exercised. Canvas pointer delivery through the automation surface remains unverified; pointer behaviour has unit evidence only |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 246 tests in 30 files pass. Ordinary production/ES5 passes 982 files; experiment production/ES5 passes 992 |

UI/UX Pro Max's focus and dragging-alternative guidance informed retained focus, button alternatives and explicit recovery copy. Actual Quest trigger/pinch recall, input switching, near convergence, occlusion, arbitrary physical positions and comfort remain open. No private media was used. Floor destination selection and seamless native-origin recovery remain separate experiment work.


## Deliberate floor selection increment — 2026-09-30

Source revision: 32bf4c0fa1, based on xr 93d38995f7 (PR #15's control recall). This advances FR-030 / AT-26 and EXP-04; it is an equal-candidate movement experiment, not final locomotion or Quest qualification.

Choose floor arms a proposal without moving the camera. A normalized, bounded straight ray must reach the fixture floor before a static room proxy, and the shared landing-footprint check must pass. A completed same-source selection confirms the destination; target drift beyond 15 cm, tracking/input loss, cancellation or interruption cannot queue later travel. The movement coordinator revalidates the destination and requires the existing owner to accept Pause before applying a new root. Height/yaw remain under the existing movement contract and Resume stays explicit.

Both renderers show the same floor ring with directional/cross feedback and a clear/blocked status in the Cancel move control. During selection, only Cancel move, Return to seat and Exit XR remain in the control bank and hit list. This followed a browser finding that the full bank obscured the marker. The initial desktop proposal moved to 3.5 m ahead to fit the level preview; arrow-key quarter-metre adjustment, Enter and Escape support desktop testing. Neither those distances nor the small floor label are a headset readability/comfort result.

| Check | Actual result / limit |
| --- | --- |
| Geometry and state cases | Clear rays, non-normalized rays, furniture/wall/stand rejection, an otherwise-clear destination behind the library plinth, outside limits, invalid directions and rays starting in a proxy pass. Same-source completion, drift, cancellation, rejected Pause, keyboard operation and hidden-control exclusion pass |
| Synthetic native input | Controller ray-pose loss and hand-joint loss cancel selection; an invalid floor proposal stays in selection mode without moving; completed selections emit one destination. These are unit events, not real headset gestures |
| Babylon browser | Armed floor view and marker inspected. Escape left the technical video playing (paused=false, readyState 4). A valid adjusted destination changed the view and paused that source (paused=true, readyState 4); Return to seat and explicit Resume restored playback |
| Three browser | Equivalent armed view inspected. Attempting an outside destination left the view and video playing; returning the proposal to clear floor and confirming moved the view and paused it. Return to seat and explicit Resume worked. The technical source was left paused afterward |
| Local checks | Application TypeScript, full lint (98 inherited warnings), styles and all 253 tests in 31 files pass. Ordinary production/ES5 passes 982 files; experiment production/ES5 passes 992. Checked floor-selection copy is absent from ordinary output. No build compatibility exemption was added |

UI/UX Pro Max's existing focus, feedback and non-drag alternatives guidance informed the reduced control bank, explicit cancel/status and keyboard alternative. There is no continuous artificial walking, camera animation or new playback owner. No private media was used. Real controller/hand rays, comfort, physical tracking-space behaviour, pointing feedback, all-scene UI occlusion, navmesh/sloped floors and native-layer depth remain unqualified. The static comparison proxies are not a real-world safety boundary. G2 remains open.


## ASS canvas comparison increment — 2026-09-30

Source revision: 421b73ff09, based on xr b0a9086eea (PR #16). This advances FR-011 / AT-10 and EXP-02. Both texture candidates copy the active libass canvas onto a transparent plane fitted to the video rectangle. Real Jellyfin tracks retain their existing renderer, fonts, timing, offsets and selection owner. The experiment never fetches another real track or disposes the owner's canvas.

The installed libass-wasm 4.2.4 render-ahead draw/clear state provides a revision for unchanged-frame suppression. Unknown modes copy each frame. Canvas replacement, size changes, seeking, track-off and invalidation clear or refresh the owned copy. Excessive dimensions, aspect mismatch and origin-access failure show an ordinary-player recovery message without exporting pixels or exception details. The inherited player gains a read-only presentation getter extension; its rendering lifecycle is unchanged.

The original ASS fixture runs through the actual installed libass worker on the existing silent technical clip. It includes top-left positioning, bold/italic text, warm colour, moving text, karaoke colour changes and deliberate gaps. It requests bundled Noto Sans; exact font matching remains unqualified. The fixture owns and disposes its isolated renderer. It never changes the owner's library or server tracks.

| Check | Actual result / limit |
| --- | --- |
| Babylon PC texture | Positioned two-line text at 0.96 s, blank interval at 2.56 s, moving text near 4.73 s and italic/karaoke frame near 6.4 s inspected. Hide/Show restores captions while the video remains paused |
| Three PC texture | Same positioned text and blank interval inspected. Moving text changes horizontal position at 3.52 and 4.48 s. Hide/Show restores the paused caption; switching to Text fixture removes the ASS canvas and restores the plain-text panel |
| Fixture lifecycle | Re-selecting ASS after Hide initially required an explicit renderer enable; fixed and browser-retested. Detach and switching to Text leave zero libass canvases and the technical source paused. These are selected lifecycle checks, not a sustained leak test |
| Unit cases | Four cases exercise the exact-version getter, unchanged/changed revisions, gaps, seek/invalidation, replacement/size changes, unknown revisions, track-off, bounded allocation, layout and redacted origin failure. Owner canvas and playback state remain unchanged |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 257 tests in 32 files pass. Ordinary production/ES5 passes 983 files; experiment production/ES5 passes 993. Checked ASS fixture/scene markers are absent from ordinary output; no dependency or compatibility exemption changed |

These are ordinary PC browser observations using original technical content. No private media, authenticated ASS delivery, actual headset, native layer, burn-in fallback, precise sync tolerance or sustained cost was tested in this slice. Dev-server hot reload continues to report the previously documented rejected origin; manual reload was used without weakening that check. Transient browser screenshots were inspected, not committed as private/media evidence.

UI/UX Pro Max's pause/caption and error-recovery guidance supports explicit controls and visible fallback. Authored subtitle styling is retained by borrowing pixels instead of reconstructing ASS as plain text. Installed libbitsub 1.11.0 can choose a GPU canvas without a preserved drawing buffer, so bitmap capture still needs its own timed-copy experiment. Native-layer composition, secondary-track overlap, user caption placement and actual Quest readability remain G2 work. Primary libass reference reviewed 2026-09-30: [JavascriptSubtitlesOctopus](https://github.com/jellyfin/JavascriptSubtitlesOctopus); revision behaviour was checked against the installed 4.2.4 source.


## PGS capture fixture increment — 2026-09-30

Source revision: c944310e1a, based on xr 47fc91fa24 (PR #17). This is a bitmap-capture feasibility fixture for FR-011 / AT-10 / EXP-02, not real Jellyfin bitmap-track integration.

An original PGS stream contains two labelled pixel captions at different coordinates, transparent corners, a translucent background, a warm stripe and explicit clear compositions. The stream is generated in TypeScript without external artwork or private media. The installed libbitsub 1.11.0 parser decodes its bytes. Its renderer's synchronous post-render `stats` event captures the canvas into an owned 2D snapshot; both XR texture candidates sample that stable copy. The fixture records the actual bitmap backend, owns its renderer and waits for initialization before disposal to avoid a late overlay after cancellation. Real Jellyfin bitmap renderers remain untouched and explicitly unsupported by the comparison.

| Check | Actual result / limit |
| --- | --- |
| Actual WASM parser | Four compositions at 500, 2500, 4000 and 6500 ms decode at 640×360. Two caption bounds and alpha values 0/192/255 match; clear intervals return empty compositions. The parser reports its expected EMPTY_CUE diagnostic for those clears |
| Babylon PC texture | PGS 1 near 1.12 s, blank interval near 2.88 s and PGS 2 near 4.48 s inspected; authored horizontal/vertical placement survives the copy |
| Three PC texture | PGS 2 near 4.8 s, paused Hide/Show and a seek back to the empty interval near 2.8 s inspected. Switching PGS back to Text removes the bitmap overlay; quick PGS/Text cancellation also leaves only the room canvas |
| Backend identification | The inherited bitmap renderer reports webgpu in this PC browser. Both XR scenes still render with WebGL. No WebGL2/Canvas2D bitmap backend, Quest backend or native composition-layer result is inferred |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 258 tests in 33 files pass. Ordinary production/ES5 passes 983 files; experimental production/ES5 passes 993. Checked technical PGS/ASS markers remain absent from ordinary output. No dependency versions or compatibility exclusions changed |

The capture adds a copy before the scene's texture upload, so actual-device cost must be measured. Server-delivered PGS, VobSub, track offsets/settings, renderer replacement, native layers and mid-cue attachment are still open. A real-player subscription must neither miss its initial frame nor keep copying when no XR consumer exists; this fixture does not solve that ownership boundary. The technical source was left paused and detached. UI/UX Pro Max's previously applied caption/recovery guidance carries through the explicit type and Hide/Show controls. No additional headset or human evidence is claimed.

Protocol/source references: installed libbitsub 1.11.0 plus its npm gitHead [b49bc7082d](https://github.com/altqx/libbitsub/tree/b49bc7082d17287d238e7626744d1c991c5f6a2a), inspected 2026-09-30. The PGS composition/segment definitions and compatibility fixtures informed the binary format; the glyph pixels and two-cue test content are original. The moving current upstream branch is not treated as the installed API.

## Bitmap consumer bridge increment — 2026-09-30

Source revision: b3b0fdcff6, based on xr 6ae98ff6b8 (PR #18). This advances FR-011 / AT-10 / EXP-02. The existing HTML video player now exposes an optional subtitle-presentation lease; this is a client seam, not a server API or new playback owner.

The bridge copies only while a consumer reads subtitles, captures inside the current bitmap renderer's synchronous post-render event, ignores replaced-renderer events and releases its snapshot on the last release. Both PGS and VobSub creation paths are wired to it, but VobSub has no runtime evidence. Initial acquisition requests an owner redraw through its existing sizing method without changing time, tracks, settings or playback. Video-only native-layer attachment does not acquire a subtitle copy. The original PGS fixture now exercises this same helper. Its new Attach technical video action preserves the paused state and current position.

| Check | Actual result / limit |
| --- | --- |
| Consumer lifecycle | Three helper cases cover lazy allocation, multiple/idempotent releases, redraw/reacquisition, replacement and late events, storage bounds and redacted failures. A borrowed-player case verifies lazy acquisition and release on source invalidation/detach without play, pause or seek |
| Paused attachment | Both PC texture candidates show the technical video and PGS 2 after attachment at 4.8 s, paused with readyState 4. The bitmap backend is webgpu; neither a headset nor another bitmap backend was tested |
| Three initial video frame | Browser inspection found captions over a black video surface when attaching while paused. Installed Three 0.186.0 waits for a future video-frame callback; marking the ready initial texture for upload fixes it. The real texture class is covered by a regression test, and the PC browser retest shows video/caption together without advancing time |
| Fixture replacement | PGS → ASS → PGS at 4.8 s was inspected in both candidates. One initial Three PGS replacement showed a blank cue; reattachment recovered it. Later settled replacements showed PGS 2 with the time and paused state unchanged. Load-to-caption latency and the cause of that blank observation remain unresolved; this is not a complete replacement pass |
| Cleanup | Detach followed by Text fixture leaves only the room canvas in the page and the source paused at 4.8 s. Snapshot ownership/release is verified by unit checks, not inferred from DOM canvas counts |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 263 tests in 35 files pass. Ordinary production/ES5 passes 984 files; experiment production/ES5 passes 994. Checked fixture/test markers are absent from ordinary output. No dependency version or compatibility exclusion changed |

Real-server bitmap selection, offsets, replacement/cancellation, VobSub, precise synchronization, sustained copy cost and Quest readability remain G2 work. Installed libbitsub source and helper tests establish the player wiring; the technical fixture does not prove authenticated bitmap delivery. The inherited asynchronous renderer-creation paths also need cancellation qualification. Native-layer captions remain uncomposed. UI/UX Pro Max's pause/caption and recovery guidance supports the explicit non-playing attachment action and visible ordinary-player fallback. No private media was used; transient browser views were inspected without committing screenshots. Manual reload was required by the existing dev-server origin rejection.

## Native underlay composition increment — 2026-09-30

Source revision: d1242005b9, based on xr cb41379217 (PR #19). This prepares an EXP-01/02 comparison for FR-011/014/018; it does not establish native-layer support or qualify subtitles.

The native video quad is now submitted before the renderer's projection. Both candidates create a video-fitted, front-facing plane that writes zero RGBA and depth in the opaque pass. The intended result is an opening through the opaque room for the native video, with nearer geometry and existing subtitle meshes composed in the projection. This addresses the prior video-last ordering, which could cover nearer captions and controls because layers do not perform scene depth testing between each other. The experiment explicitly requires projection alpha and reports rejection without switching to a texture automatically.

The session retains the latest submitted layer list. This avoids recreating a removed/destroyed layer from a previous `renderState` snapshot when reference space or video dimensions change in the same frame. A capture-phase end listener marks the session ended before ordinary recovery listeners dispose presentation. Cleanup releases the aperture/caption resources and native layer, and restores the previous projection-alpha setting for a live session. Each candidate currently owns one projection; this is not a general coordinator for independent layer producers.

| Check | Actual result / limit |
| --- | --- |
| Native ownership contracts | Seven unit cases cover layer order/video identity, projection alpha, missing capability, construction failure, cleanup failure, end-event ordering, same-frame recreation and retry after a pending initial projection. Synthetic sessions establish lifecycle behaviour only |
| Candidate aperture geometry | Real Babylon NullEngine and Three geometry agree on front, size, position, opaque-pass/depth settings and disposal for a square source. This does not compile the shader on a real GPU or measure compositor pixels |
| PC browser | Native mode retains an explicit waiting state; attempted immersive entry in the in-app PC browser reports failure without fallback. Both texture candidates subsequently display the paused original video and PGS 2 at 4.8 s. No native layer was displayed in this check |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and all 271 tests in 37 files pass. Ordinary production/ES5 passes 984 files and experiment production/ES5 passes 994. Underlay markers occur in experimental chunks and remain absent from ordinary output. No dependency versions or compatibility exclusions changed |

Required Quest checks before accepting this technique:

1. Identify the device/browser and actual alpha-capable projection. In each candidate, enter Media layer mode from paused and playing technical video; inspect both eyes, correct orientation, edges and letterboxing.
2. Compare text, ASS and PGS cues, gaps, seek and Hide/Show against the source. Verify captions remain above video and nearer room controls/objects occlude the screen correctly while leaning and moving.
3. Move between valid positions, interrupt/exit/re-enter, and replace the active source/track. Require one audible owner, correct progress and no stale layer, aperture or caption.
4. Measure synchronization, video clarity and sustained device cost against the texture path using permissioned Jellyfin fixtures. A PC waiting state or unit session cannot satisfy this gate.

Until these pass, native alpha/occlusion, both-eye shader output, subtitle fidelity, runtime limits and performance remain unverified. The source was left detached and paused; no private media was used. UI/UX Pro Max's existing caption and recovery guidance informs the explicit failure/return copy. The [composition boundary and primary sources](../04-architecture/jellyfin-integration.md#native-media-underlay-experiment) record the reasoning; no production renderer or video path is selected.

## Pointing and scene occlusion increment — 2026-09-30

Source revision: dd231500ef, based on xr 34e0a0d8ef (PR #20). This advances EXP-04 and FR-014/018/023/030 without qualifying a device input method.

Both candidates now build a depth-tested ray, endpoint/contact marker and blocked cross from the same shared hit result. Control hits use normalized metre bounds and reject intervening opaque geometry along the input path or head sightline. The scene queries include imported models and current movable meshes, ignore invisible/disabled surfaces and exclude the feedback/control meshes. Transparent and alpha-tested materials are deliberately excluded from this prototype's opaque blocker set; this is not a general transparency or per-pixel alpha picker. Floor proposals also query actual geometry in addition to conservative landing/proxy checks.

An aimed second controller now takes priority over an idle first controller. Near contact takes priority over a far control hit; a pending press retains its owner. Known tracking/session loss removes the pointer, preserves logical focus and cancels activation. The input adapter samples the viewer only in animation frames and rejects a sample older than 100 ms; this prevents an invalid `getViewerPose()` call on an input-event frame. The [experience blueprint](../03-experience/experience-blueprint.md#interaction-contract) records the protocol and WebXR source. That limit is a design guard, not measured latency.

| Check | Actual result / limit |
| --- | --- |
| Hit and visibility rules | Four shared cases cover normalized range, rotated world hits, source/viewer blockers, near contact, neutral endpoints, invalid input and actual-geometry floor rejection |
| Candidate scene queries | Real Babylon NullEngine and Three raycasting test moved geometry, range, visibility, parent disable/hide, transparency and feedback exclusion. This exposed Babylon's stale same-frame world matrix; forcing an eligible mesh update fixes the regression. No GPU pixels are asserted |
| Native event contracts | Synthetic controller/hand cases cover source priority, held ownership, occlusion cancellation, stale/missing head samples, event-frame restrictions and pointer removal. They do not establish actual hand or controller reliability |
| PC preview | Both candidates load the room and respond to keyboard fixture selection. Three's Home recall is also inspected. The PC control tool did not deliver an observable canvas pointer event, so rendered ray/marker appearance and pointer interaction are not reported passed. Technical video remained detached and paused; no private media was used |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and 285 tests in 39 files pass. Ordinary production/ES5 passes 984 files; experiment production/ES5 passes 994. Selected input markers occur only in experimental chunks. No dependency version or compatibility exclusion changed |

Before G2, run both candidates on Quest with each hand/controller and while switching inputs. Check the endpoint against visible geometry in both eyes, put a chair/remote between the source or head and a control, move an occluder during a held press, interrupt tracking, and recover while seated. Measure hit-query cost with the detailed model, moving-head sightline accuracy, marker visibility over bright video and the accepted input/frame budgets. The current query uses scene triangles and refreshes matrices; no acceleration or sustained cost is claimed. UI/UX Pro Max's verified Focus States / Focus Not Obscured guidance supports visible feedback and keeping focus distinct from activation; XR sizing and occlusion reasoning remain separately qualified.

## Subtitle creation cancellation increment — 2026-09-30

Source revision: d2e9d32ef3, based on xr d117722d99 (PR #21). This advances FR-011/018, AT-10/14 and EXP-02 through the inherited player. It does not replace a renderer or change dependency versions.

The player now invalidates canvas-renderer requests before destruction. ASS import, configuration and fallback-font continuations check request generation and playback-options identity. PGS/VobSub imports, callbacks and queued resizing check the same boundary, with instance checks on resize. Load completion/failure settles the request's own token, so a stale callback cannot finish a replacement's loading state. ASS promise failures are contained; an active error reaches the player owner, and cancellation suppresses obsolete or already queued errors.

| Check | Actual result / limit |
| --- | --- |
| Reproduction | Four tests against the actual inherited player methods failed before the change: cancelled PGS/VobSub imports still constructed an instance, and old loaded callbacks resized a replacement |
| Guarded lifecycle | Ten tests now pass with mocked renderer/network/timing boundaries. They cover both bitmap codecs, replacement load tokens, scheduled resize, source identity changes, ASS cancellation at import/configuration/font stages, stale/current errors, rejection and a queued error cancelled before dispatch |
| Ownership | Tests exercise existing JavaScript lifecycle methods through a typed test boundary; production visibility is unchanged. The current ASS error is reported against the HTML player, correcting the previous callback `this` ambiguity |
| Local checks | TypeScript, full lint (98 inherited warnings), styles and 295 tests in 40 files pass. Ordinary production/ES5 passes 984 files and experiment production/ES5 passes 994. Selected test-only labels are absent from both builds; no compatibility exclusion changed |

No authenticated ASS/bitmap delivery or new browser/headset playback result was obtained in this slice. Mocked lifecycle tests do not establish parser, GPU, font, synchronization or device support. The technical ASS/PGS fixtures use separate renderer construction and cannot stand in for this player regression.

Installed libbitsub 1.11.0 source inspection found a separate concern: `init()` awaits WASM and then creates a canvas/loads subtitles without an intervening disposed check, while GPU setup has additional asynchronous continuations. This patch prevents a cancelled import from constructing a renderer; it does not claim to stop work already running inside one. Reproduce and resolve that resource lifecycle before accepting rapid close/reopen or track switching. Plain-text/custom-DOM fetch continuations and secondary-track interactions also need separate request-identity qualification. The prior PGS replacement blank observation remains unresolved; no causal link to the newly reproduced player bugs is asserted.

## Bitmap startup disposal increment — 2026-09-30

Source revision: b903865673, based on xr 76bbfc27a3 (PR #22). This repairs a reproduced subset of R-23 under FR-011/018, AT-10/14 and EXP-02. It preserves libbitsub 1.11.0, the lockfile, Jellyfin's renderer ownership and disabled dependency-installation scripts.

The installed library resumed initialization after disposal. Its base initializer could append a fresh canvas after WASM became ready or recreate temporary storage after loading. Separately, WebGPU initialization could assign a late device/pipeline or dereference a device already cleared by destruction. Seven unattended tests reproduced these failures before the repair. These are demonstrated startup races; they are not an established cause of the earlier PGS replacement blank frame.

The [reviewable dependency patch](../../../patches/libbitsub-1.11.0/README.md) checks disposal after base initialization awaits and makes WebGPU destruction terminal across adapter, device, shader and pipeline initialization. It destroys a late returned device, prevents a canceled backend from activating/falling back, and clears destroyed references. Hash verification accepts only the pinned original or patched source and checks all outputs before writing. The explicit `patch:dependencies` command, Webpack/Vitest configuration and CI step enforce the repair without enabling third-party install scripts. The two edited modules no longer refer to inaccurate upstream source maps.

| Check | Actual result / limit |
| --- | --- |
| Reproduction | Both public PGS/VobSub constructors created canvases after disposal during WASM initialization. Five controlled WebGPU stages reproduced resource resurrection or null-device errors. The same seven cases pass after the patch |
| Lifecycle regression | Twenty tests exercise installed classes: WASM, initialization yield, pending load, normal startup, five GPU awaits, repeated destruction and both backend activation/fallback paths. WASM/loading/GPU completions are controlled; these are ownership tests, not hardware GPU qualification |
| Reproducibility | Five installer tests cover multiple hunks/CRLF, idempotence, a partially patched install, unknown input, altered output and version drift. An isolated `npm ci --no-audit` using libbitsub and its type dependency from the existing lockfile installed two packages, then applied and reverified the patch. The inherited `.npmrc` was retained; a full repository reinstall was not repeated |
| PC preview | After restarting the development build with patch verification, both Babylon and Three texture previews displayed original PGS 2 at a paused 4.81353 s using the webgpu subtitle backend. Hide/Show disposed and recreated the fixture with the same paused time and visible caption. Final detach/Text selection left one room canvas and the video paused. No private media was used |
| Local checks | TypeScript, lint (98 inherited warnings), styles and 320 tests in 42 files pass. Ordinary production/ES5 passes 984 files and experiment production/ES5 passes 994. Selected test/installer markers are absent from both outputs. Dependency versions, lockfile and compatibility exclusions are unchanged |

Remaining R-23 work includes cancellation inside already-running parser, worker, network and frame-cache operations, plus plain-text/custom-DOM and secondary-track request identity. The patch deliberately does not claim those continuations are canceled. Real-server bitmap/ASS selection, VobSub rendering, other bitmap backends, exact synchronization, sustained resource use and Quest/native-layer qualification stay open. No G2 winner or milestone exit is implied.
