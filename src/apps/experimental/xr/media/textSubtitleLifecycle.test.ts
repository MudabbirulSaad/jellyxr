import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HtmlVideoPlayer } from 'plugins/htmlVideoPlayer/plugin';

const harness = vi.hoisted(() => ({
    custom: false,
    verticalPosition: '-2',
    events: vi.fn(),
    errors: vi.fn(),
    showVideoOsd: vi.fn(),
    api: { getSessions: vi.fn(), deviceId: () => 'technical-device' }
}));

vi.mock('scripts/browser', () => ({ default: {} }));
vi.mock('scripts/settings/appSettings', () => ({ default: { alwaysBurnInSubtitleWhenTranscoding: () => true } }));
vi.mock('scripts/settings/userSettings', () => ({ currentSettings: { getSubtitleAppearanceSettings: () => ({ verticalPosition: harness.verticalPosition }) } }));
vi.mock('apps/legacy/features/playback/utils/subtitleStyles', () => ({ useCustomSubtitles: () => harness.custom }));
vi.mock('components/subtitlesettings/subtitleappearancehelper', () => ({ default: { applyStyles: vi.fn(), getStyles: () => ({ text: [] }) } }));
vi.mock('components/apphost', () => ({ appHost: { supports: () => true } }));
vi.mock('components/loading/loading', () => ({ default: { hide: vi.fn() } }));
vi.mock('components/playback/playbackmanager', () => ({ playbackManager: {
    getSubtitleUrl: (track: { Index: number }) => `https://fixture.invalid/${track.Index}.vtt`,
    trackHasSecondarySubtitleSupport: () => true
} }));
vi.mock('components/router/appRouter', () => ({ appRouter: { baseUrl: () => '', showVideoOsd: harness.showVideoOsd } }));
vi.mock('components/htmlMediaHelper', () => ({
    onErrorInternal: harness.errors, destroyHlsPlayer: vi.fn(), destroyFlvPlayer: vi.fn(), destroyCastPlayer: vi.fn(),
    getCrossOriginValue: () => '', enableHlsJsPlayerForCodecs: () => false,
    applySrc: () => Promise.resolve(), playWithPromise: () => Promise.resolve(),
    // The inherited helper clears playback options after Stop/end; retain that ownership boundary here.
    onEndedInternal: (player: { _currentPlayOptions: unknown }) => { player._currentPlayOptions = null; }, resetSrc: vi.fn(),
    seekOnPlaybackStart: (_player: unknown, _video: unknown, _position: unknown, callback: () => void) => callback()
}));
vi.mock('components/itemHelper', () => ({ default: { isLocalItem: () => false } }));
vi.mock('lib/jellyfin-apiclient', () => ({ ServerConnections: { getApiClient: () => harness.api } }));
vi.mock('lib/globalize', () => ({ default: {} }));
vi.mock('scripts/browserDeviceProfile', () => ({ default: {}, canPlaySecondaryAudio: vi.fn() }));
vi.mock('scripts/settings/webSettings', () => ({ getIncludeCorsCredentials: vi.fn() }));
vi.mock('components/backdrop/backdrop', () => ({
    setBackdropTransparency: vi.fn(),
    // Match the inherited module's named export.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TRANSPARENCY_LEVEL: { None: 0 }
}));
vi.mock('utils/events.ts', () => ({ default: { trigger: harness.events } }));
vi.mock('utils/dom', () => ({ default: {} }));

