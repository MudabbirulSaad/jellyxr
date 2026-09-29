# Development testing on PC and Quest

Status: M1 build and client connection setup exercised; authenticated playback, emulator installation and Quest verification remain pending. Updated: 2026-09-29. Actual results are in the [M1 readiness report](m1-readiness.md).

Use the PC for rapid ordinary-browser and simulated XR iteration, then test the same increment on Quest when its correctness depends on the device. This document describes how to execute the [test strategy](test-strategy.md); it does not add a competing set of acceptance requirements. Work belongs to [W-02](roadmap.md#w-02) and continues through W-09.

## Test layers and their limits

| Layer | Purpose | Proposed tools / environment | Evidence limitation |
| --- | --- | --- | --- |
| Ordinary browser and logic | Endpoint/account flows, SDK data, state transitions, error handling and inherited UI regression | Existing Vitest; named desktop browsers; candidate browser automation after evaluation | Does not test immersive input, perceived scale or headset media capabilities |
| Emulated XR on PC | Repeatable viewpoints, controller actions, session transitions, spatial layout and loading/error states | Meta Immersive Web Emulator (IWE) in Chrome/Edge; optionally IWER in a development harness | Simulates XR APIs/input using the PC; does not reproduce Quest decoding, GPU, compositor, thermal behaviour or perceived comfort |
| Actual Quest | Media/subtitle presentation, real input, text clarity, geometry, interruption and sustained performance | Named Quest/OS/Browser; remote DevTools; permitted profiling facilities | Results apply only to recorded versions, settings and fixtures |
| Deployment qualification | Install, upgrade, secure origins, server paths, network policies and rollback | Production build on reference hosting and separately served client | A development port tunnel does not qualify a self-hosted deployment |

IWE is the selected development extension and lists Chrome/Edge installation routes. IWER is its related embeddable emulation runtime; embedding it and adding browser-automation dependencies remain deferred. These choices do not select JellyXR's rendering engine. [S19](../references/glossary-sources.md#s19), [S20](../references/glossary-sources.md#s20)

## M1: establish the repeatable PC loop

1. Verify the pinned [upstream environment and scripts](../04-architecture/upstream-assessment.md). Record Node/npm versions and use the existing lockfile. Reproduce the unmodified build and ordinary feature baseline before diagnosing JellyXR changes.
2. Connect the existing local Jellyfin 10.11.4 server and inventory permissioned fixtures. The owner selected their normal account for M1 and accepted playback-history changes; restricted/admin fixtures remain separate later work. Keep credentials, media and private endpoint values outside committed files.
3. Evaluate IWE in a dedicated development browser profile and record its version and selected virtual device. Establish one successful virtual session and controller-selection exercise in the later feasibility harness.
4. Keep a clean browser profile with emulation disabled for ordinary fallback checks. If a selected framework already injects IWER, use one emulation path at a time; do not stack the extension and an injected runtime unintentionally.
5. Record reliable reset steps for session, viewpoint, input and test data. If a helper panel is useful, implement it later as development-only tooling: named viewpoints, reset/recenter, fixture selection, simulated errors and visible measurements. It must not ship with production credentials or override real-device capability reporting.

Commands below reproduce the inherited scripts in [package.json](../../../package.json). Node >=24 and npm >=11 are the declared minimums; M1 used Node 24.13.0/npm 11.15.0. Read actual results in the evidence report instead of assuming a successful run on another machine.

~~~powershell
npm ci --no-audit
npm run build:check
npm run lint
npm run stylelint
npm test
npm run build:es-check
npm run serve -- --host 127.0.0.1 --port 8080
~~~

Run these deliberately, checking each result. `build:es-check` includes the production build, so a duplicate production build is unnecessary. Keep the loopback development server running while testing; enter the local Jellyfin endpoint in the inherited server-selection form. Do not change the committed default server configuration or replace the user's installed server web client. Record pre-existing failures separately from new regressions.

## Separate browser profiles

Create a browser profile named JellyXR Emulation and install IWE through its official [Chrome store listing](https://chromewebstore.google.com/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik) or [Edge listing](https://microsoftedge.microsoft.com/addons/detail/immersive-web-emulator/hhlkbhldhffpeibcfggfndbkfohndamj). Record browser and extension versions. Keep another profile without IWE for ordinary checks; do not copy authentication storage between profiles.

Open the extension's DevTools panel, select the Quest 3 virtual profile where available, and record its exact label. Reopen the development page after changing emulation settings. M1 verifies setup; a virtual session/controller exercise belongs to the M2 feasibility harness because JellyXR does not yet implement immersive entry. An extension-store page or downloaded archive alone is not proof of installation.

## Automated checks and visual review

Reuse Vitest for testable state and adapter behaviour. Evaluate browser automation, with Playwright as one candidate, for connection, login, navigation, recovery and ordinary/XR lifecycle smoke checks. Prove any emulated XR automation path in W-02 before relying on it in CI; a browser runner does not automatically supply XR hardware or a media decoder equivalent to Quest.

For screenshot comparisons, fix browser/OS, viewport, fonts, fixture data, camera pose, animation time and media frame. Playwright documents that screenshot rendering varies with environment, so comparisons need a controlled baseline. Review intentional changes; do not automatically accept a new image because the old one failed. [S22](../references/glossary-sources.md#s22)

For moving video or nondeterministic scene content, prefer observable state assertions and deliberately frozen fixtures. A clean screenshot does not prove subtitles stay synchronized, progress is reported once or the scene remains comfortable during head movement. Pair it with the relevant AT scenario.

## Quest 3 USB development setup

Use either the reference trusted HTTPS deployment or USB development forwarding. M1 uses the owner's local server and Quest 3. Platform Tools is installed outside the project. Developer Mode and the USB debugging approval must be completed on the user's device before it can be inspected. Check device status first:

~~~powershell
$jxAdb = Join-Path $env:LOCALAPPDATA 'JellyXR\tools\platform-tools\adb.exe'
& $jxAdb version
& $jxAdb devices
~~~

When exactly one device is attached and its status is `device`, forward both development services. If several devices are attached, use `-s` with the intended local serial for each command; do not publish serials in evidence.

~~~powershell
& $jxAdb reverse tcp:8080 tcp:8080
& $jxAdb reverse tcp:8096 tcp:8096
& $jxAdb reverse --list
~~~

Open `http://localhost:8080` in Quest Browser and connect to `http://localhost:8096` through the inherited form. Inspect the browser tab from Chrome's `chrome://inspect/#devices`. Record Quest OS and Browser versions from the device/about UI and record only redacted environment details. [Meta remote debugging, updated July 22, 2026](https://developers.meta.com/horizon/documentation/web/browser-remote-debugging/) ([S21](../references/glossary-sources.md#s21)). The evidence report identifies which commands have actually run.

The app's port mapping does not forward the Jellyfin endpoint automatically. Use a reachable test HTTPS endpoint or explicitly configure the required development service mapping/proxy. Different ports remain different origins; CORS and authentication still apply. Outside this explicit forwarding arrangement, headset `localhost` refers to the headset. Loopback development eligibility is distinct from remote LAN HTTP, which does not qualify simply because it is local. See [deployment constraints](../04-architecture/deployment-security.md).

M1 checks ordinary Quest browsing and playback. M2 compares the same permissioned film and tracks in immersive mode with a plain environment, then verifies seek, progress, subtitles and entry/exit before detailed assets. Application callbacks, video frame statistics and compositor measurements are different evidence; document unavailable measurements. A USB connection alone does not demonstrate video or XR compatibility.

When the test session is finished, remove only the two mappings created for it:

~~~powershell
& $jxAdb reverse --remove tcp:8080
& $jxAdb reverse --remove tcp:8096
~~~

Stop the development server with Ctrl+C when it is no longer needed. Leave the existing Jellyfin server running.

## Where evidence is required

| Roadmap point | Required testing contribution |
| --- | --- |
| M1 / W-02 preparation | Reproduced upstream checks and ordinary baseline; documented fixtures and emulation setup; Quest access identified |
| M2 / G2 | Actual Quest evidence for media, subtitles, controller tasks, deployment and rendering budget; desktop evidence assists but cannot close these decisions alone |
| M3 | Connection/library/playback checks with a real test server; rerun affected ordinary baselines and prepare the shared lifecycle contracts |
| M4-M5 / G3 | Repeated complete journey on PC and actual Quest; user observation for reach, text readability, recenter and interruption |
| M6 / G4 | Final production build, full agreed matrix, accepted extended-session target, ordinary feature audit and deployment/rollback; emulation disabled |

If a Quest is temporarily unavailable, desktop work and fixture preparation can continue. Keep actual-device scenarios blocked and arrange a recorded run through available hardware or a tester before closing G2/G4. A video capture from a tester needs environment and procedure details; its existence alone is not a pass.

## Evidence and integration discipline

Use the [evidence record](test-strategy.md#evidence-record) for every run. Record emulator/runtime versions and the virtual device when applicable, in addition to the host browser and build. Mark partial scenario execution explicitly. Store redacted reports in the project documentation when produced; store permissioned media and secrets outside Git.

Future changes merge into `xr` with focused checks and the evidence needed for their claim. The branch can contain an incomplete implementation without being a release; G3/G4 remain explicit gates. Record test-tool adoption in the decision register and verify that production bundles neither initialize nor depend on a development emulator.
