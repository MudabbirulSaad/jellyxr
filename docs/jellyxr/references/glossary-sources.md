# Glossary and sources

Updated: 2026-09-29. External documentation describes vendor/platform behaviour; it is not proof of JellyXR device compatibility.

## Glossary

| Term | Meaning in this project |
| --- | --- |
| JellyXR | This independently developed Jellyfin Web fork and its proposed XR experience |
| Jellyfin server | Existing authority for accounts, permissions, media, metadata, progress and server conversion |
| Jellyfin Web baseline | Official client v12.1 at the pinned commit, before JellyXR changes |
| App URL / origin | Address serving client assets; origin includes scheme, host and port |
| Server endpoint | Configured Jellyfin API/media base address, including any port and base path |
| Ordinary mode | Browser presentation outside an immersive WebXR session |
| Spatial library | XR presentation of movie/series browsing and title selection |
| Cinema | XR film presentation with environment, screen and controls |
| Playback owner | Existing client component responsible for active media/session state and reporting |
| Media layer | Browser/compositor-supported presentation path associated with video; optional capability to validate |
| Direct play | Playback without server media conversion when the complete path is compatible |
| Direct stream / remux | Server delivery adapting container and potentially other compatible streams; evaluate actual selected method |
| Transcode | Server conversion required by capability or policy; distinct from environment rendering |
| Secure context | Browser security condition required for powerful APIs; LAN HTTP is not automatically trustworthy |
| Passthrough | Presentation including the physical surroundings; separate from unrestricted camera access |
| Recenter | Restore a comfortable viewing orientation for the interface/screen |
| Feature parity | Evidence that an inherited workflow retains its behaviour on a claimed configuration |
| P0 / P1 / P2 | First release / proposed extension / future investigation |
| G0-G5 | Documentation, product, feasibility, integration, qualification and expansion gates |
| Source-inspected | Confirmed in the pinned files, without a runtime test |
| Documented | Described by an external primary source |
| Proposed | Project intent or target awaiting its designated acceptance gate |
| Device-tested | Reproduced on recorded device/browser/server/media versions with evidence |
| Emulated XR | Simulated XR API/input on a host computer; evidence distinct from an actual Quest run |
| M0-M7 | Roadmap milestones grouping work packages from documentation to post-release expansion; gates control acceptance |

## Source register

All links below were consulted in this planning conversation or inspected locally on 2026-09-29. Source version/date is recorded where relevant. Recheck living platform guidance when executing G2.

