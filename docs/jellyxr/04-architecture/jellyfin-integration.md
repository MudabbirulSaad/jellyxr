# Jellyfin integration contract

Status: source-informed proposed reuse contract. Updated: 2026-09-29.

No new server endpoints are introduced. Existing SDK request/response types and server policies are authoritative. Names below are inspected integration points, not a replacement API specification.

## Pending subtitle creation

The inherited player remains the renderer owner. Destroying or replacing a custom canvas subtitle invalidates pending ASS/PGS/VobSub creation before disposal. Every import/configuration/font continuation and scheduled resize must confirm that its request still owns the slot. Late callbacks from an older renderer cannot resize a replacement, clear its presentation, finish the replacement's loading token or report an error against its playback. A request generation and playback-options identity guard creation; bitmap renderer identity additionally guards resize work. Stale work may settle only its own loading token. This boundary does not claim that disposal cancels work already running inside third-party renderers; their asynchronous initialization and GPU cleanup need separate qualification.

## Existing interfaces

| Capability | Evidence / proposed use | Required behaviour |
| --- | --- | --- |
| Endpoint and session | ConnectionManager, ServerConnections and ApiProvider | Preserve scheme, authority, port and base path; react to sign-in/out and server changes |
| Account login | Existing login controller uses authenticateUserByName | Reuse authenticated identity; no duplicated password store |
| Quick Connect | useQuickConnectEnabled and existing login/authorization flows | Check enabled state; distinguish authorizing another client from signing this client in |
| User and library | Existing SDK/query layer and user context | All requests use current server/user; invalidate scoped results on switch |
| Playback negotiation | getMediaInfoApi(api).getPostedPlaybackInfo in playbackmanager.js | Send current device profile and selected item/source/track/position options; consume returned media sources and PlaySessionId |
| Progress | reportPlaybackStart, reportPlaybackProgress, reportPlaybackStopped through the current playback owner | Preserve one session reporter and server-recognized positions |
| Stream/subtitle delivery | HTML video player with HLS and subtitle renderers | Reuse source selection and track lifecycle; explicitly bridge presentation into XR |
| Events | Existing connection/player event infrastructure and server WebSocket usage | Subscribe once, handle reconnection, dispose XR listeners on exit |

Source locations are linked in the [upstream assessment](upstream-assessment.md). All new API interactions must follow the inherited SDK convention; existing legacy adapters are integration constraints, not a reason to create new handwritten HTTP wrappers.

## Playback data flow

~~~mermaid
sequenceDiagram
    participant Viewer
    participant UI as JellyXR UI
    participant Owner as Existing playback owner
    participant Server as Jellyfin
    participant Media as Media player
    participant XR as XR presentation
    Viewer->>UI: Play or Resume
    UI->>Owner: Selected item and preferences
    Owner->>Server: Playback info with device profile
    Server-->>Owner: Media sources and session information
    Owner->>Media: Start selected delivery path
    Media-->>Owner: Ready / playing / error events
    Owner->>Server: Playback lifecycle reporting
    UI->>XR: Enter immersive presentation
    XR->>Media: Bind active media through agreed bridge
    Viewer->>UI: Pause / seek / track selection
    UI->>Owner: Existing playback command
    UI->>XR: Exit
    XR-->>Media: Release borrowed presentation resources
~~~

The order of immersive activation and media readiness must respect user-activation requirements; EXP-01 must validate both entering from active playback and starting a film while already in XR. The diagram is a responsibility flow, not a promise that every asynchronous step can precede a session request.

## Media and subtitle contract

The renderer must not infer support from file extension alone. Container, codec/profile, audio, subtitles, transport and server policy affect the chosen path. Preserve direct play, direct stream/remux and transcoding through negotiation.

Text tracks rendered by the browser and DOM/Canvas subtitle overlays may not accompany video into an XR layer. Test text, ASS/SSA and bitmap fixtures; select an explicit in-XR renderer or supported server burn-in fallback. Burn-in may prevent appearance/placement customisation and must be explained to the viewer. Never claim HDR or multichannel output from container metadata alone.

## Identity and preferences

The server remains authoritative for permissions and progress. XR screen/comfort preferences are proposed local client data scoped by server identity, user and viewing device. Switching accounts must clear observable private state; an anonymous default may be retained separately.

Use the audited inherited session-storage mechanism. A persisted token remains sensitive; "no password storage" does not mean session storage is harmless. Do not export authorization headers, tokens, signed URLs or Quick Connect secrets.

## Errors and open integration work

Handle server unreachable, unsupported server version, unauthorized user, denied playback, no compatible source, lost stream, absent subtitles and XR resource failure as distinct known cases. A generic browser network exception may not expose its underlying CORS/TLS cause; diagnostics must not fabricate certainty.

EXP-01/02 resolve private video-element access, layer/HLS interoperability, subtitle transfer and progress continuity. EXP-05 resolves separately served client networking. The exact supported server range is recorded only after the SDK minimum and test fixtures are identified.

