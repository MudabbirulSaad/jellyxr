# Feature parity matrix

Status: source-informed inventory; limited M1 ordinary playback smoke evidence exists, full parity and XR qualification remain pending. Updated: 2026-09-29.

"Inherited" means functionality exists in the baseline client or its documented ecosystem, not that it is already qualified on Quest. FR-020 requires ordinary-mode preservation. P1/P2 describe XR adaptation or a new extension, not removal of inherited ordinary behaviour.

| Capability | Ordinary-mode baseline | XR treatment | Release | Dependency / verification |
| --- | --- | --- | --- | --- |
| Server selection, login, Quick Connect | Connection/login flows and SDK integration | Retain inherited ordinary account-entry flow; reuse signed-in state in XR | P0 | Server enablement; AT-01/03 pending |
| User permissions, watched status, favourites | Server-backed user state | Same authority in spatial views | P0 | Restricted-user fixtures; AT-04/05 pending |
| Continue Watching, Next Up, libraries | Existing client discovery | Spatial layout and controls | P0 | Source/queries; AT-05 pending |
| Search, sort, filters, collections | Existing client navigation | Spatial equivalents | P0 | Large-library fixture; AT-05 pending |
| Title, seasons, episodes, media versions | Existing item/playback data | Spatial detail view | P0 | Missing-metadata fixture; AT-06 pending |
| Play/pause, seek, chapters, queue, next episode | Playback manager/player | Controller- and hand-operated controls | P0 | AT-07/09 pending |
| Direct play, direct stream/remux, transcode | Browser profile and server negotiation | Reuse negotiation; validate XR presentation | P0 | Codec/network/server policy; AT-08 pending |
| Audio and subtitle selection | HTML video/HLS and subtitle renderers | Explicit immersive subtitle rendering path | P0 | PC text/ASS texture experiments recorded in [M2 evidence](../05-delivery/m2-experiments.md); bitmap/native-layer and actual Quest AT-10 remain open |
| Cinema, screen placement, recenter | New capability | Add one environment and viewing controls | P0 | [M2 size/distance/height/tilt and Reset evidence](../05-delivery/m2-experiments.md#screen-placement-increment--2026-09-30); general recenter, curved presentation, renderer decision and Quest AT-12 remain pending |
| Reduced motion, text size, controller operation | Inherited UI patterns plus new XR needs | Adapt and test in headset | P0 | AT-13 pending |
| Music and music videos | Inherited client capability | Ordinary mode first | Preserve in P0; XR deferred | Server fixture/codecs; AT-15 pending |
| Live TV, programme guide and recordings | Inherited client/server feature | Ordinary mode first | Preserve in P0; XR deferred | Tuner/recording configuration; AT-15 pending |
| Home videos, photos, books and other library types | Client includes media viewers | Ordinary mode first | Preserve in P0; XR deferred | Test each claimed library type; AT-15 pending |
| Administration, metadata editing and account settings | Dashboard and existing routes | Ordinary mode | Preserve in P0 | Account permissions; AT-15 pending |
| Cast/remote playback | Inherited plugins and destination support | Ordinary mode | Preserve in P0 | Receiver/browser availability; AT-15 pending |
| SyncPlay | Existing client capability, audit behaviour | Ordinary mode; shared cinema later | Preserve in P0; XR P2 | Multi-client fixtures; AT-15/21 pending |
| File download | Existing permitted download behaviour to audit | Ordinary browser behaviour; managed offline library is separate | Preserve applicable P0; offline P2 | Permissions/quota; AT-15/22 pending |
| Trickplay and media-segment skip | Existing metadata-driven features | Add immersive controls | Preserve ordinary P0; XR P1 | Server generation/providers; AT-20 pending |
| Hand input | New XR interaction | Complete spatial journey, pointing/pinch, near interaction and safe switching | P0 | FR-023; AT-17 pending |
| Room exploration | New XR interaction | Physical tracking, valid teleport, 30-degree snap and Return to seat | P0 | FR-030; AT-26 pending |
| Physical remote, artwork and panels | New XR interaction | Bounded collisions/grabbing, button alternatives and recall/reset | P0 | FR-031; AT-27 pending |
| Passthrough, planes, meshes, anchors | New XR enhancement | Manual-placement fallback | P1 | Separate capabilities; AT-18 pending |
| Stereo, 180/360 projection | New qualification path | Projection and eye-order settings | P1 | Media/display experiment; AT-19 pending |
| Reactive screen light | New optional environment effect | Quality-budgeted and disableable | P1 | EXP-03; AT-20 pending |
| Offline library | Not inferred from ordinary file download | Storage/sync research | P2 | EXP and product scope; AT-22 pending |
| Vision Pro | No JellyXR qualification | Future browser/input adaptation | P2 | AT-23 pending |

## Regression policy

Use the unmodified pinned client as the comparison for each ordinary-mode fixture. Record pre-existing failure separately from fork regression. Missing hardware/server fixtures are "not tested", never "passed". A release claim must either have evidence or explicitly state its limit. No UI hiding is a substitute for documenting a broken inherited route.

Sources: [upstream assessment](../04-architecture/upstream-assessment.md), [S12](../references/glossary-sources.md#s12), [S14](../references/glossary-sources.md#s14).
