# Roadmap and work breakdown

Status: M1 merged; readiness closure and M2 preparation active under the approved M6 goal. Updated: 2026-09-30. Product owner: MudabbirulSaad.

This is the authoritative work sequence. Acceptance lives in the [functional](../02-requirements/functional-requirements.md) and [nonfunctional](../02-requirements/nonfunctional-requirements.md) requirements, connected by [traceability](../02-requirements/traceability.md). The [execution ledger](implementation-goal.md) records actual progress; [M1 evidence](m1-readiness.md) preserves observed setup results.

## Milestones and demonstrable outcomes

| Milestone | Work | Demonstration / exit | Current state |
| --- | --- | --- | --- |
| M0 Planning baseline | W-01 | Linked requirements, blueprints, source audit and documentation validation | Complete; merge 84571b91b3 |
| M1 Readiness closure | W-02 preparation | Detailed ordinary playback, tooling/version and fixture inventory; revised scope and G1 disposition | PR #1 merged at f82e5c10c2; desktop follow-up adds chapter, track-control and reload/Resume observations. Audible/synchronized tracks, exact resume offset, Quest controls, emulator metadata and manual inspection remain open |
| M2 Prove media, spatial interaction and technology | W-02 experiments | Equal Babylon/Havok and Three/Rapier scenes; media/subtitle, input, movement, build and performance evidence; G2 | [Comparison workbench](m2-experiments.md) includes PC-checked video, text/ASS/PGS fixtures, bitmap/native-layer seams, scene-occlusion, pointing and grab tracking-loss recovery fixtures, movement, original chairs/shell/library bays, bounded screen size/distance/height/tilt and 100/125/150% spatial text, plain-text caption settings and native sleep scheduling; general recenter/curvature, real-server bitmap, native composition, visual pointing and mandatory device evidence remain open, no technology selected |
| M3 Production integration boundaries | W-03, W-04, W-05; W-06 lifecycle seam | Bounded lazy XR feature in inherited React app; shared identity/library state, borrowed media bridge, scoped preferences and clean entry/exit | Awaiting G2; independent contracts/fixtures may be prepared |
| M4 Complete spatial journey | W-06 | Connect/authenticate in ordinary mode, enter XR, browse/search/detail/play/control/return in simple room; both inputs and seated movement/recovery | Awaiting integration |
| M5 Finish Cinema Observatory | W-07 | Production models/materials, physical objects, comfortable screen/text/controls and actual-headset review; G3 | Awaiting functional journey |
| M6 Qualify and package v1 | W-08, W-09 | Parity, deployment, sustained media/input/comfort/usability evidence and versioned static archive; G4 | Independent [packaging rehearsal](packaging-evidence.md), fresh locked install and both builds exercised; representative upstream update has isolated evidence. Static /xr/ bootstrap, root-switch hazard, retained chunks and normal-reload rollback have loopback checks. Final integrated build, production cache/hosting/device evidence and G4 remain open |
| M7 Expand deliberately | W-10, W-11 | Separately approved extensions and Vision Pro qualification | Beyond this goal |

No delivery date, fabricated staffing or benchmark is assumed. Work can proceed independently while evidence is pending; an incomplete dependent gate cannot be declared passed to accelerate the schedule. Production renderer binding follows G2; renderer-independent contracts, fixtures, assets and desktop checks may be prepared earlier.

## Gates

| Gate | Exit evidence | Decision owner |
| --- | --- | --- |
| G0 Documentation ready | Provenance, linked requirements, diagrams, dependency and coverage checks | Implementation lead |
| G1 Product and qualification readiness | Accepted scope/targets, Quest/server/browser inventory, ordinary baseline, tooling and permissioned fixtures with missing-case dispositions | Product owner + validation lead |
| G2 Technical feasibility and stack choice | EXP-01 through EXP-06 at the levels defined in the evaluation brief; both inputs, media/subtitle, comfort, build and sustained budget; exact versions and architecture decision | Implementation lead + product owner |
| G3 Complete polished journey | All P0 functional paths integrated and device-tested, including physical recovery and seated access; no blocking playback, identity, input or comfort defects | Implementation lead |
| G4 Release qualification | All P0 FR/NFR evidence reviewed or requirements explicitly revised; parity, hosting, 120-minute/ten-cycle/catalogue and five-viewer evidence; packaged build/provenance/rollback | Validation lead + product owner |
| G5 Expansion | Separate acceptance decisions for P1/P2 work | Product owner |

