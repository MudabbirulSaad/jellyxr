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
| Diagnostics | Redacted structured observations of connection, media and XR failure; local export is the proposed default |

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

Retain one playback owner across presentation changes. Explicit XR exit retains position and proposed paused state; normal return from a stopped title restores the library. D-15 governs interruption behaviour and is reviewed at G1.

If a media layer fails, dispose it cleanly and offer the tested fallback or ordinary viewing. Do not duplicate video/audio or silently lose subtitles. Authentication loss stops access and returns to login. Reconnection may require new playback negotiation; reuse of a stale stream URL is not guaranteed.

Changing environments or screen placement must not submit new playback reports. Session end disposes layers, scene assets and event listeners it owns, without tearing down unrelated ordinary-mode resources.

## Future platform seam

Keep input intent (select, back, scroll, recenter) separate from controller/hand specifics. Detect optional session features individually. Vision Pro will require a separate input/media test matrix, not a user-agent rename.

Related: [integration contract](jellyfin-integration.md), [experience blueprint](../03-experience/experience-blueprint.md), [requirements](../02-requirements/functional-requirements.md).
