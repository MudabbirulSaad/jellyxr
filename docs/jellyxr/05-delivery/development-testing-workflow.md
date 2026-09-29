# Development testing on PC and Quest

Status: planned workflow; no emulator, automation framework, test server or headset has been configured by this documentation phase. Updated: 2026-09-29.

Use the PC for rapid ordinary-browser and simulated XR iteration, then test the same increment on Quest when its correctness depends on the device. This document describes how to execute the [test strategy](test-strategy.md); it does not add a competing set of acceptance requirements. Work belongs to [W-02](roadmap.md#w-02) and continues through W-09.

## Test layers and their limits

| Layer | Purpose | Proposed tools / environment | Evidence limitation |
| --- | --- | --- | --- |
| Ordinary browser and logic | Endpoint/account flows, SDK data, state transitions, error handling and inherited UI regression | Existing Vitest; named desktop browsers; candidate browser automation after evaluation | Does not test immersive input, perceived scale or headset media capabilities |
| Emulated XR on PC | Repeatable viewpoints, controller actions, session transitions, spatial layout and loading/error states | Meta Immersive Web Emulator (IWE) in Chrome/Edge; optionally IWER in a development harness | Simulates XR APIs/input using the PC; does not reproduce Quest decoding, GPU, compositor, thermal behaviour or perceived comfort |
| Actual Quest | Media/subtitle presentation, real input, text clarity, geometry, interruption and sustained performance | Named Quest/OS/Browser; remote DevTools; permitted profiling facilities | Results apply only to recorded versions, settings and fixtures |
| Deployment qualification | Install, upgrade, secure origins, server paths, network policies and rollback | Production build on reference hosting and separately served client | A development port tunnel does not qualify a self-hosted deployment |

IWE is a browser extension for WebXR development and lists Chrome/Edge installation routes. IWER is its related embeddable emulation runtime; embedding it is a separate future choice. These are test-tool candidates and do not choose JellyXR's rendering engine. [S19](../references/glossary-sources.md#s19), [S20](../references/glossary-sources.md#s20)

## M1: establish the repeatable PC loop

1. Verify the pinned [upstream environment and scripts](../04-architecture/upstream-assessment.md). Record Node/npm versions and use the existing lockfile. Reproduce the unmodified build and ordinary feature baseline before diagnosing JellyXR changes.
2. Prepare a test Jellyfin endpoint and permissioned fixtures from the test strategy. Use isolated accounts with known permissions. Keep credentials, media and private endpoint values outside committed files.
3. Evaluate IWE in a dedicated development browser profile and record its version and selected virtual device. Establish one successful virtual session and controller-selection exercise in the later feasibility harness.
4. Keep a clean browser profile with emulation disabled for ordinary fallback checks. If a selected framework already injects IWER, use one emulation path at a time; do not stack the extension and an injected runtime unintentionally.
5. Record reliable reset steps for session, viewpoint, input and test data. If a helper panel is useful, implement it later as development-only tooling: named viewpoints, reset/recenter, fixture selection, simulated errors and visible measurements. It must not ship with production credentials or override real-device capability reporting.

Commands below are inherited scripts inspected in [package.json](../../../package.json); they are future setup/check instructions, not executions performed in this phase. Node >=24 and npm >=11 are the pinned package's declared minimums.

~~~powershell
npm ci
npm run build:check
npm run lint
npm test
npm run build:production
npm start
~~~

Run these deliberately, checking each result. `npm start` starts the development server; use its reported port and verify its endpoint configuration. For later CSS changes include the inherited style checks, and apply other upstream checks appropriate to changed code. Record pre-existing failures separately from new regressions. Installing an emulator is W-02 work, not a new production dependency in this documentation change.

## Automated checks and visual review

Reuse Vitest for testable state and adapter behaviour. Evaluate browser automation, with Playwright as one candidate, for connection, login, navigation, recovery and ordinary/XR lifecycle smoke checks. Prove any emulated XR automation path in W-02 before relying on it in CI; a browser runner does not automatically supply XR hardware or a media decoder equivalent to Quest.

For screenshot comparisons, fix browser/OS, viewport, fonts, fixture data, camera pose, animation time and media frame. Playwright documents that screenshot rendering varies with environment, so comparisons need a controlled baseline. Review intentional changes; do not automatically accept a new image because the old one failed. [S22](../references/glossary-sources.md#s22)

For moving video or nondeterministic scene content, prefer observable state assertions and deliberately frozen fixtures. A clean screenshot does not prove subtitles stay synchronized, progress is reported once or the scene remains comfortable during head movement. Pair it with the relevant AT scenario.

## M2: connect a real Quest early

Use either the reference trusted HTTPS deployment or USB development forwarding. Meta documents Developer Mode, Android Platform Tools and USB as prerequisites for remote debugging. With the headset connected and authorized, the following example exposes a PC service running on port 8080 to the headset:

~~~powershell
adb devices
adb reverse tcp:8080 tcp:8080
~~~

Confirm the device is available, substitute the actual development port, open `localhost:8080` in Quest Browser using the server's scheme, then inspect the tab from Chrome's `chrome://inspect/#devices`. [Meta remote debugging, updated July 22, 2026](https://developers.meta.com/horizon/documentation/web/browser-remote-debugging/) ([S21](../references/glossary-sources.md#s21)). These commands are examples, not actions already performed.

The app's port mapping does not forward the Jellyfin endpoint automatically. Use a reachable test HTTPS endpoint or explicitly configure the required development service mapping/proxy. Different ports remain different origins; CORS and authentication still apply. Outside this explicit forwarding arrangement, headset `localhost` refers to the headset. Loopback development eligibility is distinct from remote LAN HTTP, which does not qualify simply because it is local. See [deployment constraints](../04-architecture/deployment-security.md).

Compare the same permissioned film and tracks first in ordinary Quest Browser and then in immersive mode with a plain environment. Verify seek, progress, subtitles and entry/exit before adding detailed assets. Record real input and interruption results. Use available profiling carefully: application callbacks, video frame statistics and compositor measurements are different evidence; document unavailable measurements.

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
