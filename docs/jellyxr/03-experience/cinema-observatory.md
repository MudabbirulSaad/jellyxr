# Cinema Observatory specification

Status: selected first-release direction and M1 reference specification, 2026-09-29. Spatial dimensions, perceived brightness and headset readability require M2 evidence. This document describes the experience; it is not a shipped theme or implemented cinema.

## Intent and design authority

The library feels like the quiet entrance to a private cinema: precise typography, graphite surfaces, artwork with shallow depth and warm architectural light. Selecting a film reduces surrounding information. Once playback starts, the screen, subtitles and necessary controls take priority.

This specification elaborates D-12 and the [experience blueprint](experience-blueprint.md). Functional acceptance remains in [FR-005 through FR-023 and FR-030/031](../02-requirements/functional-requirements.md). It does not introduce an XR renderer, a new UI library or a second player.

The installed [UI/UX Pro Max skill](../../../.agents/skills/ui-ux-pro-max/SKILL.md) was searched for motion sensitivity, error recovery and content hierarchy. The motion and recovery results fit this product. The broad design-system query returned a marketing funnel; a narrower product query still did not provide a verified XR match. Neither preset is adopted. The visual direction below is the product owner's choice, with project-specific spatial reasoning and applicable accessibility guidance.

## Material and light vocabulary

| Element | Direction | Behaviour |
| --- | --- | --- |
| Architecture | Matte graphite floor and wall surfaces; simple, readable proportions | Establish scale without a busy room or decorative panels |
| Structural detail | A small number of warm, recessed light lines and softly lit edges | Identify boundaries; remain still during a film |
| Content planes | Opaque surfaces with subtle separation from their surroundings | Maintain contrast over bright artwork and film frames |
| Artwork | Original aspect ratio, contained cropping decisions and modest depth | Selection uses a clear outline and label; avoid a field of animated posters |
| Screen | Neutral frame and consistent aspect ratio | Environment brightness never changes video colour grading |
| Controls | Compact surface with one visual vocabulary | Reveal on deliberate input; preserve stable focus and reachable Back/Reset actions |

Use baked/static lighting as the reference for the later experiment. Reflections, shadows and any dynamic contributions need measured justification. Reactive film-colour lighting is a separate FR-026 extension. A black-box/plain-scene control remains available for M2 comparisons.

For the M2 comparison, use the same four static directional lights, linear light colours, exposure and un-tonemapped sRGB output in both renderers. This bounded fill rig makes every room-facing surface visible without relying on different ambient/hemisphere shader models; it is a technical reference, not production baked lighting or proof of pixel-identical PBR. Video and control artwork remain unlit. Compare brightness and colour on the same device before scoring visual quality.

## Reference tokens

These values define the design specification. They are not new application CSS variables until the implementation package adopts them.

| Role | Reference value | Usage |
| --- | --- | --- |
| Background | #0B0F14 | Room-adjacent browser background and deepest UI plane |
| Surface | #151B23 | Readable cards, detail and control surfaces |
| Primary text | #F2F4F7 | Titles, controls and essential values |
| Secondary text | #A7B0BC | Runtime, year, episode context and secondary explanations |
| Accent | #D7B67A | Primary action, selection and focus outline |
| Text on accent | #0B0F14 | Filled primary-action label |

Calculated sRGB contrast on the opaque reference surface is 15.71:1 for primary text, 7.90:1 for secondary text and 8.95:1 for the accent. Dark text on the accent is 9.94:1. These are colour-pair calculations, not proof of in-headset readability. Any compositing, dimming, transparency or material treatment requires another check. Essential control boundaries need their own contrast test; background/surface separation alone is not a sufficient boundary.

Retain bundled Noto Sans and existing language fallbacks. Use regular body text and bold headings/actions; do not fetch a new font from a public CDN. For ordinary reference compositions use a 16 px body, 14 px supporting metadata and 24/32 px section/page headings, with readable wrapping and browser text scaling. Preserve title spelling and the server's metadata rather than inventing a shorter title. Spatial type uses angular readability tests in M2; browser pixel sizes are not a headset sizing rule.

Use an 8 px ordinary-layout rhythm with 16 px control groups and 24/32 px section spacing. Keep inherited icon assets initially, using one consistent style per control group. Meaningful icon controls have accessible names; icons beside equivalent text are decorative. No emoji navigation or display-only controls.

