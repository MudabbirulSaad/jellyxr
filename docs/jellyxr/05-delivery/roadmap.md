# Roadmap and work breakdown

Status: M0 complete; M1 readiness in progress; immersive application work has not started. Updated: 2026-09-29. Accountable product owner: MudabbirulSaad.

This is the authoritative work sequence. Requirements remain in the [functional](../02-requirements/functional-requirements.md) and [nonfunctional](../02-requirements/nonfunctional-requirements.md) documents; [traceability](../02-requirements/traceability.md) connects them to work and tests. M1 readiness is now authorised; its [evidence report](m1-readiness.md) separates completed setup from outstanding checks. Initial targets and Cinema Observatory are accepted; choosing XR technologies remains an M2/G2 decision.

## Milestones and demonstrable outcomes

| Milestone | Work | Demonstration / exit | Current state |
| --- | --- | --- | --- |
| M0 Planning baseline | W-01 | Linked BRDs, requirements, blueprints and this roadmap; documentation checks; planning branch integrated into `xr` | Complete; merge 84571b91b3 |
| M1 Development and qualification readiness | W-02 preparation | Reproducible upstream build, test server/media inventory, desktop emulation procedure and identified Quest access; G1 decisions recorded | In progress: checks passed; desktop video start and Quest USB setup observed; owner reports Quest library access and ordinary playback. Detailed control/fixture, emulator and remote-inspection evidence pending |
| M2 Prove the difficult media path | W-02 experiments | One film with subtitles, seeking, ordinary/XR transitions and real Quest measurements; G2 technology record | Not started |
| M3 Connect, browse and watch in ordinary mode | W-03, W-04, W-05 | Existing account connects to its server; movie/episode discovery, negotiated playback, tracks and progress work | Not started |
| M4 Complete the spatial journey | W-06 | Connect → authenticate → browse → inspect → enter cinema → watch → return, using controllers and a simple environment | Not started |
| M5 Finish the cinema experience | W-07 | Chosen environment, comfortable screen controls, recenter, scoped preferences and accessible interaction; G3 integration gate | Not started |
| M6 Qualify and release | W-08, W-09 | Ordinary parity, tested hosting/rollback, sustained Quest playback and accepted support matrix; G4 | Not started |
| M7 Expand deliberately | W-10, W-11 | Separately approved extensions and later Vision Pro qualification | Deferred beyond first release |

Dates and effort estimates follow the M1 resource inventory and M2 experiments. No staffing, device availability or delivery date is assumed. M3 can develop library and playback work independently after connection/session foundations; both must converge before M4. Deployment and performance checks start during M2 and repeat as changes warrant them, rather than waiting for M6.

## Gates

| Gate | Exit evidence | Decision owner |
| --- | --- | --- |
| G0 Documentation ready | Fork/base recorded; documents populated; links, diagrams, dependencies and coverage checked | Documentation lead |
| G1 Product and qualification targets | Accept P0 criteria/NFR targets; select visual direction; identify Quest hardware/access, browser/OS, server/SDK constraints and permissioned test media | Product owner with implementation/validation leads |
| G2 Technical feasibility and stack choice | EXP-01 to EXP-06 evidence at the levels defined in the evaluation brief; real Quest playback/subtitle/input/network evidence; written renderer/input/media decisions and viable sustained budget | Implementation lead and product owner |
| G3 Complete first-release journey | P0 functional journey integrated; linked functional scenarios executed on agreed environments; no blocking identity, playback, subtitle, lifecycle or input defect | Implementation lead |
| G4 Release qualification | All P0 FR/NFR evidence reviewed or requirements formally revised; parity audit, proposed 120-minute qualification run, deployment/rollback instructions complete | Validation lead and product owner |
| G5 Expansion | Separate acceptance decisions for P1/P2 work | Product owner |

G1/G2 remain open. G1 product choices are recorded (Quest 3, Cinema Observatory and initial NFR targets); device build/package identifiers and USB access are now recorded, while About labels, complete media and readiness evidence remain incomplete. G3 proves integration; G4 additionally proves the complete support matrix and sustained quality. Roles describe responsibilities, not an assumed team. A gate record identifies the decision maker, date, build, evidence, unresolved issues and the permitted next work.

