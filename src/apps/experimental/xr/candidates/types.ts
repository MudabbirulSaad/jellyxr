import type { BorrowedVideoSurface } from '../media/borrowVideoSurface';
import type { VideoPresentationMode } from '../media/videoPresentation';
import type { PauseReason } from '../input/sessionRecovery';
import type { FrameObservations } from './frameSampler';

export interface ComparisonSample extends FrameObservations {
    remoteHeight: number;
    physicsStatus: string;
    immersive: boolean;
    mediaStatus: string;
    inputStatus: string;
    assetStatus: string;
}

export interface ComparisonScene {
    enterXR(): Promise<void>;
    exitXR(): Promise<void>;
    recallRemote(): void;
    summonControls(): void;
    resetTiming(): void;
    setVideo(surface: BorrowedVideoSurface | null, mode: VideoPresentationMode): void;
    dispose(): Promise<void>;
}

export interface ComparisonPlaybackActions {
    pause(reason: PauseReason): void;
    resume(): void;
}

export type SampleListener = (sample: ComparisonSample) => void;

export const FIXTURE_COLOURS = {
    graphite: '#0B0F14',
    surface: '#151B23',
    metal: '#A7B0BC',
    warm: '#D7B67A',
    screen: '#0B0F14'
};
