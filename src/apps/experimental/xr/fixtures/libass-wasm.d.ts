/** Narrow declaration for the installed 4.2.4 fixture API; not a dependency upgrade. */
declare module '@jellyfin/libass-wasm' {
    export default class SubtitlesOctopus {
        constructor(options: {
            video: HTMLVideoElement;
            subContent: string;
            workerUrl: string;
            legacyWorkerUrl: string;
            fonts: string[];
            fallbackFont: string;
            renderMode: string;
            renderAhead: number;
            targetFps: number;
            prescaleFactor: number;
            prescaleHeightLimit: number;
            maxRenderHeight: number;
            onError: () => void;
        });
        worker?: Worker | null;
        canvas?: HTMLCanvasElement;
        ctx?: CanvasRenderingContext2D;
        renderAhead?: number;
        oneshotState?: { iteration?: number; eventStart?: number | null; eventOver?: boolean };
        setTrack(content: string): void;
        freeTrack(): void;
        dispose(): void;
    }
}
