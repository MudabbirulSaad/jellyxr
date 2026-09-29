# Active implementation goal through M6

Activated: 2026-09-29. Status: active. No invented time or token budget. Authority: approved M6 implementation plan and later instruction to continue independently without waiting for GitHub Actions or the owner.

Deliver a release-ready JellyXR v1 for Quest 3: an explorable Cinema Observatory with genuinely spatial browsing, controllers and hands, convincing physical behaviour, reliable inherited Jellyfin playback and a qualified self-hosted package. The goal completes only after G4/M6 acceptance and packaging. Public release publication and production deployment are separate actions.

The [roadmap](roadmap.md) owns implementation order, [requirements](../02-requirements/functional-requirements.md) own behaviour and [test strategy](test-strategy.md) owns acceptance. This ledger records execution state without duplicating their criteria.

## Execution ledger

| Slice | Deliverable / authority | State and next action |
| --- | --- | --- |
| M1-A | Scope reconciliation; FR-023/030/031, D-25 through D-31 | Merged in PR #2 at xr 8ea4c39a83; requirements and documentation checks passed |
| M1-B | Detailed baseline evidence; AT-07/09/10 and G1 | Basic Quest playback owner-confirmed; USB reconnected and forwarding restored. Detailed controls and delivery-path evidence remain open |
| M1-C | Emulator and remote-debug workflow; NFR-010 | Owner reports emulator ready; exact profile/version unverified. Remote inspection not completed; automated internal-page navigation was rejected by browser security policy |
| M2-A | Deterministic scene/catalogue/media fixture specification; EXP-01 through EXP-04 | Implemented shared room, clock and catalogue fixtures; unit checks and ordinary-bundle exclusion passed |
| M2-B | Equal candidate harness, borrowed-video experiment and build compatibility | [Comparison workbench](m2-experiments.md) merged in PR #3 at xr 5efb2609aa. Borrowed contracts merged in PR #4 at xr 6a108272fd. Video paths merged in PR #5 at xr f9323ff789, spatial input in PR #6 at xr d5d590d571, movement in PR #7 at xr dc18e92a06 and remote grabbing in PR #8 at xr 1f286b0ad5. Player-preserving overlay merged in PR #9 at xr 27c2f023cd; actual Jellyfin video observed in both PC texture paths with owner pause/resume and clean detach. R-22 cancellation fixed and retested on PC in the next focused slice; device regression remains open. Native layers, subtitles, hands/controllers, full media/physics qualification and G2 remain open; no production engine selected |
| M2-C | Actual-device experiments and architecture decision; G2 | Open; hands, subtitle classes, sustained timing and complete transition evidence cannot be inferred from emulation |
| M2-D | Original model/provenance and equal asset loading; EXP-03/04 | PR #12 merged at xr 1a941de17b; chair variants, collision resources and manifest pass both loaders and Khronos validation. Shared lighting and panel-facing follow-up in 892f920477 inspected on PC; production materials/baked lighting and actual-device cost remain open |
| M3 | Production boundaries and ordinary regression | Awaiting G2 for renderer binding; independent contracts and fixture work may proceed |
| M4 | Complete spatial journey | Awaiting production integration; both input methods required |
| M5 | Production Observatory, physics and comfort | Awaiting functional journey; asset preparation may proceed independently |
| M6 | Final qualification and archive | Awaiting integrated build and required actual-device/usability evidence |

## Readiness dispositions

| Outstanding evidence | Disposition | Blocks |
| --- | --- | --- |
| Detailed Quest seek, audio, subtitle and resume checks | Keep unverified; reuse permissioned media and record each result separately | Complete G1/ordinary scenario pass; dependent media claims |
| Exact emulator profile/version and clean-profile comparison | Owner-reported setup only; inspect when the supported browser surface is available | Reproducible emulation claim |
| Quest remote inspection and About UI labels | Manual check pending; ADB package/build inventory is recorded separately | Remote-debug readiness claim, not fixture/code preparation |
| Direct/remux/transcode and ASS/bitmap fixtures | Inventory missing cases honestly; prepare labelled technical fixtures separately without changing the owner's library | Related EXP-01/02 and release support claims |
| Actual head/hand/comfort and five-viewer observations | Do not synthesize observations; retain pending gates while completing independent work | G2/G3/G4 evidence as assigned |

## Autonomous operation

Continue useful implementation, fixture preparation, source inspection, local tests and focused PRs without repeated permission questions. Merge after appropriate local checks; do not wait for GitHub Actions under D-30. Record CI status separately when available and fix actual failures. A partial slice may merge without closing a milestone.

An hourly thread follow-up is configured to resume unfinished goal work when capacity is available and remain quiet when no action is possible. Account limits cannot be reset with the available tools; the follow-up does not purchase credits. Preserve the current checkout, uncommitted work, test processes and honest evidence state across interruptions.

Do not mark the goal complete because the code is merged or an archive can be generated. Keep device-dependent gates open until the accepted scenarios actually pass; do not silently reduce mandatory hands, spatial depth, physics, comfort or media requirements.

Related: [decisions](../06-decisions/decision-register.md), [risks](risks.md), [M1 evidence](m1-readiness.md), [technology comparison](../06-decisions/technology-evaluation.md).


## Next independent work

PR #10 merged the cancellation fix at xr b8c2174263; PR #11 merged the [plain-text comparison](m2-experiments.md#text-subtitle-comparison-increment--2026-09-30) at xr f0e37f7f75. Both candidates display labelled captions; Babylon also displayed F-01's active text. [Original chair assets](../04-architecture/asset-pipeline.md) now load in both candidates; shared lighting and panel-facing geometry are checked. Next, complete locomotion recovery/reference-space reset handling, continue rich subtitle/native-layer experiments and test overlay source/track changes and repeated open/close. Continue production asset/material preparation independently. Preserve G2: no winner without mandatory real Quest hands/media/comfort measurements. Do not treat PC observations as headset passes.

Checkpoint on 2026-09-30: account usage reached 99%; ordinary usage was still allowed. Two free reset credits were reported, but no available tool can redeem them and native app control is unavailable. The existing hourly continuation remains configured. No credits were purchased or reset claimed.
