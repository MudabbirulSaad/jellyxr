import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HtmlVideoPlayer } from 'plugins/htmlVideoPlayer/plugin';

const harness = vi.hoisted(() => ({
    renderers: [] as Array<{ options: { onLoading: () => void; onLoaded: () => void; onError: (error: unknown) => void }; dispose: ReturnType<typeof vi.fn>; updateCanvasSize: ReturnType<typeof vi.fn>; timeOffset: number }>,
    frames: [] as FrameRequestCallback[],
    events: vi.fn(),
    errors: vi.fn(),
    ass: [] as Array<{ options: { onError: () => void }; dispose: ReturnType<typeof vi.fn> }>,
    api: {
        getUrl: (path: string) => path,
        accessToken: () => 'technical-fixture',
        getNamedConfiguration: vi.fn(() => Promise.resolve({ EnableFallbackFont: false })),
        getJSON: vi.fn(() => Promise.resolve([] as Array<{ Name: string }>))
    }
}));

vi.mock('libbitsub', () => {
    const create = (options: typeof harness.renderers[number]['options']) => {
        const renderer = { options, dispose: vi.fn(), updateCanvasSize: vi.fn(), timeOffset: 0,
            setDebandEnabled: vi.fn(), setDebandThreshold: vi.fn(), setDebandRange: vi.fn() };
        harness.renderers.push(renderer);
        return renderer;
    };
    const Renderer = vi.fn(function (options) {
        return create(options);
    });
    return { PgsRenderer: Renderer, VobSubRenderer: Renderer };
});
vi.mock('@jellyfin/libass-wasm', () => ({ default: vi.fn(function (options) {
    const renderer = { options, dispose: vi.fn() };
    harness.ass.push(renderer);
    return renderer;
}) }));
vi.mock('scripts/browser', () => ({ default: {} }));
vi.mock('scripts/settings/appSettings', () => ({ default: {} }));
vi.mock('scripts/settings/userSettings', () => ({ currentSettings: { getSubtitleAppearanceSettings: () => ({}) } }));
vi.mock('apps/legacy/features/playback/utils/subtitleStyles', () => ({ useCustomSubtitles: () => false }));
vi.mock('components/subtitlesettings/subtitleappearancehelper', () => ({ default: {} }));
vi.mock('components/apphost', () => ({ appHost: {} }));
vi.mock('components/loading/loading', () => ({ default: {} }));
vi.mock('components/playback/playbackmanager', () => ({ playbackManager: { getSubtitleUrl: () => '/technical-subtitle.sup' } }));
vi.mock('components/router/appRouter', () => ({ appRouter: { baseUrl: () => '' } }));
vi.mock('components/htmlMediaHelper', () => ({ onErrorInternal: harness.errors }));
vi.mock('components/itemHelper', () => ({ default: { isLocalItem: () => false } }));
vi.mock('lib/jellyfin-apiclient', () => ({ ServerConnections: { getApiClient: () => harness.api } }));
vi.mock('lib/globalize', () => ({ default: {} }));
vi.mock('scripts/browserDeviceProfile', () => ({ default: {}, canPlaySecondaryAudio: vi.fn() }));
vi.mock('scripts/settings/webSettings', () => ({ getIncludeCorsCredentials: vi.fn() }));
vi.mock('components/backdrop/backdrop', () => ({ setBackdropTransparency: vi.fn() }));
vi.mock('utils/events.ts', () => ({ default: { trigger: harness.events } }));
vi.mock('utils/dom', () => ({ default: {} }));

// Exercise the inherited JS lifecycle methods without making its JSDoc-private API public.
type TestPlayer = {
    renderPgs: HtmlVideoPlayer['renderPgs'];
    renderVobSub: HtmlVideoPlayer['renderVobSub'];
    renderSsaAss: HtmlVideoPlayer['renderSsaAss'];
    destroyCustomTrack: HtmlVideoPlayer['destroyCustomTrack'];
    _currentPlayOptions: HtmlVideoPlayer['_currentPlayOptions'];
    isFetching: boolean;
};

