# Visual and spatial direction

Status: three proposals; no final direction, fonts, palette or engine selected. Updated: 2026-09-29.

## Shared principles

Build visual quality through proportion, material consistency, restrained lighting and readable hierarchy. Artwork is the primary variable colour source. Interface accents have a consistent meaning. Distinctiveness must remain when optional motion and dynamic lighting are disabled.

Use a small material vocabulary and clear foreground/background separation. Glass is a material choice, not a default for every surface. Readability wins over transparency. Preserve a stable viewing horizon and avoid translating the camera during transitions.

The installed [UI/UX Pro Max skill](../../../.agents/skills/ui-ux-pro-max/SKILL.md) informed reduced-motion and motion-sensitivity guidance. Its generic design-system searches did not yield a verified XR product match, so no generated web preset is adopted. Spatial choices below are project proposals and must be tested.

## Directions to compare

| Direction | Library | Cinema | Signature | Tradeoff |
| --- | --- | --- | --- | --- |
| Cinema Observatory | Spacious graphite panels, precise type, artwork in shallow depth | Architectural theatre with controlled light and convincing scale | Library withdraws as the screen and theatre take focus | Requires excellent geometry/material quality to avoid feeling empty |
| Orbital Archive | A shallow curved arrangement of collections around a stable centre | Curved architectural screen framing with restrained metallic detail | Selected collection unfolds while the viewer remains stationary | Peripheral content can increase scanning effort; limit navigation depth |
| Living Light | Opaque readable content planes within softly lit surroundings | Soft materials and controlled colour influenced by the selected film | Environment settles into a quiet palette as playback begins | Dynamic colour can distract and consume resources; static fallback must look complete |

These are alternative overall directions, not three launch environments. The product owner chooses one at G1. Keep the others as reference alternatives rather than mixing every motif.

## Material, type and light guidelines

- Define a small semantic palette: background, surface, foreground, muted text, focus, action and error. Choose values only after contrast review.
- Use legible type with clear hierarchy and a tested language/fallback strategy. Inherited Noto Sans is a compatibility baseline, not a final branding decision.
- Keep film and subtitle luminance readable; UI/environment brightness controls must not accidentally alter film colour grading.
- Use precomputed lighting and carefully selected dynamic contributions as candidate methods. Reflection, shadow and texture costs are measured in EXP-03.
- Keep poster aspect ratios intact and provide neutral missing-art states.
- Use one icon family with text labels for unfamiliar actions. Avoid decorative symbols that imply unsupported controls.

## Spatial and motion guidelines

Place essential navigation and playback controls within a comfortable forward area. Use depth to communicate hierarchy rather than scatter the interface around the user. Screen depth/size and control position must be recoverable.

Transitions communicate selection, entry, exit or loading. Reduced-motion mode displays the final readable state with minimal movement. Idle animation should not compete with the film. Screen-reactive lighting is an optional P1 effect with an off switch.

## Assets and review outputs

The later design review should contain comparable home, detail and cinema compositions; material references; type/contrast samples; a motion storyboard; and an asset licence/provenance list. Do not add unlicensed movie artwork to the repository. Use synthetic or permissioned media for experiments.

At G2, evaluate the chosen composition in-headset at actual viewing distance with long titles, dense metadata and subtitles. Record participant feedback separately from performance measurements.

Sources: [S01](../references/glossary-sources.md#s01), [S10](../references/glossary-sources.md#s10), [S15](../references/glossary-sources.md#s15).