## Dependency map

~~~mermaid
flowchart TD
    W01["W-01 Documents and pinned foundation"] --> Prep["W-02 Readiness and G1"]
    Prep --> Proof["W-02 Experiments and G2"]
    Proof --> W03["W-03 Connection and identity"]
    W03 --> W04["W-04 Library and details"]
    W03 --> W05["W-05 Playback and recovery"]
    W04 --> W06["W-06 XR lifecycle and spatial library"]
    W05 --> W06
    W06 --> W07["W-07 Cinema and comfort / G3"]
    W07 --> W08["W-08 Parity and deployment qualification"]
    W08 --> W09["W-09 Sustained qualification / G4"]
    W09 --> W10["W-10 Approved extensions / G5"]
    W09 --> W11["W-11 Vision Pro / G5"]
~~~

This graph shows completion dependencies. Fixture design, deployment checks and ordinary regression begin earlier within W-02/W-03 and continue throughout the sequence. Exploratory W-02 code is disposable evidence; it does not depend on completed product packages W-05/W-06, and it must not silently become production architecture.

## Work packages

| ID | Deliverable | Depends on | Requirements | Completion |
| --- | --- | --- | --- | --- |
| <a id="w-01"></a>W-01 | Fork, pinned source audit and linked documentation package | Approved planning request | All planning mappings | G0 checks and Git integration record |
| <a id="w-02"></a>W-02 | Development workflow, qualification fixtures, feasibility experiments and technology decision | W-01; implementation-phase authorisation for setup/spikes; G1 before experiments | NFR-001/002/006/010; all experimental integration risks | Reproducible baseline; EXP evidence and G2 record |
| <a id="w-03"></a>W-03 | Endpoint/login/session and deployment diagnostics | W-02 | FR-001/002/003/004/022; NFR-004/005 | AT-01/02/03/04/16 |
| <a id="w-04"></a>W-04 | Shared library data, home, search and title journey | W-03 | FR-005/006/007; NFR-008 | AT-05/06 ordinary/data portions; XR completion in W-06 |
| <a id="w-05"></a>W-05 | Playback integration, tracks, progress and recovery | W-03, W-02 media decision | FR-008/009/010/011/012/018; NFR-009 | AT-07/08/09/10/14 ordinary/adapter portions; XR transitions in W-06 |
| <a id="w-06"></a>W-06 | XR lifecycle, spatial library and controller input | W-04, W-05 ordinary/data/adapter exits | FR-013/014/021; XR portions of W-04/W-05 requirements | AT-05/06/07/08/09/10/11/13/14 XR portions; no duplicate media ownership |
| <a id="w-07"></a>W-07 | Chosen cinema, geometry, preferences and comfort | W-06, G1 visual decision | FR-015/016/017/019; NFR-003 | AT-04/10/12/13 |
| <a id="w-08"></a>W-08 | Ordinary parity, deployment guide, diagnostics and upstream rehearsal | W-03 through W-07 | FR-020/022; NFR-004/005/006/007/010 | AT-01/02/15/16/25 |
| <a id="w-09"></a>W-09 | Sustained performance and release qualification | W-07, W-08 | NFR-001/002/008/010; all P0 | AT-24, completed first-release matrix, G4 |
| <a id="w-10"></a>W-10 | Individually approved hand/MR/media/social/offline extensions | G4 and extension-specific decisions | FR-023 through FR-028 | AT-17 through AT-22 as scoped |
| <a id="w-11"></a>W-11 | Vision Pro capability and interaction qualification | G4; available hardware | FR-029 | AT-23 and platform decision |

Work packages are local planning items, not automatically filed GitHub issues. W-03 through W-11 have not started. Owners and dates are assigned when a package is taken up; no unchecked action below represents implemented functionality.

## Implementation steps within each package

### W-01 Planning and branch foundation

1. Preserve v12.1 at the pinned SHA, upstream source, licence and installed UI/UX skill provenance.
2. Validate the linked package and distinguish confirmed choices from proposals and untested claims.
3. Commit `docs/planning`, create `xr` from the pinned baseline when absent, merge the planning work and verify the fork branch. This changes documentation and project guidance only.

### W-02 Readiness, experiments and technology decision

