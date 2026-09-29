# Risks and open questions

Status: active planning register. Updated: 2026-09-29.

Roles are accountable functions, not invented team assignments. Product owner coordinates unassigned roles. Resolve by the stated gate; unresolved items block only work that depends on them.

| ID | Risk / question | Evidence and mitigation | Owner | Due |
| --- | --- | --- | --- | --- |
| R-01 | Complete browser/version and runtime server qualification remain outstanding | Quest 3 USB access, Android build and active Browser package recorded; owner reports library access and ordinary playback. Server 10.11.4 and SDK minimum 10.10.0 observed. Confirm About labels and detailed control/fixture evidence under D-11 | Product + validation lead | G1 inventory; G2 qualification |
| R-02 | Private player media element may not support a simple XR attachment | EXP-01 lifecycle/ownership spike; narrow adapter proposal; preserve existing player semantics | Implementation lead | G2 |
| R-03 | DOM/native subtitle overlays may disappear or desynchronize in XR | EXP-02 now includes a borrowed plain-text panel and labelled cue/gap/track-off fixture in both texture candidates. ASS/bitmap and native-layer composition remain unimplemented; text styling, user placement and actual Quest synchronization still require qualification | Media lead | G2 |
| R-04 | Realistic scene plus decoding may exceed sustained budget | EXP-03 with plain-scene control and long run; reduce environment cost; qualify actual video formats | Performance lead | G2, recheck G4 |
| R-05 | Domain/IP/TLS/CORS/local-network rules can block API or media requests | EXP-05 exact-browser matrix; reference HTTPS topology; test streams, subtitles and sockets separately | Deployment lead | G2 |
| R-06 | Modern/legacy client coupling increases maintenance and parity risk | Source map; keep integration narrow; AT-15 and AT-25 after updates | Implementation lead | G2/G4 |
| R-07 | Selected Cinema Observatory geometry and materials need headset validation | D-12 selection and reference specification complete; test identical tasks, readability and reset/recenter on Quest 3 | Product/design lead | G2 |
| R-08 | Accepted initial targets may need evidence-based revision | D-10 accepted at M1; measure using identified fixtures and record any revision with product acceptance | Product + validation lead | G2 |
| R-09 | Session/token or cached-content leakage across users | Audit inherited storage and new scoped preferences; AT-04/16; redact diagnostics and signed URLs | Implementation lead | G2/G4 |
| R-10 | Test media/artwork and distribution provenance need review | Use permissioned fixtures; keep licence/attribution and asset provenance; qualify distribution packaging later | Product owner | G1 assets; G4 release |
| R-11 | Offline storage, shared viewing, advanced media and reactive lighting broaden scope | Separate P1/P2 decisions; define measurable extension criteria before implementation | Product owner | G5 |
| R-12 | Vision Pro browser/media/input capabilities differ from Quest | EXP-06 isolates assumptions; AT-23 on real device before any support claim | Implementation lead | G2 review; G5 qualification |
| R-13 | Base paths and cached assets may break after client updates | Validate public path/router, media/socket URL composition and rollback; no silent library migration | Deployment lead | G4 |
| R-14 | Inherited feature fixtures may be unavailable | Record blocked/not-tested rows; obtain required fixtures or narrow support claims explicitly | Validation lead | G4 |
| R-15 | A successful ordinary playback smoke test may be mistaken for complete Quest compatibility | Authorised Quest 3 and both port mappings observed; library access and basic playback are owner-reported. Detailed controls, remote inspection and sustained/immersive qualification remain pending. Separate direct observations, owner reports and emulation under NFR-010 | Validation lead + product owner | G1 setup; G2/G4 evidence |
| R-16 | Emulation tooling may alter production capabilities or conflict with another injected runtime | Evaluate one active emulation path at a time; record chosen tool/version; inspect final bundle and run production with emulation disabled | Implementation lead | G2 tooling; G4 production check |
| R-17 | Required hand gestures, near input and input switching may be unreliable | EXP-04 and AT-17 on Quest; cancellation and fresh activation after loss; controller fallback cannot close the hand gate | Implementation + validation lead | G2, G3/G4 retest |
| R-18 | Exploration or misplaced physical controls can strand a seated viewer | AT-26/27 with both inputs; destination validation, stable horizon, button alternatives, Return to seat and recall/reset. Native-reset experiment cancels actions, pauses and exits XR; stable control recall and compact recovery now pass both PC previews. Quest reach/readability, scene occlusion and seamless anchor recovery remain open | Design + validation lead | G2 prototype, G3 finish |
| R-19 | Physics catch-up, jitter or tunnelling can exceed budgets or break presence | Compare Havok/Rapier using identical simple colliders and motion; bounded steps, sleeping, damping and fast-body protection; profile viewing and active interaction separately | Implementation lead | G2, G4 |
| R-20 | Asset detail or unclear download licences can block distribution | Original chair recipe, GLB variants, collision data and licence/hash manifest implemented; both loaders and Khronos validator exercised. No external art imported. Texture compression, lighting, measured cost and final distribution audit remain open | Design + implementation lead | G2 pipeline, G4 archive |
| R-21 | Autonomous work can outrun human/device evidence | Continue independent fixtures, contracts and desktop checks; keep qualification gates open and never infer hands, comfort or five-viewer success from code or emulation | Implementation + validation lead | Every milestone |
| R-22 | Cancelling the inherited audio action sheet raises an unhandled rejection | Reproduced during the M2 desktop media run. Named cancellation handling now passes the actual PC retest and three action-sheet regression tests; real selection errors still propagate. Keep actual-device and full ordinary regression open | Implementation lead | G2 reproduction/fix; G4 retest |

## Questions already settled

The app is a Jellyfin Web fork, named jellyxr under MudabbirulSaad. It uses existing Jellyfin identity and endpoints. Self-hosting and library-plus-cinema are the agreed first-release direction. Do not reopen these as technology preferences without new evidence or user instruction.

## Escalation rule

A risk becomes a decision record when evidence selects an approach or changes scope. Link the evidence, affected requirements and test cases. Never use "future work" to hide an unresolved P0 playback, permission or deployment failure.
