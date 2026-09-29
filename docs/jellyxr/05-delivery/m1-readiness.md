# M1 readiness evidence

Updated: 2026-09-29. Status: build and documentation work delivered; authenticated playback, emulator and physical Quest verification pending. M1 and G1 are not closed.

This report records observed results for W-02 preparation. It is not a device support announcement. The milestone branch starts at xr commit 84571b91b3362a4aaeaac81e6d9cec77ce89e3c6; application source and locked dependencies remain those of the pinned Jellyfin Web baseline.

## Decisions and environment

| Item | Evidence / disposition |
| --- | --- |
| Authorised work | Approved M1 implementation plan; branch milestone/m1-readiness; pull request targets xr |
| Development host | Windows build 26200; Node 24.13.0; npm 11.15.0 |
| Client foundation | Jellyfin Web 12.1.0; pinned upstream fae41f33eb7cd636a9ef68984adb82bb247a6e1b |
| Server | Existing local Jellyfin 10.11.4, reported by public system information; startup wizard complete |
| SDK | Locked @jellyfin/sdk 1.0.0 installed; lib/versions.js declares minimum server 10.10.0. This is a floor, not a tested compatibility matrix |
| Test identity | Owner selected the existing account and accepted playback-history changes; credentials are entered through normal sign-in |
| Headset | Quest 3 available according to owner; USB device, OS/Browser versions and playback not yet observed |
| Design | Cinema Observatory selected; bundled Noto Sans and reference palette specified |
| Targets | Existing NFR targets accepted, including 120 minutes, ten XR cycles and the 1,000-item catalogue; no XR measurements yet |

## Reproduced build baseline

Commands ran on the unchanged application tree using the existing package-lock.json. Checks ran concurrently, so durations are elapsed observations rather than benchmark comparisons. Logs are local under `%LOCALAPPDATA%\JellyXR\m1`, outside Git.

| Check | Result | Recorded evidence |
| --- | --- | --- |
| npm ci --no-audit | Passed | 1,768 packages installed; existing lockfile unchanged |
| npm run build:check | Passed | Exit 0; 10.3 seconds |
| npm run lint | Passed with inherited warnings | Exit 0; 108.9 seconds; 0 errors, 98 warnings |
| npm run stylelint | Passed | Exit 0; 13.2 seconds |
| npm test | Passed | Exit 0; 12 test files and 162 tests; 25.9 seconds command elapsed |
| npm run build:es-check | Passed with inherited size warnings | Exit 0; 96.4 seconds; production compilation and ES5 check of 982 files passed |
| Development server | Running at initial handoff | Loopback port 8080; compilation succeeded in 28.8 seconds; HTTP 200; server-selection and sign-in screens observed |

No baseline failure required a source change. The npm configuration reports an unrecognised `min-release-age-exclude` setting and inherited dependency deprecations. Webpack reports asset and entrypoint size warnings. These are recorded observations; this milestone does not silence them, upgrade dependencies or claim a performance improvement.

## Repository validation and CI

The dedicated [JellyXR checks workflow](../../../.github/workflows/xr-checks.yml) targets pushes and pull requests to xr and supports manual runs. It installs locked dependencies on Node 24, runs all five inherited checks, uses contents:read permissions and does not deploy. The existing upstream workflows are preserved. Workflow syntax, trigger branches, permissions and command list were parsed locally; live CI conclusions belong to the pull request's Checks view.

The updated package passed local link/anchor, requirement coverage, work-dependency and Markdown checks: 24 package documents plus root README/AGENTS, 340 relative links, 39 requirement definitions, six business goals and 11 work packages. All six Mermaid diagrams parse with Mermaid 11.12.0. New specification colour pairs were calculated independently. No application source, lockfile, upstream licence or installed skill content changed.

## Browser and server observations

| Observation | Result | Boundary |
| --- | --- | --- |
| Local server public information | Passed | Version/reachability only; no authenticated library information retrieved |
| Development-origin CORS preflight for public information | Passed | HTTP 204; requested authorization/content-type headers allowed. Not a stream/subtitle/socket compatibility result |
| Client loading in Codex in-app browser | Passed | Inherited Select Server, Connect to Server and sign-in screens rendered |
| Enter existing local endpoint through inherited form | Passed | Reached that server's normal sign-in screen; Remember Me disabled |
| Existing-account sign-in | Pending user interaction | Credentials have not been supplied to the agent or committed |
| Library and title details | Not run | Requires signed-in session |
| Playback, seek, subtitles and resume | Not run | Requires signed-in session and selected media |