// Exercise actual inherited track selection/rendering; only transport and native cue storage are controlled.
type TestPlayer = {
    createMediaElement: HtmlVideoPlayer['createMediaElement'];
    setTrackForDisplay: HtmlVideoPlayer['setTrackForDisplay'];
    setCurrentTrackElement: HtmlVideoPlayer['setCurrentTrackElement'];
    destroyCustomTrack: HtmlVideoPlayer['destroyCustomTrack'];
    updateSubtitleText: HtmlVideoPlayer['updateSubtitleText'];
    setCurrentSrc: HtmlVideoPlayer['setCurrentSrc'];
    onStartedAndNavigatedToOsd: HtmlVideoPlayer['onStartedAndNavigatedToOsd'];
    setSubtitleStreamIndex: HtmlVideoPlayer['setSubtitleStreamIndex'];
    setSecondarySubtitleStreamIndex: HtmlVideoPlayer['setSecondarySubtitleStreamIndex'];
    stop: HtmlVideoPlayer['stop'];
    destroy: HtmlVideoPlayer['destroy'];
    onEnded: HtmlVideoPlayer['onEnded'];
    onPlaying: HtmlVideoPlayer['onPlaying'];
    canSetAudioStreamIndex: HtmlVideoPlayer['canSetAudioStreamIndex'];
    setAudioStreamIndex: HtmlVideoPlayer['setAudioStreamIndex'];
    _currentPlayOptions: HtmlVideoPlayer['_currentPlayOptions'];
    isFetching: boolean;
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function captions(text: string) {
    return new Response(JSON.stringify({ TrackEvents: [{ StartPositionTicks: 0, EndPositionTicks: 10000000, Text: text }] }));
}
const track = (index: number) => ({ Index: index, Codec: 'srt', Type: 'Subtitle', DeliveryMethod: 'External' });

async function setup() {
    const player = new HtmlVideoPlayer() as unknown as TestPlayer;
    player._currentPlayOptions = { item: { ServerId: 'technical-server' }, playMethod: 'DirectPlay', mediaSource: { MediaStreams: [track(2), track(3)] } };
    const video = await player.createMediaElement({ fullscreen: false }) as HTMLVideoElement;
    const tracks: Array<{ label: string; mode: string; cues: VTTCue[]; addCue: (cue: VTTCue) => void; removeCue: (cue: VTTCue) => void }> = [];
    Object.defineProperty(video, 'textTracks', { value: tracks });
    video.addTextTrack = vi.fn(() => {
        const cues: VTTCue[] = [];
        const native = { label: 'manualTrack', mode: 'disabled', cues, addCue: (cue: VTTCue) => cues.push(cue), removeCue: (cue: VTTCue) => cues.splice(cues.indexOf(cue), 1) };
        tracks.push(native);
        return native as unknown as TextTrack;
    });
    return { player, video, tracks };
}
async function settle() {
    await new Promise(resolve => setTimeout(resolve, 0));
}

describe('inherited plain-text subtitle lifecycle', () => {
    beforeEach(() => {
        harness.custom = false;
        harness.verticalPosition = '-2';
        harness.events.mockClear();
        harness.errors.mockClear();
        harness.showVideoOsd.mockReset();
        harness.api.getSessions.mockReset();
        vi.stubGlobal('VTTCue', class {
            line = 'auto';
            constructor(public startTime: number, public endTime: number, public text: string) {}
        });
    });
    afterEach(() => {
        document.body.textContent = '';
        document.head.querySelector('#htmlvideoplayer-cuestyle')?.remove();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('does not re-enable native captions after the selected track is removed', async () => {
        const { player, video, tracks } = await setup();
        const request = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn(() => request.promise));
        player.setTrackForDisplay(video, track(2));
        player.setTrackForDisplay(video, null);
        request.resolve(captions('Technical removed caption'));
        await settle();
        expect(tracks[0].cues).toHaveLength(0);
        expect(tracks[0].mode).toBe('disabled');
    });

    it('keeps late native cues out of the replacement track', async () => {
        const { player, video, tracks } = await setup();
        const old = deferred<Response>();
        const current = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise));
        player.setTrackForDisplay(video, track(2));
        player.setTrackForDisplay(video, track(3));
        current.resolve(captions('Technical current caption'));
        await settle();
        old.resolve(captions('Technical obsolete caption'));
        await settle();
        expect(tracks[0].cues.map(cue => cue.text)).toEqual(['\u200ETechnical current caption']);
    });

    it('does not let an obsolete custom response claim the replacement element', async () => {
        harness.custom = true;
        const { player, video } = await setup();
        const old = deferred<Response>();
        const current = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise));
        player.setTrackForDisplay(video, track(2));
        player.setTrackForDisplay(video, track(3));
        old.resolve(captions('Technical obsolete caption'));
        await settle();
        current.resolve(captions('Technical current caption'));
        await settle();
        player.updateSubtitleText(500);
        expect(document.querySelector('.videoSubtitlesInner')?.textContent).toContain('Technical current caption');
    });

    it.each(['-2', '2'])('retains secondary-first custom captions with vertical position %s', async position => {
        harness.verticalPosition = position;
        harness.custom = true;
        const { player, video } = await setup();
        const primary = deferred<Response>();
        const secondary = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(primary.promise).mockReturnValueOnce(secondary.promise));
        player.setTrackForDisplay(video, track(2), 0);
        player.setTrackForDisplay(video, track(3), 1);
        secondary.resolve(captions('Technical secondary caption'));
        await settle();
        primary.resolve(captions('Technical primary caption'));
        await settle();
        player.updateSubtitleText(500);
        expect(document.querySelector('.videoSecondarySubtitlesInner')?.textContent).toContain('Technical secondary caption');
        expect(document.querySelector('.videoSubtitlesInner')?.textContent).toContain('Technical primary caption');
        const first = document.querySelector('.videoSubtitles')?.firstElementChild;
        expect(first?.className).toBe(position === '-2' ? 'videoSecondarySubtitlesInner' : 'videoSubtitlesInner');
    });

    it('rejects a stale session lookup before it changes the selected track', async () => {
        const { player } = await setup();
        player._currentPlayOptions.playMethod = 'Transcode';
        const old = deferred<unknown[]>();
        const current = deferred<unknown[]>();
        harness.api.getSessions.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
        const display = vi.spyOn(player, 'setTrackForDisplay').mockImplementation(() => undefined);
        const oldSelection = player.setCurrentTrackElement(2);
        const currentSelection = player.setCurrentTrackElement(3);
        current.resolve([]);
        await currentSelection;
        old.resolve([{ TranscodingInfo: { IsVideoDirect: false } }]);
        await oldSelection;
        expect(player._currentPlayOptions.mediaSource.MediaStreams[0].DeliveryMethod).toBe('External');
        expect(display).toHaveBeenCalledOnce();
        expect(display.mock.calls[0][1]?.Index).toBe(3);
    });

    it.each([false, true])('ignores an old-source response in custom mode=%s', async custom => {
        harness.custom = custom;
        const { player, video, tracks } = await setup();
        const request = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn(() => request.promise));
        player.setTrackForDisplay(video, track(2));
        player._currentPlayOptions = { ...player._currentPlayOptions };
        request.resolve(captions('Technical previous source caption'));
        await settle();
        expect(tracks[0]?.cues || []).toHaveLength(0);
        expect(document.querySelector('.videoSubtitles')).toBeNull();
        expect(player.isFetching).toBe(false);
    });

    it('aborts removed requests and settles feedback without waiting for their network result', async () => {
        const { player, video } = await setup();
        const old = deferred<Response>();
        const current = deferred<Response>();
        const fetchMock = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
        vi.stubGlobal('fetch', fetchMock);
        player.setTrackForDisplay(video, track(2));
        const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
        expect(player.isFetching).toBe(true);
        player.setTrackForDisplay(video, track(3));
        expect(signal.aborted).toBe(true);
        old.reject(new Error('Technical canceled request'));
        await settle();
        expect(player.isFetching).toBe(true);
        expect(harness.errors).not.toHaveBeenCalled();
        player.setTrackForDisplay(video, null);
        expect(player.isFetching).toBe(false);
        current.resolve(captions('Technical removed replacement'));
        await settle();
        expect(harness.events.mock.calls.filter(call => call[1] === 'beginFetch')).toHaveLength(2);
        expect(harness.events.mock.calls.filter(call => call[1] === 'endFetch')).toHaveLength(2);
    });

    it('keeps loading feedback until the JSON body finishes', async () => {
        const { player, video, tracks } = await setup();
        const body = deferred<{ TrackEvents: unknown[] }>();
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => body.promise }));
        player.setTrackForDisplay(video, track(2));
        await settle();
        expect(player.isFetching).toBe(true);
        body.resolve({ TrackEvents: [] });
        await settle();
        expect(player.isFetching).toBe(false);
        expect(tracks[0].mode).toBe('showing');
    });

    it.each([false, true])('contains a current failed request in custom mode=%s', async custom => {
        harness.custom = custom;
        const { player, video } = await setup();
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Technical fetch error')));
        player.setTrackForDisplay(video, track(2));
        await settle();
        expect(harness.errors).toHaveBeenCalledOnce();
        expect(harness.errors.mock.calls[0][0]).toBe(player);
        expect(player.isFetching).toBe(false);
    });

    it('disabling only secondary captions leaves primary loading intact', async () => {
        const { player, video, tracks } = await setup();
        const primary = deferred<Response>();
        const secondary = deferred<Response>();
        const fetchMock = vi.fn().mockReturnValueOnce(primary.promise).mockReturnValueOnce(secondary.promise);
        vi.stubGlobal('fetch', fetchMock);
        player.setTrackForDisplay(video, track(2), 0);
        player.setTrackForDisplay(video, track(3), 1);
        player.setTrackForDisplay(video, null, 1);
        expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
        expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true);
        expect(player.isFetching).toBe(true);
        secondary.resolve(captions('Technical removed secondary'));
        primary.resolve(captions('Technical retained primary'));
        await settle();
        expect(tracks[0].cues[0].text).toContain('Technical retained primary');
        expect(tracks[1].cues).toHaveLength(0);
        expect(tracks[1].mode).toBe('disabled');
        expect(player.isFetching).toBe(false);
    });

    it('removes secondary-first custom DOM and cancels the remaining primary load', async () => {
        harness.custom = true;
        const { player, video } = await setup();
        const primary = deferred<Response>();
        const secondary = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn().mockReturnValueOnce(primary.promise).mockReturnValueOnce(secondary.promise));
        player.setTrackForDisplay(video, track(2), 0);
        player.setTrackForDisplay(video, track(3), 1);
        secondary.resolve(captions('Technical secondary-only state'));
        await settle();
        expect(document.querySelector('.videoSecondarySubtitlesInner')).not.toBeNull();
        player.setTrackForDisplay(video, null);
        primary.resolve(captions('Technical removed primary'));
        await settle();
        expect(document.querySelector('.videoSubtitles')).toBeNull();
        expect(player.isFetching).toBe(false);
    });

    it('keeps the same selected track loading when selection is repeated', async () => {
        const { player, video, tracks } = await setup();
        const request = deferred<Response>();
        const fetchMock = vi.fn(() => request.promise);
        vi.stubGlobal('fetch', fetchMock);
        player.setTrackForDisplay(video, track(2));
        await player.setCurrentTrackElement(2);
        request.resolve(captions('Technical repeated selection'));
        await settle();
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(tracks[0].cues[0].text).toContain('Technical repeated selection');
    });

    it('retains both independent selections when their session lookups finish in reverse', async () => {
        const { player, tracks } = await setup();
        player._currentPlayOptions.playMethod = 'Transcode';
        const primary = deferred<unknown[]>();
        const secondary = deferred<unknown[]>();
        harness.api.getSessions.mockReturnValueOnce(primary.promise).mockReturnValueOnce(secondary.promise);
        vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(captions(`Technical ${url.endsWith('2.js') ? 'primary' : 'secondary'} lookup`))));
        const p = player.setCurrentTrackElement(2, 0);
        const s = player.setCurrentTrackElement(3, 1);
        secondary.resolve([]);
        await s;
        primary.resolve([]);
        await p;
        await settle();
        expect(tracks[0].cues[0].text).toContain('primary');
        expect(tracks[1].cues[0].text).toContain('secondary');
    });

    it('restarts an aborted pending track when the viewer switches away and back before lookup completes', async () => {
        const { player, video, tracks } = await setup();
        player._currentPlayOptions.playMethod = 'Transcode';
        const original = deferred<Response>();
        const final = deferred<Response>();
        const fetchMock = vi.fn().mockReturnValueOnce(original.promise).mockReturnValueOnce(final.promise);
        vi.stubGlobal('fetch', fetchMock);
        player.setTrackForDisplay(video, track(2));
        const away = deferred<unknown[]>();
        const back = deferred<unknown[]>();
        harness.api.getSessions.mockReturnValueOnce(away.promise).mockReturnValueOnce(back.promise);
        const a = player.setCurrentTrackElement(3);
        const b = player.setCurrentTrackElement(2);
        back.resolve([]);
        await b;
        away.resolve([]);
        await a;
        expect(fetchMock).toHaveBeenCalledTimes(2);
        original.resolve(captions('Technical canceled first attempt'));
        final.resolve(captions('Technical selected again'));
        await settle();
        expect(tracks[0].cues.map(cue => cue.text)).toEqual(['\u200ETechnical selected again']);
    });

    async function startup(throughOsd = false) {
        const state = await setup();
        const { player, video } = state;
        vi.spyOn(video, 'pause').mockImplementation(() => undefined);
        await player.setCurrentSrc(video, { ...player._currentPlayOptions, fullscreen: throughOsd, url: 'https://fixture.invalid/video.mp4',
            mediaSource: { MediaStreams: [track(0), track(1), track(2), track(3)],
                DefaultSubtitleStreamIndex: 2, DefaultSecondarySubtitleStreamIndex: 3, DefaultAudioStreamIndex: 0 } });
        const fetchMock = vi.fn((url: string) => Promise.resolve(captions(`Technical ${url}`)));
        vi.stubGlobal('fetch', fetchMock);
        vi.useFakeTimers();
        const navigation = deferred<void>();
        harness.showVideoOsd.mockReturnValue(navigation.promise);
        if (throughOsd) player.onPlaying({ target: video } as unknown as Event);
        else player.onStartedAndNavigatedToOsd();
        return { ...state, fetchMock, navigation };
    }

    it('initializes both default tracks once during ordinary startup', async () => {
        const { tracks, fetchMock } = await startup();
        await vi.runAllTimersAsync();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(tracks[0].cues[0].text).toContain('/2.js');
        expect(tracks[1].cues[0].text).toContain('/3.js');
    });

    it.each(['primary-off', 'secondary-off', 'select-secondary', 'stop', 'end', 'destroy', 'source'] as const)(
        'does not apply the startup secondary track after %s', async action => {
            const { player, video, tracks, fetchMock } = await startup();
            if (action === 'primary-off') player.setSubtitleStreamIndex(-1);
            if (action === 'secondary-off') player.setSecondarySubtitleStreamIndex(-1);
            if (action === 'select-secondary') player.setSecondarySubtitleStreamIndex(1);
            if (action === 'stop') await player.stop(false);
            if (action === 'end') player.onEnded({ target: video } as unknown as Event);
            if (action === 'destroy') player.destroy();
            if (action === 'source') {
                await player.setCurrentSrc(video, { ...player._currentPlayOptions,
                    url: 'https://fixture.invalid/next.mp4', mediaSource: { ...player._currentPlayOptions.mediaSource } });
            }
            await vi.runAllTimersAsync();
            expect(fetchMock.mock.calls.map(call => call[0])).not.toContain('https://fixture.invalid/3.js');
            if (action === 'select-secondary') {
                expect(tracks[1].cues[0].text).toContain('/1.js');
                expect(tracks[1].mode).toBe('showing');
            } else { expect(tracks[1]?.mode || 'disabled').toBe('disabled'); }
        }
    );

    it.each(['select', 'stop', 'end', 'source', 'destroy'] as const)(
        'ignores completed OSD navigation after %s invalidates startup', async action => {
            const { player, video, fetchMock, navigation, tracks } = await startup(true);
            if (action === 'select') player.setSubtitleStreamIndex(1);
            if (action === 'stop') await player.stop(false);
            if (action === 'end') player.onEnded({ target: video } as unknown as Event);
            if (action === 'source') {
                await player.setCurrentSrc(video, { ...player._currentPlayOptions,
                    url: 'https://fixture.invalid/next.mp4', mediaSource: { ...player._currentPlayOptions.mediaSource } });
            }
            if (action === 'destroy') player.destroy();
            navigation.resolve();
            await vi.runAllTimersAsync();
            expect(fetchMock.mock.calls.map(call => call[0])).toEqual(action === 'select' ? ['https://fixture.invalid/1.js'] : []);
            if (action === 'select') expect(tracks[0].cues[0].text).toContain('/1.js');
        }
    );

    it('initializes the current pair when OSD navigation completes normally', async () => {
        const { tracks, fetchMock, navigation } = await startup(true);
        expect(fetchMock).not.toHaveBeenCalled();
        navigation.resolve();
        await vi.runAllTimersAsync();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(tracks[0].cues[0].text).toContain('/2.js');
        expect(tracks[1].cues[0].text).toContain('/3.js');
    });

    it('finishes current OSD navigation and audio initialization without replacing a newer subtitle choice', async () => {
        const { player, navigation, fetchMock } = await startup(true);
        vi.spyOn(player, 'canSetAudioStreamIndex').mockReturnValue(true);
        const audio = vi.spyOn(player, 'setAudioStreamIndex').mockImplementation(() => undefined);
        const dialog = document.querySelector('.videoPlayerContainer');
        dialog?.classList.add('videoPlayerContainer-onTop');
        player.setSubtitleStreamIndex(1);
        navigation.resolve();
        await vi.runAllTimersAsync();
        expect(audio).toHaveBeenCalledExactlyOnceWith(0);
        expect(fetchMock.mock.calls.map(call => call[0])).toEqual(['https://fixture.invalid/1.js']);
        expect(dialog?.classList.contains('videoPlayerContainer-onTop')).toBe(false);
    });
});