1. After the implementation phase begins, reproduce the pinned application build using its recorded Node/npm requirements and lockfile. Run inherited checks and capture pre-existing failures before modifying application code.
2. Prepare test accounts, permissioned media, catalogue and network fixtures. Record exact hardware/browser/server versions, real Quest access and fixture gaps. Review visual alternatives and targets to close G1.
3. Establish the [PC and Quest testing workflow](development-testing-workflow.md): ordinary browser baseline, a development-only emulator, reproducible captures and real-device remote debugging. Evaluate browser automation without treating emulation as headset qualification.
4. Run EXP-01/02 first: known film, media ownership, HLS/seek, subtitle formats, XR entry/exit and interruption. Compare presentation alternatives with a plain dark environment on Quest before commissioning final scene assets.
5. Run EXP-03/04/05 using representative scene/library complexity, controllers and deployment variants. Run EXP-06 ordinary regression and portability review. Keep failed observations, not only favourable captures.
6. Record chosen versions, rejected alternatives and integration seams at G2; update system/integration/deployment blueprints and relevant risks. Archive reproducible experiment evidence and identify which spike code must be rewritten.

Exit: G2 evidence under the [technology evaluation brief](../06-decisions/technology-evaluation.md). Without Quest access, continue desktop investigation and fixture preparation; keep device-dependent conclusions blocked. No production engine is selected by this roadmap.

### W-03 Connection, authentication and session boundaries

1. Reuse existing endpoint/account flows; verify domain, IP, port and Base URL handling, TLS and separate-origin errors.
2. Integrate existing login and Quick Connect behaviour with loading, cancellation, expiry and logout states. Preserve server permissions and server/user cache boundaries.
3. Add actionable, redacted connection diagnostics and return-to-ordinary routes. Test restricted accounts and account/server switching before introducing spatial caches.

Exit: AT-01/02/03/04/16 for this increment, with environment limitations recorded. Reuse working inherited behaviour rather than rebuilding it solely for branding.

### W-04 Library and title discovery

1. Reuse SDK-backed home, libraries, Continue Watching and Next Up data; preserve permissions, pagination and refresh ownership.
2. Connect search/filter/sort, title details, season/episode and media-version selection to the existing data model. Cover missing artwork, long names, empty and loading/error states.
3. Retain selection, scroll/context and resume state across the planned ordinary/XR boundary. Profile incremental use of the 1,000-item fixture before adding dense spatial artwork.

Exit: AT-05/06 ordinary behaviour and data/context contracts ready for W-06; XR-specific portions remain pending W-06. Do not mark an entire scenario passed from a partial execution.

### W-05 Playback, tracks, progress and recovery

1. Implement the narrow integration seam selected by EXP-01. Keep one media/session reporting owner; reuse capability negotiation and direct/remux/transcode decisions.
2. Connect pause, seek, chapters, audio/subtitle choice, episode continuation and resume. Implement the proven subtitle presentation/fallback path for text, ASS and bitmap fixtures.
3. Handle network/server/auth failures with explicit states and preserved progress. Provide lifecycle hooks for W-06 without creating a second media element or progress loop unintentionally.

Exit: ordinary AT-07/08/09/10/14 evidence and integration hooks, followed by full transition coverage in W-06. A working local sample video alone does not satisfy server playback requirements.

### W-06 XR lifecycle, controllers and the complete journey

1. Add capability detection, deliberate session entry, denied/unsupported fallback, focus loss, end and cleanup. Bind to the existing media owner using the selected adapter.
2. Implement spatial home/library, search results and title/episode details with controller selection, back navigation and visible loading/error feedback. Preserve browsing context on return.
3. Demonstrate the complete journey in a simple cinema. Exercise left/right controllers, disconnected input, library-to-XR entry and entry during active ordinary playback.

Exit: AT-05/06/07/08/09/10/11/13/14 XR portions on the appropriate desktop and Quest environments; one audible stream and one reporting owner throughout. Resolve transition defects before environment polish.

### W-07 Cinema, preferences and comfort