G1 remains partially open: product choices and USB access are confirmed, ordinary Quest playback and emulator readiness are owner-reported, while detailed controls, inspector and some fixture metadata are unverified. Missing media cases remain required for dependent experiments; preparation does not require waiting for their arrival. G2/G3/G4 remain open. Each gate record names date/build/evidence, unresolved items and permitted next work.

## Dependency map

~~~mermaid
flowchart TD
    W01["W-01 Documents and pinned foundation"] --> Prep["W-02 Readiness and G1"]
    Prep --> Proof["W-02 Experiments and G2"]
    Proof --> W03["W-03 Identity and XR boundary"]
    W03 --> W04["W-04 Shared library state"]
    W03 --> W05["W-05 Media bridge and recovery"]
    W04 --> W06["W-06 Spatial journey and both inputs"]
    W05 --> W06
    W06 --> W07["W-07 Observatory and physics / G3"]
    W07 --> W08["W-08 Parity and deployment"]
    W08 --> W09["W-09 Qualification and package / G4"]
    W09 --> W10["W-10 Approved extensions / G5"]
    W09 --> W11["W-11 Vision Pro / G5"]
~~~

These are completion dependencies. Prototype code and shared test fixtures may precede production work. Experiments remain clearly separated and do not silently become production architecture.

## Work packages

| ID | Deliverable | Depends on | Requirements | Completion |
| --- | --- | --- | --- | --- |
| <a id="w-01"></a>W-01 | Pinned source audit and linked documentation | Approved planning request | All planning mappings | G0 checks and integration record |
| <a id="w-02"></a>W-02 | Readiness, common comparison fixtures, experiments and G2 decision | W-01; G1 dispositions for dependent experiments | NFR-001/002/006/010; all feasibility risks | Reproducible baseline and EXP evidence |
| <a id="w-03"></a>W-03 | Existing endpoint/login/session reuse, lazy XR feature boundary and diagnostics | W-02 | FR-001/002/003/004/022; NFR-004/005 | AT-01/02/03/04/16; ordinary regression |
| <a id="w-04"></a>W-04 | Shared library identity, filters, selection, pagination and title state | W-03 | FR-005/006/007; NFR-008 | AT-05/06 ordinary/data portions; XR in W-06 |
| <a id="w-05"></a>W-05 | Borrowed media bridge, tracks, progress and interruption integration | W-03, W-02 media decision | FR-008/009/010/011/012/018; NFR-009 | AT-07/08/09/10/14 adapter portions; XR in W-06 |
| <a id="w-06"></a>W-06 | Session lifecycle, spatial library/search, both inputs and movement | W-04, W-05 | FR-013/014/021/023/030; XR portions of W-04/W-05 | AT-05/06/07/08/09/10/11/13/14/17/26 |
| <a id="w-07"></a>W-07 | Observatory assets, bounded physics, screen geometry and preferences | W-06 | FR-015/016/017/019/031; NFR-003 | AT-04/10/12/13/17/26/27; G3 |
| <a id="w-08"></a>W-08 | Ordinary parity, hosting/rollback, privacy/licence audit and upstream rehearsal | W-03 through W-07 | FR-020/022; NFR-004/005/006/007/010 | AT-01/02/15/16/25; production bundle audit |
| <a id="w-09"></a>W-09 | Sustained qualification, usability and release-ready archive | W-07, W-08 | NFR-001/002/008/010; all P0 | AT-24, full release matrix and G4 |
| <a id="w-10"></a>W-10 | Separately approved MR/media/social/offline extensions | G4 and extension decisions | FR-024 through FR-028 | AT-18 through AT-22 as scoped |
| <a id="w-11"></a>W-11 | Vision Pro qualification | G4; actual hardware | FR-029 | AT-23 and platform decision |

## Ordered implementation slices

### M1 closure and W-02 preparation

1. Preserve the reproduced Node/npm/lockfile baseline and outstanding ordinary control checks. Do not replay broad checks for documentation alone.
2. Record connected Quest inventory and emulator readiness separately from verified configuration. Reproduce two-port USB forwarding; manual remote inspection stays pending until observed.
3. Inventory anonymous direct-play, remux/transcode, audio and subtitle fixtures; record unavailable cases and their dependent experiments. Never manufacture a pass.
4. Apply approved scope changes to requirements, decisions, parity, tests and traceability before implementation. Create deterministic technical fixtures without modifying the owner's library.

