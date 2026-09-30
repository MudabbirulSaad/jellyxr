# Observatory asset pipeline

Status: M2 original chair, upholstery maps, architectural shell and loading comparison implemented; compressed production textures, lighting and Quest qualification remain open. Updated 2026-09-30. Supports FR-015/031, NFR-001/002 and EXP-03/04.

## Source and ownership

The [authoring recipe](../../../scripts/jellyxr/buildObservatoryAssets.ts) creates the Observatory chair from original dimensions and geometry. It uses the already pinned Three 0.186.0 authoring/export utilities; that tool choice does not select the production renderer. Both candidates load the identical exported GLB. No external model, movie artwork, photograph or downloaded texture is included.

The recipe, runtime models and collision data use the repository's GPL-2.0-or-later licence. The [asset manifest](../../../src/apps/experimental/xr/assets/observatory/manifest.json) records source, licence, authoring dependency, coordinates, variants, hashes and outstanding work. Three remains MIT-licensed; the Babylon loader and its glTF interface package are pinned to 9.27.1 under Apache-2.0. Preserve their notices in M6 dependency packaging.

## Current model

The chair has a rounded graphite shell, independent seat/back/head/lumbar cushions, raised arms, restrained metal feet and warm side trim. Back channels are geometric relief. Five material groups are merged into five primitives, shared when placed twice. Cushions now use two original 512 × 512 linear data maps: tangent-space normals and packed metallic/roughness. Their 8 cm repeating tile represents 32 crossing threads per axis. Rounded cushion UVs scale by face arc length, with MikkTSpace tangents generated using the utility bundled with Three. Other finishes retain their scalar PBR materials; no video or control surface receives the upholstery maps.

| Variant | Triangles per chair | GLB bytes | Material primitives | Measured outer size |
| --- | ---: | ---: | ---: | --- |
| Detailed | 13,192 | 1,457,108 | 5 | approximately 0.896 × 1.353 × 0.780 m |
| Reduced | 2,504 | 292,788 | 5 | same dimensions |

These are asset counts, not measured draw calls, GPU cost or transfer times over a particular network. Neither count is an accepted performance budget. Both variants preserve shape and material vocabulary; the reduced version uses fewer bevel/cylinder segments.

The separate [collision resource](../../../src/apps/experimental/xr/assets/observatory/observatory-chair-collision.json) has two boxes per chair. Tests check that rendered vertices fit within the proxies and both renderers report matching triangle/material counts. Remote collision tests use the widened chair footprint. Physics never needs the detailed render mesh as its collider.

## Upholstery material contract

Prepare an original repeatable woven surface for the existing cushions, with linear tangent-space normal data and a packed metallic/roughness texture. Use a documented physical tile size across cushion faces, explicit tangent data and mipmap-capable sampling in both renderers. The material must retain the graphite palette without touching video, captions or control artwork. Share material textures across chair instances and release them with their owning model. Keep source recipes, image hashes and licence information with the manifest. Initial lossless PNG assets are authoring/reference inputs; they do not satisfy the final GPU-compressed texture or headset-shimmer gate.

## Architectural shell comparison contract

For FR-015/031 and EXP-03, replace the visible floor, ceiling, four walls and library plinth with an original glTF shell. Author a consistent graphite envelope, recessed acoustic panels, a quiet floor grid, ceiling coffers and restrained metal trim. Keep all rendered vertices inside the existing collision volumes; do not change room size, floor height, locomotion clearance, screen, lights, chairs or remote behavior merely to add detail. The model is stable architecture, with no decorative buttons or invented library content.

Both candidates load identical GLB bytes and use their existing PBR/light settings. Merge geometry by finish to bound material primitives, retain a separate collision resource, and record source, licence, dimensions, counts and hashes. Successful loading replaces only the corresponding visible proxies; failure retains them and reports a retry path. Dispose the model with the comparison scene. Keep the shell outside ordinary production. This prepares architectural detail without claiming baked lighting, final shelving, texture compression, measured GPU cost or Quest fidelity.

Retain an explicit Plain room option for the EXP-03 control scene. It renders only the existing architectural collision geometry while retaining the same chosen chair detail, lights, controls and physics. Switching between Architectural shell and Plain room restarts the comparison and clears its video attachment. Disable scene changes during immersive use; record the selected geometry with later measurements so unlike scenes are never ranked together.

### Current shell

The [room recipe](../../../scripts/jellyxr/buildObservatoryRoom.ts) creates a graphite backing envelope, bevelled acoustic panels, a two-metre floor grid, ceiling coffers, metal edge rails and layered library plinth. Floor joints are 8 mm wide; the finished tile surface remains at zero height. Four scalar PBR finishes merge into four material primitives. The [room manifest](../../../src/apps/experimental/xr/assets/observatory/room-manifest.json) records original GPL-2.0-or-later authorship with no external assets, the locked authoring tool and unresolved production work.

