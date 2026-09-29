# JellyXR development documentation

Status: M6 goal active; M1 scope integrated and M2 comparison workbench implemented, device qualification still open, 2026-09-29. Owner: MudabbirulSaad.

JellyXR is a self-hosted Jellyfin Web fork with a spatial library and immersive cinema for Meta Quest. It uses an existing Jellyfin endpoint and account. Vision Pro is a future platform. This package prepares implementation and the next technology decision; it does not claim that XR functionality is implemented or tested.

## Start here

1. Read the three business requirement documents for intent and boundaries.
2. Review requirements and the feature parity matrix for release commitments.
3. Follow the experience and system blueprints for proposed behaviour.
4. Review risks and technology experiments before selecting additional technologies.
5. Use traceability to connect every first-release requirement to implementation work and validation.
6. Follow the [implementation roadmap](05-delivery/roadmap.md), [PC/Quest testing workflow](05-delivery/development-testing-workflow.md) and [M1 evidence](05-delivery/m1-readiness.md). The [M6 execution goal](05-delivery/implementation-goal.md) is active; Cinema Observatory, Quest 3, hands/controllers, exploration and initial targets are confirmed. Remaining G1 environment/fixture evidence and all G2 technology choices are open.

## Document register

| Area | Document | Status |
| --- | --- | --- |
| Business | [Product BRD](01-business/product-brd.md) | Intent and initial targets confirmed; measurement pending |
| Business | [Jellyfin foundation BRD](01-business/jellyfin-foundation-brd.md) | Foundation confirmed |
| Business | [XR experience BRD](01-business/xr-experience-brd.md) | Scope confirmed; Cinema Observatory selected |
| Requirements | [Functional requirements](02-requirements/functional-requirements.md) | Accepted v1 scope; implementation pending |
| Requirements | [Nonfunctional requirements](02-requirements/nonfunctional-requirements.md) | Initial targets accepted; measurement pending |
| Requirements | [Feature parity matrix](02-requirements/feature-parity.md) | Source-informed; device validation pending |
| Requirements | [Traceability](02-requirements/traceability.md) | Complete planning mapping |
| Experience | [Experience blueprint](03-experience/experience-blueprint.md) | Proposed interaction behaviour |
| Experience | [Visual and spatial direction](03-experience/visual-direction.md) | Cinema Observatory selected; alternatives retained as references |
| Experience | [Cinema Observatory specification](03-experience/cinema-observatory.md) | Composition, reference tokens and copy defined; spatial validation pending |
| Architecture | [Upstream assessment](04-architecture/upstream-assessment.md) | Pinned source inspected |
| Architecture | [System blueprint](04-architecture/system-blueprint.md) | Logical proposal; engine deferred |
| Architecture | [Jellyfin integration contract](04-architecture/jellyfin-integration.md) | Source-informed; integration tests pending |
| Architecture | [Deployment and security](04-architecture/deployment-security.md) | Reference topology; device validation pending |
| Delivery | [Active implementation goal](05-delivery/implementation-goal.md) | Active through M6; device gates remain open |
| Delivery | [Roadmap and work breakdown](05-delivery/roadmap.md) | M1 merged; closure and M2 preparation active |
| Delivery | [Test and validation strategy](05-delivery/test-strategy.md) | Unit/build baseline passed; application acceptance scenarios remain incomplete |
| Delivery | [PC and Quest development testing](05-delivery/development-testing-workflow.md) | Build, signed-in desktop and Quest USB setup exercised; complete playback, emulator and remote inspection pending |
| Delivery | [M2 experiment evidence](05-delivery/m2-experiments.md) | Both comparison scenes render on PC; media/input/device experiments pending |
| Delivery | [M1 readiness evidence](05-delivery/m1-readiness.md) | Actual build results, fixture inventory and outstanding actions |
| Delivery | [Risks and open questions](05-delivery/risks.md) | Active decision backlog |
| Decisions | [Decision register](06-decisions/decision-register.md) | Confirmed, proposed and deferred entries |
| Decisions | [Technology evaluation brief](06-decisions/technology-evaluation.md) | Criteria and experiments; no winner selected |
| References | [Glossary and sources](references/glossary-sources.md) | Dated source register |
| Delivery | [Documentation validation record](05-delivery/documentation-validation.md) | Documentation checks only |

## Reading rules

P0 is required for the first library-and-cinema release. P1 is a proposed subsequent extension. P2 is a future investigation. Ordinary-mode preservation is independent of whether an XR adaptation is scheduled.

A source-inspected capability is not a tested compatibility claim. Initial numeric quality targets are accepted under D-10; device measurements remain pending at G2/G4. The [decision register](06-decisions/decision-register.md) is authoritative about what has been agreed.

## Repository baseline

Fork: [MudabbirulSaad/jellyxr](https://github.com/MudabbirulSaad/jellyxr).
Upstream: [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web).
Baseline: v12.1, commit fae41f33eb7cd636a9ef68984adb82bb247a6e1b.
Integration branch: `xr`, from the pinned baseline; planning work is authored on `docs/planning` and merged into `xr`. Git history records the integration. Existing upstream source remains the application foundation.

The inherited stack constrains the future decision: React, TypeScript and the Jellyfin SDK already exist. Renderer, spatial UI, media-layer integration and asset pipeline choices remain open.

## Maintaining this package

Use stable BG, FR, NFR, W, AT, D, R and EXP identifiers. Keep each definition in its authoritative document. When scope changes, update requirements, traceability, parity and release work together. Record new evidence with source/date or test environment and result; never replace a pending result with an assumption.