Sources: [S02](../references/glossary-sources.md#s02), [S05](../references/glossary-sources.md#s05), [S12](../references/glossary-sources.md#s12), [S13](../references/glossary-sources.md#s13).

## M2 experimental presentation seam

The [M2 evidence](../05-delivery/m2-experiments.md#borrowed-media-contract-increment) records a narrow getter added to the existing HTML video player. It exposes the active element for borrowed frame presentation only. The playback manager still owns play/pause/seek, queue, track negotiation and progress. Experimental leases invalidate on owner/source changes and dispose only their observers; compositor attachments dispose only their own layers.

Both comparison renderers now use this seam. The experiment-only overlay preserves the ordinary video route, because the inherited Page/view-hide lifecycle can stop video on navigation. A desktop run borrowed F-01's active video in both texture paths, paused/resumed through the existing owner and returned to the ordinary player without a competing active video. Subtitle composition, native layers and actual-device transitions remain unqualified. Do not use a renderer helper that changes the borrowed video's CORS, source, autoplay, mute, loop or lifecycle without a reviewed adapter and evidence.

The EXP-02 text increment reads currently active native text cues and the player's existing custom-text elements into a screen-anchored plain-text comparison panel. The playback owner retains cue timing, offsets and track selection; the experiment does not fetch tracks or change their modes. Seeking clears the panel until the owner supplies current cues. Unavailable ASS/bitmap renderers and plain-text overflow display an in-scene warning; the native media-layer path explicitly states that separate captions are not composed. Plain-text comparison does not preserve authored typography, regions or karaoke; those cases remain G2 blockers until a faithful renderer or tested burn-in path exists. Caption contents are transient and must not enter diagnostics or evidence files. See the [text experiment evidence](../05-delivery/m2-experiments.md#text-subtitle-comparison-increment--2026-09-30).


### ASS canvas comparison boundary

The EXP-02 comparison now borrows the installed libass-wasm 4.2.4 renderer's existing 2D canvas. Preserve the entire authored frame, transparency and coordinates on a plane aligned with the video content rectangle. Do not start another renderer for a real Jellyfin track, fetch another track, change timing/offsets or dispose the owner's canvas. Read the active renderer each frame so track replacement/off does not retain old imagery. Seeking and source invalidation hide the borrowed presentation. The renderer's render-ahead state may identify unchanged frames; unknown rendering modes must not reuse a speculative revision.

Use an original, labelled ASS script on the existing silent technical clip to test placement, colour, animation and cue gaps with the inherited library. That isolated fixture owns its renderer and cleans it up; it is not server-delivery evidence. Keep a visible ordinary-player recovery message for unavailable, excessive or unreadable canvas output. Comparison limits are 4096 pixels per dimension and 8,847,360 pixels total; this bounds allocation without silently scaling captions. Actual device cost, fonts, synchronization and display quality remain G2 questions.

Bitmap capture needs a distinct experiment. Installed libbitsub 1.11.0 can use a GPU canvas without a preserved WebGL drawing buffer, so a later canvas copy cannot be assumed faithful. Retain the explicit bitmap warning until capture timing/backend and clearing have been demonstrated. Native media-layer subtitle composition remains separate work.

Evidence: [ASS canvas comparison](../05-delivery/m2-experiments.md#ass-canvas-comparison-increment--2026-09-30). The installed renderer source establishes the seam; desktop fixture observations do not qualify server-delivered ASS or headset output.

### Bitmap capture experiment boundary

Before exposing real bitmap tracks, test an original PGS stream through the installed libbitsub 1.11.0 renderer. Its synchronous `stats` event follows each render/clear attempt within the renderer's animation callback. Copy its canvas into an owned 2D snapshot at that point, then let the XR comparison sample the stable copy. Record the actual chosen backend and clear gaps, seeks and track-off; do not assume a later GPU-canvas read is preserved. The fixture may own its renderer, while real Jellyfin bitmap tracks remain under the existing unsupported warning until a lifecycle-safe subscription and initial-frame strategy are proven. No debug events, cue contents or private sources enter reports.

The [PGS fixture evidence](../05-delivery/m2-experiments.md#pgs-capture-fixture-increment--2026-09-30) records actual-parser and PC webgpu-backend observations. WebGL2/Canvas2D bitmap capture, VobSub and real-player subscriptions remain unqualified; the XR renderer baseline remains WebGL.

### Bitmap consumer lifecycle

The next integration comparison acquires a bitmap-presentation consumer when the borrowed video lease first reads subtitles. Video-only media-layer leases do not acquire it. Allocate and copy only while at least one consumer exists. Capture synchronously on the active renderer's post-render event, reject late events from replaced renderers, and release snapshot storage on last-consumer release or track removal. Read the latest snapshot without retaining an old track. Errors remain redacted and cannot escape into the owner's render loop.

For attachment during a paused cue, request one redraw through the installed renderer's existing `updateCanvasSize` path. Source inspection shows that this recomputes its existing video bounds and invalidates the render index without playing, seeking or changing subtitle settings. The next owner frame produces the snapshot. Do not toggle settings to force a redraw: `setDisplaySettings({})` deliberately does nothing when values are unchanged. Test acquisition, replacement, cancellation and release with the original PGS fixture before making any server-delivery or device claim.

The video texture must also upload an already available paused frame on attachment. Installed Three 0.186.0 otherwise waits for its first video-frame callback in browsers supporting that API. Mark the initial texture for upload after the presentation coordinator has verified frame readiness; never advance playback to obtain a frame. Subsequent frames remain observed by the engine and disposal cancels only its own callback.

The [consumer bridge evidence](../05-delivery/m2-experiments.md#bitmap-consumer-bridge-increment--2026-09-30) records the implemented player seam, unit lifecycle checks and both PC paused-attachment observations. Server-delivered bitmap tracks remain unqualified; a blank observation during fixture replacement keeps replacement/initial-load latency open. The earlier fixture-only boundary above records the order of investigation, not the current set of source interfaces.

### Disposed renderer startup

Disposal is terminal for the owned bitmap renderer and its backend. Pending WASM, initialization yields, subtitle loading and GPU setup must not recreate a canvas, temporary surface, GPU device or render loop after disposal. A GPU device returned after cancellation must be destroyed; canceled initialization must not trigger fallback or report a current-track error. The implementation carries a narrow, version- and content-checked patch for inherited libbitsub 1.11.0, preserving dependency versions. Review and revalidate the patch during every dependency update; verification/build must fail on unexpected input instead of silently skipping it. Keep the inherited disabled installation-script policy; explicit verification runs after installation and before Webpack/Vitest module resolution. See [patch provenance and maintenance](../../../patches/libbitsub-1.11.0/README.md).

This boundary addresses startup resource ownership. Cancellation inside parser, worker and network operations requires separate evidence; it is not proved by preventing the final render-loop start. Nor does mocked GPU initialization qualify hardware output or subtitle delivery.

### In-flight bitmap loads

Track disposal must abort that renderer's subtitle fetches, reject late load results before state changes, settle queued parser work without using a freed parser, and dispose its worker session even if loading is not yet acknowledged. The shared worker belongs to the library; do not terminate it when one renderer is removed. A canceled load must not retry, start a fallback parser, emit stale loading/error callbacks or restore frame/index caches. The same guard must cover PGS buffer/progressive paths and VobSub IDX/SUB/MKS paths. Keep normal loading, genuine active errors and concurrent independent renderers working.

Extend the pinned patch only against reproduced ownership failures, with tests at network, worker and scheduled-parser boundaries. Those tests control external completions and must stay distinct from codec fidelity and actual-device qualification. The library's existing range loader accepts an abort signal; use that interface without introducing another subtitle downloader or playback owner.

### Plain-text request ownership

Native cues and custom text elements must apply only to the current video, source and selected primary/secondary slot. Replacing or disabling a slot invalidates and aborts its pending request; removing the primary selection invalidates both slots. A secondary selection must not cancel a still-current primary fetch, and either request may complete first. Delayed playback-session lookups must also respect the latest selection before starting rendering or changing delivery metadata. Loading feedback must settle once through response-body decoding, cancellation or failure; obsolete errors must not affect a replacement. Preserve the existing account, delivery endpoint, text sanitization and track presentation options.

### Native media underlay experiment

Investigate placing the native video quad before the renderer's projection layer. Layers compose in list order without scene depth testing between them; placing video last can cover nearer scene controls and captions. The proposed projection pass therefore writes transparent black at a depth-tested, video-sized screen aperture, while the surrounding room stays opaque. Existing caption meshes render in the same projection pass as controls and foreground geometry. This keeps caption timing with the inherited owner and avoids a second subtitle timeline or direct manipulation of compositor-owned textures.

Require an alpha-capable projection layer and explicitly enable its texture alpha during attachment. The aperture must write depth and zero RGBA without alpha blending, face the same direction as the screen and preserve the video aspect ratio. Foreground opaque objects should occlude it; geometry behind it should not refill it. Dispose aperture/caption resources and restore the projection's prior alpha setting on failure, detach, interruption or session replacement. A missing alpha path must report rejection rather than silently hide captions. Verify both eye views, alpha edges, authored captions, foreground controls and movement on Quest before accepting this composition technique. PC/unit evidence can establish resource/order contracts only.

Keep the comparison's submitted layer list for the session: `renderState` may still expose the previous frame when a dimension/reference-space change removes and recreates presentation in one frame. Never resubmit a destroyed video layer from that stale snapshot. The comparison currently accepts one renderer projection and owns later composition updates; additional layer producers require an explicit shared coordinator before integration.

Primary source reviewed 2026-09-30: [WebXR Layers explainer](https://github.com/immersive-web/layers/blob/main/explainer.md) and the [immersive-web video/projection sample](https://github.com/immersive-web/webxr-samples/blob/main/layers-samples/eqrt-video.html). The exact installed renderer sources must determine material and projection handling; no device support is inferred from these references.
