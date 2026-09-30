# Upstream assessment

Status: pinned source inspected on 2026-09-29. Subsequent M1 build and connection observations are recorded in the [readiness evidence](../05-delivery/m1-readiness.md); authenticated playback and headset qualification remain pending.

## Provenance

| Property | Inspected value |
| --- | --- |
| Upstream | [jellyfin/jellyfin-web](https://github.com/jellyfin/jellyfin-web) |
| Personal fork | [MudabbirulSaad/jellyxr](https://github.com/MudabbirulSaad/jellyxr) |
| Release | [v12.1](https://github.com/jellyfin/jellyfin-web/releases/tag/v12.1) |
| Commit | fae41f33eb7cd636a9ef68984adb82bb247a6e1b |
| Source-assessment branch | docs/planning, initially checked out at the pinned commit |
| JellyXR integration branch | xr, rooted at the same baseline; documentation integration follows D-20 |
| Remotes | origin = personal fork; upstream = official repository |
| Package version | 12.1.0 |
| Licence metadata | package.json declares GPL-2.0-or-later; retain upstream LICENSE and notices |
| Existing local addition | UI/UX Pro Max, with its separate MIT licence and installation provenance |

The working tree was populated from this commit without replacing the installed skill. The root README gains a JellyXR introduction; upstream introduction, source layout and contribution guidance remain.

## Inherited technology

Values below come from the pinned [package manifest](../../../package.json), not a recommendation to upgrade.

| Area | Baseline |
| --- | --- |
| Language/UI | TypeScript 5.9.3; React/React DOM 18.3.1 |
| Server integration | @jellyfin/sdk 1.0.0 plus legacy jellyfin-apiclient 1.11.0 |
| Server-state/UI | TanStack React Query 5.91.3; MUI 6.5.0; React Router 6.30.4 |
| Video/subtitles | hls.js 1.6.16; @jellyfin/libass-wasm 4.2.4; libbitsub 1.11.0 |
| Build/test | Webpack 5.109.0; Vitest 3.2.7; Vite configuration used for tests |
| Runtime tooling declared | Node >=24.0.0; npm >=11.0.0 |

[CONTRIBUTING.md](../../../CONTRIBUTING.md) requires new code in TypeScript, new API interactions through the SDK, and new app pages based on the existing React Page component. The legacy tree still contains JavaScript and globals. Do not treat a modern route migration as completed parity.

## Source map and reuse findings

| Evidence | Finding | Implication |
| --- | --- | --- |
| [RootApp](../../../src/RootApp.tsx) | Query persistence, API and user-settings providers wrap routing | Reuse context; isolate new XR state from server ownership |
| [API context](../../../src/hooks/useApi.tsx) | SDK API, user and legacy client are bridged through ServerConnections and sign-in/out events | Do not introduce a second login/session store |
| [Connection manager](../../../src/lib/jellyfin-apiclient/connectionManager.js) | Saved servers, SDK bridging, capabilities and SDK MINIMUM_VERSION | Preserve base addresses and derive server support from SDK plus tests |
| [Playback manager](../../../src/components/playback/playbackmanager.js) | Device profile, posted playback-info query, source/stream selection, queue and report ownership | XR commands should flow through this owner |
| [HTML video player](../../../src/plugins/htmlVideoPlayer/plugin.js) | Private media element, HLS lifecycle, text/ASS/bitmap subtitle integration | Media-layer binding needs a deliberate access boundary; DOM subtitles cannot be assumed visible in XR |
| [Browser device profile](../../../src/scripts/browserDeviceProfile.js) | Existing browser playback capability construction | Validate Quest capabilities rather than hardcode processor-based claims |
| [Quick Connect capability hook](../../../src/hooks/useQuickConnect.ts) | SDK-backed enabled check | Feature must follow server enablement |
| [Quick Connect authorization route](../../../src/apps/legacy/routes/quickConnect/index.tsx) | Authorizes another client's code | This route is not by itself proof of the new-client login flow |
| [Login controller](../../../src/apps/legacy/controllers/session/login/index.js) | Existing account sign-in entry | Reuse/auth audit before XR-specific UI |
| [Media segments](../../../src/apps/legacy/features/playback/utils/mediaSegments.ts) | Typed segment handling | XR skip controls can consume existing metadata semantics |

## Structure and limitations

The source has modern, legacy, dashboard and wizard applications. The modern UI still reuses legacy content. Player "plugins" are client modules, distinct from server plugins. Existing styles, localization and routing cannot simply be drawn inside an XR scene with identical behaviour.

The HTML player owns its media element privately. EXP-01 must determine whether a narrow lifecycle-safe accessor/adapter or another player integration is required. EXP-02 must prove subtitles appear and stay synchronized on the chosen presentation path. No WebXR integration is claimed by this audit.

M1 installed the locked SDK 1.0.0 artifact and inspected lib/versions.js: MINIMUM_VERSION is 10.10.0 and API_VERSION is 13.0.0. The existing local server reports 10.11.4. These constants and public reachability do not demonstrate complete runtime compatibility; qualify the named configuration at G2. The web-client tag must not be used as a server-version requirement.

## Update strategy

Keep the recorded upstream commit and maintain small JellyXR integration changes. Evaluate an upstream update on a separate branch, inspect connection/player/subtitle changes, update provenance, run ordinary-mode parity and XR media regression, then adopt the update deliberately. No automatic dependency replacement is part of this phase.

Preserve upstream licence and authorship files. Distribution/licence review and upstream contribution policies remain applicable to their respective future work; this document does not claim endorsement by Jellyfin.


### Update inspection — 2026-09-30

Read-only remote/source inspection found official master at `e466eb93f0515246455e215d62e72b94b48ad242`. The pinned release fae41f33eb is not its ancestor; their inspected merge base is aa039568eb759ff4e3a028256d93f18740273314. Development-tip package metadata identifies version 13.0.0 and an unstable SDK 0.0.0-unstable.202609160935, whereas JellyXR deliberately retains the released 12.1.0/SDK 1.0.0 baseline. A default-branch fetch is not authorization to change these constraints.

`git merge-tree --write-tree --name-only c729c0e52d913177aeef804e39e6d1ad08538f7e e466eb93f0515246455e215d62e72b94b48ad242` reports conflicts in package.json and package-lock.json. ESLint configuration, index.jsx and webpack.common.js merge textually. This command creates no working-tree merge or adopted revision; a clean textual merge is not runtime compatibility evidence.

Representative official changes available for a later isolated rehearsal include photo autoplay ownership (b924dc518159d1bde3204b57b146d830f1bbc88f), Tizen container/audio capability separation (a510fba5a54d8d899b17f445121e6277511c2e0c) and multiple-gamepad navigation (37bf9d271bc7fd71c6090299d3f5a13acd97bc07). Their source diffs were inspected; no change is cherry-picked here. The current htmlVideoPlayer integration is a separate maintained boundary, and ordinary/XR regression must accompany any adopted player or capability change. This inspection identified the next work and package-conflict risk. The subsequent representative rehearsal is recorded below; final ordinary/XR regression remains open.


### Representative rehearsal contract

For the early AT-25 rehearsal, use official capability-profile change a510fba5a54d8d899b17f445121e6277511c2e0c in an isolated branch from the current JellyXR source. First demonstrate the expected Tizen container/audio-policy difference with controlled browser/media capability inputs; then apply the exact upstream commit and rerun those assertions, the inherited suite and both build compatibility paths. Keep dependency versions, the HTML player/media bridge and account/progress ownership unchanged. Record application conflicts and unchanged integration surfaces explicitly.

Retain the focused TypeScript probe as a replayable patch and document the base, upstream and rehearsal revisions. This is an update experiment, not a new hardware support claim or automatic adoption into xr. Passing source/build checks cannot close ordinary media, real Quest or final integrated-update regression requirements. Source inspection or textual merge success alone does not pass AT-25.


### Representative update results — 2026-09-30

Base: `c569e7c51243f169350fdac973f356e9bf3db236`. Official upstream candidate: `a510fba5a54d8d899b17f445121e6277511c2e0c` (container/audio capability separation, original PR #8519). The clean isolated checkout retained the verified locked installation from the fresh-build rehearsal. A local probe commit ec4d0d901d, exact `cherry-pick -x` result 114dcea843 and probe type-annotation correction produce local rehearsal revision `46d72a3789ee5670729a89864bdffdfbdb5d6ea6`. This revision remains on the isolated rehearsal branch; it is not the xr application revision.

| Check | Actual result / limit |
| --- | --- |
| Before the update | Seven controlled profile cases: four expected failures and three passes. Tizen 3/4/5 MP4/TS and Tizen 5 HLS-TS still contain OPUS; Chromium Android, disabled-codec and rejected-capability controls pass. These expose policy differences in the source, not measured decoder failures |
| Application | The exact upstream commit applies with no conflict and retained authorship/provenance. The resulting browserDeviceProfile.js is byte-identical as a Git blob to the candidate's version. No dependency or SDK change is needed |
| Focused candidate result | All seven cases pass. MKV/WebM retain OPUS while Tizen MP4/TS and HLS-TS exclude it; configured fMP4 HLS stays independent. AAC/MP3, the controlled Chromium Android case, disabled-codec filters and rejected capability remain covered |
| Integration boundary | Diff from base contains only browserDeviceProfile.js (23 additions, five deletions) and the 113-line TypeScript probe. HTML player/media bridge, playback manager, connection/account code, package.json and package-lock.json are unchanged |
| Type and lint checks | Application TypeScript and full lint pass; lint retains 98 existing warnings and zero errors. The probe needed an explicit local result type because the inherited JavaScript adds properties after its initial object literal. No application type or compatibility rule was relaxed |
| Regression/build checks | All 434 tests in 50 files pass in the rehearsal checkout. Ordinary production/ES5 passes 984 files; experimental production/ES5 passes 994. Both builds retain the two inherited size warnings. No CSS/SCSS changed, so stylelint was not repeated from the preceding clean-install run |

The [replay instructions and original probe patch](../../../patches/upstream-rehearsal/README.md) preserve the controlled inputs and expected before/after results. The patch applies cleanly to the unchanged main profile; it is kept outside the main collected tests because its candidate assertions deliberately fail the pinned application. The ordinary main suite remains 427 cases; 434 refers only to the isolated candidate. The probe and updated application file are not silently copied into xr.

This exercises the source-application, conflict-review and local-check portion of AT-25 under NFR-007. It does not qualify real Tizen/Quest playback, server source negotiation, native layers, audio/subtitle synchronization, account transitions or the final production XR integration. The full development-tip package conflicts recorded above remain unresolved, and no SDK switch or broad upstream merge is adopted. Repeat the relevant ordinary/actual-device media scenarios and final integrated update review before G4; source/build success alone cannot approve that gate.

The evidence/recipe update passes 437 relative links/anchors across 33 Markdown files, unique requirement definitions, P0/work/scenario mappings and the unchanged 17 dependency edges. No diagrams changed. Both rehearsal bundles exclude the selected probe marker; no UI or production code changes are included in the evidence PR.
