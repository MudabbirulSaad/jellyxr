# JellyXR project guidance

## Current phase

The authorised phase is repository setup and development documentation. Product implementation and selection of additional XR technologies follow the documentation review. The product owner is MudabbirulSaad.

Start with [the documentation index](docs/jellyxr/README.md), then the [decision register](docs/jellyxr/06-decisions/decision-register.md) and requirements relevant to the task.

## Authority and change discipline

- User instructions govern scope. Confirmed decisions record those instructions; proposed targets and deferred decisions are not approvals.
- Business requirements explain intent. Functional and nonfunctional requirements define acceptance. Blueprints describe the proposed means. Traceability connects them.
- Change the authoritative document first, then update affected links, traceability, risks and work items. Do not copy requirements into competing lists.
- Preserve the pinned baseline and installed UI/UX skill. Keep JellyXR documents under docs/jellyxr.
- Preserve upstream licence and attribution. Follow [CONTRIBUTING.md](CONTRIBUTING.md) for inherited implementation conventions.
- New implementation code follows upstream TypeScript and Jellyfin SDK conventions. Do not introduce an XR engine, replace the playback system or upgrade the inherited stack merely to prepare documentation.
- Reuse the server's accounts, permissions and media; do not create a second account system.
- Read the exact baseline source before claiming a reusable interface. Distinguish source inspection, vendor documentation, design proposals and device-tested behaviour.
- No headset or server compatibility has been demonstrated by this documentation phase.
- Keep credentials, server tokens, private endpoints and personal media out of committed examples and diagnostics.
- Preserve upstream source layout and keep future XR integration changes narrow enough to review during upstream updates.

## Validation

For documentation changes: check relative links and anchors, unique requirement IDs, first-release test coverage, roadmap dependencies, diagrams, and decision consistency. For later implementation, run the upstream checks appropriate to changed code and the linked acceptance scenarios. Do not mark a device scenario passed without recorded device evidence.
