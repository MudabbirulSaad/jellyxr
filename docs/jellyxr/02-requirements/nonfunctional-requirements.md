# Nonfunctional requirements

Status: proposed targets, not measured results. Updated: 2026-09-29.

All requirements below are P0 for the first release. The product and validation leads accept or revise numeric targets at G1 before they become release criteria. Record actual device, OS/browser, server, media and network conditions. See [test strategy](../05-delivery/test-strategy.md).

| ID | Requirement and rationale | Proposed acceptance target | Dependencies / source |
| --- | --- | --- | --- |
| <a id="nfr-001"></a>NFR-001 | Sustain XR rendering while decoding video | At the selected supported refresh rate, p95 application frame work stays below 80% of its interval in the controlled cinema fixture; e.g. 11.1 ms at 72 Hz. Track application timing separately from compositor/decoder timing; report missed frames and measurement limitations. Reduce environment complexity before independently changing video quality | EXP-01/03; exact hardware and rate at G1; S09, S10 |
| <a id="nfr-002"></a>NFR-002 | Remain stable for a full film | Complete a 120-minute representative movie run without crash, unwanted session termination, unrecoverable audio loss or progressively worsening frame timing. Repeat ten XR enter/exit cycles; inspect resource growth after warmup and cleanup. Battery/thermal observations are recorded only where observable; do not claim unavailable sensors | AT-24; R-04; S01 |
| <a id="nfr-003"></a>NFR-003 | Provide accessible interaction and readable UI | Ordinary UI targets WCAG 2.2 AA; keyboard focus and labels work. Spatial UI passes readable-text, bright/dark background, left/right controller, seated/reclining and reduced-motion scenarios. DOM accessibility does not automatically transfer into XR | AT-10/13; S15, S18 |
| <a id="nfr-004"></a>NFR-004 | Protect identity and personal media information | No password persistence or diagnostic disclosure; session credentials use the inherited audited mechanism; user/server switches clear scoped caches and XR state; no new analytics upload by default; diagnostic samples contain no reusable credentials or signed stream URLs | FR-004/022; security review; S05 |
| <a id="nfr-005"></a>NFR-005 | Make hosting behaviour predictable | Reference HTTPS domain, trusted HTTPS IP and base-path setups pass; ordinary HTTP limitations are explicit; no documented setup depends on disabling browser security, accepting certificate warnings or exposing an unrestricted proxy | AT-01/02; S04-S08, S17 |
| <a id="nfr-006"></a>NFR-006 | Publish truthful compatibility | Every claimed device/browser/server combination has a recorded run. Feature detection governs XR enhancement; unsupported devices keep ordinary mode. Server version range follows the SDK minimum plus testing, not web-client version naming | G1/G2; upstream audit; S02 |
| <a id="nfr-007"></a>NFR-007 | Keep upstream integration maintainable | Preserve ancestry/licence notices; new code follows inherited TypeScript/SDK conventions; XR additions are bounded; integration changes have requirement-linked tests; an upstream update rehearsal identifies conflicts and playback risks | AT-25; S02, S03 |
| <a id="nfr-008"></a>NFR-008 | Keep browsing responsive as libraries grow | In a seeded 1,000-item library, initial view renders before the entire catalogue downloads; offscreen art/assets load on demand; input feedback target is within 100 ms; compare initial startup and memory to pinned ordinary-mode baseline | EXP-03; AT-05/24; S01 |
| <a id="nfr-009"></a>NFR-009 | Preserve state under recoverable failure | Network/auth/XR interruption scenarios produce one visible state and one active playback owner. Retried operations do not duplicate sessions. No autoplay after interruption without the accepted resume behaviour | AT-14; D-15; S02 |
| <a id="nfr-010"></a>NFR-010 | Make quality claims reproducible | Each test records build/base SHA, device and browser versions, server/FFmpeg versions when relevant, codec/container/tracks, network profile, settings, steps and expected/actual results. Label ordinary desktop, emulated XR and actual-device evidence separately; an emulated run cannot satisfy a device-dependent acceptance claim. No fabricated benchmark or pass status | All acceptance work; S01; R-15 |

## Measurement boundaries

Frame rate of the movie and refresh rate of the XR scene are distinct. A 24 fps film is not a 24 Hz head-tracking target. JavaScript frame timing alone does not prove decoder or compositor performance. Use vendor profiling where available and record what was actually measured.

Video resolution, HDR, stereo projection, multichannel audio and battery behaviour require independent qualification. Do not derive them from processor specifications or a desktop browser run.

Initial numeric targets are deliberately limited. G1 must resolve test hardware and representative fixtures; G2 may revise targets only with written evidence and product acceptance, not silently to make a candidate pass.
