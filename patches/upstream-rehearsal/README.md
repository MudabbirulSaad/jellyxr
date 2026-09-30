# Controlled upstream capability-profile rehearsal

This directory preserves the original TypeScript probe used to rehearse official Jellyfin commit `a510fba5a54d8d899b17f445121e6277511c2e0c` against JellyXR base `c569e7c51243f169350fdac973f356e9bf3db236`. The probe was authored for JellyXR with Codex assistance under the repository's GPL-2.0-or-later licence. The upstream application change is referenced by its Git commit and retains its author; it is not adopted into xr by this artifact.

The [probe patch](browser-device-profile.test.patch) adds `src/scripts/browserDeviceProfile.test.ts` only in a disposable checkout. It mocks browser flags, media capability probes and settings while exercising the real inherited profile builder. It is deliberately not collected in the main suite and does not change production policy. No actual Tizen, Chromium or Quest decoder/input compatibility is inferred.

## Replay in an isolated checkout

Keep the probe's absolute path in the main checkout, and create or reuse a separate, clean managed checkout at the recorded base. Use the supported Node/npm versions and installed Git remote pointing to official jellyfin/jellyfin-web. In PowerShell, substitute the actual returned checkout path:

```powershell
$jxProbePatch = (Resolve-Path 'patches/upstream-rehearsal/browser-device-profile.test.patch').Path
$jxRehearsalPath = '<absolute isolated checkout path>'
git -C $jxRehearsalPath switch -c rehearsal/upstream-audio-profile c569e7c51243f169350fdac973f356e9bf3db236
git -C $jxRehearsalPath apply --check $jxProbePatch
git -C $jxRehearsalPath apply $jxProbePatch
```

Run the following from the isolated checkout. Do not apply the expected-failing probe to the working development checkout.

```powershell
npm ci --no-audit
npm run patch:dependencies
npm test -- src/scripts/browserDeviceProfile.test.ts
```

At the recorded base, **four assertions fail and three pass**: the controlled Tizen 3/4/5 MP4/TS policy and Tizen 5 HLS-TS policy still advertise OPUS. The Chromium Android, disabled-codec and rejected-capability controls pass. This expected failure establishes that the probe distinguishes the change; it is not a failed JellyXR CI suite.

Commit the probe only on the isolated branch, fetch the exact official commit, then apply it with provenance:

```powershell
git add src/scripts/browserDeviceProfile.test.ts
git commit -m "Add controlled audio-profile update rehearsal probes"
git fetch upstream a510fba5a54d8d899b17f445121e6277511c2e0c
git cherry-pick -x a510fba5a54d8d899b17f445121e6277511c2e0c
npm test -- src/scripts/browserDeviceProfile.test.ts
npm run build:check
npm run lint
npm test
npm run build:es-check
npm run build:xr-experiments
npm run escheck:xr-experiments
```

The candidate must pass all seven focused cases, retain AAC/MP3 and independently configured fMP4 HLS policy, and preserve Chromium Android and disabled-codec controls. Record actual output from each command and stop to investigate unexpected failures; do not convert missing/failed checks into passes. Inspect `git diff <base> HEAD`: only the profile and probe should differ. Recheck package/lock, account, player and media-bridge paths explicitly.

Rehearsal builds stay local and separate from the qualified package. Before reusing the checkout, retain its commits and evidence and make sure no build/server still uses it. Do not merge or publish the rehearsal branch merely because the source and unit checks pass. Actual ordinary-media and XR regression are separate evidence.

Recorded execution and limitations are in [the upstream assessment](../../docs/jellyxr/04-architecture/upstream-assessment.md#representative-update-results--2026-09-30). The probe's LF-normalized SHA-256 is `ec63557488acec58ca8237ee74d4a17112d7296a2be1fcf84cfa5ca5b4d30974`; Git may use CRLF on Windows, so normalize line endings before comparing that hash.