1. Build the G1-selected environment with documented asset provenance, coherent scale/materials/lighting and measured quality tiers. Keep film and subtitle readability central.
2. Implement qualified screen geometry, recenter/reset, seated/reclining use, scoped preferences and reduced-motion/text options. Include reachable playback/track controls and recovery from poor placement.
3. Evaluate the complete experience on Quest with representative viewers. Adjust environment cost without silently changing stream-quality policy; record comfort/readability observations and accessibility limitations.

Exit: AT-04/10/12/13 plus integrated journey evidence; close G3 only after earlier journey scenarios are complete. The complete inherited feature audit remains W-08/G4 work. Proposed numeric and usability targets must have a recorded G1 disposition.

### W-08 Ordinary parity, deployment and maintenance

1. Complete the inherited feature audit against the same pinned upstream build and fixtures. Distinguish baseline defects, JellyXR regressions, unsupported combinations and unavailable fixtures.
2. Write and execute hosting instructions for same-origin assets and a separate client: trusted HTTPS domain/IP, ports/base paths, CORS, media/range and WebSocket routing, updates, cached assets and rollback.
3. Review diagnostic/storage privacy and production bundles for development-only tools. Rehearse a representative upstream update on an isolated branch and document the affected integration seams.

Exit: AT-01/02/15/16/25, tested deployment instructions and support-matrix draft. Unavailable inherited fixtures stay visibly blocked until the release claim is resolved.

### W-09 Sustained performance and release

1. Execute the full P0 matrix using the agreed Quest/browser/server/media configurations. Run AT-24 at accepted targets, including the proposed 120-minute viewing session and ten XR cycles; record warmup, frame/video metrics and memory-observation limitations.
2. Fix blocking regressions and repeat affected scenarios. Test the final production artifact with emulation disabled, including deployment and rollback; check that ordinary mode remains usable when immersive XR is unavailable.
3. Publish the tested support matrix, known limitations, version/provenance information and installation/update notes. Tag a release only after G4 is recorded; release publication is a later operation.

Exit: accepted G4 evidence for every P0 requirement, rather than a desktop frame-rate claim. No release tag or production deployment is part of the current documentation merge.

### W-10 Extensions and W-11 future platform

Treat hands, passthrough, advanced media, reactive lighting/metadata enhancements, shared viewing and offline support as separately scoped work. Resolve each feature's dependencies and acceptance criteria before implementing it; preserve existing P1/P2 priorities. W-11 requires actual Vision Pro/browser/input/media evidence under AT-23 and an explicit platform-support decision. Neither package blocks the agreed first release.

## Reviewable changes and evidence

Start future feature branches from `xr`; keep changes small enough to demonstrate a user outcome or resolve one experiment. Each change links its W/FR/NFR/AT/EXP identifiers, changed integration points, build/base SHA and relevant evidence. Include upstream checks appropriate to the code and focused runtime scenarios. A failed feasibility gate changes the blueprint or recorded scope visibly; it does not silently replace the Jellyfin foundation.

Use an evidence record containing environment, fixture, steps, expected/actual behaviour, result, limitations and redacted captures. Label each run ordinary desktop, emulated XR or actual Quest. [Test strategy](test-strategy.md) owns the acceptance procedure; [development testing workflow](development-testing-workflow.md) owns the day-to-day execution approach. A package is complete when its assigned scenario portions have evidence; the overall scenario stays incomplete until all assigned packages/environments are covered. Thus W-04/W-05 ordinary exits can unblock W-06 without falsely claiming XR portions passed.

## Current M1 completion work

Finish the pending steps in the [M1 evidence report](m1-readiness.md): detailed playback/fixture inventory, separate emulator-profile verification and manual remote inspection. The build baseline, signed-in desktop access, authorised USB setup and owner-reported ordinary Quest playback are recorded. Once G1 is recorded, the first M2 XR experiment is one correctly played and subtitled film with reliable entry/exit; the engine decision follows that evidence.

## Release and update operations

Serve versioned client assets with a rollback copy of the prior client. Verify asset public paths, cached bundles, endpoint settings and socket/media routes after deployment. A client update must not migrate or replace the user's Jellyfin library.

Use local redacted diagnostics during qualification. A hosted analytics or monitoring service is not assumed. Re-run playback, subtitle and continuity scenarios after upstream player or SDK changes; expand tests when changes introduce a new risk.
