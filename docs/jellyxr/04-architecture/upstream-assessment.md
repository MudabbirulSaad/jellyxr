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
