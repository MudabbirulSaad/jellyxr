# JellyXR project guidance

## Current phase

The authorised phase is M1 development and Quest 3 readiness: reproduce the inherited build, connect the existing test configuration, prepare development-only emulation and headset debugging, define Cinema Observatory, and add checks for xr. The product owner is MudabbirulSaad. Renderer selection and immersive playback experiments belong to M2; M1 does not authorise replacing the inherited stack or media player.

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
- Record ordinary desktop, emulated XR and actual Quest evidence separately in the M1 readiness report. Public server reachability does not prove authenticated playback or headset compatibility.
- Use UI/UX Pro Max for applicable guidance. Cinema Observatory is the selected direction; new copy must describe real actions and states. Do not add filler text, fabricated statistics, invented testimonials or decorative controls without behaviour.
- Keep credentials, server tokens, private endpoints and personal media out of committed examples and diagnostics.
- Preserve upstream source layout and keep future XR integration changes narrow enough to review during upstream updates.

## Validation

For documentation changes: check relative links and anchors, unique requirement IDs, first-release test coverage, roadmap dependencies, diagrams, and decision consistency. For later implementation, run the upstream checks appropriate to changed code and the linked acceptance scenarios. Do not mark a device scenario passed without recorded device evidence.
