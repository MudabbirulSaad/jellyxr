import { rotatePitch } from '../fixtures/boxGeometry';
import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

export interface CaptionSettings {
    readonly size: 1 | 1.25 | 1.5;
    readonly backing: 1 | 0.75 | 0;
    readonly position: 'Upper' | 'Centre' | 'Lower';
}

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = { size: 1, backing: 1, position: 'Upper' };
export type ReadCaptionSettings = () => CaptionSettings;
export const readDefaultCaptions: ReadCaptionSettings = () => DEFAULT_CAPTION_SETTINGS;

/** The transparent envelope fits five enlarged lines; the visible backing hugs the text. */
export function captionGeometry(settings: CaptionSettings, percent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE) {
    const screen = screenGeometry(percent, pose);
    const offset = { Upper: 0.65, Centre: 0, Lower: -0.65 }[settings.position];
    const point = rotatePitch([0, offset * percent / 100, 0.11], screen.pitch);
    return { width: screen.width * 0.75, height: screen.height * 0.5,
        position: [point[0], point[1] + pose.height, point[2] - pose.distance] as const };
}
