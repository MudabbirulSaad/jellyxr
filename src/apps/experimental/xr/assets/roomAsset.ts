import url from './observatory/observatory-room.glb';
import manifest from './observatory/room-manifest.json';

export const ROOM_ASSET = { url, ...manifest };

export function roomAssetObservation(elapsedMs: number): string {
    return `Original room shell: ${manifest.triangles} triangles, ${manifest.primitives} primitives; ${manifest.bytes} bytes. Load and parse ${elapsedMs.toFixed(0)} ms; cache and device conditions are uncontrolled.`;
}