## Library composition

The forward view contains a restrained navigation band, a primary content plane and enough architectural context to convey depth. The library is not a dashboard of unrelated metrics.

| Region | Content | Interaction |
| --- | --- | --- |
| Navigation | Library identity, search, movie/series selection and account/settings access | Explicit labels and predictable Back; current location has a visible selected state |
| Continue watching | Server-backed resume items with actual progress | Resume opens the selected item at its known position; hide the row if empty |
| Main library | Artwork grid with title and useful year/episode context | Incremental loading; focus does not shift neighbours; title detail is one deliberate selection |
| Supporting collections | Actual collections and filtered results | Show only available content; preserve filter and browsing position on return |

Use shallow depth to separate navigation, cards and context. Essential navigation stays in front of the viewer; do not require turning around or walking to discover a collection. Returning from playback restores selection and browsing context.

| State | Visible content | Action |
| --- | --- | --- |
| Loading library | Reserved artwork spaces and “Loading your library…” | Keep Back and server/account navigation usable; reduced motion uses static placeholders |
| Empty library | “No movies are available in this library.” | “Choose another library”; do not show invented film cards |
| No search results | “No results for this search.” | “Clear search”; retain the entered query |
| Missing artwork | Neutral surface with the real title and media type | Open the item normally; do not manufacture cover art |
| Failed request | “Your library couldn’t be loaded.” | “Retry” and “Back”; preserve filters and previously loaded context where permitted |
| Lost permission | “This item is no longer available to your account.” | Return to the library and refresh permitted content |

## Title-detail composition

Place the selected artwork on one side of a readable information plane. Present the real title, year/runtime or episode context, synopsis when present, and one primary playback action. Additional metadata must support selection rather than fill empty space.

- Show “Resume” when valid progress exists; otherwise show “Play”. Offer “Play from beginning” separately where appropriate.
- Put episode and available media-version selection near playback, with the current choice clearly named.
- Keep audio/subtitle availability factual. Do not label formats as supported merely because metadata lists them.
- When a synopsis is absent, omit that region. Never generate a replacement plot or review.
- Show “Loading title details…” while fetching. If unavailable, show “This title couldn’t be loaded.” with “Retry” and “Back to library”.
- Restore focus to the originating card when leaving the detail view. Long titles wrap; title and primary action remain discoverable at large text settings.

“Enter cinema” is a deliberate mode action when XR entry is supported. It must not imply playback has started. Its visibility, denial and fallback behaviour follow FR-013 and the system blueprint.

## Cinema composition

Keep the viewing horizon stable. The viewer may deliberately explore the connected room under FR-030; every task also works seated. The neutral screen is the dominant forward element, framed by sparse architecture and restrained warm light. The library withdraws without moving the camera. Playback and environment quality remain separate controls.

| Region | Content and behaviour |
| --- | --- |
| Screen | Preserve media aspect ratio; use qualified flat/curved options only; screen controls never stretch the film |
| Subtitles | Preserve the selected track, timing and readable placement through seeking and UI visibility changes; presentation/burn-in path remains an M2 decision |
| Playback tray | Play/Pause, progress/seek, chapters where available, audio/subtitles and return navigation; reflect actual player state |
| Viewing controls | Screen size/distance/height/tilt as qualified, “Recenter screen” and “Reset screen”; reachable after poor placement |
| Environment settings | Explicit brightness/quality settings scoped to the user/server/viewing device; reduced environment cost does not silently change stream quality |
| Exit | “Back to library” restores browsing context; leaving the immersive session follows the single-owner playback contract |

Do not hide focused controls while a viewer is interacting with them. Do not attach a complete settings panel permanently to the head. Screen/control placement and seated/reclining geometry are evaluated with the Quest 3 at M2; no metre or degree value is claimed comfortable by this document.

