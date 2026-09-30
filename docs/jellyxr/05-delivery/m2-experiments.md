# M2 experiment evidence

Updated: 2026-09-30. Status: comparison workbench preparation passed local checks; G2 remains open. Initial source revision: d919941b3b, based on xr 8ea4c39a83; dated increments below identify subsequent revisions. The workbench is a disposable experiment, not the production spatial library or an engine-selection decision.

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

## Screen-size comparison contract — 2026-09-30

Under [FR-016](../02-requirements/functional-requirements.md#fr-016), compare deliberate screen-size changes in both disposable scenes before selecting a presentation path. Keep the architectural screen and its collision proxy fixed, with a graphite surround so reduced images do not expose a bright white border. The displayed image may occupy 60–100% of the existing 6.4 × 3.6 m envelope, in ten-percentage-point steps. These are bounded experiment values, not accepted headset sizing recommendations.

Scene-rendered **Screen size**, **Smaller**, **Larger**, **Reset size** and **Back to controls** actions must use the existing shared controller/hand/desktop hit-testing path. Show the current percentage and physical envelope, disable actions at their limits, and preserve the stable control anchor while adjusting. Retain Return to seat and Exit XR recovery. Closing the panel preserves the size for this scene; Reset restores 100%. No preference is persisted yet.

Video aspect ratio, ASS/bitmap artwork, native quad, projection aperture and plain-text caption geometry must derive from the same percentage. Size changes may replace owned presentation resources but must not release the borrowed player, seek, pause, play, change tracks or restart progress reporting. Unchanged size must not allocate resources each frame. A rejected media layer remains an explicit error, with no silent texture fallback.

Validate boundary/Reset behaviour, stable target placement, both renderer geometries, layer/aperture agreement, cleanup and playback ownership in controlled tests. Inspect both PC texture previews with the labelled calibration media and captions. Real layer resizing, hand/controller operation, subtitle readability and comfort remain Quest checks. Distance, height, tilt, curved presentation, general screen recentering and scoped production preferences remain unimplemented portions of FR-016; this increment does not close that requirement or G2.

UI/UX Pro Max's verified **Disabled States** guidance informs distinct disabled controls; the existing focus/press feedback and concrete action labels are retained. Its mobile sizing and haptic defaults are not XR qualification evidence.

## Expanded flat-screen placement contract — 2026-09-30

Extend the bounded FR-016 comparison with deliberate distance, height and tilt controls. Preserve the size-only results above as historical evidence. For this expanded experiment, the graphite backing and its collision box now follow the selected image envelope and pose; the room architecture remains fixed. Video, authored caption canvas, plain-text caption panel and native-layer aperture must share that pose and maintain their local depth separation. No source aspect ratio or player-owned state changes.

The proposed comparison range is 4–6.5 m from the room's reference seat, centre height 1.2–2.8 m and tilt ±15 degrees. Distance changes in 0.25 m steps, height in 0.1 m steps and tilt in five-degree steps. These are experimental bounds, not headset comfort recommendations. A change must fit inside the room and avoid other solid geometry, the current viewer and the remote. Keep the screen at least 1.75 m from the tracked head so it cannot cross the 1.4 m reference control bank; this is a comparison safeguard, not a comfort threshold. Reject a conservative swept envelope through the viewer or remote, including Reset. Reject blocked changes with an actionable message and retain the prior valid placement. Never move the camera or push an object to make a screen placement fit. Reset restores the default size and pose only when that placement is clear.

Use a per-scene collision model, not mutable global fixtures. Teleport validation, floor occlusion, control placement, remote sweeps and engine collision bodies must observe the same screen pose. Tilted-screen queries use the oriented box; do not leave an invisible collider at the old location. Placement cancels pending input/grabs and stays fixed after confirmation. Preserve seated button alternatives and Back/Return to seat/Exit XR. Validate transforms and clearance in controlled tests, inspect both candidate previews, and retain native-layer, actual hand/controller and comfort gates as pending until measured.

General recentering toward an arbitrary orientation, curved presentation and persistent production preferences are separate remaining FR-016 work. This contract is not a G2 engine choice.

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

Source revision: 421b73ff09, based on xr b0a9086eea (PR #16). This advances FR-012 / AT-10 and EXP-02. Both texture candidates copy the active libass canvas onto a transparent plane fitted to the video rectangle. Real Jellyfin tracks retain their existing renderer, fonts, timing, offsets and selection owner. The experiment never fetches another real track or disposes the owner's canvas.

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

Source revision: c944310e1a, based on xr 47fc91fa24 (PR #17). This is a bitmap-capture feasibility fixture for FR-012 / AT-10 / EXP-02, not real Jellyfin bitmap-track integration.

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

Source revision: b3b0fdcff6, based on xr 6ae98ff6b8 (PR #18). This advances FR-012 / AT-10 / EXP-02. The existing HTML video player now exposes an optional subtitle-presentation lease; this is a client seam, not a server API or new playback owner.

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

Source revision: d1242005b9, based on xr cb41379217 (PR #19). This prepares an EXP-01/02 comparison for FR-012/014/018; it does not establish native-layer support or qualify subtitles.

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

Source revision: d2e9d32ef3, based on xr d117722d99 (PR #21). This advances FR-012/018, AT-10/14 and EXP-02 through the inherited player. It does not replace a renderer or change dependency versions.

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

Source revision: b903865673, based on xr 76bbfc27a3 (PR #22). This repairs a reproduced subset of R-23 under FR-012/018, AT-10/14 and EXP-02. It preserves libbitsub 1.11.0, the lockfile, Jellyfin's renderer ownership and disabled dependency-installation scripts.

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

## Bitmap load cancellation increment — 2026-09-30

Source revision: 660a57bbf8, based on xr 8df832b8b5 (PR #23). This extends the same pinned libbitsub 1.11.0 repair for FR-012/018, AT-10/14 and EXP-02. It closes reproduced load-ownership failures without changing dependency versions, the lockfile or Jellyfin's playback ownership.

Disposal now aborts that renderer's subtitle requests, cancels queued main-thread parsing, releases an owned worker session before acknowledgement, and prevents late load/frame/index replies from restoring disposed state. Each continuation checks the renderer before changing state or starting fallback work. The shared worker remains available to other renderers. An aborted range probe no longer attempts HEAD and ordinary GET fallbacks. Parser exceptions in a scheduled live load settle through the existing error path instead of escaping a timer callback.

| Check | Actual result / limit |
| --- | --- |
| Reproduction | Ten tests initially failed across pending worker initialization/load, four URL-loading paths and queued parser callbacks for PGS/VobSub. A further range-probe case reproduced three fetch attempts after cancellation; the repaired path makes only the original attempt |
| Lifecycle regression | Thirty-two load/worker/parser cases and three range-loader cases pass. They cover cancellation, late success/rejection, idle/timer queues, progressive PGS, VobSub IDX/SUB/MKS control flow, normal loads/errors and two concurrent renderer sessions. External worker/parser/network completions are controlled; these tests do not decode VobSub or prove real-server delivery |
| Reproducibility | An isolated installation of the two locked dependency packages using `npm ci --no-audit` accepted the complete patch and passed idempotent verification. This is not a full repository reinstall. Pulling a new patch revision requires a pristine reinstall as explained in the [patch instructions](../../../patches/libbitsub-1.11.0/README.md) |
| PC preview | Both Babylon and Three video-texture previews displayed the original PGS 2 cue at paused 4.8 s with the detailed chair model and webgpu subtitle backend. Three Hide/Show pairs per candidate restored the visible cue without advancing playback. Detach followed by Text fixture left one room canvas and the source paused. Transient views were inspected; no private media or saved screenshot is included |
| Local checks | TypeScript, lint (98 inherited warnings, no errors), styles and all 355 tests in 44 files pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. Both output sets contain the load/range cancellation markers and exclude the selected test marker. Compatibility exclusions are unchanged |
| Documentation | Thirty Markdown files including the patch instructions pass 405 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the 17 dependency edges. Existing diagrams are unchanged |

Worker parsing already executing synchronously may finish before its queued disposal message. The tests establish session ownership and ignored late replies, not worker CPU preemption or measured memory recovery. The PC fixture uses in-memory original PGS data; it does not qualify HTTP subtitle delivery, VobSub decoding, other bitmap backends, Quest or native layers. Manual reload remains necessary when the development server rejects the tool browser's HMR origin.

R-23 now retains plain-text/custom-DOM and secondary-track request identity, plus real-player source/track transitions and sustained resource verification. The earlier replacement blank observation and exact load-to-caption latency remain unresolved; these ownership repairs are not asserted to explain them. G2 and all dependent milestone gates remain open.

## Text subtitle ownership increment — 2026-09-30

Source revision: a236039a88, based on xr 3f2e9f24b6 (PR #24). This advances FR-012/018, AT-10/14 and EXP-02 in the inherited HTML player. No dependency, server API or playback owner changes.

Five initial tests reproduced native cues returning after disable, stale cues mixing into a replacement, an obsolete custom response claiming the new element, secondary-first custom captions disappearing, and an old server-session lookup overriding the current selection. An additional reverse-lookup test exposed secondary native cues occupying the primary slot. These failures use the real player selection/rendering methods with controlled transport and native cue storage.

Requests now belong to a primary or secondary slot, the current playback options and the video element. Removal aborts and settles the affected request once; late responses and errors are ignored. Busy feedback remains active through JSON body completion, and current failures reach the existing player error channel without including signed URLs or subtitle content. Repeated selection preserves its active fetch, while switching away and back restarts an aborted load. Session lookups check selection identity before applying tracks or changing delivery metadata.

Custom captions share a video-scoped container that either response can create; both completion orders preserve the configured line ordering. Native rendering reserves both track slots when the secondary lookup finishes first. Removing all tracks also handles a secondary-only container. Existing text normalization, sanitization and appearance remain in use.

| Check | Actual result / limit |
| --- | --- |
| Regression cases | Seventeen cases cover the six reproduced failures, old-source results, abort and late rejection, loading through JSON decoding, current errors, independent slot removal, secondary-only cleanup, repeated selection and switching away/back. Native cue storage and server replies are controlled; custom elements use the real DOM and inherited presentation methods |
| Local checks | TypeScript, full lint (98 inherited warnings, no errors), styles and all 372 tests in 45 files pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. No dependency or build compatibility exclusion changed; the narrow AbortController lint explanation refers to the existing legacy polyfill |
| Output/document audit | Both builds contain the request repair and exclude the selected test marker. Thirty Markdown files pass 406 relative links/anchors, requirement/acceptance coverage and the unchanged roadmap dependency graph |
| UI/UX review | The installed UI/UX Pro Max search for loading feedback returned Feedback / Loading Indicators. The relevant guidance is matching busy feedback to the actual operation and preserving the existing interaction. This change corrects request lifetime without introducing new controls or marketing content |

No new browser, server-delivered subtitle or Quest run is claimed for this slice. These unattended tests do not qualify the legacy UWP file-reader path, native browser cue layout, language/codec fidelity or device timing. The deferred secondary initialization timer, transitions between plain text and canvas formats, actual source changes/overlay cycles and sustained resources remain separate regression work. The earlier PGS replacement blank and G2 selection remain unresolved.

## Upholstery material increment — 2026-09-30

Source revision: 4d2d272ef8, based on xr 4099bb4268 (PR #25). This is independent asset preparation for FR-015/031, NFR-001/002 and EXP-03/04; it does not choose an engine or close G2/M5.

Both original chair variants now embed a 512 × 512 normal map and a 512 × 512 packed metallic/roughness map, authored mathematically from crossing threads. Cushion UVs use an 8 cm physical tile; explicit MikkTSpace tangents accompany the normal data. The normal PNG is 10,086 bytes and the packed PNG 5,437 bytes. These are lossless PNG references with runtime mipmap sampling, not GPU-compressed textures. The detailed GLB is 1,457,108 bytes and reduced GLB 292,788 bytes; triangles, five material primitives, outer dimensions and collision proxies are unchanged.

The source recipe and manifest record provenance and hashes under the repository licence. No downloaded art, photographic surface or new authoring/runtime package is included. Both chair instances share model resources. Three's disposal now releases material textures and closes decoded images once; Babylon uses its asset container lifecycle.

| Check | Actual result / limit |
| --- | --- |
| Rebuild | Two generation runs produced identical GLB hashes. Node 24 authoring and its separate TypeScript check pass; the generator embeds image bytes without a browser/canvas shim |
| File/loader validity | Khronos glTF Validator 2.0.0-dev.3.10 reports zero errors/warnings and four unused-UV informational notices per variant. Both actual loaders accept the files. Six asset cases cover geometry/proxies, material bindings, tangent orthogonality, pixel/hash constraints and shared disposal. Node tests decode PNG data but control ImageBitmap creation; NullEngine does not exercise GPU upload |
| Desktop workbench | Both candidates load detailed and reduced variants. Six deliberate 30-degree turns expose the detailed chairs from the seated reverse direction in both candidates. Shape and graphite finish remain coherent in those views. Small textile detail is not resolved well enough at that distance to approve its final appearance; close-range inspection and both-eye/shimmer review remain open |
| Local checks | All 375 tests in 45 files, application/authoring TypeScript, lint (98 inherited warnings), styles and both production builds pass. Ordinary/experimental ES5 checks pass 984/994 files. The ordinary build has no GLBs; both experimental GLBs match the source-manifest hashes |
| Documentation | Thirty Markdown files pass 409 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 roadmap dependency edges |

The development browser still reports the known HMR origin rejection; manual reload loaded the new assets. No private media was used or started. Desktop frame/load labels are uncontrolled observations and are not performance evidence. No sustained GPU-memory, Quest, compression or material-equivalence pass is inferred. UI/UX Pro Max searches for background noise and hierarchy did not yield material-specific guidance; the existing Observatory specification remains the design authority, with static restrained detail and unchanged unlit video/control surfaces. The [asset pipeline](../04-architecture/asset-pipeline.md) records the next compression, lighting and device steps.

## Subtitle startup and canvas-slot increment — 2026-09-30

Source revision: 6db3a0be75, based on xr 3004f0ceb6 (PR #26). This advances FR-012/018, AT-10/14 and EXP-02 within the inherited HTML player. Earlier subtitle evidence and ledger rows incorrectly cited audio requirement FR-011; those references now point to the authoritative subtitle requirement FR-012. Their observations and qualification limits are unchanged.

Deferred secondary initialization now captures its original track/video/options and is canceled by newer selection, source replacement or teardown. Delayed OSD navigation cannot restore the default pair over a newer choice or initialize another source. Current navigation still removes its overlay state and performs the inherited audio initialization. Clearing secondary captions now preserves the primary ASS/PGS/VobSub renderer, its pending import, callbacks and loading state; clearing the primary or all tracks still disposes it.

| Check | Actual result / limit |
| --- | --- |
| Reproduction | Ten of the 45 targeted cases fail against the pre-change player. They expose obsolete default selection after newer primary/secondary choices or source replacement, late OSD initialization, and cancellation of pending primary ASS/PGS/VobSub when secondary captions are cleared. Some cases exercise the same defect through different paths; this is not a count of independent bugs |
| Regression | Eighteen new cases bring the two player suites to 45 passing cases. Stop/end tests retain the inherited helper's clearing of playback options; normal startup and normal OSD completion still load both tracks. A newer subtitle choice preserves current navigation and audio initialization. Canvas callbacks and final primary disposal remain exercised |
| Local checks | TypeScript, lint (98 inherited warnings, zero errors), styles and all 393 tests in 45 files pass. Ordinary/experimental production and ES5 checks pass 984/994 files with unchanged compatibility exclusions. Both output sets contain the startup repair and exclude the selected test marker |
| Documentation | Thirty Markdown files pass 410 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges |
| Evidence boundary | Real player methods run with controlled network, native cue storage, navigation and renderer constructors. Video transport and audio switching are mocked boundaries. These checks establish asynchronous ownership, not real-server delivery, decoder fidelity, audio output, XR composition or headset behavior |

The first concurrent ordinary build process exited with Windows status 0xC0000005 and no compiler diagnostic; the sequential rerun passed. A manually constructed experimental ES-check command used the wrong exclusion list and rejected inherited modern worker files; validation uses the existing `escheck:xr-experiments` script without changing its exclusions. Neither event is reported as an application regression or a successful check.

UI/UX Pro Max's targeted loading-feedback search returned Feedback / Loading Indicators: preserve feedback for its owning operation and avoid stale or misleading busy state. No visual redesign or new copy was needed. Real-server cross-format transitions, the earlier PGS replacement blank observation, native-layer/device tests and sustained resource measurements remain open.


## Spatial catalogue increment — 2026-09-30

Source revision: 32578e0be3, including d038412130 and d1a81b35d3, based on xr adccdf81be (PR #27). This advances FR-005/006/007/014 and EXP-03/04 within the disposable comparison. The technology brief recorded the shared geometry, bounded residency, focus and context contract before implementation. It does not bind the production renderer or connect a new library API.

Both scenes now present six world-space technical records, Previous/Next page, All types/Movies/Episodes, details, Back and Close. Opening or recalling resolves a checked placement; page/detail changes preserve the settled anchor. Back restores the selected card, and Close/reopen retains the page/filter/detail. Disabled page actions remain opaque hit blockers without activation. Original calibration stripes, complete technical titles and explicit missing-artwork labels replace no real media content; these records cannot start playback.

A shared panel owner disposes outgoing canvas textures/materials/meshes and reuses unchanged panels. The catalogue has at most eleven panel owners, six of them cards; the ordinary comparison control bank has twelve. The separate DOM catalogue and its repeated fixture generation on diagnostic renders were removed. That source change is not a measured CPU improvement. A rapid Enter sequence revealed that new content could activate while placement was pending; activation now waits for placement resolution in keyboard, pointer and native selection paths.

| Check | Actual result / limit |
| --- | --- |
| State and ownership regression | Nine new cases bring the full suite to 402 tests in 46 files. They traverse all 1,000 fixture records with at most six resident cards, verify panel disposal and unchanged-panel reuse, disabled boundaries, stale-ID rejection, filters, Back and Close/reopen context, title wrapping, placement/recovery and pending-placement activation |
| Input regression | Controlled controller and hand event cases select a visible card, cancel a held Back action on tracking loss, reject its late completion and require a new deliberate press. These exercise the shared coordinator and analytic geometry; they do not establish real hand tracking, controller hardware or displayed-ray accuracy |
| Desktop comparison | Babylon and Three render the same card grid and detail composition. Keyboard checks open details, return to the catalogue, advance to 7–12 and filter to Movies 1–6 of 666. Babylon Close/reopen retains that filter. The final revision was reloaded and Open/detail inspected again in both candidates. The long first title and explicit missing-artwork state remain visible. Small card/action labels in the PC preview are not a headset readability approval |
| Local checks | Application TypeScript, lint (98 inherited warnings, zero errors), styles and 402 tests pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. The final experimental build includes the placement guard. Later changes after the ordinary build are confined to the excluded experimental feature; the ordinary output has no catalogue marker |
| Output and ownership | The experimental output contains the catalogue marker, and both output sets exclude the selected test marker. No dependency, lockfile, compatibility exclusion, media source or progress reporter changed. Resource-count tests do not measure GPU memory release or sustained device performance |
| Documentation | Thirty Markdown files pass 411 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed |
| UI/UX review | UI/UX Pro Max searches for pagination/navigation/focus returned keyboard navigation, visible focus and unobscured navigation guidance. The comparison keeps complete keyboard actions, a visible focus outline/text, disabled-action exclusion and contextual Back. Browser pixel recommendations are not treated as XR angular sizing evidence |

No private library metadata or media was loaded for this slice. No video was attached or started in the final catalogue checks. Transient browser screenshots were inspected; no exported before/after screenshot artifact is included. The tool browser's pointer targeting remained unreliable at the scrolled page position, so keyboard activation supplied the recorded PC navigation evidence. No desktop pointer pass is claimed.

Quest both-eye depth, head-motion parallax, actual hand/controller reach, long-title readability, measured GPU/upload cost and the sustained 1,000-item run remain open. Production search, collections, Jellyfin pagination and playback selection remain M3/M4 work after G2. The existing native-layer, subtitle and five-viewer gates are unchanged; this slice closes no milestone exit.

## Spatial search increment — 2026-09-30

Source revision: b4154d57f3, based on xr 6ae27fbca2 (PR #29). This advances FR-006/014/023 and EXP-04 within the disposable comparison. The technology brief records the draft, recovery, geometry and diagnostic contract before implementation. No production renderer, search API or multilingual input implementation is selected.

Search opens 39 individually rendered and hit-tested keys, a labelled field and Backspace, Space, Clear term, Search and Cancel actions. Only Search applies the draft; Cancel restores the previous query, type and page. Clear search removes only the applied term. Empty results retain explicit editing, filtering and clearing actions. Both candidates use the same state and geometry, retain a safe settled anchor and cancel held input when the view changes. The Latin fixture accepts at most 48 characters, then disables character/Space actions without moving keyboard focus to a destructive action.

| Check | Actual result / limit |
| --- | --- |
| State and recovery | Eleven new cases bring the suite to 423 tests in 48 files. They cover submit versus draft, Cancel, filtering, detail/Back, zero-result Close/reopen, Clear, the character bound, unsupported keys and unfinished-draft disposal |
| Shared input | Controlled native controller and hand event cases type once, reject duplicate activation, cancel a lost press and require a new deliberate press. Analytic ray/near tests distinguish all 39 keys. Keyboard Escape cancels a held action. These are coordinator/geometry tests, not physical-device evidence |
| Residency and redraw | Twenty edit/submit/clear/cancel cycles peak at 46 panel owners and release all owners on disposal. The normal catalogue now has 12 panels, or at most 13 with an applied query. A value-only edit repaints the field while unchanged keys/buttons retain their resources. These counts do not establish GPU release, frame cost or thermal stability |
| Desktop Babylon | Scene keys entered 0001 and returned one matching technical record. Detail/Back and changed-draft Cancel retained that result. Forty-nine attempts to enter W stopped at 48; the full term wrapped within its field and displayed Limit reached. Search produced an honest empty state; Clear search restored six resident records from the 1,000-item catalogue |
| Desktop Three | The same keyboard displayed in the room, scene keys entered 0001 and returned the matching record, and Cancel discarded a changed draft while retaining the prior result. No ordinary DOM search field was used |
| Visual correction | Desktop inspection exposed stretched header text. Control canvases now match their physical panel aspect ratios; headings, field text and the long applied term wrap without the earlier distortion. PC inspection does not approve headset angular sizing or readability |
| Diagnostics and content | Input diagnostics report Search key rather than the character, and catalogue status does not echo the draft or query. All content is clearly labelled technical data; no private library, artwork or media was used, and no video was attached or started |
| UI/UX review | UI/UX Pro Max's Input Labels result supports the persistent visible field label. Existing focus and disabled-state guidance supports stable target bounds, explicit limit feedback and inactive-target exclusion. Pixel/touch guidance is not substituted for XR reach or angular-size measurements |

Application TypeScript, full lint (98 inherited warnings, zero errors) and all 423 tests pass. The affected 20 catalogue/search tests and focused artwork lint also pass after the final aspect-ratio correction. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. The ordinary output excludes the search keyboard marker, the experimental output contains it, and both exclude the selected test marker. Dependency versions, lockfile and compatibility exclusions are unchanged. No CSS/SCSS changed, so stylelint was not repeated for this slice.

Thirty-two Markdown files pass 419 relative links/anchors, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

Transient browser screenshots were inspected; no exported screenshot artifact is included. The supported browser surface supplied desktop keyboard activation, not reliable pointer or native-device input. Quest binocular depth, typing accuracy/speed, controller/hand reach, switching, near interaction, readable long terms and sustained upload/frame cost remain open. The 48-character Latin keyboard is a technical fixture constraint; localized production search, IME and Jellyfin query/permission behavior remain M3/M4 work. No G2 choice or milestone exit is implied.


## Architectural shell increment — 2026-09-30

Source revision: f253e875a7, based on xr 509129fd9d (PR #31). This advances FR-015/031 and EXP-03/04 within the disposable comparison. The asset-pipeline contract was updated before implementation. No renderer is selected and no M5 visual qualification is implied.

Both candidates load identical original room geometry: graphite backing, recessed acoustic panels, ceiling coffers, a quiet floor grid, metal rails and a layered library plinth. The screen, lights, chairs, remote and locomotion collision geometry are unchanged. The shell has 15,084 triangles in four material primitives, no textures and 1,089,452 bytes; source, licence, hash and collision resources are in the [asset pipeline](../04-architecture/asset-pipeline.md). No private media or imported environment art is included.

Architectural shell and Plain room are independent of chair quality. Plain room avoids the room asset request and preserves the simple architectural comparison geometry. Successful loading hides only the corresponding visible proxies; a failed load leaves them visible and describes the retry action. Scene disposal releases imported resources and restores proxies. Changes restart the comparison, clear its presentation attachment and pause the technical fixture; immersive scene changes remain disabled.

| Check | Actual result / limit |
| --- | --- |
| Repeatable authoring | Regenerating the room yields the same SHA-256. Extracting the shared binary exporter and regenerating both chair variants leaves their existing content unchanged. No new dependency or lockfile change |
| Geometry and loaders | Four new tests bring the full suite to 427 tests in 49 files. Every authored vertex fits within the seven unchanged static volumes; both real glTF loaders agree on counts and representative scene-query distances. Controlled loading tests cover failure retention, successful replacement/disposal and no-load Plain room. NullEngine does not upload to a GPU |
| File validity | Khronos glTF Validator 2.0.0-dev.3.10, installed outside the repository, reports zero errors, warnings, informational notices and hints for the final shell |
| PC visuals | Both engines render the same forward room proportions, recessed detail and unobscured control bank. The explicit plain selection loads in both, and Three returns successfully to the shell. Browser keyboard floor proposals and confirmation moved the viewer and recalled controls in both candidates during this slice; these are not controller/hand or native XR observations |
| Switching and media | In Three's Plain room, the silent technical fixture played with readyState 4. Switching to Architectural shell paused it (observed 3.783 s) and reset the scene to No video attached. This checks fixture ownership on scene restart, not a Jellyfin delivery path, audible media or subtitle synchronization |
| Local checks | Application and offline-authoring TypeScript pass; full lint has 98 inherited warnings and zero errors. The full 427-test run passes; the four room cases and affected lint pass again after adding Plain room. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. Build output retains the two inherited size warnings |
| Bundle boundary | Ordinary output contains no GLB or room-status marker. Experimental output contains three GLBs, including the exact manifest-hashed room file. Both outputs exclude the selected room-test marker. No broad compatibility exemption was added; Vite now recognizes GLB imports in asset-owner tests |
| UI/UX review | UI/UX Pro Max's targeted loading-feedback result supports explicit preparation/failure text and keyboard-operable detail choices. Selected choices expose pressed state; room changes preserve visible fallback on failure. No new decorative control or fabricated library content is introduced. XR reach, contrast in-headset and spatial readability are separately unqualified |

Saved PC reference views: [plain Babylon baseline](../references/images/m2-plain-room-babylon.png), [architectural Babylon](../references/images/m2-architecture-babylon.png) and [architectural Three](../references/images/m2-architecture-three.png). Each includes the technical workbench context. Their load labels and application timings are uncontrolled observations, not engine rankings or sustained-performance evidence. The Three source preview shows the paused technical fixture; no private artwork/title is present.

No CSS/SCSS changed, so stylelint was not repeated. Both ordinary and experimental builds pass; later documentation and reference-image additions do not alter application source. Remaining gates include complete room/back-wall visual review, final library shelving, authored surface textures, compression/mips, baked lighting/reflections, actual scene-query/GPU cost, native media layers, binocular depth, hand/controller reach and sustained Quest qualification. G2/G3/G4 remain open.

Documentation validation passes 430 relative links/anchors across 32 Markdown files, unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Screen-size increment — 2026-09-30

Source: `723b3cb5f3138b1bc13dd9112e6cd97806558d3c`, branch `milestone/m2-screen-sizing`, based on `xr` `92039c9316`. Implements the [bounded comparison contract](#screen-size-comparison-contract--2026-09-30) for FR-016/012/014, without selecting a renderer or changing the ordinary player.

Both scenes expose a seven-panel size view through the existing spatial input path. Explicit Smaller/Larger steps update one shared percentage, with disabled limits, Reset, Back, Return to seat and Exit XR. Size changes retain the control anchor and player lease while replacing owned video/caption resources. The native quad and projection content receive the same value. The screen backing and all colliders stay fixed; its graphite finish removes the bright surround that PC inspection exposed at reduced sizes.

| Check | Actual result and limits |
| --- | --- |
| Controlled regression | Twelve additional cases; 439 tests across 51 files pass. Covers size limits, retained size, Reset, disabled geometry, stable placement, deliberate activation/cancellation, both real renderer video/caption/aperture geometries, native composition arguments and disposal without player commands. Artwork drawing is mocked in the geometry cases; native layer calls use a controlled host |
| Defects found while authoring | Tests reproduced disabled focus when reopening at 60% and Escape key-up canceling the return layout. Both are fixed. PC inspection exposed a heading covering the plain caption; the size panel is lower, and a reference-seat projection assertion protects that separation. This does not qualify other head positions or authored caption placement |
| Babylon PC texture | Playing calibration video reduced from 100% to 60%; plain-text caption and image appeared together at the reduced size. After native seek, paused time was 0.40597 s before and after Reset to 100%. PGS 1 appeared at 80% after seeking into its active interval. Before the first PGS cue, the existing unqualified-bitmap message appeared; that state is not a caption fidelity pass |
| Three PC texture | Attached the same paused technical video with PGS 1, reduced 100% to 60%, then Reset and Escape restored full size and the main controls. Paused time remained 0.64597 s through the latter sequence. No Jellyfin-delivered track or audible media was exercised in this slice |
| UI operation | PC keyboard actions verified both scenes. A coordinate click in the scrolled workbench did not activate the target; no mouse-pointer pass is recorded. Real controller/hand sizing and input switching remain untested on Quest |
| Local checks | TypeScript passes. Full lint: 98 inherited warnings, zero errors; affected lint passes again after layout refinement. Stylelint passes. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994, with the two inherited bundle-size warnings. Final layout passes the full 439-test run |
| Bundle boundary | Ordinary output contains no new sizing-copy/action markers or room marker. Dependencies and lockfile are unchanged. The controls remain behind the existing experimental build boundary |

PC references: [Babylon text at 60%](../references/images/m2-size-babylon-60.png) and [Three PGS at 60%](../references/images/m2-size-three-60.png). Both show only labelled, original calibration content. They are visual evidence of selected desktop states, not binocular depth, text readability in-headset, timing, colour fidelity or a renderer ranking. Logs remain outside Git in `%LOCALAPPDATA%/JellyXR/screen-size-*.log`.

Additional screen distance/height/tilt, curved presentation, general recentering and persisted preferences remain open under FR-016. ASS resizing has controlled geometry coverage but was not visually rechecked in this slice. Native layer resizing, subtitle classes and all required hand/controller, comfort and sustained Quest evidence remain open at G2; G3/G4 are not advanced.

Documentation validation passes 444 relative links/anchors across 33 Markdown files, 41 unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Screen-placement increment — 2026-09-30

Source: `2379d90127f737300ffcdfae477c8c9a8bc86624`, branch `milestone/m2-screen-placement`, based on `xr` `212ba7e6d0`. Implements the [expanded comparison contract](#expanded-flat-screen-placement-contract--2026-09-30), extending the earlier size-only experiment. G2 remains open.

Screen settings now cycles between size, seat distance, centre height and tilt. Explicit step buttons, disabled range limits, Reset, Back, Return to seat and Exit XR remain in a stable eight-panel workspace. UI/UX Pro Max guidance informs visible focus, disabled states, concrete recovery copy and alternatives to dragging. The comparison ranges are not headset sizing recommendations.

The solid backing, video texture, plain/rich captions, native quad and projection aperture share size and pitch. A per-scene collision source also feeds floor occlusion, teleport clearance, control placement and remote sweeps. Havok replaces the owned box shape on the existing fixed body; Rapier resizes its existing collider. Both move their visible backing with the body. Invalid room, viewer or remote clearance retains the previous placement; an accepted change cancels pending input. The screen remains fixed after adjustment, without moving the viewer or changing playback.

| Check | Actual result and limits |
| --- | --- |
| Controlled regression | 457 tests across 53 files pass, including 18 added cases. Covers bounded steps and reset, rejected placement retention, per-scene isolation, oriented ray/overlap queries, floor obstruction, remote sweep and removal of the old screen obstruction. Existing input/movement recovery tests also pass |
| Actual physics libraries | Both installed WASM engines run the new adapter tests without a headset. Ray hits agree with the oriented query box across translation, positive/negative pitch, reduced size and reset. Old-position and reduced-width misses pass; the original body remains. This does not establish measured device collision cost, comfort or long-session stability |
| Presentation and owner | Real Three geometry and Babylon NullEngine geometry agree for video, plain/rich captions and alpha apertures across sizes and positive/negative tilt. Native transform arguments and lifecycle use a controlled host. Presentation rebuilds once per distinct pose, without play/pause/load, seek or lease release. Artwork drawing is mocked in geometry tests; actual caption fidelity remains separately qualified |
| Babylon PC texture | Keyboard steps reached 80%, seat distance 5.50 m, centre 1.8 m and +10° tilt with the original text cue visible. Further lowering stopped at 1.5 m and showed a room-collision error when 1.4 m was requested. The rejection copy was then clarified to offer size, height or distance adjustment. The technical video remained paused at 0.359806 s across placement and the reset/close sequence |
| Three PC texture | The original PGS 1 cue remained visible at 80%, 5.00 m, 1.9 m and −10° tilt. Reset restored 100%, 6.50 m, 2.0 m and 0°, followed by return to room controls. The video remained paused at 0.599806 s. The fixture used the inherited bitmap `webgpu` backend; neither server-delivered tracks nor audible playback was tested here |
| Interaction boundary | PC keyboard checks only. No new mouse, controller, hand, binocular-depth, native-layer or headset comfort pass. The Quest was absent from ADB at the start of this slice. Headset-dependent gates remain open |
| Local checks | Full test suite and TypeScript pass. Full lint has 98 inherited warnings and zero errors; affected-file lint passes. Stylelint passes. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994 files, with the two inherited bundle-size warnings |
| Production boundary | New screen-action/copy and room markers are absent from ordinary production JavaScript. Dependency versions and the lockfile are unchanged. No production renderer, player replacement or new server interface is introduced |

PC references: [Babylon text with raised tilt](../references/images/m2-placement-babylon-text.png) and [Three PGS with lowered tilt](../references/images/m2-placement-three-pgs.png). These contain only labelled technical content. They demonstrate selected desktop states, not readable headset text, synchronized delivery, colour fidelity or performance rankings. Local logs are in `%LOCALAPPDATA%/JellyXR/screen-placement-*.log`.

Remaining FR-016 work includes general orientation recentering, qualified curved presentation and scoped production preferences. The controls can cover parts of a lowered video while open; the reference screenshots are not a full placement/accessibility qualification. Actual native layers, both required input methods, complete subtitle/media classes and sustained Quest measurements still block G2. G3/G4 are unchanged.

Documentation validation passes 449 relative links/anchors across 33 Markdown files, 41 unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Library-bay increment — 2026-09-30

Source: `14d0b15c26a8676335b5cd0035a596106935f439`, branch `milestone/m2-library-bays`, based on `xr` `4b633a8d67`. Implements the [library bay comparison contract](../04-architecture/asset-pipeline.md#library-bay-comparison-contract--2026-09-30) under FR-015/031. This is independent asset preparation for both disposable candidates; G2 remains open.

Two original graphite cases now stand on the outer portions of the library plinth. Bevelled posts and boards, recessed backs and narrow warm metal edges establish physical depth while retaining the central seated catalogue workspace. There are no invented posters, fabricated media descriptions or decorative controls. The cases contain seven collision boxes each, leaving actual open compartments; their geometry and proxies are shared by both candidates and the Plain room control.

| Check | Actual result and limits |
| --- | --- |
| Asset and provenance | Expanded GLB: 17,892 triangles, five material primitives, zero textures, 1,292,408 bytes. The addition is 2,808 triangles and 202,956 bytes. Repeat generation produced SHA-256 `0f3bdedda1ff174257a478e31c68694c7c8b427472b561e4c8f27bef56b0e10e` both times. Khronos Validator 2.0.0-dev.3.10 returned zero errors, warnings, information and hints. Original GPL-2.0-or-later geometry, no imported assets or dependency changes |
| Geometry and clearance | Actual Three/glTF and Babylon NullEngine/glTF loaders pass vertex/proxy, hash, count, disposal and surface-query checks. Rays hit the inner back, post and board surfaces at matching distances. The original seven room volumes remain unchanged; fourteen case-part volumes are added. Named library/seat destinations remain clear, shelf destinations are rejected, and full catalogue controls fit at the tested 1.3 m and 1.65 m eye heights |
| Remote physics | Both installed Havok and Rapier WASM engines run the same controlled insertion/release sequence. The held remote reaches the compartment without a full-case blocker, drops onto the board and remains stable over the following two simulated seconds. Swept queries stop at the back and shelf surfaces. This checks deterministic fixture behaviour, not actual hands, sustained device physics or arbitrary impact speeds |
| Babylon PC | Keyboard operation reached the library, opened the six-card technical catalogue, closed it, snap-turned 30 degrees right and returned to the seat. The central catalogue stayed clear of the cases; the turned view showed shelf depth. No video was attached or played in this slice |
| Three PC | The equivalent library/catalogue/close/turn/return sequence worked. The explicit Plain room option retained the open compartments, library access and snap turn using the visible collision proxies. No new mouse-pointer, controller or hand pass is claimed |
| Local checks | Full suite: 458 tests across 53 files pass. The final test callback-style cleanup was followed by another passing two-engine physics run. Application and authoring TypeScript pass. Full lint: zero errors and 98 inherited warnings after fixing two callback-return errors introduced in the test; affected-file lint and stylelint pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994 files, with the two inherited bundle-size warnings |
| Bundle boundary | Ordinary production JavaScript contains none of the new case IDs, shell marker or asset hash; ordinary output contains no GLBs. The experiment stays opt-in. Dependency versions and lockfile are unchanged |

PC references: [Babylon case view](../references/images/m2-library-bays-babylon.png), [Three case view](../references/images/m2-library-bays-three.png), [central technical catalogue](../references/images/m2-library-bays-catalogue.png) and [Three Plain room control](../references/images/m2-library-bays-plain.png). These show selected desktop states only. Logs are outside Git in `%LOCALAPPDATA%/JellyXR/library-bays-*.log`.

UI/UX Pro Max was reviewed selectively. The two permitted searches did not provide a verified shelving-layout match; this composition follows the approved Cinema Observatory specification and general consistency guidance. Headset scale/readability, near hand interaction, actual GPU/query cost, baked lighting and compressed surface textures remain open. Production artwork mounting and constrained artwork interaction are separate work. Quest was absent from ADB at this slice's start; no new device evidence, renderer decision or G2/G3/G4 pass is recorded.

Documentation validation passes 456 relative links/anchors across 33 Markdown files, 41 unique requirements, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Grab-tracking recovery increment — 2026-09-30

Source: `7626205f9d738625fb3419d3159c625c8d47ad61`, branch `milestone/m2-grab-tracking-loss`, based on `xr` `bf1ddf031e`. Repairs the shared native input adapter under FR-021/023/031 and the [grab continuity contract](../04-architecture/system-blueprint.md#grab-tracking-continuity-comparison); it does not select an engine or close G2.

The existing adapter checked the grab anchor but could keep moving a held remote after `getViewerPose` returned no valid head pose. Controller squeeze could also start a grab after the last head sample aged beyond the existing 100 ms selection limit. Six new cases exercise controller and hand events: five failed before the repair; the existing stale-head rejection on the hand selection path already passed.

The adapter now uses one recent animation-frame head-position check for pointing, screen clearance and grab startup. A missing/nonfinite head sample cancels pending input and releases the remote before the held-body update. Restoring tracking does not restore the old hold; a new squeeze/pinch is required. Native event handlers borrow the recent sample and never call the animation-only viewer-pose API. No playback, renderer, model or dependency change is included.

| Check | Actual result and limits |
| --- | --- |
| Reproduction | `npm exec vitest -- run src/apps/experimental/xr/input/remoteInput.test.ts` produced five failures before the fix: controller/hand hold survived missing head tracking, both survived a nonfinite head position, and controller grab started from a stale sample. The assertion observed an active grab owner where none was expected |
| Repaired ownership | All ten remote-input cases pass. Lost tracking releases exactly once, clears movement, refuses startup until a fresh sample, stays released on recovery, and permits a fresh action. Event-frame viewer-pose access is set to throw; neither input method calls it |
| Regression | 38 focused selection, remote, recovery and actual-physics adapter tests pass. Full suite: 464 tests across 53 files pass. Existing source removal, hidden-session, joint-loss and physical shelf/recall cases retain their coverage |
| Build and compatibility | TypeScript, full lint (98 inherited warnings, zero errors) and stylelint pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994 files with the two inherited bundle-size warnings. The new input helper/recovery marker is present only in experimental output |
| Evidence boundary | Native events/poses are controlled test objects; actual Havok/Rapier tests separately exercise their installed WASM adapters. No browser or Quest tracking-loss pass is inferred. ADB reported zero attached devices. No fresh media or visual result was needed or claimed for this input-only repair |

UI/UX Pro Max's Dragging Movements guidance was checked: retain recall/button alternatives instead of making recovery depend on another drag. Existing recall and geometry buttons remain in place; there is no new interface copy or decorative control. Local reproduction and check logs are in `%LOCALAPPDATA%/JellyXR/grab-tracking-*.log`. Actual head/controller/hand loss, reacquisition, input switching, near reach and comfort remain EXP-04/AT-27 device work.

Documentation validation passes 460 relative links/anchors across 33 Markdown files, 41 unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Spatial text-size increment — 2026-09-30

Source: `b24aebca57626db7825cd903fb4f409469ef8106`, branch `milestone/m2-spatial-text-size`, based on `xr` `e01d641955`. Implements the [spatial text-size comparison contract](../03-experience/cinema-observatory.md#spatial-text-size-comparison) under FR-017 and EXP-04 in both disposable candidates. No renderer is selected and G2 remains open.

The world-space **Text size** control cycles 100%, 125%, 150% and back to 100%. Requested glyph sizes are retained, complete text wraps, and information panels receive enough height instead of silently shrinking or truncating labels. Rendering, hit testing and placement checks consume the same sized target descriptors. Changing size cancels pending input, rechecks stable placement and preserves logical focus, selected detail and catalogue position. Size lasts for the current scene only; persisted preferences under FR-019 remain future integration work. Video and subtitle geometry are unchanged.

| Check | Actual result and limits |
| --- | --- |
| Text layout | Eight new tests cover all three sizes and four visual states, long fixture titles, 48-character wide-glyph queries, empty results, geometry-error copy, root/floor/recovery controls and the complete keyboard. Controlled canvas metrics check complete text, margins, line separation and requested font size; these are deterministic arithmetic checks, not actual-font or headset readability measurements |
| Geometry and state | Enlarged target rectangles remain separate and fit tested seat/library poses at 1.3 m and 1.65 m eye heights. Shared target geometry passes hit checks; a cycle preserves catalogue page 7–12 and focus. Controlled native controller/hand events activate once and cancel an interrupted press. Forty-six search panel owners stay bounded; typing repaints only the changed field and disposal releases every owner |
| Babylon PC | Keyboard operation cycled sizes, opened the long first technical detail at 150%, returned to the room controls, reset to 100% and reopened the same detail. The full title and technical description remain visible at both sizes. The two saved views compare default and enlarged settings in this build; they are not a previous-build regression baseline |
| Three PC | A fresh candidate started at 100%; keyboard operation selected 150%, opened spatial search and entered 48 wide letters. The limit message and all draft characters remained visible across wrapped lines. Cancel discarded the draft and returned to the previous six-card page with 150% retained. No mouse, actual-controller or hands-only pass is inferred |
| Local checks | Full suite: 472 tests across 54 files pass. TypeScript, full lint (zero errors, 98 inherited warnings) and stylelint pass. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994 files. Both builds retain the two inherited bundle-size warnings. Ordinary JavaScript excludes the new text-size and technical catalogue markers; dependency versions and lockfile are unchanged |
| Device boundary | ADB reported zero attached devices. No media was started during this slice; the visible technical video fixture remained outside the comparison's borrowed-video path. Stereo depth, near reach, full-bank readability, hand typing, changing size while watching and sustained cost still need Quest evidence |

PC references: [Babylon default 100% detail](../references/images/m2-text-babylon-detail-100.png), [Babylon enlarged 150% detail](../references/images/m2-text-babylon-detail-150.png) and [Three 150% full search draft](../references/images/m2-text-three-search-150.png). These are technical desktop states, not production copy or a headset visual pass. Local logs are in `%LOCALAPPDATA%/JellyXR/text-size-*.log`.

UI/UX Pro Max's Text Reflow and Spacing and Essential Text Truncation guidance informed complete wrapping and additional layout space. The unrelated top search result was not used. No fabricated titles, testimonials or usage claims were added. AT-13/17 and G2/G3/G4 remain open.

Documentation validation passes 467 relative links/anchors across 33 Markdown files, 41 unique requirements, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Native sleep scheduling increment — 2026-09-30

Source: `1aac596f70ba9b4fbeac298a82d9fd9e7ab93d9b`, branch `milestone/m2-idle-physics`, based on `xr` `31647808c1`. Implements the [idle simulation comparison contract](../04-architecture/system-blueprint.md#idle-simulation-comparison) for FR-031 and EXP-03/04. Both candidates previously called their physics step while the native remote was asleep. The new shared scheduler skips those calls and clears accumulated time, while rendering, input and video continue. It does not select an engine or close G2.

Only a confirmed native sleep state allows suspension; no position/velocity threshold freezes an awake or jittering body. A held remote always keeps stepping. Recall/release and successful static-collider revisions wake the body, and recovery resets the clock. The existing four-step catch-up cap remains. The comparison currently has one dynamic body, enforced by the room-fixture test; additional dynamic objects must join the activity check before this policy can cover them.

| Check | Actual result and limits |
| --- | --- |
| Shared clock policy | Three new scheduler cases cover awake stepping, the four-step cap, confirmed sleep, idle time discard, suspension and delayed collider-revision wake. Two-hour timestamp jumps are synthetic clock inputs, not 120-minute viewing runs |
| Actual installed physics | Both existing WASM adapter tests now also reach native sleep, skip 144 subsequent frames without changing the pose, recall and resettle, continue stepping while held, release after a suspended interval without catch-up, then wake for a changed collider-revision identity. Original wall-stop, recall and shelf cases still pass. The revision identity is controlled; it does not emulate every possible scene mutation |
| Havok compatibility seam | Babylon 9.27.1 has no public body sleep-state query in the inspected declarations. A small guarded adapter reads its current native body handle and calls Havok 1.3.14 activation-state functions. Missing handle, failed result or thrown query keeps simulation active. A query failure does not disable native wake; the installed-library test verifies that recovery too. This private handle seam must be retested on updates |
| Rapier observation | The installed 0.20.0 body uses its public `isSleeping()` and `wakeUp()` operations; existing mutation calls retain their wake flags. No custom sleep thresholds or dependency changes are introduced |
| Babylon PC | The remote settles at roughly 0.717 m and the counter stays at 39 fixed steps while rendered/idle frames increase. Recall advances it to 107, then it stops again after settling. The silent original video texture continues playing with physics idle. The final helper change is also reloaded and this ordinary path repeated |
| Three PC | Native settling stops at 60 fixed steps; Recall advances to 120, then returns to idle. A spatial Smaller action changes the screen to 90%, advances the counter to 156 and returns to idle while the technical video remains active. This is selected desktop button/keyboard evidence, not actual hands, controllers or native-layer playback |
| Local checks | All 475 tests in 55 files pass. TypeScript, stylelint and full lint pass with zero errors and 98 inherited warnings. Ordinary production/ES5 passes 984 files; final experimental production/ES5 passes 994 files. Both retain two inherited size warnings. The final fallback adjustment is covered by another full test run, TypeScript, affected lint and experimental build |
| Boundary | Ordinary JavaScript excludes the new scheduler diagnostics. No player ownership, account, asset or dependency version is changed. ADB returned zero attached devices. GPU, compositor, decoding, Quest heat/battery, long-session resource use and actual input qualification remain open |

PC references: [Babylon video preview](../references/images/m2-idle-physics-babylon.png), [Three screen-adjustment preview](../references/images/m2-idle-physics-three.png) and [Three native-sleep counters](../references/images/m2-idle-physics-counters.png). Counts are observations of these runs, not equal-work benchmark rankings; native sleep timing and uncontrolled PC scheduling differ. The tests initially assumed an exact floating-point frame boundary after a long jump; the fixture now uses an exact 15 ms observation interval while physics retains its 1/72-second steps. No application timing policy was loosened to make the assertion pass.

UI/UX Pro Max's two targeted feedback searches did not provide a verified match for these experiment counters. The diagnostic uses general clear-status guidance as a fallback: actual Active, Idle or Suspended state, executed steps and skipped idle frames beside the existing timing limitation. It introduces no animation, success claim or fabricated metric. Source inspection and the [Rapier sleep documentation](https://rapier.rs/docs/user_guides/javascript/rigid_body_sleeping/), checked 2026-09-30, support the API choice; actual installed-engine results above establish this slice's behaviour. Local logs are in `%LOCALAPPDATA%/JellyXR/idle-physics-*.log`.

Documentation validation passes 485 relative links/anchors across 33 Markdown files, 41 unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Plain-text caption settings increment — 2026-09-30

Source: `ed372df95dc51e14837c20a024c1d387b3c86eb7`, branch `milestone/m2-caption-settings`, based on `xr` `cc7d7541b6`. Implements the [caption settings comparison](../03-experience/cinema-observatory.md#plain-text-caption-settings-comparison) for FR-012 and EXP-02/04. Screen settings now opens a scene-rendered Captions view in each candidate: size 100/125/150%, Opaque/75%/None backing, Upper/Centre/Lower placement, Reset, Back and recovery actions. Settings last for this scene; account persistence and production track selection are unchanged.

Plain-text glyphs enlarge inside a fixed transparent envelope; the visible backing follows the actual line count. Outlined text remains when backing is disabled. Overflow and renderer warnings retain an opaque fallback message. Settings changes update the existing subtitle texture or mesh without replacing the borrowed video or native layer. ASS/bitmap keep their authored canvas layout. The former fixed caption geometry was removed from `screenFixture.ts`; the shared caption geometry now owns the placement used by both candidates.

| Check | Actual result and limits |
| --- | --- |
| Cue and artwork ownership | Four added artwork cases cover a paused cue, style invalidation, no upload for placement-only changes, no-backing outline, clearing, opaque warnings and complete five-line layouts at every size. Canvas metrics are controlled; these are not actual-font or headset measurements |
| Input and geometry | Four added interaction cases check retained settings through Back/resize, reset isolation, interrupted activation and single native controller/hand event activation. Expanded layout checks cover all three UI text sizes, tested seated/library positions, complete labels and matching bounds. Native poses/events are test objects, not real input qualification |
| Actual renderer objects | Nine existing installed-renderer cases now cover each placement at 60/80/100% screen size and -15/0/15° tilt. Both retain the same video objects and subtitle textures, keep rich-canvas positions unchanged, use alpha without caption depth writes, and dispose their owned resources. Babylon uses NullEngine for these geometry tests; GPU output is checked separately on PC |
| Babylon PC | Size/backing/position changes visibly update the technical text. One paused-cue check retained exactly 3.735638 seconds through reset to 100%/Opaque/Upper. After the final geometry consolidation, a reload repeated default versus 150%/None/Lower on a paused first fixture cue. No server media or audible-track result is implied |
| Three PC | The same paused 3.735638-second cue attaches without restarting. 125%/75%/Centre changes are visible; Hide clears the caption and Show restores it. Switching to the original ASS fixture and resetting plain-text settings retains the authored ASS surface and paused time. This is one selected technical transition, not a full format matrix |
| Visual correction and limits | The initial centre settings heading covered the cue, so the bank moved beside the default screen. The final PC views show the cue and controls together. Small text appears more minified/rough in Babylon at the normal desktop preview size; equal pixel/filtering review and actual-headset readability remain open. Full-page screenshot capture changed the viewport-dependent canvas height and clipped the bank, so the saved references use the normal viewport |
| Local checks | 483 tests across 56 files pass. TypeScript, stylelint and full lint pass with zero errors and 98 inherited warnings; affected lint was repeated after the final geometry change. Ordinary production/ES5 passes 984 files; final experimental production/ES5 passes 994 files, both with two inherited size warnings. An initial generic `escheck` after the experimental build checked ordinary output; the final run uses `escheck:xr-experiments` against the actual experiment directory |
| Boundary | Ordinary output excludes the new caption-heading marker; dependency versions and lockfile are unchanged. ADB reported zero authorized devices. Native layer alpha, both-eye composition, timing after server seeks/track changes, rich-track styling controls, near reach, all screen/viewer poses, persisted preferences and G2/G4 remain open |

UI/UX Pro Max's Input Labels result informed visible setting names and values. The spatial controls retain focus/press outlines, explicit reset/back routes and button alternatives. No marketing copy, invented media or unsupported success metric was added. Logs: `%LOCALAPPDATA%/JellyXR/caption-*.log`.

PC references: [Babylon default captions](../references/images/m2-caption-babylon-reset.png), [Babylon 150% unbacked lower captions](../references/images/m2-caption-babylon-150-lower.png), [Three 125% translucent centre captions](../references/images/m2-caption-three-125-centre.png). These show selected desktop states and do not establish the final cinema's visual quality or headset compatibility.

Documentation validation passes 492 relative links/anchors across 33 Markdown files, 41 unique requirement definitions, all P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed; whitespace checks pass.

## Canvas minification filtering increment — 2026-09-30

Source: `f4a670af87e9dc77f3eb12cc068cba6d708987a5`, branch `milestone/m2-text-filtering`, based on `xr` `4f608499b4`. Implements the [canvas filtering comparison](../03-experience/cinema-observatory.md#canvas-filtering-comparison) for FR-012/014/017 and EXP-02/04. The normal PC preview reproduced rough, broken small strokes in Babylon's room controls. Equal Three panels used the same artwork dimensions and physical geometry with smoother strokes. The inspected candidates share a 70-degree camera and a 1:1 desktop render scale; no camera, font, canvas-resolution or geometry change was made in this repair.

Babylon's control, floor-marker and plain/rich subtitle DynamicTextures explicitly disabled mipmaps. Three's CanvasTexture defaults use linear mipmap filtering. A shared Babylon canvas factory now enables mipmaps and trilinear sampling when the context permits the original dimensions, including on rich-canvas replacement. Contexts requiring power-of-two mipmap dimensions use bilinear sampling without mipmaps, so construction cannot round, resize and clear authored artwork. This is a comparison repair; production text strategy and G2 remain undecided.

| Check | Actual result and limits |
| --- | --- |
| Reproduction | The saved normal-viewport Babylon/Three references reproduce the small-label difference with identical room, camera, 100% text and default screen geometry. The two installed-renderer regression cases first failed: mipmap generation was false on the permissive context, and the restricted context retained sampling mode 3 instead of explicit bilinear mode 2 |
| Regression seam | Both cases now pass using actual Babylon meshes, materials and textures. They cover all current control textures, floor marker, a 1600×600 caption envelope, rich-canvas replacement from 1280×720 to 1920×1080, disposal and 100 unchanged updates without upload or allocation. Canvas drawing is controlled and the context capability is simulated in NullEngine; this does not qualify actual WebGL1 GPU output |
| PC repair | Reloading the repaired Babylon scene at the same normal viewport produces smoother small-label strokes, similar to the unchanged Three reference. The labels remain small at this preview height; this is visual inspection rather than a calibrated pixel-quality score or renderer ranking |
| Paused text and ASS | Selected plain-text size/backing changes preserve the paused 6.08496-second technical-video position. A 150% unbacked text cue remains visible. Switching to the real-libass ASS fixture retains authored position/style and the same paused time despite those plain-text settings. Bright-frame contrast and alpha-edge quality still need actual-headset review |
| PGS | The inherited webgpu bitmap backend starts and attaches. At the initial 6.08496-second gap no bitmap is visible; a deliberate native-video scrub to paused 1.204041 seconds displays original PGS 1 in the source and Babylon texture. This selected fixture seek is not server-delivery or synchronization qualification |
| Local checks | 485 tests across 57 files pass. TypeScript, stylelint and full lint pass with zero errors and 98 inherited warnings. Ordinary production/ES5 checks 984 files; experimental production/ES5 checks 994 files. Both builds retain two inherited bundle-size warnings. Dependency versions/lockfile are unchanged; ordinary JavaScript has no spatial caption or floor-marker strings |
| Boundary | ADB reported zero authorized devices. Mipmap memory/upload overhead, moving-view shimmer, actual binocular clarity, native layers, real media transitions, hands/controllers and G2/G4 remain open. Mipmap generation follows the existing dirty upload path; this slice measures neither sustained GPU cost nor all real subtitle renderers' redraw cadence |

References: [Babylon before](../references/images/m2-filtering-babylon-before.png), [Babylon after](../references/images/m2-filtering-babylon-after.png), [unchanged Three](../references/images/m2-filtering-three-reference.png), [enlarged plain text](../references/images/m2-filtering-babylon-caption.png), [authored ASS](../references/images/m2-filtering-babylon-ass.png) and [decoded PGS](../references/images/m2-filtering-babylon-pgs.png). All are original technical fixtures at the normal viewport, with no private media or browser chrome. Full-page captures were avoided because they change the viewport-dependent canvas size.

The PC loop uses the development route, default Babylon scene, a 0.65-page downward scroll and normal-viewport capture; the same controls are inspected after reload. `npm test -- src/apps/experimental/xr/candidates/canvasFiltering.test.ts` reproduced the resource-policy failures before the fix and now passes. Source inspection covers Babylon 9.27.1's DynamicTexture constructor and dynamic-texture upload extension, and Three 0.186.0's CanvasTexture/Texture defaults. Vendor references checked 2026-09-30: [Babylon DynamicTexture](https://doc.babylonjs.com/typedoc/classes/BABYLON.DynamicTexture) and [Three CanvasTexture](https://threejs.org/docs/pages/CanvasTexture.html). No vendor support statement is substituted for device evidence.

UI/UX Pro Max's Contrast Readability guidance supports retaining the existing text/surface palette and caption backing choices. Texture sampling follows installed-source inspection and this visual experiment; web font-size rules are not treated as angular XR sizing. The diagnosis changed sampling alone, retained the shared canvas dimensions and camera, and added no debug instrumentation. Logs: `%LOCALAPPDATA%/JellyXR/text-filtering-*.log`. AT-10/13/17 and all dependent device gates remain open.

Documentation validation passes 502 relative links/anchors across 33 Markdown files (29 package documents plus four repository guidance/patch documents), 41 unique requirements, all P0/work/scenario mappings, six business goals, 11 work packages, 17 acyclic dependency edges and 27 acceptance scenarios. Diagrams are unchanged; whitespace checks pass.

## Remote model increment — 2026-09-30

Source: `5444f14138f05c54645abe8d9bd5a0715a38eaca`, branch `milestone/m2-remote-model`, based on `xr` `c53b7a2d963246e3ec56c821ac8cab485f793a15`. Implements the [remote model comparison contract](../04-architecture/asset-pipeline.md#remote-model-comparison-contract--2026-09-30) under FR-015/031, D-27 and EXP-03/04. W-02 comparison and W-07 asset preparation advance; AT-24/27 and G2/G3/G4 remain open.

Both candidates replace the rendered remote box with the same original bevelled graphite shell, opaque grip panel, underside ribs and restrained warm trim. The [recipe](../../../scripts/jellyxr/buildObservatoryRemote.ts), manifest and collision resource contain no imported source asset or texture. Three scalar PBR primitives contain 2,412 triangles in a 176,248-byte GLB; visible bounds are approximately 0.078 × 0.0337 × 0.188 m. SHA-256: `7b35b1c438383b8f0463b25876262da54f421007ab676bdb1ed01e3238b3d048`. Original assets are GPL-2.0-or-later. Normal/roughness detail, reflections and final playback-control design remain future work; no inactive buttons, fake display or invented branding is added.

The existing centred 0.08 × 0.035 × 0.19 m collision proxy, 0.18 kg mass, damping, grab owner, recall, tracking-loss policy and sleep scheduler remain authoritative. There is still exactly one dynamic remote body. Three hides only the proxy material; Babylon hides only its proxy surface, keeping model children and the body enabled. Each loader parents the model to that body, locates held feedback by its named trim material and owns only its imported resources. Missing feedback or a load failure retains the visible proxy with a controlled diagnostic. Held feedback uses the same linear warm emissive colour and restores the passive material after release; the existing control bank still owns playback actions.

| Check | Actual result and limits |
| --- | --- |
| File and source validity | Repeated `npm run assets:remote` generation produces identical bytes/hash. Khronos Validator 2.0.0-dev.3.10 reports zero errors, warnings, infos and hints. Every vertex fits inside the unchanged proxy; the GLB has no textures or external resources. File validity does not qualify headset scale or appearance |
| Actual loader geometry/materials | Four new tests use the installed Three GLTFLoader and Babylon NullEngine loader. They verify counts, normals, scalar PBR values, named feedback and matching linear colour. Translated/rotated body parents at three pitches retain model placement; actual scene rays hit the visible model at 0.283 m from the controlled local ray origin in both engines |
| Ownership and recovery | Tests cover missing proxy/material, failed loading, restored fallback visibility, held/released feedback and idempotent cleanup without disposing the external body proxy. Existing actual Havok/Rapier WASM tests retain hold, wall-stop, recall and shelf placement coverage. The existing sleep tests remain in the full suite; no new native input or device result is inferred |
| Babylon PC | The authored model is reported loaded without the fallback diagnostic. The remote settles at displayed height 0.717 m with native sleep and 39 fixed steps. HTML Recall advances the counter to 107 and the remote returns to the same displayed height/native sleep. These are selected desktop counters, not a calibrated simulation, timing or hand-interaction qualification |
| Three PC | The same asset is reported loaded. Initial settling reaches native sleep at 60 fixed steps and displayed height 0.717 m. HTML Recall advances the counter to 120 before native sleep returns at the same displayed height. No new media is attached or started in either comparison |
| Visual observation limit | Saved normal-viewport views record candidate selection and asset-loading metadata with partial room geometry. The default fixed PC camera does not provide a clear close-up of the settled remote; a deliberate floor move still leaves the control bank occluding it. Close-range bevel/material appearance, binocular scale, finger contact, held feedback visibility and seated reach remain uninspected device tasks |
| Local checks | All 508 tests across 59 files pass. Application and offline-authoring TypeScript, full lint (zero errors, 98 inherited warnings) and stylelint pass. Both production builds pass with two inherited size warnings: ordinary ES5 checks 984 files, experimental ES5 checks 994. The final loading-copy change also passes affected lint and both builds |
| Bundle boundary | Ordinary production output contains zero GLBs and none of the checked new remote markers. Experimental output contains the remote GLB exactly once with the source hash. Dependency versions and lockfile are unchanged; no new account, player owner or runtime API is introduced |
| Device boundary | ADB reported zero authorized devices at this slice's start. Real controller/hand grabs, switching/tracking loss, near occlusion, close-range appearance, GPU/load/disposal cost and sustained input/physics qualification still need Quest evidence. No engine is selected and no milestone gate closes |

An intermediate focused Vitest invocation ended with `ERR_IPC_CHANNEL_CLOSED` without an assertion result. Its cause is unclassified; a one-worker focused rerun passes all four new cases and the normal full suite then passes all 508. An earlier Babylon warning exposed container parenting before `addAllToScene`; the helper now adds its own hierarchy first, then parents it to the external body, and the actual-loader tests pass without those warnings. The first output inspection looked in ordinary `dist` after an experimental build; the corrected `.jellyxr-experiments` directory and `escheck:xr-experiments` pass. That inspection mistake is not a build defect.

UI/UX Pro Max's verified Dragging Movements result supports keeping button/keyboard recovery available. An unrelated first search result was discarded. XR dimensions, geometry and physics follow the existing fixture and separately recorded reasoning; no screen-space guideline is treated as real-hand qualification. Technical content stays labelled and private media is absent.

Loading references: [Babylon](../references/images/m2-remote-babylon-loading.png) and [Three](../references/images/m2-remote-three-loading.png). These are desktop loading references, not close-range model-quality views. Local evidence is outside Git in `%LOCALAPPDATA%/JellyXR/remote-*.log` and `remote-gltf-validation.json`. No diagrams changed.

Documentation validation passes 524 relative links/anchors across 33 Markdown files (29 package documents plus four repository guidance/patch documents), 41 unique requirements, all P0/work/scenario mappings, six business goals, 11 work packages, 17 acyclic dependency edges and 27 acceptance scenarios. Whitespace checks pass.

## Deliberate remote release increment — 2026-09-30

Source: `49c651cc37230888ec1e534d042c6db5663e20a1`, branch `milestone/m2-remote-release`, based on `xr` `a26d9e5c27f7641b81c1dfe62079b94971f24ed7`. Implements the [deliberate release comparison contract](../04-architecture/system-blueprint.md#deliberate-remote-release-comparison) under FR-021/023/031 and EXP-04. This bounded W-02 increment advances the physical interface; AT-17/27 and G2/G3/G4 remain open.

Previously, every remote release returned to a dynamic body with zero velocity. A tracked, deliberate controller squeeze end or hand pinch end now releases with the body's recent collision-constrained fixed-step motion, capped at the existing 3 m/s vector speed. Samples older than 100 ms and speeds below 0.01 m/s are cleared. Blocked motion cannot become a through-wall fling; a stationary sample replaces old momentum. Beginning a new grab clears prior release history. Nonfinite body samples cancel ownership before entering native velocity. Input-event frames still borrow a recent head sample rather than calling the animation-only viewer-pose API.

Cancellation retains its existing separate path: head/grip/joint loss, removed input, hidden/end/reset, movement, Recall and disposal produce no inherited throw momentum. A release event needs a visible session, recent valid head sample and finite current grip or both pinch joints. Source ownership prevents an unrelated end event from dropping another hold. Both adapters return to dynamic motion, explicitly stop angular velocity, apply the same linear vector and wake through their existing mechanisms. Grab orientation remains frozen; hand-relative rotation and angular throwing are unfinished work, not silently removed requirements.

| Check | Actual result and limits |
| --- | --- |
| Initial feature tests | The first focused run has eight expected failures: six tests lack the deliberate-drop interface and two controller/hand end-event tests receive no velocity. Nineteen other cases pass. This establishes the missing feature, not a measured device defect |
| Shared motion policy | Seven new cases cover recent bounded motion, diagonal vector cap over four catch-up steps, blocked-wall release, stale samples, stationary replacement/reacquisition, source ownership/cancellation and nonfinite body samples. Numeric caps and freshness are experimental safeguards, not measured comfort thresholds |
| Controlled native events | Ten new cases cover controller and hand gesture ends, absent grip/joints, hidden interruption, stale head samples and invalid grip/joint positions. Deliberate ends alone receive momentum; canceled releases remain zero and cannot replay after cleanup. Event-frame viewer-pose access is forbidden by the fixture |
| Actual Havok and Rapier | Both installed WASM adapter tests now throw at each side wall with a 3 m/s release and inspect every one of 720 subsequent 1/72-second steps for room/floor containment. A downward 3 m/s release onto a thin library shelf stays above its board over 360 steps. Later positions remain settled; angular velocity is explicitly zero at release, cancellation and Recall clear linear velocity, and existing hold/sleep/wake/recovery tests still pass. These are selected deterministic impacts, not all rotated contacts or ten seconds of real headset viewing |
| Local checks | All 525 tests across 59 files pass. TypeScript, stylelint and full lint pass with zero errors and 98 inherited warnings. The added duplicated test stepper initially fails lint; one shared helper removes the duplication, the actual-WASM tests are repeated and TypeScript/full lint pass. Ordinary production/ES5 checks 984 files; experimental production/ES5 checks 994, each retaining two inherited size warnings. The later copy-only follow-up passes affected lint, fresh watch type checking and both production checks again |
| Fresh development process and PC | The live watcher retains TS2307 for two existing remote helpers while fresh standalone TypeScript and production checks pass. Stopping that owned process and starting the same loopback command clears its errors; a fresh compile reports no TypeScript errors. The exact watch-state cause is unclassified. Both PC candidates then load the original assets and reach native sleep at displayed height 0.717 m; Babylon reaches 39 fixed steps, Three 60, and HTML Recall advances Three to 120 before sleep returns. No actual grab, throw or media is started in this PC check |
| Connected device setup | One authorised Quest 3 is present. Client/server USB reverse mappings are restored and listed; Android/build and active Browser package match the [M1 inventory](m1-readiness.md). Client host HTTP returns 200 and public Jellyfin information reports 10.11.4. These probes do not establish immersive entry, video, hand input, inspector or performance success |
| Boundary | No new dependency/version, model, account, playback owner or public API is introduced. No actual controller/hand throw, seated reach, subjective motion, arbitrary collision, angular behaviour or sustained Quest result is claimed. A pending owner observation remains distinct from these controlled tests |

UI/UX Pro Max's verified Dragging Movements result supports retaining existing button/keyboard Recall and placement alternatives. It does not determine throw speed, XR reach or hand tracking. No new decorative controls, fabricated content or private media is added. Local logs remain outside Git under `%LOCALAPPDATA%/JellyXR/remote-release-*.log`.

The copy-only follow-up `0ef204b9c1e855fbc61492181d115ba0b6f82a9c` corrects the workbench's outdated statement that throwing is absent. [Before guidance](../references/images/m2-release-guidance-before.png) and [after guidance](../references/images/m2-release-guidance-after.png) are normal-viewport PC references; they show the changed explanation, not physical throw behaviour. Ordinary output has zero GLBs and zero new release-guidance markers; experimental output contains that guidance once. The lockfile hash is unchanged at `883a2e2d1bef285bf7abdc98547b16c778640c4b2d16fa8a64efe73c51bbb485`.

Documentation validation passes 535 relative links/anchors across 33 Markdown files (29 package documents plus four repository guidance/patch documents), 41 unique requirements, all P0/work/scenario mappings, six business goals, 11 work packages, 17 acyclic dependency edges and 27 acceptance scenarios. Diagrams are unchanged; whitespace checks pass.
