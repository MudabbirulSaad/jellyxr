# System blueprint

Status: logical proposal; no XR framework selected. Updated: 2026-09-29.

## Components

~~~mermaid
flowchart LR
    Viewer["Viewer"]
    UI["Ordinary or spatial UI"]
    Session["Existing connection and user context"]
    Library["Library queries and actions"]
    Playback["Existing playback owner"]
    Media["HTML media and subtitle integration"]
    XR["XR presentation adapter"]
    Cinema["Cinema scene and input"]
    Prefs["Scoped XR preferences"]
    Server["Existing Jellyfin server"]
    Viewer --> UI
    UI --> Session
    UI --> Library
    UI --> Playback
    Session --> Server
    Library --> Server
    Playback --> Server
    Playback --> Media
    Media --> XR
    XR --> Cinema
    UI --> Prefs
~~~

The boxes describe responsibilities, not new packages or one class per box. The browser receives video streams from the existing server; no JellyXR transcoding service is introduced.

## Ownership and boundaries

| Boundary | Owner and input/output responsibility |
| --- | --- |
| Connection/user | Existing Jellyfin connection infrastructure owns endpoint, authenticated identity and session lifecycle; presentation observes changes |
| Library | Existing SDK/query integration retrieves permitted items; spatial views consume the same item identity and actions |
| Playback | Existing playback owner selects source/streams, negotiates playback, owns queue/progress and handles controls |
| Media bridge | Proposed narrow access to the active media surface and subtitle timing/lifecycle; ownership is borrowed, not duplicated |
| XR session | New presentation lifecycle checks capability, requests user activation, manages frames/input and disposes scene resources |
| Cinema | New environment/screen/controls obey comfort and performance settings without changing server playback policy |
| Preferences | XR-specific geometry/comfort are scoped locally; server playback settings remain server-owned when supported |
| Diagnostics | Redacted structured observations of connection, media and XR failure; local export is the accepted default |

No new public server API or account data model is proposed. Later internal TypeScript interfaces should represent these responsibilities without mirroring the entire SDK. EXP-01 determines media bridge details.

## Presentation state

~~~mermaid
stateDiagram-v2
    [*] --> Ordinary
    Ordinary --> RequestingXR: explicit user activation
    RequestingXR --> SpatialLibrary: no active video
    RequestingXR --> Cinema: active video
    RequestingXR --> Ordinary: unsupported or denied
    SpatialLibrary --> Cinema: title selected and media ready
    Cinema --> SpatialLibrary: stop and return
    Cinema --> Paused: focus loss or interruption
    Paused --> Cinema: explicit resume after recovery
    SpatialLibrary --> Ordinary: exit XR
    Cinema --> Ordinary: exit XR with state retained
    Paused --> Ordinary: session ended
~~~

These are presentation states; playback has its own loading/buffering/playing/paused/stopped state. Entering a scene is not permission to create a new playback session. Library context includes route, filters, list position and selected item.

## Continuity and failures

Retain one playback owner across presentation changes. Explicit XR exit retains position and accepted paused state; normal return from a stopped title restores the library. D-15 governs interruption and deliberate movement behaviour; event handling is qualified at G2.

The M2 comparison handles XR hidden/blurred visibility, ordinary-page hiding and session end immediately through the existing owner's Pause command. It cancels queued movement, activation and grabs, releases presentation resources and resets the simulation clock; regaining visibility never calls Resume. If Pause cannot be confirmed, report that failure rather than claiming a paused state. Disposing an active XR comparison also pauses before detaching, while closing an ordinary desktop overlay preserves ordinary playback.

Reference-space reset uses a conservative experimental recovery: pause, cancel stale poses/actions, suspend frame work and end the XR session. The viewer can explicitly enter again from the ordinary page. This avoids applying an unvalidated transform or teleport after a native origin discontinuity. Seamless world-anchor continuity and reachable in-room recovery remain G2 work; this fallback does not qualify them. See the platform's [reset event](https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace/reset_event) and [visibility states](https://developer.mozilla.org/en-US/docs/Web/API/XRSession/visibilityState).

If a media layer fails, dispose it cleanly and offer the tested fallback or ordinary viewing. Do not duplicate video/audio or silently lose subtitles. Authentication loss stops access and returns to login. Reconnection may require new playback negotiation; reuse of a stale stream URL is not guaranteed.

Changing environments or screen placement must not submit new playback reports. Session end disposes layers, scene assets and event listeners it owns, without tearing down unrelated ordinary-mode resources.

## Interaction and simulation

The interaction layer converts controller and hand events into common select, back, scroll, grab, teleport, turn and recenter intents. A single active-action identity prevents a pinch/controller transition from dispatching twice. Loss cancels the current action and constrained grab; subsequent tracking reacquisition requires fresh activation. Logical focus belongs to the view state, not a transient input device.

Physics owns only movable remote/artwork/panel bodies and their collision proxies. The room and screen are stable anchors. Use fixed steps, bounded catch-up after a long frame, damping, sleeping and fast-body collision protection; expose reset/recall without requiring simulation to recover itself. Hide/end suspends or disposes simulation, and returning does not replay accumulated hidden time. EXP-03/04 compare the candidates' costs and failure behaviour before exact integration is chosen.