| State | Copy and action |
| --- | --- |
| Preparing playback | “Preparing video…”; cancel returns to the selected title |
| Buffering | “Buffering…” when the player reports stalled delivery; keep state and controls coherent |
| Paused | A clear Play action; do not animate the environment to fill inactivity |
| Network interruption | “Playback was interrupted.” with “Retry” and “Back to library”; follow the accepted resume behaviour |
| Session ended | “Cinema session ended.” with “Return to library” and a deliberate re-entry action where supported |
| XR unavailable | “Immersive viewing isn’t available in this browser.” with ordinary playback available |
| Insecure app origin | Explain that immersive viewing requires a secure connection; do not ask the viewer to disable browser security |
| Unknown connection failure | “Couldn’t connect to your server. Check the address and connection, then retry.” Do not assert TLS/CORS as a proven cause |

## Motion and feedback

For ordinary reference compositions, start control feedback within the accepted 100 ms budget, with approximately 180 ms for panel appearance, favouring opacity rather than layout movement. These are initial design timings, not required runtime dependencies. Reduced motion presents the final readable state without parallax, scene travel or scroll-jacking. Essential feedback remains immediate and visible.

Focus and selection use shape/outline plus text context, not colour alone. Controller targeting must provide explicit feedback before activation; hover alone never performs an action. Tracking loss cancels an incomplete gesture and leaves a recoverable state. Input focus rules must be tested again in the chosen spatial UI implementation.

Comparison panels face the same local +Z direction as their hit regions. Their backs do not display mirrored actionable labels; the front keeps the original artwork orientation. Apply the same facing rule to the flat video and subtitle surfaces. Recalled controls rotate their geometry and hit regions together; hiding a back face alone is not a complete seated-navigation solution.

The comparison's recovery interaction is a deliberate trigger/pinch on empty space to bring the controls into the current forward workspace. It must not activate from gaze or steal a nearby remote grab. A browser button and keyboard Home provide desktop alternatives. Recalled controls use a fresh valid viewer pose, remain level, avoid the fixture's static collision proxies and keep a stable world anchor until the next explicit recall or deliberate movement. A lost/hidden input cancels an incomplete recall; no stale pose is applied when tracking returns. If the bounded placement search cannot find room, report that failure and retain the previous anchor. This experiment is not a claim that every physical position is comfortable or fully recoverable; Quest review and final placement constraints remain open.

When the full bank does not fit, first try a compact, closer Return to seat / Exit XR pair. Hidden actions leave the hit-test and keyboard target lists as well as the scene. The pair is a recovery route, not a miniature full menu; its experimental near placement still requires Quest readability, convergence and hand-reach review. If neither layout fits, retain the explicit failure and headset-system exit guidance. Placement also checks the complete target rectangles against the level desktop preview bounds (48-degree horizontal and 33-degree vertical half angles). A browser review moved the compact pair around eye level because its first collision-free placement fell below the view. These bounds are a preview constraint, not a headset field-of-view or comfort measurement.

## Floor selection comparison

Choose floor deliberately arms destination selection. Aim with a controller ray or tracked hand pointer, then complete trigger/pinch to confirm the indicated clear destination. A floor ring and label distinguish a valid destination from a blocked one; looking alone never moves the viewer. A straight ray in this first comparison must reach the floor before any static room proxy and the destination must satisfy the shared footprint clearance. It does not model a navigation mesh, slopes or real-world room safety.

During selection, show only Cancel move, Return to seat and Exit XR in the bank so the floor stays visible; remove hidden actions from hit testing too. The PC proposal starts 3.5 m ahead to fit its level preview, and remains a proposal until confirmation. On PC, arrow keys adjust the proposed point in quarter-metre steps after Choose floor; Enter confirms and Escape cancels. Cancelling, input/tracking loss, interruption or changing input while a press is held cannot cause travel later. Reject a destination that drifts more than 15 cm between press and release. Pause the inherited playback owner before applying the destination, preserve height/yaw, then recall the stable control bank; Resume stays explicit. All distances are technical fixture settings pending Quest review.

## Content and asset discipline

Every content region has a defined data source or user task. No filler paragraphs, invented ratings, fake usage counts, testimonials, unsupported badges or feature announcements appear in new product copy. Technical fixtures use truthful names such as “Subtitle timing fixture — text track” and are clearly separated from a user's library.

Personal media titles and images may appear during local testing, but are excluded from committed review material. Record asset licences and source/version before adding distributed assets. This M1 specification adds no movie artwork or third-party font assets.

## Room and asset production

