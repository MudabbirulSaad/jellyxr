export interface ComparisonSample {
    frames: number;
    p95WorkMs: number;
    remoteHeight: number;
    immersive: boolean;
}

export interface ComparisonScene {
    enterXR(): Promise<void>;
    exitXR(): Promise<void>;
    recallRemote(): void;
    dispose(): Promise<void>;
}

export type SampleListener = (sample: ComparisonSample) => void;

export const FIXTURE_COLOURS = {
    graphite: '#0B0F14',
    surface: '#151B23',
    metal: '#A7B0BC',
    warm: '#D7B67A',
    screen: '#F2F4F7'
};
