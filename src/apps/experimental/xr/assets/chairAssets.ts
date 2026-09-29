import detailed from './observatory/observatory-chair-detailed.glb';
import reduced from './observatory/observatory-chair-reduced.glb';
import manifest from './observatory/manifest.json';

export type ChairQuality = 'detailed' | 'reduced';
export const CHAIR_POSITIONS = [[-1.25, 0, 1.5], [1.25, 0, 1.5]] as const;

export function chairAsset(quality: ChairQuality) {
    const variant = manifest.variants.find(entry => entry.variant === quality);
    if (!variant) throw new Error('Chair variant missing from the asset manifest.');
    return { url: quality === 'detailed' ? detailed : reduced, ...variant };
}

export function assetObservation(quality: ChairQuality, elapsedMs: number): string {
    const asset = chairAsset(quality);
    return `Original ${quality} chair: ${asset.triangles} triangles, ${asset.primitives} primitives per chair; ${asset.bytes} bytes. Load and parse ${elapsedMs.toFixed(0)} ms in this run; cache and device conditions are uncontrolled.`;
}