### Idle simulation comparison

Under FR-031 and EXP-03/04, both M2 candidates stop fixed-step calls when every dynamic fixture body is actually asleep and none is held. Do not infer rest from a quiet-looking mesh or freeze an awake/jittering body to improve timing results. A grab, release, recall or changed static collider must allow the required physics work again; re-entry never catches up the elapsed idle/hidden interval. Unknown sleep state keeps simulation running. Physics suspension must leave rendering, media, input and stable room geometry available.

The current fixture has one dynamic remote. Qualify its native sleep observation, wake and resettling against each installed WASM engine, including a long idle gap, interrupted hold and screen update. Report simulation state, executed fixed steps and skipped idle frames as experiment diagnostics, separate from frame timing. These checks do not establish Quest battery, thermal or sustained-performance gains. Any additional dynamic object must join the activity decision before this policy can apply to a larger scene.

The session coordinator owns reference-space changes and deliberate teleport/snap orientation. It validates destinations, asks the existing playback owner to pause before a viewing-position change, and requires explicit Resume. It does not own a second playback clock. Library identity, filters, selection and pagination survive movement and library/cinema transitions.

### Grab tracking continuity comparison

Under FR-021/023/031 and AT-27, both comparison candidates must cancel a held remote when the animation frame has no valid viewer pose, even if a controller grip or hand joints remain available. A new grab requires the same recent valid animation-frame head sample used for selection; an input-event frame must not call `getViewerPose`. Cancellation clears the grab target and releases once without retaining a throw velocity. Restored tracking does not resume the old grab; a fresh squeeze/pinch is required. Keep logical focus, remote recall and button alternatives. Controlled event tests establish this ownership rule; actual headset loss/recovery remains a separate qualification scenario.

### Deliberate remote release comparison

Under FR-031 and EXP-04, distinguish a deliberate squeeze/pinch end from cancellation. Only the current grab owner with fresh head and grip/joint tracking may release with linear momentum. Derive that momentum from recent collision-constrained fixed-step displacement, cap it at the existing 3 m/s held-motion bound and discard samples older than 100 ms. A stationary hold releases without a stale fling; experimental release speeds below 0.01 m/s are cleared without freezing an awake native body. Reject a nonfinite body sample before creating native velocity. Catch-up steps must not accumulate speed beyond the cap. Keep the current frozen grab orientation and zero angular release velocity; free hand-relative rotation and angular throwing remain separately open work.

Tracking loss, removed input, hidden/end/reset, scene movement, Recall and disposal release without inherited momentum. Fresh tracking never replays a canceled throw. Both physics adapters must apply the same explicit velocity after returning to dynamic motion, wake normally, retain collision protection and permit settling/sleep/Recall. Exercise deliberate and canceled releases through controlled native events and actual WASM wall/floor/shelf collisions. Report those checks separately from Quest hand/controller, arbitrary-impact, comfort and sustained performance qualification; no G2 choice is implied.

### Comparison timing observation boundaries

Under NFR-001/010 and EXP-03, keep the existing bounded 720-sample application-work window separate for ordinary desktop preview and each immersive session. A new session identity, presentation-mode transition or interruption clears both the window and its frame count. Hidden, blurred or invalidated sessions may retain required head-tracked rendering, but must not contribute qualification timing samples. Clear observations immediately on interruption events even when the runtime supplies no further animation frame; resuming starts a fresh window and never adds hidden elapsed time.

An explicit media attachment or presentation-path change also clears timing history so an old/no-video workload is not presented as the new media path. Offer a labelled manual timing reset for controlled warmup/runs without changing playback, scene placement, input or physics. Display observation scope, frames since reset, recent window size and a pending state before any valid sample; zero is not a measured p95. Retain nearest-rank p95 and bounded memory. These are synchronous application-work observations, excluding GPU, compositor, decode and motion-to-photon timing. Record the actual device, refresh rate, workload and profiling limits separately; no automatic performance pass or G2 choice follows from the readout.

## Production loading boundary

M3 hosts a bounded XR feature within the existing React application. Load renderer, physics and room assets only at the feature boundary; preserve ordinary routes and localization. Capability detection explains unavailable entry without treating a user-agent string as proof. The borrowed media bridge detaches without stopping or reporting through a second owner. Subtitle presentation and text rendering are chosen at G2.

Viewing preferences are scoped by server, user and device and validate geometry before applying it. Asset manifests connect source/licence records, runtime variants, collision geometry and loading dependencies. No private endpoint, title or token enters a committed manifest or diagnostic record.

## Future portability

Keep input intent (select, back, scroll, grab, teleport, turn, recenter) separate from controller/hand specifics. Detect optional session features individually. Vision Pro will require a separate input/media test matrix, not a user-agent rename.

Related: [integration contract](jellyfin-integration.md), [experience blueprint](../03-experience/experience-blueprint.md), [requirements](../02-requirements/functional-requirements.md).