| ID | Primary source and version | Supports / limitation |
| --- | --- | --- |
| <a id="s01"></a>S01 | User-approved documentation plan, M1 plan and Spatial Cinema Implementation Goal Through M6, 2026-09-29; latest instruction to continue autonomously and merge without waiting for GitHub Actions | Product/execution authority; not device evidence |
| <a id="s02"></a>S02 | [Official client release v12.1](https://github.com/jellyfin/jellyfin-web/releases/tag/v12.1), commit fae41f33eb7cd636a9ef68984adb82bb247a6e1b; [local source assessment](../04-architecture/upstream-assessment.md) | Source structure, connection/playback ownership and pinned dependencies |
| <a id="s03"></a>S03 | [Pinned contribution guide](https://github.com/jellyfin/jellyfin-web/blob/v12.1/CONTRIBUTING.md), [package manifest](../../../package.json), [licence](../../../LICENSE) | Inherited implementation conventions and provenance |
| <a id="s04"></a>S04 | [Jellyfin networking](https://jellyfin.org/docs/general/post-install/networking/) | Endpoint, ports, self-hosting, HTTPS and Base URL behaviour |
| <a id="s05"></a>S05 | [Jellyfin reverse proxy](https://jellyfin.org/docs/general/post-install/networking/reverse-proxy/) | WebSockets, forwarding and sensitive URL logging |
| <a id="s06"></a>S06 | [MDN secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) | HTTPS/loopback distinction; not a certificate deployment guarantee |
| <a id="s07"></a>S07 | [MDN WebXR permissions](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Permissions_and_security) | User activation, focus, permission and session conditions |
| <a id="s08"></a>S08 | [MDN mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content) | Browser restrictions on insecure subresources |
| <a id="s09"></a>S09 | [Meta WebXR Layers](https://developers.meta.com/horizon/documentation/web/webxr-layers/) | Layer/media-layer architecture and potential quality/performance benefits; no JellyXR benchmark |
| <a id="s10"></a>S10 | [Meta WebXR performance guidance](https://developers.meta.com/horizon/documentation/web/webxr-perf-bp/) | Rendering-cost tradeoffs and measurement requirement |
| <a id="s11"></a>S11 | [Meta WebXR Hands](https://developers.meta.com/horizon/documentation/web/webxr-hands/) | Hand-input capability; interaction design still needs testing |
| <a id="s12"></a>S12 | [Jellyfin codec support](https://jellyfin.org/docs/general/clients/codec-support/), [transcoding](https://jellyfin.org/docs/general/post-install/transcoding/) | Media compatibility and server conversion; not a Quest-specific certification |
| <a id="s13"></a>S13 | [Jellyfin Quick Connect](https://jellyfin.org/docs/general/server/quick-connect/) | Existing-account authorization flow and server enablement |
| <a id="s14"></a>S14 | [Jellyfin media segments](https://jellyfin.org/docs/general/server/metadata/media-segments/), [10.10 feature announcement](https://jellyfin.org/posts/jellyfin-release-10.10.0/) | Segment-provider dependency and trickplay context |
| <a id="s15"></a>S15 | [Installed UI/UX Pro Max](../../../.agents/skills/ui-ux-pro-max/SKILL.md), [provenance](../../../.agents/skills/ui-ux-pro-max/INSTALLATION.md) | UX search matched reduced motion/motion sensitivity; generic visual presets were not adopted |
| <a id="s16"></a>S16 | [Meta scene understanding](https://developers.meta.com/horizon/documentation/iwsdk/guides/11-scene-understanding/) | Separate plane/mesh/anchor capabilities; not an SDK selection |
| <a id="s17"></a>S17 | [Chrome Local Network Access](https://developer.chrome.com/blog/local-network-access), published 2025-06-09 with 2025-09-29 update | Permission model and documented local mixed-content exceptions; verify Quest/browser version independently |
| <a id="s18"></a>S18 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Ordinary UI accessibility target; spatial accessibility requires additional evaluation |
| <a id="s19"></a>S19 | [Meta Immersive Web Emulator](https://github.com/meta-quest/immersive-web-emulator), consulted 2026-09-29 | Desktop extension and Chrome/Edge installation routes; proposed tool, not a Quest performance result |
| <a id="s20"></a>S20 | [Meta Immersive Web Emulation Runtime](https://github.com/meta-quest/immersive-web-emulation-runtime), consulted 2026-09-29 | Optional embeddable WebXR emulation runtime; no project integration selected |
| <a id="s21"></a>S21 | [Meta browser remote debugging](https://developers.meta.com/horizon/documentation/web/browser-remote-debugging/), updated 2026-07-22, consulted 2026-09-29 | Developer Mode, ADB port reversal and desktop DevTools workflow; development access is distinct from deployment qualification |
| <a id="s22"></a>S22 | [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots), consulted 2026-09-29 | Controlled screenshot baselines and environment variance; candidate automation only |
| <a id="s23"></a>S23 | [Google Android repository metadata](https://dl.google.com/android/repository/repository2-3.xml), inspected 2026-09-29; Windows platform-tools_r37.0.1-win.zip | Actual Platform Tools download/version/checksum; device connection still needs local evidence |
| <a id="s24"></a>S24 | Locked @jellyfin/sdk 1.0.0 package installed from [package-lock.json](../../../package-lock.json); lib/versions.js inspected 2026-09-29 | Installed minimum server 10.10.0 and generated API version 13.0.0; constants are not a runtime compatibility result |
| <a id="s25"></a>S25 | [Poly Haven licence](https://polyhaven.com/license), consulted 2026-09-29 | CC0 asset distribution terms; inspect individual downloads and distinguish website material |
| <a id="s26"></a>S26 | [ambientCG licence](https://docs.ambientcg.com/license/), consulted 2026-09-29 | CC0 asset terms; no asset has yet been imported |
| <a id="s27"></a>S27 | [Meta browser video guidance](https://developers.meta.com/horizon/documentation/web/browser-video/), consulted 2026-09-29 | Investigate media layers first; subtitle composition and Jellyfin lifecycle still need experiments |
| <a id="s28"></a>S28 | [Babylon Havok integration](https://github.com/BabylonJS/havok), [Rapier CCD](https://rapier.rs/docs/user_guides/javascript/rigid_body_ccd/), consulted 2026-09-29 | Candidate physics facilities and fast-body collision guidance; no measured comparison or package choice |

## Provenance rules

Record the exact commit for code-derived observations. For web guidance, keep the link and access date and revisit it before implementation. Record test results separately with build/device/fixture details.

The local UI/UX skill was downloaded from nextlevelbuilder/ui-ux-pro-max-skill at commit 09170eec67eefd46a7ae85de61b40c194020f997. Its search examples were adapted to this workspace. Its licence is separate from the Jellyfin application licence.

No XR benchmark, complete support-matrix pass or headset usability result exists from M1. Build results and limited connection observations are recorded separately in [M1 readiness evidence](../05-delivery/m1-readiness.md).
