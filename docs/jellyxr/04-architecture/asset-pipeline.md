# Observatory asset pipeline

Status: M2 original chair and loading experiment implemented; production materials, lighting and Quest qualification remain open. Updated 2026-09-30. Supports FR-015/031, NFR-001/002 and EXP-03/04.

## Source and ownership

The [authoring recipe](../../../scripts/jellyxr/buildObservatoryAssets.ts) creates the Observatory chair from original dimensions and geometry. It uses the already pinned Three 0.186.0 authoring/export utilities; that tool choice does not select the production renderer. Both candidates load the identical exported GLB. No external model, movie artwork, photograph or downloaded texture is included.

The recipe, runtime models and collision data use the repository's GPL-2.0-or-later licence. The [asset manifest](../../../src/apps/experimental/xr/assets/observatory/manifest.json) records source, licence, authoring dependency, coordinates, variants, hashes and outstanding work. Three remains MIT-licensed; the Babylon loader and its glTF interface package are pinned to 9.27.1 under Apache-2.0. Preserve their notices in M6 dependency packaging.

## Current model

The chair has a rounded graphite shell, independent seat/back/head/lumbar cushions, raised arms, restrained metal feet and warm side trim. Back channels are geometric relief. Five material groups are merged into five primitives, shared when placed twice. There are no texture maps in this increment. UVs are retained for subsequent material work.

| Variant | Triangles per chair | GLB bytes | Material primitives | Measured outer size |
| --- | ---: | ---: | ---: | --- |
| Detailed | 13,192 | 1,271,456 | 5 | approximately 0.896 × 1.353 × 0.780 m |
| Reduced | 2,504 | 245,384 | 5 | same dimensions |

These are asset counts, not measured draw calls, GPU cost or transfer times over a particular network. Neither count is an accepted performance budget. Both variants preserve shape and material vocabulary; the reduced version uses fewer bevel/cylinder segments.

The separate [collision resource](../../../src/apps/experimental/xr/assets/observatory/observatory-chair-collision.json) has two boxes per chair. Tests check that rendered vertices fit within the proxies and both renderers report matching triangle/material counts. Remote collision tests use the widened chair footprint. Physics never needs the detailed render mesh as its collider.

## Rebuild and verify

Use the locked dependencies and Node 24:

```powershell
npm run assets:observatory
npx tsc --project scripts/jellyxr/tsconfig.json
npm test -- src/apps/experimental/xr/assets/chairAssets.test.ts
npm run build:check
```

Generation replaces only the named chair GLBs, collision JSON and manifest under the experimental asset directory. Repeated generation with this source and tool version produced identical GLB hashes. Changes to geometry, materials or tools must regenerate the manifest and pass the loader/hash/collision tests before review.

The generator runs offline in Node. Its small Blob reader adapter serves GLTFExporter's binary path; it does not emulate a browser or change the app's runtime. Browser compatibility lint remains active for application/XR code. Only `scripts/jellyxr/*.ts`, which runs in Node and is excluded from application bundles, uses a Node-specific compatibility setting.

Khronos glTF Validator 2.0.0-dev.3.10 was installed outside the repository for this run. Both files returned zero errors and zero warnings, plus five informational notices for currently unused UV attributes. Actual Three GLTFLoader and Babylon NullEngine/glTF-loader tests also passed; those tests do not exercise a headset or GPU.

## Runtime comparison and remaining work

The opt-in workbench offers Detailed and Reduced chair models. Changing model detail restarts the comparison scene and clears its attachment; it does not stop the inherited Jellyfin player. A failed asset load retains visible simple collision proxies and reports the failure. The ordinary production bundle must contain neither chair GLBs nor the experiment controls.

The browser run visibly loaded both detailed candidates. Initial load/parse labels include cache and device conditions as uncontrolled; they cannot rank engines. Lighting and control back-face differences are still visible between the harnesses and need normalization before comparative visual scoring. Keep these observations separate from model file validity.

Next asset work includes UV/material refinement, authored normal/roughness detail, compressed textures, a shared lighting/reflection reference, room architecture/shelving, an authored remote and complete disposal/load-failure qualification. Measure actual draw calls, GPU/CPU cost, memory and loading under a repeatable device configuration. Final realism, seated visibility and long-session budgets remain G2/G3/G4 gates under the [Cinema Observatory specification](../03-experience/cinema-observatory.md).

Primary references accessed 2026-09-30: [glTF specification](https://github.com/KhronosGroup/glTF/tree/main/specification/2.0), [Khronos validator](https://github.com/KhronosGroup/glTF-Validator), and the installed Three/Babylon source versions recorded above.