Compose a library bay and seating bay within one architectural shell. Use clear sight lines, detailed seats with simple collision proxies, recessed warm luminaires and restrained metal fixtures. Shelves are real geometry; poster surfaces and title panels have shallow, coherent separation. A seated library mode brings the same permitted content into the forward workspace rather than removing essential actions.

Production models use authored proportions, PBR materials, normal/roughness detail, baked light and reflection references. Author source geometry separately from glTF/GLB runtime variants and simplified collision resources. Record texture compression, material count, triangles, draw calls, transfer size and load cost; budgets follow measured EXP-03 results, not an invented “high fidelity” polygon count. A visually coherent lower-cost variant is required.

The first independent asset increment is an original Observatory chair: a rounded graphite shell, separate upholstered cushions, lumbar/head support, inset arms, restrained metal feet and stitched-channel geometry. Produce detailed and lower-detail GLB variants from a reproducible source recipe, with separate simple collision boxes and measured file/triangle/material counts. Load the identical bytes in both M2 candidates before choosing a renderer. This is a representative model/loading experiment; authored texture detail, baked lighting/reflections and final headset fidelity remain required M5 work.

The M2 architectural reference now adds recessed acoustic panels, ceiling coffers, a restrained floor grid and metal rails to the same stable room envelope. Both candidates load the same original GLB; Plain room retains a lower-complexity comparison control with unchanged lights and chair choice. This prepares the material hierarchy and scale without claiming final shelving, baked lighting or headset fidelity. See the [asset pipeline](../04-architecture/asset-pipeline.md) for counts, provenance and validation.

Prefer original models and verified CC0 resources. Every imported asset manifest entry records its source URL/version, author, licence text, modifications, attribution requirements, source file, runtime variants and collision resources. Website preview art is not automatically covered by an asset's licence. Review the actual download terms before importing. Do not redistribute personal movie posters as environment assets.

Motion uses short, damped responses for deliberate interactions. Springs cannot move the camera or produce sustained oscillation; reduced motion settles directly while preserving essential feedback. Suspend unnecessary physical simulation while watching. The room and movie screen stay stable even when the remote or an artwork object moves.

## M2 review

Compare library, detail and cinema tasks using the same fixture and viewing settings. Verify bright/dark video frames, long titles, large text, both controllers, hands, seated teleport/turn/return, object recall, reduced motion, poor screen placement, subtitle selection and interruption. Record visual feedback separately from frame timings. Changes justified by evidence update this specification and the linked requirements/decisions together.

Related: [visual alternatives](visual-direction.md), [M1 readiness evidence](../05-delivery/m1-readiness.md), [technology experiments](../06-decisions/technology-evaluation.md).

## M2 spatial catalogue reference

The comparison now offers Open catalogue from the room controls, with six technical records on individual world-space cards. Cards, heading and actions occupy separate depth planes; none is a browser overlay. The same bounded page, filter, detail, Back and Close state runs in both candidates, with explicit missing-artwork and disabled-page states. Close/reopen preserves the current filter/page/detail; Back restores the selected card. Opening or recalling uses the existing deliberate placement checks, while paging and detail changes retain the settled anchor. Recovery controls remain available when the full view cannot fit.

This is a technical readability/input/load comparison, not the production spatial library composition or real Jellyfin data integration. The card titles and original calibration art are clearly labelled fixtures. Card/readability dimensions, reduced texture quality, both-eye depth and actual controller/hand reach still require Quest evidence. UI/UX Pro Max's keyboard-navigation and focus-appearance guidance informs visible focus and disabled-target exclusion; browser pixel recommendations are not treated as XR angular sizing rules.

### Search comparison

Search replaces the card view with a room-anchored keyboard, one scene target per key. Keep a persistent Search term label, the complete draft, a character count and explicit Limit reached feedback. Search applies the draft; Cancel keeps the prior result context. Backspace, Space and Clear term describe their actual actions. An applied term appears with the results, and an empty result says “No results for this search.” with Edit search and Clear search available. No invented recommendation or metadata fills the empty state.

The M2 Latin fixture uses four key rows and a 48-character cap; these are comparison settings, not a production language/IME decision. Disabled keys keep their geometry and lose activation, without redirecting a repeated press to another control. Reuse the stable anchor while the new layout fits; otherwise run placement recovery before accepting input. A value change updates the field without repainting every key. Match texture and physical-panel aspect ratios to preserve glyph shape. UI/UX Pro Max's visible-label guidance supports the field treatment; final text scale, target reach, hand/controller typing and long-term readability still need actual Quest review.

