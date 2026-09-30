/** Bounded comparison envelope, in metres. The architectural backing and collision stay fixed. */
export const SCREEN_FRAME = { width: 6.4, height: 3.6, depth: 0.04, x: 0, y: 2, z: -6.5 };

export function screenGeometry(percent = 100) {
    if (!Number.isFinite(percent) || percent < 60 || percent > 100) {
        throw new Error('Screen size must be between 60% and 100%.');
    }
    const scale = percent / 100;
    return {
        width: SCREEN_FRAME.width * scale,
        height: SCREEN_FRAME.height * scale,
        videoPosition: [0, 2, -6.47] as const,
        canvasPosition: [0, 2, -6.45] as const,
        captions: {
            width: 4.8 * scale, height: 1.2 * scale,
            position: [0, SCREEN_FRAME.y + 0.65 * scale, -6.39] as const
        }
    };
}
