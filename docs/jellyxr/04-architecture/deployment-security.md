# Deployment and security

Status: reference design; installation/device validation pending. Updated: 2026-09-29.

## Addresses and ownership

The app URL serves JellyXR assets. The Jellyfin endpoint is the server API/media base address. They may share an origin or differ. An origin includes scheme, hostname and port. A configured server base path must be preserved in API, artwork, stream and WebSocket requests.

Self-hosting is the baseline. No public JellyXR service, credential relay or open proxy is part of this design.

## Reference topology

~~~mermaid
flowchart LR
    Quest["Quest browser"]
    Proxy["User-managed HTTPS origin"]
    Assets["JellyXR static assets"]
    Jellyfin["Existing Jellyfin server"]
    Quest -->|"HTTPS"| Proxy
    Proxy -->|"/xr/ assets"| Assets
    Proxy -->|"/jellyfin/ API, media and socket"| Jellyfin
~~~

The paths are an illustrative topology, not generated configuration. The asset public path/router and server Base URL must be checked against the selected deployment before publishing an install guide. Replacing/serving the web-client assets with a Jellyfin deployment is another supported documentation path; retain the original client as a rollback option.

A separately served client connects directly to the configured endpoint subject to browser policies. If a reverse proxy is used, it is operated by the user and forwards only configured services. The web client does not become an unrestricted server-side fetch proxy.

## Access matrix

| App access / endpoint | Expected planning behaviour | Validation |
| --- | --- | --- |
| HTTPS domain / same HTTPS origin | Reference route for API, media and sockets | AT-01 |
| HTTPS IP / same origin | XR eligible only with an IP-valid certificate trusted by the headset and supported runtime | AT-01 |
| HTTPS app / different HTTPS endpoint | Requires correct CORS/auth/request handling, reachable host and any applicable network permission | AT-02 |
| HTTP LAN IP / HTTP endpoint | Ordinary browsing may work; remote LAN HTTP is not a secure-context entitlement for immersive XR | AT-02 |
| HTTPS app / HTTP server | Mixed-content restrictions generally apply; do not make this a portable deployment promise | AT-02 |
| Public-origin app / local-network endpoint | Browser-specific local-network permission/reachability rules may apply | AT-02, EXP-05 |
| Loopback development | Trustworthy loopback rules are development exceptions; localhost on the headset refers to the headset, not the developer PC | AT-02 |
| Domain/IP with port and server base path | Preserve all endpoint components; verify media URLs, redirects and WSS routing | AT-01 |

Secure context is necessary, not sufficient: WebXR support, user activation, focus and permissions also matter. Browser certificate warnings are not an installation solution. Sources: [secure contexts](../references/glossary-sources.md#s06), [WebXR permissions](../references/glossary-sources.md#s07).

Some Chromium versions document permission-gated local-network exceptions to mixed-content checks. These are not proof of identical Quest Browser behaviour; do not rely on them without validating the exact version, request types and permission states. Test fetch, video, HLS segments, images and sockets separately. [S17](../references/glossary-sources.md#s17)

## Proxy and transport requirements

Support byte-range/media responses and required headers without breaking seeking. Allow WebSocket upgrade and correct secure socket URLs. Configure trusted proxy handling on Jellyfin where appropriate; do not trust arbitrary forwarded headers. Check proxy timeouts and media buffering with long playback and transcode fixtures.

Cross-origin media that can display in a video element is not automatically usable by a canvas/WebGL sampling path. Validate CORS for the chosen renderer/layer path and any film-colour sampling. Avoid treating successful login as proof that every stream/subtitle request works.

## Account and diagnostic handling

Use Jellyfin authentication and policy. Keep credentials out of examples. Redact tokens, authorization values and signed URLs from diagnostics and proxy logs; use the existing server's permissions for downloads and remote access. Do not send browsing history or playback telemetry to a new service by default.

Connection UI should offer Retry, Edit endpoint and ordinary-mode continuation where meaningful. It can definitively explain an insecure app origin or missing XR API. For indistinguishable TLS/CORS/network failures, provide likely checks and a redacted diagnostic bundle without claiming a cause the browser did not reveal.

## Documentation before release

Publish tested instructions for the reference topology and separately served assets, with versioned prerequisites, trusted-certificate guidance, base-path examples, upgrade/rollback and WebSocket/range checks. This phase specifies that work; it does not deploy a service or generate production proxy configuration.

For PC iteration and headset USB development forwarding, see the [development testing workflow](../05-delivery/development-testing-workflow.md). Mapping a development app port does not forward the Jellyfin endpoint or prove production CORS, certificates, base paths and media routes. Repeat the required access matrix on the final hosting topology before G4.

Sources: [Jellyfin networking](../references/glossary-sources.md#s04), [reverse proxy](../references/glossary-sources.md#s05), [mixed content](../references/glossary-sources.md#s08).
