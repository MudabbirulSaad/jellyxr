import type { FixtureBox, Point3 } from './roomFixture';
import { rotatePitch } from './boxGeometry';

/** Bounded comparison envelope, in metres. Only deliberate controls move the screen. */
export const SCREEN_FRAME = { width: 6.4, height: 3.6, depth: 0.04, x: 0, y: 2, z: -6.5 };

export interface ScreenPose { readonly distance: number; readonly height: number; readonly tilt: number }
export const DEFAULT_SCREEN_POSE: ScreenPose = { distance: 6.5, height: 2, tilt: 0 };

export function screenGeometry(percent = 100, pose = DEFAULT_SCREEN_POSE) {
    if (!Number.isFinite(percent) || percent < 60 || percent > 100) {
        throw new Error('Screen size must be between 60% and 100%.');
    }
    if (![pose.distance, pose.height, pose.tilt].every(Number.isFinite)
        || pose.distance < 4 || pose.distance > 6.5 || pose.height < 1.2 || pose.height > 2.8 || Math.abs(pose.tilt) > 15) {
        throw new Error('Screen placement is outside the comparison bounds.');
    }
    const scale = percent / 100;
    // Positive tilt points the normal upward. Both candidates use right-handed coordinates.
    const pitch = -pose.tilt * Math.PI / 180;
    const point = (local: Point3): Point3 => {
        const rotated = rotatePitch(local, pitch);
        return [rotated[0], rotated[1] + pose.height, rotated[2] - pose.distance];
    };
    return {
        width: SCREEN_FRAME.width * scale,
        height: SCREEN_FRAME.height * scale,
        pitch,
        orientation: [Math.sin(pitch / 2), 0, 0, Math.cos(pitch / 2)] as const,
        videoPosition: point([0, 0, 0.03]),
        canvasPosition: point([0, 0, 0.05]),
        captions: {
            width: 4.8 * scale, height: 1.2 * scale,
            position: point([0, 0.65 * scale, 0.11])
        }
    };
}

export function screenBox(percent = 100, pose = DEFAULT_SCREEN_POSE): FixtureBox {
    const geometry = screenGeometry(percent, pose);
    return { id: 'screen', position: [0, pose.height, -pose.distance], size: [geometry.width, geometry.height, SCREEN_FRAME.depth],
        pitch: geometry.pitch, material: 'screen', collision: 'static' };
}