### M2 and W-02 experiments

1. Build disposable Babylon/Havok and Three/Rapier comparison scenes with equal geometry, material, collider, control and media fixtures. WebGL is the baseline.
2. Investigate media layers first, then the video-texture path. Borrow the inherited active video; preserve one audio/progress owner. Exercise direct and converted playback, seeking, all required subtitle classes and transitions.
3. Compare controller/hand selection, near input, grab, tracking loss, teleport/snap/return and seated operation; run matched geometry/physics stress and 1,000-item catalogue workloads.
4. Run short repeated profiles and the accepted sustained experiment on actual Quest. Verify inherited build and ES5 compatibility, dependencies and licences.
5. Record exact renderer/physics/input/text/subtitle/media versions and results using D-28. Do not bind production to a candidate before G2; if neither passes, document the failed gate and revised approach.

### M3 and W-03 through W-05

1. Host a bounded lazy-loaded XR feature in the existing React app. Reuse endpoint, account, permission, query and playback infrastructure; expose deliberate Enter cinema with capability/error states.
2. Introduce the tested borrowed-media bridge and session lifecycle, safe disposal, reference-space handling and redacted diagnostics.
3. Preserve library identity, filters, selected title and pagination across ordinary/spatial views. Add validated server/user/device-scoped viewing preferences and reset behaviour.
4. Retain localization and ordinary compatibility; verify integration tests and clean entry/exit before completing this milestone.

### M4 and W-06

1. Implement spatial movies/series/seasons/episodes, Continue Watching and permitted collections; add spatial keyboard, search/filter, incremental artwork and restored context.
2. Implement detail/play/seek/chapters/audio/subtitles/episode continuation through the same playback owner. Cover loading, empty, missing-art, permission and retry states.
3. Complete both controller and hand journeys in a simple room, including valid teleport, snap turning, seat selection and recovery controls.
4. Handle network/auth/input/session interruptions without duplicate activation, audio or reporting. Qualify the complete Quest journey before visual polish closes any gate.

### M5 and W-07

1. Replace simple geometry with original/approved free redistributable glTF/GLB models, PBR materials, baked lighting and compressed textures; preserve collision/source manifests.
2. Finish physical remote and constrained art/panels, collision/recall/reset, readable text, selection feedback and restrained spring motion.
3. Finish qualified screen geometry, reduced motion, text scale, seated/reclining and environment tiers, keeping video/subtitle quality independent.
4. Produce comparable library/detail/cinema/hands/error reference views. Apply UI/UX Pro Max selectively and perform real-headset comfort/readability review; optimize measured draw/texture/geometry/simulation costs. Close G3 only with functional and physical evidence.

### M6 and W-08/W-09

1. Complete ordinary feature parity and Quest media/input/recovery matrix. Test HTTPS domain/trusted IP, ports/base paths, separate origins, media ranges and WebSockets.
2. Reproduce production installation, upgrade/cache behaviour and rollback. Audit asset licences, notices, diagnostics, credentials and development-only exclusions; rehearse an upstream update.
3. Run final 120-minute viewing, ten XR cycles, 1,000-item catalogue, controllers/hands/movement/seated/reclining and five-viewer tasks against accepted criteria.
4. Fix and repeat affected scenarios. Package a versioned static-client archive with checksums, build/provenance manifest, installation/update/rollback instructions, support matrix and honest limitations.
5. Close G4 and the goal only when required evidence passes. Public release publication and production deployment remain separate actions.

## Review and integration

Use focused branches and PRs targeting xr. Link work/requirement/scenario IDs and distinguish directly observed results, owner reports and emulation. Run and inspect appropriate local inherited checks and scenario tests. The latest owner instruction permits merging without waiting for GitHub Actions; it does not turn unavailable device evidence into a pass. Keep CI failures visible for follow-up.

Partial slices may merge while the milestone stays open. Continue independent work when human evidence is pending; do not ask repeatedly or claim completion merely because code merged. The [execution ledger](implementation-goal.md) and evidence reports record the remaining gates.

## Beyond M6

Passthrough, stereo/180/360, reactive film lighting, shared viewing, offline library and actual Vision Pro qualification require separately scoped W-10/W-11 work. Hands, exploration and bounded physical interaction are already v1 requirements.