The in-app browser smoke check is an initial development observation. Its exact embedded Chromium version was not captured, so it does not qualify a named desktop browser configuration under NFR-010. Full AT-03/05/06/07/08/09/10 acceptance scenarios remain unpassed.

## Tooling and headset observations

Android Platform Tools 37.0.1-15733141 (ADB 1.0.41) was installed outside the repository under `%LOCALAPPDATA%\JellyXR\tools\platform-tools`. The Windows archive was obtained from Google's repository metadata and checked against its published SHA-1 `e03e78b1d80b396f1c3358e31251cb31740e1110`. `adb version` succeeds. The observed `adb devices` result contains no connected device.

The automation inventory exposes a personal Brave profile and the Codex in-app browser. Attempts to create dedicated Chrome/Edge sessions returned browser-unavailable results; the extension gallery reports that it cannot be scripted. No personal-profile settings were changed and no extension installation is claimed. The user has been asked to create a separate JellyXR Emulation profile and install the official extension; version/profile verification is pending.

| Task | State | Required completion evidence |
| --- | --- | --- |
| Platform Tools installation | Complete | Recorded version and archive verification |
| Clean comparison environment | Initial in-app browser available | Named desktop browser/version still required for qualification |
| Dedicated emulator profile and IWE | Pending manual setup | Browser/profile, extension version and selected virtual device; confirm clean environment remains unmodified |
| Quest Developer Mode and USB authorisation | Pending user/device interaction | Device appears as authorised in ADB |
| Client and server port forwarding | Not run | Both reverse mappings listed for the selected device |
| Quest OS/Browser inventory and remote inspection | Not run | Version record and successful inspection of the development client |
| Ordinary Quest browsing/playback | Not run | Signed-in library/title/playback observations with identified media properties |

## Fixture inventory

This is an honest availability inventory, not generated sample content. The existing server is reachable, but its authenticated media inventory has not yet been inspected. Private titles and identifiers are not needed in this report.

| Case | Availability | Next evidence / linked scenario |
| --- | --- | --- |
| Existing normal account | Owner confirms account; sign-in pending | AT-03 baseline subset |
| Restricted and administrative accounts | Not inventoried for this pass | Required later for AT-04/15; normal account alone does not cover these roles |
| Movie and episode with resume state | Not inventoried | Codec/container/duration and redacted case label; AT-05/06/07 |
| Compatible direct-play media | Not inventoried | Negotiated delivery method; AT-08 |
| Remux/direct-stream and transcode cases | Not inventoried | Actual negotiation and server conversion evidence; AT-08 |
| Prohibited-transcode and unavailable-source cases | Not prepared | Controlled permission/failure fixtures before AT-08/14; do not alter the owner's server policy merely to create a case |
| Multiple audio tracks and chapters | Not inventoried | Track metadata and seek behaviour; AT-09/10 |
| Text, ASS and bitmap subtitles | Not inventoried | One representative of each format or explicit missing-case record; AT-10/EXP-02 |
| 1,000-item catalogue | Not prepared | Separate deterministic fixture for EXP-03/AT-05/24; no fabricated catalogue added to the owner's library |
| Interrupted network/server and expired session | Not exercised | Controlled recovery runs; AT-14 |

## Remaining steps and gate disposition

1. Sign in to the development client using the existing account. Inventory selected media without exporting personal titles/artwork, then run ordinary library/detail/playback/seek/subtitle/resume checks.
2. Complete the separate emulator-profile installation and record version/profile evidence.
3. Connect and authorise Quest 3 over USB. Follow the [two-port development workflow](development-testing-workflow.md#quest-3-usb-development-setup), record OS/Browser versions, and verify the same ordinary journey on the headset.
4. Review missing fixture cases and record the resulting G1 disposition. M2 immersive experiments and measurements remain separate work.

The visual selection and target decisions are settled; environment and media evidence is still outstanding. Keep the M1 pull request in draft while required readiness checks are missing. Future evidence must update this report, roadmap and risks together rather than changing pending cells to passed by assumption.

Related: [roadmap](roadmap.md), [test strategy](test-strategy.md), [Cinema Observatory](../03-experience/cinema-observatory.md), [decisions](../06-decisions/decision-register.md).