The GLB contains 15,084 triangles, four primitives and no textures in 1,089,452 bytes. Its outer envelope is approximately 12.2 × 4.4 × 14.2 m, including the unchanged wall/floor/ceiling collision extents. SHA-256: `30e803bdf4cb8f5654fb42e031c6c2759fa6e49aba936a07968e4bf913f3c955`. The separate [room collision resource](../../../src/apps/experimental/xr/assets/observatory/observatory-room-collision.json) matches the seven existing static architectural boxes exactly. These counts are not a performance qualification or an approved production budget.

Actual Three/glTF and Babylon NullEngine/glTF tests load the same file, check every rendered vertex against the collision volumes, compare representative floor/wall/ceiling/plinth ray hits and verify disposal. Loader-failure tests retain visible proxies; Plain room skips model loading entirely. Khronos Validator 2.0.0-dev.3.10 reports zero errors, warnings, informational notices and hints for this file. Final geometry, lighting and query costs still require actual GPU/headset measurements.

## Rebuild and verify

Use the locked dependencies and Node 24:

```powershell
npm run assets:observatory
npm run assets:room
npx tsc --project scripts/jellyxr/tsconfig.json
npm test -- src/apps/experimental/xr/assets/chairAssets.test.ts src/apps/experimental/xr/assets/roomAsset.test.ts
npm run build:check
```

The chair command replaces only its named GLBs, two authored PNGs, collision JSON and manifest under the experimental asset directory. The room command replaces only its GLB, collision JSON and room manifest in that directory. The [material recipe](../../../scripts/jellyxr/upholsteryMaterial.ts) encodes the linear data maps and embeds the same bytes into each GLB. PNGs are lossless reference assets; GPU-compressed variants remain pending. Repeated generation with this source and tool version produced identical GLB hashes. Changes to geometry, materials or tools must regenerate the manifest and pass the loader/hash/collision tests before review.

Both generators run offline in Node and share the [binary export helper](../../../scripts/jellyxr/gltfAuthoring.ts). Its small Blob reader adapter serves GLTFExporter's geometry path; the material recipe subsequently adds aligned image buffer views, textures and sampler references to the GLB. No DOM/canvas shim is required in the generator. Node 24 supplies PNG compression/CRC support; no image-authoring package or runtime dependency was added. Browser compatibility lint remains active for application/XR code. Only `scripts/jellyxr/*.ts`, which runs in Node and is excluded from application bundles, uses a Node-specific compatibility setting.

Khronos glTF Validator 2.0.0-dev.3.10 was installed outside the repository for this run. Both chair files returned zero errors and zero warnings, plus four informational notices for UV attributes on the remaining untextured finishes. Actual Three GLTFLoader and Babylon NullEngine/glTF-loader tests also passed. Node tests decompress the actual PNG data and supply a controlled ImageBitmap boundary; NullEngine does not upload to a GPU. Tests cover tangent orthogonality, declared channels, bounds/proxies, pixel ranges/hashes and disposal. Those tests do not exercise a headset or GPU.

## Runtime comparison and remaining work

The opt-in workbench offers Detailed and Reduced chair models independently of Architectural shell and Plain room. Changing room or chair detail restarts the comparison scene and clears its attachment; it does not stop the inherited Jellyfin player. A failed asset load retains visible simple collision proxies and reports the failure. The ordinary production bundle must contain neither chair/room GLBs nor the experiment controls.

The browser run visibly loaded both detailed candidates. Initial load/parse labels include cache and device conditions as uncontrolled; they cannot rank engines. The subsequent shared four-light reference and front-facing controls normalize those comparison inputs. Detailed and reduced variants with the updated materials load in both PC previews, but full material/lighting equivalence and close-range textile appearance remain review tasks. Keep these observations separate from model file validity.

Next asset work includes GPU-compressed textures and mip validation, close-range weave/UV review, baked lighting/reflections, final library shelving and surface materials, an authored remote and complete load-failure qualification. Three now disposes shared textures and closes decoded images with the source model; Babylon retains asset-container ownership. The architectural shell has matching forward PC views and retained floor selection/recovery, with a plain baseline available for controlled comparisons. File validity and desktop load checks do not establish sustained GPU memory recovery. Measure actual draw calls, GPU/CPU cost, memory and loading under a repeatable device configuration. Final realism, seated visibility and long-session budgets remain G2/G3/G4 gates under the [Cinema Observatory specification](../03-experience/cinema-observatory.md).

Primary references accessed 2026-09-30: [glTF specification](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc), [Khronos validator](https://github.com/KhronosGroup/glTF-Validator), and the installed Three/Babylon source versions recorded above.
