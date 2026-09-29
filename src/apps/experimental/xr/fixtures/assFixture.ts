import { appRouter } from 'components/router/appRouter';
import type { BorrowedSubtitleSurface } from '../media/borrowVideoSurface';
import { readAssPresentation } from 'plugins/htmlVideoPlayer/assPresentation';
import notoFontUrl from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff2';

/** Original labelled script for the existing silent clip; never applied to Jellyfin media. */
export const ASS_FIXTURE = `[Script Info]
ScriptType: v4.00+
PlayResX: 640
PlayResY: 360
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans,28,&H00F7F4F2,&H007AB6D7,&H00140F0B,&H80140F0B,0,0,0,0,100,100,0,0,1,2,1,5,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.25,0:00:02.25,Default,,0,0,0,,{\\an7\\pos(24,68)\\b1}ASS TOP LEFT{\\b0}\\N{\\c&H007AB6D7&}Original caption fixture
Dialogue: 0,0:00:03.00,0:00:05.00,Default,,0,0,0,,{\\move(150,170,490,170)\\fs22}MOVING ASS FIXTURE
Dialogue: 0,0:00:05.75,0:00:07.75,Default,,0,0,0,,{\\pos(320,140)\\i1}ASS PAUSE / SEEK\\N{\\i0\\k50}Timing {\\k50}and {\\k100}colour
`;

export async function installAssFixture(video: HTMLVideoElement, onError: () => void) {
    const { default: SubtitlesOctopus } = await import('@jellyfin/libass-wasm');
    const resource = (name: string) => new URL(`${appRouter.baseUrl()}/libraries/${name}`, window.location.href).href;
    let failed = false;
    let disposed = false;
    const renderer = new SubtitlesOctopus({
        video, subContent: ASS_FIXTURE,
        workerUrl: resource('subtitles-octopus-worker.js'),
        legacyWorkerUrl: resource('subtitles-octopus-worker-legacy.js'),
        fonts: [new URL(notoFontUrl, window.location.href).href],
        fallbackFont: resource('default.woff2'),
        renderMode: 'wasm-blend', renderAhead: 90, targetFps: 24,
        prescaleFactor: 4, prescaleHeightLimit: 1080, maxRenderHeight: 1080,
        onError: () => {
            failed = true;
            onError();
        }
    });
    let enabled = true;
    return {
        read: (): BorrowedSubtitleSurface => ({
            textElements: [], unsupportedRenderer: failed ? 'ASS' : null,
            canvas: enabled && !failed && !disposed ? readAssPresentation(renderer) : null
        }),
        setEnabled(value: boolean) {
            if (disposed || failed) return;
            enabled = value;
            if (value) renderer.setTrack(ASS_FIXTURE);
            else renderer.freeTrack();
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            if (renderer.worker) renderer.dispose();
        }
    };
}
