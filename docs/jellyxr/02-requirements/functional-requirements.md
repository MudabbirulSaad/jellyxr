# Functional requirements

Status: proposed acceptance baseline derived from the approved scope. Updated: 2026-09-29.

P0 = first release; P1 = extension after first release; P2 = future investigation. Sources refer to the [source register](../references/glossary-sources.md). Requirement acceptance is intended behaviour, not a claim of implementation. The [traceability matrix](traceability.md) assigns work and validation.

## Connection and identity

| ID | Priority | Requirement and rationale | Observable acceptance | Dependencies / source |
| --- | --- | --- | --- | --- |
| <a id="fr-001"></a>FR-001 | P0 | Configure and retain a Jellyfin endpoint so self-hosting is practical | Accept a URL with domain or IP, explicit port and optional base path; trim accidental surrounding whitespace; verify a server before login; preserve the base path for API, image, stream and socket requests; reconnect to a saved server | Deployment matrix; S01, S04; BF-04 |
| <a id="fr-002"></a>FR-002 | P0 | Sign in using an existing Jellyfin account; no additional registration | Valid login opens that user's library; invalid credentials allow retry; expired/revoked sessions return to login without revealing another user's cached content; logout clears active user presentation and session references | FR-001; existing session owner; S02; BF-02 |
| <a id="fr-003"></a>FR-003 | P0 | Offer server-supported Quick Connect to reduce headset typing | Offer it only when enabled; authorization completes sign-in; expiration, denial and cancellation leave ordinary login available; no reusable secret appears in diagnostics | FR-002; server capability; S13 |
| <a id="fr-004"></a>FR-004 | P0 | Honour permissions and separate users/servers in both modes | A restricted user cannot browse or play denied content; switching users/servers removes the prior user's library, selection, queue and private preferences; revocation is handled even if an item was cached | FR-002; server policy; S01, S02; BF-02 |

## Library and playback

| ID | Priority | Requirement and rationale | Observable acceptance | Dependencies / source |
| --- | --- | --- | --- | --- |
| <a id="fr-005"></a>FR-005 | P0 | Provide movie/series home and libraries for everyday discovery | Continue Watching, Next Up and recent items reflect server data; movie and series libraries load incrementally; loading, empty, failed and end-of-list states are distinguishable | FR-004; S01, S02; BX-01 |
| <a id="fr-006"></a>FR-006 | P0 | Search, filter, sort and browse collections without losing orientation | Search results respect permissions; cancelling search returns to prior context; filter/sort choices remain visible; clearing them restores the unfiltered set; favourites and watched status reflect the active account | FR-005; existing queries and item actions; S02 |
| <a id="fr-007"></a>FR-007 | P0 | Present useful title details and episode selection | Display available artwork, synopsis, duration and metadata; missing fields do not leave broken controls; choose season/episode and an available media version; Play and Resume are unambiguous | FR-005; item/media-source data; S01, S02 |
| <a id="fr-008"></a>FR-008 | P0 | Retain progress and episode continuity across views | Resume uses server progress; next-episode and autoplay preferences are respected; start/progress/stop reports follow one authoritative playback session; re-entering XR does not create a second reporter or restart from zero | FR-009; playback manager; S02; BF-01 |
| <a id="fr-009"></a>FR-009 | P0 | Negotiate playback against actual browser/media capabilities | Supported direct play works; remux/direct-stream and transcode fixtures use the server-selected path; disallowed transcoding yields an actionable failure; selected source, stream indices and session identifiers remain consistent | FR-002; device profile and playback-info API; S02, S12 |
| <a id="fr-010"></a>FR-010 | P0 | Expose essential player controls in the cinema | Play/pause, seeking, skip steps, available chapters, mute/volume where browser-supported, and Stop work through the existing playback owner; pending seek/buffer state is visible; rapid actions do not create overlapping playback | FR-009; S01, S02 |
| <a id="fr-011"></a>FR-011 | P0 | Choose audio tracks and retain language preferences | List available tracks clearly; selecting a supported alternative changes audio, including server renegotiation when needed; preserve position and explain failure; do not label unavailable codecs or output modes as supported | FR-009; S12 |
| <a id="fr-012"></a>FR-012 | P0 | Make subtitles readable and controllable in immersive playback | Select/off works; text subtitle size, backing and placement are adjustable; verify synchronization after seek and track changes; formatted/bitmap tracks have a tested renderer or explicit server-burn-in path; no silent subtitle loss on XR entry | FR-009; subtitle experiment EXP-02; S02, S12; BX-03 |

## XR presentation and operation

