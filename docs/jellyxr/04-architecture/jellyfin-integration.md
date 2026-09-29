# Jellyfin integration contract

Status: source-informed proposed reuse contract. Updated: 2026-09-29.

No new server endpoints are introduced. Existing SDK request/response types and server policies are authoritative. Names below are inspected integration points, not a replacement API specification.

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
