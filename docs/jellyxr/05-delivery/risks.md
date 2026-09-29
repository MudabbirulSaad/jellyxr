# Risks and open questions

Status: active planning register. Updated: 2026-09-29.

Roles are accountable functions, not invented team assignments. Product owner coordinates unassigned roles. Resolve by the stated gate; unresolved items block only work that depends on them.

| ID | Risk / question | Evidence and mitigation | Owner | Due |
| --- | --- | --- | --- | --- |
| R-01 | Exact Quest model, browser/OS and supported server versions are unknown | Inventory available hardware; resolve pinned SDK minimum; choose representative fixtures; record D-11 | Product + validation lead | G1 |
| R-02 | Private player media element may not support a simple XR attachment | EXP-01 lifecycle/ownership spike; narrow adapter proposal; preserve existing player semantics | Implementation lead | G2 |
| R-03 | DOM/native subtitle overlays may disappear or desynchronize in XR | EXP-02 across text/ASS/bitmap; explicit renderer/burn-in fallback and appearance limits | Media lead | G2 |
| R-04 | Realistic scene plus decoding may exceed sustained budget | EXP-03 with plain-scene control and long run; reduce environment cost; qualify actual video formats | Performance lead | G2, recheck G4 |
| R-05 | Domain/IP/TLS/CORS/local-network rules can block API or media requests | EXP-05 exact-browser matrix; reference HTTPS topology; test streams, subtitles and sockets separately | Deployment lead | G2 |
| R-06 | Modern/legacy client coupling increases maintenance and parity risk | Source map; keep integration narrow; AT-15 and AT-25 after updates | Implementation lead | G2/G4 |
| R-07 | Visual direction and comfort geometry remain unsettled | Compare identical task compositions; select D-12; headset review and reset/recenter tests | Product/design lead | G1, validate G2 |
| R-08 | Proposed numeric targets may not suit available hardware | Accept/revise NFR targets using identified fixtures; document measurements rather than promise peak specifications | Product + validation lead | G1/G2 |
| R-09 | Session/token or cached-content leakage across users | Audit inherited storage and new scoped preferences; AT-04/16; redact diagnostics and signed URLs | Implementation lead | G2/G4 |
| R-10 | Test media/artwork and distribution provenance need review | Use permissioned fixtures; keep licence/attribution and asset provenance; qualify distribution packaging later | Product owner | G1 assets; G4 release |
| R-11 | Offline storage, shared viewing, advanced media and reactive lighting broaden scope | Separate P1/P2 decisions; define measurable extension criteria before implementation | Product owner | G5 |
| R-12 | Vision Pro browser/media/input capabilities differ from Quest | EXP-06 isolates assumptions; AT-23 on real device before any support claim | Implementation lead | G2 review; G5 qualification |
| R-13 | Base paths and cached assets may break after client updates | Validate public path/router, media/socket URL composition and rollback; no silent library migration | Deployment lead | G4 |
| R-14 | Inherited feature fixtures may be unavailable | Record blocked/not-tested rows; obtain required fixtures or narrow support claims explicitly | Validation lead | G4 |
| R-15 | PC emulation may be mistaken for Quest compatibility, or hardware access may arrive too late | Separate desktop/emulated/actual-device evidence under NFR-010; identify hardware/tester access at M1; run media/subtitle experiments on Quest before G2 and final qualification at G4 | Validation lead + product owner | G1 access; G2/G4 evidence |
| R-16 | Emulation tooling may alter production capabilities or conflict with another injected runtime | Evaluate one active emulation path at a time; record chosen tool/version; inspect final bundle and run production with emulation disabled | Implementation lead | G2 tooling; G4 production check |

## Questions already settled

The app is a Jellyfin Web fork, named jellyxr under MudabbirulSaad. It uses existing Jellyfin identity and endpoints. Self-hosting and library-plus-cinema are the agreed first-release direction. Do not reopen these as technology preferences without new evidence or user instruction.

## Escalation rule

A risk becomes a decision record when evidence selects an approach or changes scope. Link the evidence, affected requirements and test cases. Never use "future work" to hide an unresolved P0 playback, permission or deployment failure.
