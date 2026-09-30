import url from './observatory/observatory-remote.glb';
import manifest from './observatory/remote-manifest.json';

export const REMOTE_ASSET = { url, ...manifest };

export function remoteAssetObservation(elapsedMs: number): string {
    return `Original remote: ${manifest.triangles} triangles, ${manifest.primitives} primitives; ${manifest.bytes} bytes. Load and parse ${elapsedMs.toFixed(0)} ms; cache and device conditions are uncontrolled.`;
}
