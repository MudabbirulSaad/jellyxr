# Requirements traceability

Status: planning coverage complete; M1 build/readiness evidence recorded, application acceptance scenarios incomplete. Updated: 2026-09-29.

Authoritative behaviour is defined in the linked requirements. This matrix maps intent to design, delivery and evidence without restating acceptance text.

## Business coverage

| Goal | Related business requirements | Representative requirements | Work / evidence |
| --- | --- | --- | --- |
| BG-01 Existing Jellyfin identity and media | BF-01/02; BX-03 | FR-001 through FR-004, FR-008/009/019; NFR-004/009 | W-03/05/07; AT-01/03/04/07/08/14 |
| BG-02 Straightforward discovery and resume | BX-01/04 | FR-005 through FR-008, FR-013/014/021/023; NFR-003/008 | W-04/06; AT-05/06/07/11/13/17 |
| BG-03 Comfortable convincing cinema | BX-02/03/05 | FR-010 through FR-019, FR-030/031; NFR-001/002/003 | W-05/06/07/09; AT-09/10/12/13/14/24/26/27 |
| BG-04 Understandable self-hosting | BF-04 | FR-001/022; NFR-004/005 | W-03/08; AT-01/02/16 |
| BG-05 Preserve client value | BF-01/03; BX-04 | FR-004/008/013/020; NFR-006 | W-05/06/08; AT-04/07/11/15 |
| BG-06 Maintainability and expansion | BF-05; BX-05 | FR-020/022/029; NFR-006/007/010 | W-02/08/11; AT-15/16/23/25 |

Goals are defined in the [Product BRD](../01-business/product-brd.md); BF/BX entries are in the [foundation](../01-business/jellyfin-foundation-brd.md) and [XR](../01-business/xr-experience-brd.md) BRDs.

## Functional coverage