| ID | Priority | Requirement and rationale | Observable acceptance | Dependencies / source |
| --- | --- | --- | --- | --- |
| <a id="fr-013"></a>FR-013 | P0 | Enter/exit XR deliberately while retaining the current task | A visible user action requests XR; unsupported/insecure/denied states explain the limitation and retain ordinary mode; leaving XR preserves title, position and library context; only one media element/session plays audibly | FR-008; secure context and capability checks; S06, S07 |
| <a id="fr-014"></a>FR-014 | P0 | Adapt library and title detail views to spatial browsing | Complete home-to-title-to-play and back while seated; navigation and current focus remain visible; all essential movie/series actions are reachable with controller pointing and activation | FR-005, FR-006, FR-007, FR-021; S01; BX-01 |
| <a id="fr-015"></a>FR-015 | P0 | Provide one cohesive cinema that supports sustained viewing | Chosen environment displays stable geometry and lighting; controls remain readable over dark/bright film frames; reduced quality preserves layout; transitions do not move the viewer's virtual camera | D-12, NFR-001; S01, S10 |
| <a id="fr-016"></a>FR-016 | P0 | Adjust and recover screen geometry | Change size, distance, height, tilt and flat/curved presentation where the selected path supports it; preserve source aspect ratio; Reset restores a reachable default; Recenter aligns the layout to current comfortable orientation | FR-015; EXP-01; S01 |
| <a id="fr-017"></a>FR-017 | P0 | Support seated/reclining use and comfort settings | Controls can be brought into a comfortable position without standing; reduced motion suppresses decorative transitions; text-size settings apply to spatial UI; no progress depends solely on dragging, colour or hover | FR-016, FR-021; S15; BX-02 |
| <a id="fr-018"></a>FR-018 | P0 | Recover from interruption without hidden playback or state loss | Network loss shows buffering/retry; authentication loss requires login; XR focus loss/session end follows documented pause/resume behaviour; reconnect resumes a valid session or renegotiates once without duplicate audio | FR-008, FR-013; D-15; S02, S07 |
| <a id="fr-019"></a>FR-019 | P0 | Save viewer preferences without crossing account boundaries | Retain screen/comfort preferences for the same server-user-device context; logout/switch never applies private account settings to another user; invalid stored geometry has a safe Reset; server playback preferences stay server-owned where applicable | FR-004; D-14; S01 |
| <a id="fr-020"></a>FR-020 | P0 | Preserve inherited ordinary-mode access | Audit every row of the parity matrix; inherited supported routes remain reachable; a feature without XR adaptation has an ordinary-mode route; clearly distinguish fixture limitations from newly introduced regressions | Pinned baseline; parity matrix; S01, S02; BF-03 |
| <a id="fr-021"></a>FR-021 | P0 | Offer reliable controller input and explicit activation | Point/select, scroll, Back, player controls and recenter work for left- or right-hand use; focus, press and disabled states differ; controller loss does not activate a target or strand the viewer; looking alone never plays a title | FR-013; input experiment EXP-04; S01 |
| <a id="fr-022"></a>FR-022 | P0 | Provide useful connection and playback diagnostics | Distinguish known insecure-origin, unsupported-XR, auth, server and media failures; ambiguous browser network errors give possible causes without falsely asserting CORS; diagnostic export redacts tokens, passwords, full signed URLs and private media identifiers by default | FR-001, FR-009; NFR-004; S04, S05, S08 |

## Planned extensions

These remain explicit backlog requirements; their absence does not block the first release.

| ID | Priority | Requirement and rationale | Observable acceptance for that extension | Dependencies / source |
| --- | --- | --- | --- | --- |
| <a id="fr-023"></a>FR-023 | P1 | Hand pointing/pinch and predictable controller switching | Core journey works with hands; tracking loss cancels pending input; resting gestures do not activate controls; controllers remain available | EXP-04; S11 |
| <a id="fr-024"></a>FR-024 | P1 | Passthrough screen and optional room-aware placement | Supported devices enter room viewing; unsupported/denied plane, mesh or anchor features retain manual placement; switch modes with playback continuity | EXP-05; S16 |
| <a id="fr-025"></a>FR-025 | P1 | Stereo and 180/360 viewing | Known fixtures render correct eye order/projection; per-title settings persist; unsupported formats fail explicitly; no generic resolution/HDR promise | EXP-01, EXP-02; S09, S12 |
| <a id="fr-026"></a>FR-026 | P1 | XR seek thumbnails, segment skip and optional reactive screen light | Thumbnails and skip controls appear only with available metadata; missing metadata does not block playback; screen light can be disabled independently and meets the accepted frame budget | Server metadata; EXP-03; S14 |
| <a id="fr-027"></a>FR-027 | P2 | Shared viewing with clear host control | A later defined multi-user fixture meets an agreed sync tolerance and handles host departure; avatars/voice require separate scope decisions | Existing SyncPlay audit; R-11 |
| <a id="fr-028"></a>FR-028 | P2 | Offline downloads and reconnection | A later storage experiment proves permitted download, quota/error handling, offline playback, deletion and progress reconciliation without crossing users | Browser storage and server policy; R-11 |
| <a id="fr-029"></a>FR-029 | P2 | Vision Pro qualification | Core journey passes the separately recorded browser/device capability and input matrix; unsupported Quest-specific effects degrade explicitly | EXP-06; R-12 |
