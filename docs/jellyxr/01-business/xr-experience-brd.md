# XR experience BRD

Status: first-release journey and Cinema Observatory direction confirmed; detailed spatial behaviour awaits device validation. Updated: 2026-09-29.

## Intended experience

The viewer opens a web address, connects to Jellyfin, selects a movie or episode and enters a believable personal cinema. Spatial browsing and watching should be usable while seated with relaxed arms. Returning from the cinema restores the user's library context.

The first release must feel complete along this journey before expanding environment count or social features.

## Business requirements

| ID | Requirement | Value | Goal |
| --- | --- | --- | --- |
| BX-01 | Spatial movie/series discovery with predictable navigation | A useful XR library that supports repeat use | BG-02 |
| BX-02 | One cohesive cinema with adjustable viewing geometry | Personal comfort and a recognisable product identity | BG-03 |
| BX-03 | Clear playback, track and subtitle interaction | Viewers retain control without leaving the headset | BG-01, BG-03 |
| BX-04 | Reliable ordinary/XR transitions and recovery | Browsing and progress survive presentation changes | BG-02, BG-05 |
| BX-05 | Quality adapts without degrading the core task | Smooth viewing across qualified hardware | BG-03, BG-06 |

## Realism and visual identity

Use believable proportions, deliberate material response, stable lighting, consistent depth and restrained movement. Movie artwork provides much of the changing colour. The environment supports the film, and controls remain readable against both bright and dark frames.

Explore Cinema Observatory, Orbital Archive and Living Light in the [visual direction document](../03-experience/visual-direction.md). None is selected. The product owner will choose the direction after reviewing the same browsing, detail and playback states for each.

Dynamic screen lighting, passthrough occlusion, reflections and more complex materials are candidates for measured experiments. The first environment must remain visually coherent when those optional effects are disabled.

## Comfort and interaction

Controllers are the first-release input baseline. Screen position, size, distance and tilt must be recoverable through visible controls, including a one-action recenter. Avoid forced virtual camera movement. Large targets and explicit activation are more important than dense controls.

Hand interaction follows a separate feasibility and usability gate. Looking at an item alone must not start playback. Reduced-motion behaviour must preserve readable final states.

## Expansion boundaries

Hand input, passthrough, stereo/180/360 media and reactive lighting are P1 candidates. Shared rooms, offline downloads and Vision Pro qualification are P2. Existing ordinary-mode features retain their own parity obligations.

The browser mediates access to Quest capabilities. Device support, display quality and sustained performance must be measured on identified hardware. The plan does not promise native API parity, HDR, unrestricted sensor access or a particular maximum video resolution.

Sources: [S01](../references/glossary-sources.md#s01), [S09](../references/glossary-sources.md#s09), [S10](../references/glossary-sources.md#s10), [S11](../references/glossary-sources.md#s11), [S15](../references/glossary-sources.md#s15).
