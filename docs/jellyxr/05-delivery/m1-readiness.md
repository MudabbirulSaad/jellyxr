# M1 readiness evidence

Updated: 2026-09-29. Status: build, signed-in desktop smoke test and Quest USB setup recorded; owner reports successful library access and ordinary playback on Quest 3. Detailed playback checks, emulator setup and remote inspection remain pending. M1 and G1 are not closed.

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
| Headset | Quest 3 observed as an authorised ADB device; Android 14 / API 34, build UP1A.231005.007.A1, incremental 52433670048800520; security patch 2026-06-04. Horizon OS release label still requires About UI confirmation |
| Quest Browser | Active com.oculus.browser package versionName 152.0.0.44.30.1069357998, versionCode 570501451, read with ADB. The older hidden system package is not the active version; browser About/user-agent confirmation remains pending |
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

[GitHub Actions run 36565551369](https://github.com/MudabbirulSaad/jellyxr/actions/runs/36565551369) passed all five checks for the initial M1 pull request revision. Subsequent documentation-only evidence updates do not change the application baseline; their CI status is recorded separately by GitHub.

The updated package passed local link/anchor, requirement coverage, work-dependency and Markdown checks: 24 package documents plus root README/AGENTS, 340 relative links, 39 requirement definitions, six business goals and 11 work packages. All six Mermaid diagrams parse with Mermaid 11.12.0. New specification colour pairs were calculated independently. No application source, lockfile, upstream licence or installed skill content changed.

## Browser and server observations

| Observation | Result | Boundary |
| --- | --- | --- |
| Local server public information | Passed | This particular probe establishes version/reachability only |
| Development-origin CORS preflight for public information | Passed | HTTP 204; requested authorization/content-type headers allowed. Not a stream/subtitle/socket compatibility result |
| Client loading in Codex in-app browser | Passed | Inherited Select Server, Connect to Server and sign-in screens rendered |
| Enter existing local endpoint through inherited form | Passed | Reached that server's normal sign-in screen; Remember Me disabled |
| Existing-account sign-in | Signed-in session observed | Owner completed browser sign-in; home/library became available. Credentials were not read or committed; invalid/expired-account cases remain untested |
| Library and title details | Basic subset passed | Movie/series library and Continue Watching rendered; an existing episode's details, audio/subtitle choices and chapters loaded |
| Desktop video start and pause | Basic subset passed | F-01 rendered video; DOM media state reached 16.36 seconds, readyState 4, 3840 x 2160, then paused. This is not an audio-quality, HDR or sustained-performance result |
| Desktop seek, subtitle rendering and resume | Incomplete | English audio and SUBRIP selected in title details. Synchronized subtitle rendering, seek and resume were not established by this run; player keyboard automation did not complete |
| Quest library access | Owner-reported success | Owner replied that the library loaded in Quest Browser after both USB mappings were installed; the agent did not remotely inspect the page |
| Quest ordinary playback | Owner-reported basic pass | Owner confirms video plays at localhost:8080 on Quest 3 and appears fine. Actual-device report, not an emulator result or direct agent observation; fixture, delivery method and elapsed viewing time were not supplied |
| Quest seek/subtitle/resume | Detailed results not recorded | General playback feedback does not identify each control result; confirm these separately before closing their scenario portions |

The in-app browser smoke check is an initial development observation. Its exact embedded Chromium version was not captured, so it does not qualify a named desktop browser configuration under NFR-010. Full AT-03/05/06/07/08/09/10 acceptance scenarios remain unpassed.

## Tooling and headset observations

Android Platform Tools 37.0.1-15733141 (ADB 1.0.41) was installed outside the repository under `%LOCALAPPDATA%\JellyXR\tools\platform-tools`. The Windows archive was obtained from Google's repository metadata and checked against its published SHA-1 `e03e78b1d80b396f1c3358e31251cb31740e1110`. `adb version` succeeds. On the follow-up run, exactly one Quest 3 appeared with status `device`; its serial is omitted from this report.

Both `adb reverse tcp:8080 tcp:8080` and `adb reverse tcp:8096 tcp:8096` succeeded, and `adb reverse --list` showed both mappings. Both host loopback services returned HTTP 200. The mappings remain active for the owner's headset test. Reconnect/reboot may require repeating the documented setup; a port mapping alone does not prove media delivery.

Automatic navigation to `chrome://inspect/#devices` was rejected by browser security policy, which allows only HTTP(S) navigation. No alternate inspector surface or raw debugging-protocol workaround was attempted. The owner must open desktop Chrome's inspector manually and record successful inspection of the Quest client before that check is closed.

The automation inventory exposes a personal Brave profile and the Codex in-app browser. Attempts to create dedicated Chrome/Edge sessions returned browser-unavailable results; the extension gallery reports that it cannot be scripted. No personal-profile settings were changed and no extension installation is claimed. The user has been asked to create a separate JellyXR Emulation profile and install the official extension; version/profile verification is pending.

| Task | State | Required completion evidence |
| --- | --- | --- |
| Platform Tools installation | Complete | Recorded version and archive verification |
| Clean comparison environment | Initial in-app browser available | Named desktop browser/version still required for qualification |
| Dedicated emulator profile and IWE | Pending manual setup | Browser/profile, extension version and selected virtual device; confirm clean environment remains unmodified |
| Quest Developer Mode and USB authorisation | Complete | Owner approved debugging; one Quest 3 observed with ADB status device |
| Client and server port forwarding | Complete for this connection | Both reverse mappings listed; owner reports Quest library loads |
| Quest OS/Browser inventory | Package/build identifiers recorded | About UI release labels remain to be confirmed; do not substitute Android 14 for a Horizon OS release number |
| Remote inspection | Pending manual action | Desktop Chrome Inspect must open the Quest client; automated internal-page navigation was blocked |
| Ordinary Quest browsing/playback | Library and basic playback reported successful | Detailed control results and media properties remain to be recorded |

## Fixture inventory

The signed-in library and one episode's details were inspected through the inherited UI. F-01 is an anonymous episode fixture: about 48 minutes; UI reports 4K HEVC Dolby Vision Profile 8.1 (HDR10), two Dolby Digital+ 5.1 audio tracks, SUBRIP tracks and eleven chapter entries. Source container, actual delivery method and server FFmpeg version were not recorded. A 2160p decoded video surface does not prove direct play or HDR output. No private title, identifier, artwork or media is committed.

During desktop navigation, a browser-control action unintentionally toggled the episode's watched flag. The flag was restored and the UI showed Mark played again before the playback test. That fixture's prior resume position is not a valid baseline for a resume assertion; later testing must establish a new known position.

| Case | Availability | Next evidence / linked scenario |
| --- | --- | --- |
| Existing normal account | Signed-in desktop session observed; owner reports Quest library access | Valid-session subset only; AT-03 remains incomplete |
| Restricted and administrative accounts | Not inventoried for this pass | Required later for AT-04/15; normal account alone does not cover these roles |
| Movie and episode with resume state | Movie/episode Continue Watching entries visible; F-01 episode inspected | Record movie media properties and establish a known resume point; AT-05/06/07 |
| Compatible direct-play media | Not inventoried | Negotiated delivery method; AT-08 |
| Remux/direct-stream and transcode cases | Not inventoried | Actual negotiation and server conversion evidence; AT-08 |
| Prohibited-transcode and unavailable-source cases | Not prepared | Controlled permission/failure fixtures before AT-08/14; do not alter the owner's server policy merely to create a case |
| Multiple audio tracks and chapters | Available in F-01 | Two audio choices and eleven chapters observed; switching during playback and chapter seeking untested; AT-09/10 |
| Text, ASS and bitmap subtitles | SUBRIP available in F-01; ASS/bitmap not inventoried | Text selection observed, rendering/sync unverified; find or record missing ASS/bitmap cases; AT-10/EXP-02 |
| 1,000-item catalogue | Not prepared | Separate deterministic fixture for EXP-03/AT-05/24; no fabricated catalogue added to the owner's library |
| Interrupted network/server and expired session | Not exercised | Controlled recovery runs; AT-14 |

## Remaining steps and gate disposition

1. Complete the desktop ordinary playback, seek, subtitle and resume checks using a newly established resume point; finish the media/delivery inventory without exporting personal titles/artwork.
2. Complete the separate emulator-profile installation and record version/profile evidence.
3. Keep the authorised Quest 3 connection and [two-port development workflow](development-testing-workflow.md#quest-3-usb-development-setup) active. Basic playback is owner-confirmed; record seek, subtitle and resume results plus anonymous fixture properties. Confirm About versions and manually open remote inspection.
4. Review missing fixture cases and record the resulting G1 disposition. M2 immersive experiments and measurements remain separate work.

The visual selection and target decisions are settled; environment and media evidence is still outstanding. Under D-24, the owner authorised merging the current M1 work into xr without waiting for the CI runner, superseding the earlier draft hold. Integration does not close M1/G1 or pass the remaining checks. Future evidence must update this report, roadmap and risks together rather than changing pending cells to passed by assumption.

Related: [roadmap](roadmap.md), [test strategy](test-strategy.md), [Cinema Observatory](../03-experience/cinema-observatory.md), [decisions](../06-decisions/decision-register.md).