function setup() {
    const player = new HtmlVideoPlayer() as unknown as TestPlayer;
    player._currentPlayOptions = { transcodingOffsetTicks: 10000000, mediaSource: { MediaStreams: [] } };
    const video = document.createElement('video');
    const item = { ServerId: 'technical-server' };
    return { player, video, item };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

describe('inherited canvas subtitle creation', () => {
    beforeEach(() => {
        harness.renderers.length = 0;
        harness.frames.length = 0;
        harness.ass.length = 0;
        harness.events.mockClear();
        harness.errors.mockClear();
        harness.api.getNamedConfiguration.mockReset().mockResolvedValue({ EnableFallbackFont: false });
        harness.api.getJSON.mockReset().mockResolvedValue([]);
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => harness.frames.push(callback));
        vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function (this: XMLHttpRequest) {
            this.dispatchEvent(new Event('load'));
        });
    });

    it.each(['renderPgs', 'renderVobSub'] as const)('does not construct a cancelled %s after its dynamic import resolves', async method => {
        const { player, video, item } = setup();
        player[method](video, { Index: 2, Codec: 'pgssub' }, item);
        player.destroyCustomTrack(video);
        await vi.dynamicImportSettled();
        expect(harness.renderers).toHaveLength(0);
        expect(player.isFetching).toBe(false);
    });

    it.each(['renderPgs', 'renderVobSub'] as const)('keeps late %s callbacks and resize off its replacement', async method => {
        const { player, video, item } = setup();
        player[method](video, { Index: 2 }, item);
        await vi.dynamicImportSettled();
        const old = harness.renderers[0];
        old.options.onLoading();
        expect(player.isFetching).toBe(true);
        player.destroyCustomTrack(video);
        expect(old.dispose).toHaveBeenCalledOnce();
        player[method](video, { Index: 3 }, item);
        await vi.dynamicImportSettled();
        const next = harness.renderers[1];
        next.options.onLoading();
        old.options.onLoaded();
        expect(player.isFetching).toBe(true);
        expect(next.updateCanvasSize).not.toHaveBeenCalled();
        harness.frames[0](0);
        expect(next.updateCanvasSize).not.toHaveBeenCalled();
        harness.frames[1](0);
        expect(next.updateCanvasSize).toHaveBeenCalledOnce();
        next.options.onLoaded();
        expect(next.timeOffset).toBe(1);
        expect(player.isFetching).toBe(false);
        player.destroyCustomTrack(video);
        expect(next.dispose).toHaveBeenCalledOnce();
    });

    it('settles the old loading token after source replacement without resizing or restarting it', async () => {
        const { player, video, item } = setup();
        player.renderPgs(video, { Index: 2 }, item);
        await vi.dynamicImportSettled();
        const old = harness.renderers[0];
        old.options.onLoading();
        player._currentPlayOptions = { transcodingOffsetTicks: 20000000 };
        old.options.onLoaded();
        expect(player.isFetching).toBe(false);
        expect(old.updateCanvasSize).not.toHaveBeenCalled();
        old.options.onLoading();
        expect(player.isFetching).toBe(false);
        player.destroyCustomTrack(video);
    });

    it('cancels ASS before import, configuration or fallback-font completion', async () => {
        for (const stage of ['import', 'config', 'fonts']) {
            const { player, video, item } = setup();
            const config = deferred<{ EnableFallbackFont: boolean }>();
            const fonts = deferred<Array<{ Name: string }>>();
            harness.api.getNamedConfiguration.mockReturnValue(config.promise);
            harness.api.getJSON.mockReturnValue(fonts.promise);
            player.renderSsaAss(video, { Index: 2 }, item);
            if (stage !== 'import') await vi.dynamicImportSettled();
            if (stage === 'fonts') {
                config.resolve({ EnableFallbackFont: true });
                await vi.dynamicImportSettled();
            }
            player.destroyCustomTrack(video);
            config.resolve({ EnableFallbackFont: true });
            fonts.resolve([{ Name: 'Technical font' }]);
            await vi.dynamicImportSettled();
            expect(harness.ass).toHaveLength(0);
        }
    });

    it('ignores obsolete ASS errors and reports current errors against the player owner', async () => {
        const { player, video, item } = setup();
        player.renderSsaAss(video, { Index: 2 }, item);
        await vi.dynamicImportSettled();
        const old = harness.ass[0];
        player.destroyCustomTrack(video);
        player.renderSsaAss(video, { Index: 3 }, item);
        await vi.dynamicImportSettled();
        old.options.onError();
        expect(harness.errors).not.toHaveBeenCalled();
        const current = harness.ass[1];
        current.options.onError();
        await vi.waitFor(() => expect(harness.errors).toHaveBeenCalledOnce());
        expect(harness.errors.mock.calls[0][0]).toBe(player);
        player.destroyCustomTrack(video);
    });

    it.each([false, true])('contains failed ASS configuration after cancellation=%s', async cancelled => {
        const { player, video, item } = setup();
        const config = deferred<{ EnableFallbackFont: boolean }>();
        harness.api.getNamedConfiguration.mockReturnValue(config.promise);
        player.renderSsaAss(video, { Index: 2 }, item);
        await vi.dynamicImportSettled();
        if (cancelled) player.destroyCustomTrack(video);
        config.reject(new Error('technical request failed'));
        await vi.dynamicImportSettled();
        expect(harness.ass).toHaveLength(0);
        expect(harness.errors).toHaveBeenCalledTimes(cancelled ? 0 : 1);
        player.destroyCustomTrack(video);
    });

    it('drops an already queued ASS error when the track is closed before its timer runs', async () => {
        const { player, video, item } = setup();
        player.renderSsaAss(video, { Index: 2 }, item);
        await vi.dynamicImportSettled();
        vi.useFakeTimers();
        try {
            harness.ass[0].options.onError();
            player.destroyCustomTrack(video);
            vi.runAllTimers();
            expect(harness.errors).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });
});
