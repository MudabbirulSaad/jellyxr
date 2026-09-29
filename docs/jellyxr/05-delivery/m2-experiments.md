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

1. Attach the inherited active media surface through a narrow borrowed bridge; compare media layer and texture paths with explicit subtitle composition and lifecycle ownership.
2. Add equal world-space target/control, controller/hand, grab/teleport/snap and tracking-loss fixtures. Prove all required operations on the actual Quest.
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

Source revision: 42b56f1c99, based on xr dc18e92a06. Implements part of FR-031 / EXP-04; AT-27 remains open.

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
