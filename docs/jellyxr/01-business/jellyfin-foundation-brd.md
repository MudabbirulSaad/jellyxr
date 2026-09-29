# Jellyfin foundation BRD

Status: foundation confirmed; compatibility claims pending tests. Updated: 2026-09-29.

## Required foundation

JellyXR extends the official Jellyfin Web client at the [pinned baseline](../04-architecture/upstream-assessment.md). Existing Jellyfin servers continue to own accounts, access permissions, media files, metadata, watch status and playback progress. Server-side media conversion remains a Jellyfin responsibility.

The client must connect through a configurable endpoint. App origin and server endpoint are separate concepts even when a deployment uses the same origin. Users must not copy their media or register another account.

## Business requirements

| ID | Requirement | Business reason | Goal |
| --- | --- | --- | --- |
| BF-01 | Reuse existing connection, library and playback behaviour where suitable | Reduce duplicate logic and retain familiar server semantics | BG-01, BG-05 |
| BF-02 | Honour user restrictions and isolate sessions across servers/users | Household access must not broaden when entering XR | BG-01 |
| BF-03 | Preserve inherited ordinary-browser workflows | XR adoption must retain the usefulness of the existing client | BG-05 |
| BF-04 | Support self-hosted app and endpoint topologies | Installation must fit real Jellyfin deployments | BG-04 |
| BF-05 | Track upstream changes and licence/attribution provenance | Keep maintenance and redistribution reviewable | BG-06 |

Detailed acceptance lives in the [functional requirements](../02-requirements/functional-requirements.md); these business requirements do not introduce a second acceptance specification.

## Reuse policy

Reuse domain data, session ownership, capability negotiation, queue and progress reporting. Adapt visual presentation and input for XR. Add cinema environment, screen placement and XR preferences.

Source inspection shows a modern/legacy UI mixture and player plugins. Reuse is not a promise that every existing view renders inside WebXR unchanged. Audit subtitles, video-element ownership and session transitions before deciding the integration mechanism.

## Compatibility and preservation

Maintain a feature matrix that distinguishes inherited source behaviour, proposed XR adaptation, tested combinations and unsupported combinations. Do not infer a server minimum from the client's v12.1 version number: the connection manager imports the SDK's minimum-version constant. The supported server range is a G1/G2 decision based on that constraint and test evidence.

Music, Live TV, SyncPlay, downloads, administration, metadata editing and other inherited routes require an ordinary-mode audit. An inherited route does not imply every browser or headset supports its media path.

## Maintenance and hosting

Keep upstream ancestry and a recorded base commit. Review updates on a separate branch, evaluate API/player changes and run parity validation before adoption. Retain upstream contribution files and licence notices. A proposed contribution back to upstream must separately follow its contribution policy.

No new server plugin is required for baseline connection and playback. Optional server metadata such as media segments remains capability dependent. Self-hosting does not require making a server publicly reachable.

Sources: [S01](../references/glossary-sources.md#s01), [S02](../references/glossary-sources.md#s02), [S03](../references/glossary-sources.md#s03), [S04](../references/glossary-sources.md#s04).