### Spatial text-size comparison

For FR-017 and EXP-04, add a world-space Text size action to the common room controls. Cycle explicitly through 100%, 125% and 150%, display the current percentage and retain it for the comparison scene across catalogue, search, detail, screen and recovery views. This is a bounded readability experiment, not persisted production preferences or a headset sizing recommendation.

Enlarge the rendered glyphs, preserve their aspect ratio and wrap essential labels, complete fixture titles, search terms and recovery messages. Give the search heading/field and screen summary sufficient physical height at larger settings; artwork may use less space before text is crowded. Do not shrink text silently, insert an ellipsis, change video/subtitle size or alter playback. Keep visible geometry and hit bounds aligned, cancel pending activation on a size change and settle controls through the existing placement/clearance policy. Logical focus and catalogue context survive. Validate all fixture text states at each size and inspect both PC candidates; actual binocular readability, controller/hand operation, reach and rendering cost stay open.

### Library bay model comparison

Prepare two graphite shelving bays on the ends of the library plinth, leaving the central forward workspace open at the library destination. Use shallow recessed backs, rounded shelf edges and sparse warm metal detail; keep the screen and seated actions visually primary. Shelf cavities are open space in the collision model, not a single invisible solid block. The cases are architectural furniture, with no fake titles or nonfunctional controls. The existing world-space technical catalogue supplies the comparison's actionable content. Final artwork mounting, selected-artwork physics and production data binding remain separate requirements.

### Plain-text caption settings comparison

For FR-012 and EXP-02/04, add a Caption settings view reached from the spatial Screen settings view in both candidates. Label the scope as plain text: ASS and bitmap surfaces retain their authored layout, and track selection stays with the inherited player. Offer caption size 100/125/150%, backing Opaque/75%/None, vertical placement Upper/Centre/Lower, Reset captions and Back to screen. Retain Return to seat and Exit XR. Settings belong to the current comparison scene and survive opening/closing controls, video reattachment and screen adjustment; they are not account preferences.

Size increases glyph size and visible backing height within a fixed transparent envelope, without changing video geometry or silently shrinking text. Keep complete cues within the bounded five-line comparison, reporting overflow explicitly. Backing changes affect only the caption rectangle; outlined light text remains present when backing is reduced. Error/fallback messages always use an opaque readable surface. Placement is relative to the stable screen and follows its size/tilt; it never follows the viewer's head. Each action preserves the active cue/timeline and video owner and updates without recreating the video or native media layer. Caption gaps still clear the surface. Control labels include the actual current value, and reset cannot leave a held activation on replacement controls.

Use UI/UX Pro Max's Input Labels guidance for visible setting names and values; its HTML label mechanism is not an XR sizing rule. Validate controlled cue changes, wrapping, geometry/resource ownership and both PC paths. Actual subtitle synchronization, bright/dark-frame readability, native alpha composition and both hand/controller flows remain Quest evidence; this comparison cannot close FR-012 or G2.

Keep the comparison bank beside the default screen so its heading cannot conceal the cue being adjusted. The initial centre bank failed this PC inspection and was replaced. This is a fixture composition; changed screen poses, close hand reach, minified text and all headset viewing positions still need evaluation. The fixed transparent caption envelope and text backing are separate: transparent margins must not become visible boxes or depth-writing occluders.

### Canvas filtering comparison

For FR-012/014/017 and EXP-02/04, compare minified control and subtitle text at the same preview dimensions, camera and physical panel size. Use linear mipmap filtering for canvas presentation when the context supports the original canvas dimensions. Do not change typography, hit bounds, video resolution or authored ASS/bitmap layout to conceal aliasing. On a context requiring power-of-two mipmap dimensions, retain the canvas dimensions and use non-mipmapped linear sampling instead of allowing construction to resize and clear the artwork. Upload changed artwork only; retain the existing dirty-state and disposal ownership. Inspect the ordinary PC preview and record its limits; actual binocular clarity, moving-view shimmer, alpha edges and sustained upload cost remain device qualification.