| Requirement | Goal | Blueprint | Work | Acceptance scenario | Release |
| --- | --- | --- | --- | --- | --- |
| [FR-001](functional-requirements.md#fr-001) | BG-01, BG-04 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03) | [AT-01](../05-delivery/test-strategy.md#at-01), [AT-02](../05-delivery/test-strategy.md#at-02) | First release |
| [FR-002](functional-requirements.md#fr-002) | BG-01 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03) | [AT-03](../05-delivery/test-strategy.md#at-03) | First release |
| [FR-003](functional-requirements.md#fr-003) | BG-01, BG-02 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03) | [AT-03](../05-delivery/test-strategy.md#at-03) | First release |
| [FR-004](functional-requirements.md#fr-004) | BG-01, BG-05 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03) | [AT-04](../05-delivery/test-strategy.md#at-04) | First release |
| [FR-005](functional-requirements.md#fr-005) | BG-02 | [Experience](../03-experience/experience-blueprint.md) | [W-04](../05-delivery/roadmap.md#w-04), [W-06](../05-delivery/roadmap.md#w-06) | [AT-05](../05-delivery/test-strategy.md#at-05) | First release |
| [FR-006](functional-requirements.md#fr-006) | BG-02 | [Experience](../03-experience/experience-blueprint.md) | [W-04](../05-delivery/roadmap.md#w-04), [W-06](../05-delivery/roadmap.md#w-06) | [AT-05](../05-delivery/test-strategy.md#at-05) | First release |
| [FR-007](functional-requirements.md#fr-007) | BG-02 | [Experience](../03-experience/experience-blueprint.md) | [W-04](../05-delivery/roadmap.md#w-04), [W-06](../05-delivery/roadmap.md#w-06) | [AT-06](../05-delivery/test-strategy.md#at-06) | First release |
| [FR-008](functional-requirements.md#fr-008) | BG-01, BG-05 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-07](../05-delivery/test-strategy.md#at-07) | First release |
| [FR-009](functional-requirements.md#fr-009) | BG-01, BG-03 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-08](../05-delivery/test-strategy.md#at-08) | First release |
| [FR-010](functional-requirements.md#fr-010) | BG-02, BG-03 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-09](../05-delivery/test-strategy.md#at-09) | First release |
| [FR-011](functional-requirements.md#fr-011) | BG-01, BG-03 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-10](../05-delivery/test-strategy.md#at-10) | First release |
| [FR-012](functional-requirements.md#fr-012) | BG-03 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-10](../05-delivery/test-strategy.md#at-10) | First release |
| [FR-013](functional-requirements.md#fr-013) | BG-02, BG-05 | [System](../04-architecture/system-blueprint.md) | [W-06](../05-delivery/roadmap.md#w-06) | [AT-11](../05-delivery/test-strategy.md#at-11) | First release |
| [FR-014](functional-requirements.md#fr-014) | BG-02 | [Experience](../03-experience/experience-blueprint.md) | [W-06](../05-delivery/roadmap.md#w-06) | [AT-05](../05-delivery/test-strategy.md#at-05), [AT-11](../05-delivery/test-strategy.md#at-11), [AT-26](../05-delivery/test-strategy.md#at-26) | First release |
| [FR-015](functional-requirements.md#fr-015) | BG-03 | [Visual direction](../03-experience/visual-direction.md) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-12](../05-delivery/test-strategy.md#at-12) | First release |
| [FR-016](functional-requirements.md#fr-016) | BG-03 | [Experience](../03-experience/experience-blueprint.md) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-12](../05-delivery/test-strategy.md#at-12) | First release; [partial M2 placement evidence](../05-delivery/m2-experiments.md#screen-placement-increment--2026-09-30) |
| [FR-017](functional-requirements.md#fr-017) | BG-03 | [Experience](../03-experience/experience-blueprint.md) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-13](../05-delivery/test-strategy.md#at-13) | First release |
| [FR-018](functional-requirements.md#fr-018) | BG-01, BG-03 | [System](../04-architecture/system-blueprint.md) | [W-05](../05-delivery/roadmap.md#w-05), [W-06](../05-delivery/roadmap.md#w-06) | [AT-14](../05-delivery/test-strategy.md#at-14) | First release |
| [FR-019](functional-requirements.md#fr-019) | BG-01, BG-03 | [System](../04-architecture/system-blueprint.md) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-04](../05-delivery/test-strategy.md#at-04), [AT-12](../05-delivery/test-strategy.md#at-12) | First release |
| [FR-020](functional-requirements.md#fr-020) | BG-05, BG-06 | [Upstream assessment](../04-architecture/upstream-assessment.md) | [W-08](../05-delivery/roadmap.md#w-08) | [AT-15](../05-delivery/test-strategy.md#at-15) | First release |
| [FR-021](functional-requirements.md#fr-021) | BG-02, BG-03 | [Experience](../03-experience/experience-blueprint.md) | [W-06](../05-delivery/roadmap.md#w-06) | [AT-13](../05-delivery/test-strategy.md#at-13) | First release |
| [FR-022](functional-requirements.md#fr-022) | BG-04, BG-06 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03), [W-08](../05-delivery/roadmap.md#w-08) | [AT-02](../05-delivery/test-strategy.md#at-02), [AT-16](../05-delivery/test-strategy.md#at-16) | First release |
| [FR-023](functional-requirements.md#fr-023) | BG-02, BG-03 | [Experience](../03-experience/experience-blueprint.md) | [W-06](../05-delivery/roadmap.md#w-06) | [AT-17](../05-delivery/test-strategy.md#at-17) | First release |
| [FR-024](functional-requirements.md#fr-024) | BG-03 | [System](../04-architecture/system-blueprint.md) | [W-10](../05-delivery/roadmap.md#w-10) | [AT-18](../05-delivery/test-strategy.md#at-18) | Future |
| [FR-025](functional-requirements.md#fr-025) | BG-03 | [Media integration](../04-architecture/jellyfin-integration.md) | [W-10](../05-delivery/roadmap.md#w-10) | [AT-19](../05-delivery/test-strategy.md#at-19) | Future |
| [FR-026](functional-requirements.md#fr-026) | BG-02, BG-03 | [Visual direction](../03-experience/visual-direction.md) | [W-10](../05-delivery/roadmap.md#w-10) | [AT-20](../05-delivery/test-strategy.md#at-20) | Future |
| [FR-027](functional-requirements.md#fr-027) | BG-03 | [System](../04-architecture/system-blueprint.md) | [W-10](../05-delivery/roadmap.md#w-10) | [AT-21](../05-delivery/test-strategy.md#at-21) | Future |
| [FR-028](functional-requirements.md#fr-028) | BG-01 | [System](../04-architecture/system-blueprint.md) | [W-10](../05-delivery/roadmap.md#w-10) | [AT-22](../05-delivery/test-strategy.md#at-22) | Future |
| [FR-029](functional-requirements.md#fr-029) | BG-06 | [System](../04-architecture/system-blueprint.md) | [W-11](../05-delivery/roadmap.md#w-11) | [AT-23](../05-delivery/test-strategy.md#at-23) | Future |
| [FR-030](functional-requirements.md#fr-030) | BG-02, BG-03 | [Movement](../03-experience/experience-blueprint.md#movement-and-object-recovery) | [W-06](../05-delivery/roadmap.md#w-06) | [AT-26](../05-delivery/test-strategy.md#at-26) | First release |
| [FR-031](functional-requirements.md#fr-031) | BG-03 | [Physical behaviour](../04-architecture/system-blueprint.md#interaction-and-simulation), [remote model contract](../04-architecture/asset-pipeline.md#remote-model-comparison-contract--2026-09-30) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-27](../05-delivery/test-strategy.md#at-27), [AT-24](../05-delivery/test-strategy.md#at-24) | First release; [partial model evidence](../05-delivery/m2-experiments.md#remote-model-increment--2026-09-30), device gates open |

## Nonfunctional coverage

| Requirement | Goal | Blueprint | Work | Acceptance scenario | Release |
| --- | --- | --- | --- | --- | --- |
| [NFR-001](nonfunctional-requirements.md#nfr-001) | BG-03 | [System](../04-architecture/system-blueprint.md) | [W-02](../05-delivery/roadmap.md#w-02), [W-09](../05-delivery/roadmap.md#w-09) | [AT-24](../05-delivery/test-strategy.md#at-24) | First release |
| [NFR-002](nonfunctional-requirements.md#nfr-002) | BG-03 | [System](../04-architecture/system-blueprint.md) | [W-02](../05-delivery/roadmap.md#w-02), [W-09](../05-delivery/roadmap.md#w-09) | [AT-14](../05-delivery/test-strategy.md#at-14), [AT-24](../05-delivery/test-strategy.md#at-24) | First release |
| [NFR-003](nonfunctional-requirements.md#nfr-003) | BG-02, BG-03 | [Experience](../03-experience/experience-blueprint.md) | [W-07](../05-delivery/roadmap.md#w-07) | [AT-10](../05-delivery/test-strategy.md#at-10), [AT-13](../05-delivery/test-strategy.md#at-13), [AT-17](../05-delivery/test-strategy.md#at-17), [AT-26](../05-delivery/test-strategy.md#at-26), [AT-27](../05-delivery/test-strategy.md#at-27) | First release |
| [NFR-004](nonfunctional-requirements.md#nfr-004) | BG-01, BG-04 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03), [W-08](../05-delivery/roadmap.md#w-08) | [AT-04](../05-delivery/test-strategy.md#at-04), [AT-16](../05-delivery/test-strategy.md#at-16) | First release |
| [NFR-005](nonfunctional-requirements.md#nfr-005) | BG-04 | [Deployment and identity](../04-architecture/deployment-security.md) | [W-03](../05-delivery/roadmap.md#w-03), [W-08](../05-delivery/roadmap.md#w-08) | [AT-01](../05-delivery/test-strategy.md#at-01), [AT-02](../05-delivery/test-strategy.md#at-02) | First release |
| [NFR-006](nonfunctional-requirements.md#nfr-006) | BG-05, BG-06 | [Upstream assessment](../04-architecture/upstream-assessment.md) | [W-02](../05-delivery/roadmap.md#w-02), [W-08](../05-delivery/roadmap.md#w-08) | [AT-15](../05-delivery/test-strategy.md#at-15), [AT-24](../05-delivery/test-strategy.md#at-24) | First release |
| [NFR-007](nonfunctional-requirements.md#nfr-007) | BG-06 | [Upstream assessment](../04-architecture/upstream-assessment.md), [notice contract/evidence](../05-delivery/packaging-evidence.md#installed-dependency-notices--2026-09-30) | [W-08](../05-delivery/roadmap.md#w-08) | [AT-25](../05-delivery/test-strategy.md#at-25); final redistribution/source review open | First release |
| [NFR-008](nonfunctional-requirements.md#nfr-008) | BG-02, BG-03 | [System](../04-architecture/system-blueprint.md) | [W-04](../05-delivery/roadmap.md#w-04), [W-09](../05-delivery/roadmap.md#w-09) | [AT-05](../05-delivery/test-strategy.md#at-05), [AT-24](../05-delivery/test-strategy.md#at-24) | First release |
| [NFR-009](nonfunctional-requirements.md#nfr-009) | BG-01, BG-03 | [System](../04-architecture/system-blueprint.md) | [W-05](../05-delivery/roadmap.md#w-05) | [AT-14](../05-delivery/test-strategy.md#at-14) | First release |
| [NFR-010](nonfunctional-requirements.md#nfr-010) | BG-06 | [System](../04-architecture/system-blueprint.md), [evidence workflow](../05-delivery/development-testing-workflow.md), [exact notice/package evidence](../05-delivery/packaging-evidence.md#installed-dependency-notices--2026-09-30) | [W-02](../05-delivery/roadmap.md#w-02), [W-08](../05-delivery/roadmap.md#w-08), [W-09](../05-delivery/roadmap.md#w-09) | [AT-16](../05-delivery/test-strategy.md#at-16), [AT-24](../05-delivery/test-strategy.md#at-24), [AT-25](../05-delivery/test-strategy.md#at-25); evidence protocol applies to all scenarios | First release |

## Coverage interpretation

All 25 P0 functional requirements and all 10 nonfunctional requirements have work and test mappings. FR-024 through FR-029 remain extension requirements with future scenarios. Documentation completeness does not mean those scenarios have passed.

W-01 produced the package. W-02 preparation now has [M1 evidence](../05-delivery/m1-readiness.md), including initial build and server-screen checks; experimental choices remain open before production implementation. The [roadmap](../05-delivery/roadmap.md) maps W-01 through W-11 to milestones M0 through M7 and ordered implementation steps. The [testing workflow](../05-delivery/development-testing-workflow.md) separates PC iteration from actual-device evidence; it adds no competing product requirements. The [feature parity matrix](feature-parity.md) provides per-capability preservation status. The [decision register](../06-decisions/decision-register.md) and [risks](../05-delivery/risks.md) identify remaining gates.

When a requirement changes, update its work/scenario mappings and any affected business goal. Do not remove an inherited feature merely by moving its XR adaptation to a later release.

The [library-bay comparison evidence](../05-delivery/m2-experiments.md#library-bay-increment--2026-09-30) supports W-02 preparation for FR-015/031 and the clearance portions of FR-014/030. It does not complete W-07, AT-12/26/27 or any device scenario; production artwork interaction and actual headset qualification remain open.

The [grab-tracking recovery evidence](../05-delivery/m2-experiments.md#grab-tracking-recovery-increment--2026-09-30) supports W-02 comparison work for FR-021/023/031. Controlled events prove the repaired cancellation/ownership path; they do not close AT-17/27 or replace actual-controller and hands-only qualification.

The [spatial text-size evidence](../05-delivery/m2-experiments.md#spatial-text-size-increment--2026-09-30) supports W-02 preparation for FR-017 and the input/geometry portions of FR-014/021/023. Complete fixture text, matching hit bounds and selected PC states are checked. W-07 and AT-13/17 still require actual headset readability, seated/reclining use, both input methods and the other comfort settings; no complete requirement pass is recorded.

The [static hosting rehearsal](../05-delivery/packaging-evidence.md#static-base-path-and-rollback-rehearsal--2026-09-30) supports W-08/W-09 preparation for NFR-005/008/010 and the static-client parts of AT-01/24. Its loopback base path and bootstrap revision checks do not close authenticated playback, production cache/rollback, HTTPS, media transport or device qualification.

The [native sleep evidence](../05-delivery/m2-experiments.md#native-sleep-scheduling-increment--2026-09-30) supports W-02 comparison work for FR-031 and NFR-001/002. Installed-engine sleep/wake and controlled-clock behaviour are checked; AT-11/18/27 still need the actual-device sustained, input and physics evidence. A synthetic time jump is not an extended viewing-session result.

The [plain-text caption settings evidence](../05-delivery/m2-experiments.md#plain-text-caption-settings-increment--2026-09-30) supports W-02 for FR-012/014. Controlled layout/input/resource checks and selected PC paused-cue transitions are recorded. AT-10/13/17 still need real server tracks, synchronization, native composition and actual Quest readability/input; scene-local settings do not close FR-019.

The [canvas filtering evidence](../05-delivery/m2-experiments.md#canvas-minification-filtering-increment--2026-09-30) supports W-02 for FR-012/014/017. Installed-renderer policy/dimension/ownership checks and selected PC references establish the minification repair. AT-10/13/17 retain actual-headset text, alpha, input and sustained-cost qualification; no complete requirement or G2 pass is recorded.
