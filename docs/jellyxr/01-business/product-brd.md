# Product BRD

Status: intent and initial qualification targets confirmed; measured acceptance pending. Owner: product owner. Updated: 2026-09-29.

## Problem and audience

Jellyfin users with a Quest headset need a complete path from their existing media library to comfortable immersive viewing. The experience must retain the account, library and progress they already use while offering spatial discovery and an intentional cinema environment.

Primary users are people watching their own Jellyfin movies and series while seated or reclining. Secondary users are self-hosting administrators configuring access and household members with separate Jellyfin permissions. Future users include Vision Pro owners.

## Business goals

| ID | Outcome | Success evidence |
| --- | --- | --- |
| BG-01 | Make an existing Jellyfin library usable without another account or media migration | Existing-account connection, restricted-user and progress scenarios pass |
| BG-02 | Make choosing and resuming a film straightforward in a headset | Accepted initial usability target: at least 4 of 5 representative users resume a title without assistance |
| BG-03 | Deliver convincing, comfortable cinema viewing | Cinema Observatory; accepted 120-minute stability target and structured comfort review |
| BG-04 | Make self-hosting and endpoint configuration understandable | Domain, trusted-IP and base-path scenarios documented and reproduced |
| BG-05 | Preserve the value of Jellyfin's existing client | Every inherited feature is classified; ordinary-mode regressions recorded before release |
| BG-06 | Keep the product maintainable and extensible | Upstream provenance and changes remain traceable; future-platform boundaries documented |

These are accepted initial success criteria under D-10, not market statistics or measured results. Traceability is maintained [centrally](../02-requirements/traceability.md).

## Value and scope

The first release provides ordinary browser access, spatial movie/series discovery and immersive playback. It combines dependable Jellyfin behaviour with adjustable screens, readable subtitles, controller and hand interaction, recoverable physical objects and one explorable Cinema Observatory. The connected library and seating areas use genuine world-space geometry while every core task remains available seated.

Self-hosting is the reference operating model. The client may be served alongside Jellyfin or separately with a reachable configured endpoint. There is no new JellyXR subscription, account service, replacement media catalogue or server transcoder in this scope.

The long-term product may add passthrough, stereo/immersive media, richer environments, shared viewing and Vision Pro. Downloads and browser storage are research items. Existing music, Live TV and other client capabilities remain represented in ordinary-mode parity rather than being silently dropped.

## Constraints and tradeoffs

- Use the official Jellyfin Web codebase as the foundation.
- Use Quest resources for sustained viewing quality; maximum instantaneous GPU usage is not a success measure.
- Preserve server permissions and account boundaries across both presentation modes.
- Protect video clarity and frame stability when environment complexity must decrease.
- Define the product and acceptance needs before selecting additional XR technologies.
- Visual distinctiveness must survive reduced motion and simplified quality settings.

## Stakeholders and ownership

The product owner accepts scope and visual direction. The implementation lead owns integration feasibility and upstream maintenance. The validation lead owns reproducible device and media evidence. These are roles; until assigned, the product owner coordinates their decisions.

Funding, commercial distribution and public hosted service operations are not assumed. Changes to those boundaries require a recorded product decision.

Source: approved user plan [S01](../references/glossary-sources.md#s01). Related: [foundation BRD](jellyfin-foundation-brd.md), [XR BRD](xr-experience-brd.md).
