# Experience blueprint

Status: proposed behaviour for the confirmed first-release journey. Updated: 2026-09-29.

## Information architecture

Ordinary mode retains Jellyfin navigation and settings. XR exposes Home, Movies, Series, Search, title details, cinema controls and viewing settings. Other library types lead to ordinary-mode access until their spatial views are qualified.

Home prioritises Continue Watching, Next Up and recently added items. A stable navigation rail and Back action remain in predictable locations. Spatial panels stay within a comfortable forward viewing area; the user does not need to turn around to find essential actions.

## Journey

~~~mermaid
flowchart LR
    Open["Open app address"] --> Connect["Choose Jellyfin endpoint"]
    Connect --> Auth["Existing login or Quick Connect"]
    Auth --> Browse["Browse home and libraries"]
    Browse --> Detail["Inspect title / episode"]
    Browse --> XRLibrary["Enter spatial library"]
    XRLibrary --> Detail
    Detail --> Play["Play or Resume"]
    Play --> Cinema["Cinema with active video"]
    Cinema --> Controls["Controls / tracks / screen settings"]
    Controls --> Cinema
    Cinema --> Return["Stop or exit XR"]
    Return --> Browse
~~~

The diagram shows tasks, not a forced onboarding sequence on every visit. A saved valid session may open directly to Home. Entering XR always follows a deliberate user action and capability checks.

## Screen and state inventory

| View | Primary content/actions | Required non-happy states |
| --- | --- | --- |
| Endpoint | App/server distinction, address, connect and saved servers | Invalid address, unreachable host, policy limitation, incompatible server |
| Authentication | User login and enabled Quick Connect | Invalid credentials, expired code, cancelled authorization, disabled capability |
| Home/library/search | Artwork, progress, filters, query, navigation | Loading, empty library/results, missing artwork, partial failure, end of results |
| Title/episodes | Play, Resume, versions, seasons and metadata | Missing metadata, no playable source, permission revoked |
| XR entry | Enter and ordinary-mode continuation | Insecure origin, unavailable API, denial, session request failure |
| Cinema | Film with controls hidden when idle | Buffering, paused, error, focus loss, ended |
| Controls | Play/pause, seek, chapters, audio/subtitles, stop | Disabled action, pending seek, unavailable track |
| Viewing settings | Geometry, recenter, Reset, comfort and quality | Out-of-range saved state, unsupported option, input lost |

Error wording names the action the user can take. Preserve title/library state on a recoverable failure. Do not hide controls simply because a network operation is pending.

## Interaction contract

Controller rays/near input and hand pointing/pinch highlight targets; explicit activation selects them. Scene geometry determines hit testing and occlusion. Switching input methods preserves logical focus without duplicate activation, and loss cancels pending activation or grabbing. Back unwinds the current view before leaving XR. Recenter is always reachable from the control surface and ordinary recovery UI. Screen manipulation has explicit controls in addition to any later drag gesture.

The control surface appears on explicit input and hides after inactivity only when no menu/seek operation is active. Exact hide timing is a G1 usability setting. Repeated activation while a command is pending must not create duplicate sessions.

The user can browse in XR and start a film, or begin ordinary playback and enter XR. Both routes share title identity, chosen tracks and playback ownership. The accepted interruption policy pauses on focus loss and requires explicit resume after return; it must be validated against browser events.

## Movement and object recovery

The library and seating area occupy one connected room. World-space shelves and controls have consistent scale and stable anchors; leaning changes their perspective and approaching changes apparent scale. A summoned panel settles in the forward workspace. It does not remain glued to the viewer's head. Search uses a scene-rendered keyboard with labelled Back, Cancel and Clear actions.

Physical tracking remains runtime-owned. A deliberate teleport gesture/action previews a valid destination before confirmation; unavailable, obstructed and out-of-room locations are rejected visibly. Snap turn moves by 30 degrees only on explicit input. Hands and controllers both expose movement and Return to seat, including button alternatives. Changing viewing position pauses an active film and shows “Resume”; closing the movement controls alone never resumes it.

The remote, selected artwork and panels may be grabbed within safe constraints. Losing input cancels the grab without launching an object. “Recall remote” restores the remote to a reachable anchor; “Reset panel” restores panel placement. Screen adjustments always have labelled buttons. Neither a misplaced object nor the viewer's room position may hide Back, Recenter or Reset permanently. Do not require a person to walk across their physical room to reach a library or control.

## Accessible presentation

Provide readable text with a stable backing, visible focus and labels. Avoid text sizes defined only in CSS pixels for the headset; evaluate apparent angular size at supported viewing distances. Test subtitle readability on moving bright frames.

Respect reduced motion in both browser and XR settings. Make essential paths possible without standing, sustained raised arms, forced camera travel or colour-only meaning. Ordinary DOM semantics and keyboard access remain tested separately from spatial accessibility.

## Review protocol

Review the selected Cinema Observatory using the same home, title and paused-film tasks. Include a large-library case, a long title, a missing poster, subtitles, a restricted user and network interruption. D-12 records the visual choice; headset interaction review follows at G2.

Requirements: [FR-005 through FR-023 and FR-030/031](../02-requirements/functional-requirements.md), [NFR-003](../02-requirements/nonfunctional-requirements.md#nfr-003). Behaviour ownership: [system blueprint](../04-architecture/system-blueprint.md).
