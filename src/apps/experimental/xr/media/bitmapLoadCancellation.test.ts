import { PgsRenderer, VobSubRenderer } from 'libbitsub';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const seams = vi.hoisted(() => ({
    workerAvailable: vi.fn(() => true),
    workerReady: vi.fn<() => Promise<unknown>>(),
    send: vi.fn<(message: { type: string; sessionId?: string | null }) => Promise<unknown>>(),
    constructed: vi.fn(),
    parsed: vi.fn(),
    freed: vi.fn()
}));
vi.mock('../../../../../node_modules/libbitsub/dist/ts/parsers', async importOriginal => {
    const actual = await importOriginal<object>();
    class Parser {
        constructor() { seams.constructed(); }
        load() {
            seams.parsed();
            return 1;
        }
        loadFromData() { seams.parsed(); }
        getTimestamps() { return new Float64Array([1000]); }
        getMetadata() { return { cueCount: 1 }; }
        dispose() { seams.freed(); }
    }
    return { ...actual, PgsParser: Parser, VobSubParserLowLevel: Parser };
});
vi.mock('../../../../../node_modules/libbitsub/dist/ts/wasm', () => ({ initWasm: () => Promise.resolve() }));
vi.mock('../../../../../node_modules/libbitsub/dist/ts/worker', () => ({
    isWorkerAvailable: seams.workerAvailable,
    getOrCreateWorker: seams.workerReady,
    sendToWorker: seams.send
}));

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((success, failure) => {
        resolve = success;
        reject = failure;
    });
    return { promise, resolve, reject };
}

type Probe = {
    init(): Promise<void>;
    createCanvas(): void;
    startRenderLoop(): void;
    isLoaded: boolean;
    renderAtIndex(index: number): unknown;
    findCurrentIndex(time: number): number;
    cachedIndex: number;
};
const originalInit = (PgsRenderer.prototype as unknown as Probe).init;
const formats = [
    { name: 'PGS', Renderer: PgsRenderer, load: 'loadPgs', dispose: 'disposePgs', reply: 'pgsLoaded' },
    { name: 'VobSub', Renderer: VobSubRenderer, load: 'loadVobSub', dispose: 'disposeVobSub', reply: 'vobSubLoaded' }
];

function replyFor(type: string) {
    let reply = 'vobSubLoaded';
    if (type === 'loadPgs') reply = 'pgsLoaded';
    else if (['beginPgs', 'appendPgs', 'finishPgs'].includes(type)) reply = 'pgsProgress';
    else if (['loadVobSubIdx', 'attachVobSubData'].includes(type)) reply = 'vobSubProgress';
    return { type: reply, added: 1, count: 1, metadata: { cueCount: 1 }, timestamps: new Float64Array([1000]) };
}

describe('installed bitmap load cancellation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        seams.workerAvailable.mockReturnValue(true);
        seams.workerReady.mockResolvedValue({});
        seams.send.mockImplementation(message => Promise.resolve(replyFor(message.type)));
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    function start(Renderer: typeof PgsRenderer | typeof VobSubRenderer, options: Partial<ConstructorParameters<typeof VobSubRenderer>[0]> = {}) {
        const prototype = Renderer.prototype as unknown as Probe;
        let task!: Promise<void>;
        vi.spyOn(prototype, 'init').mockImplementation(function (this: Probe) {
            task = originalInit.call(this);
            return task;
        });
        // Keep the real asynchronous loader; canvas/backend startup is covered separately.
        vi.spyOn(prototype, 'createCanvas').mockImplementation(() => { /* No GPU in this test. */ });
        const render = vi.spyOn(prototype, 'startRenderLoop').mockImplementation(() => { /* Observe startup only. */ });
        const loaded = vi.fn();
        const error = vi.fn();
        const events = vi.fn();
        const renderer = new Renderer({
            video: document.createElement('video'), subContent: new ArrayBuffer(4),
            idxContent: 'Technical IDX loader fixture', onLoaded: loaded, onError: error, onEvent: events, ...options
        });
        return { renderer, loaded, error, events, render, task: () => task };
    }

    it.each(formats)('never submits a load after disposal during shared-worker startup ($name)', async format => {
        const worker = deferred<unknown>();
        seams.workerReady.mockReturnValue(worker.promise);
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        fixture.renderer.dispose();
        worker.resolve({});
        await fixture.task();
        expect(seams.send.mock.calls.filter(([message]) => message.type === format.load)).toHaveLength(0);
        expect(fixture.loaded).not.toHaveBeenCalled();
        expect(fixture.error).not.toHaveBeenCalled();
    });

    it.each([
        { name: 'PGS buffer URL', Renderer: PgsRenderer, subUrl: 'https://fixture.invalid/captions.sup', streamingLoad: false },
        { name: 'PGS progressive URL', Renderer: PgsRenderer, subUrl: 'https://fixture.invalid/captions.sup', streamingLoad: true },
        { name: 'VobSub MKS URL', Renderer: VobSubRenderer, subUrl: 'https://fixture.invalid/captions.mks', streamingLoad: true },
        { name: 'VobSub IDX URL', Renderer: VobSubRenderer, subUrl: 'https://fixture.invalid/captions.sub', streamingLoad: true },
        { name: 'PGS range probe', Renderer: PgsRenderer, subUrl: 'https://fixture.invalid/captions.sup', streamingLoad: false, rangeRequests: true }
    ])('aborts a pending fetch without retries or stale errors ($name)', async format => {
        const response = deferred<Response>();
        const fetchMock = vi.fn<(url: string, options: RequestInit) => Promise<Response>>().mockReturnValue(response.promise);
        vi.stubGlobal('fetch', fetchMock);
        const fixture = start(format.Renderer, { subContent: undefined, idxContent: undefined, subUrl: format.subUrl, streamingLoad: format.streamingLoad, rangeRequests: 'rangeRequests' in format && format.rangeRequests });
        await vi.advanceTimersByTimeAsync(0);
        expect(fetchMock).toHaveBeenCalledOnce();
        const signal = fetchMock.mock.calls[0][1].signal;
        fixture.renderer.dispose();
        response.reject(new Error('Technical fetch canceled'));
        await fixture.task();
        expect(signal?.aborted).toBe(true);
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fixture.error).not.toHaveBeenCalled();
        expect(fixture.loaded).not.toHaveBeenCalled();
    });

    it.each(formats)('does not parse a freed main-thread instance in a scheduled callback ($name)', async format => {
        seams.workerAvailable.mockReturnValue(false);
        vi.stubGlobal('scheduler', { yield: () => Promise.resolve() });
        const callbacks: Array<() => void> = [];
        vi.stubGlobal('requestIdleCallback', (callback: () => void) => callbacks.push(callback));
        const cancel = vi.fn();
        vi.stubGlobal('cancelIdleCallback', cancel);
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        expect(callbacks).toHaveLength(1);
        fixture.renderer.dispose();
        await fixture.task();
        expect(cancel).toHaveBeenCalledWith(1);
        expect(() => callbacks[0]()).not.toThrow();
        expect(seams.parsed).not.toHaveBeenCalled();
        expect(seams.freed).toHaveBeenCalledOnce();
        expect(fixture.loaded).not.toHaveBeenCalled();
        expect(fixture.error).not.toHaveBeenCalled();
    });

    it.each(formats)('does not allocate a parser after disposal during a main-thread yield ($name)', async format => {
        seams.workerAvailable.mockReturnValue(false);
        const yieldGate = deferred<void>();
        vi.stubGlobal('scheduler', { yield: () => yieldGate.promise });
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        fixture.renderer.dispose();
        yieldGate.resolve();
        await fixture.task();
        expect(seams.constructed).not.toHaveBeenCalled();
        expect(fixture.loaded).not.toHaveBeenCalled();
    });

    it.each(formats)('cancels and settles a queued timer parser ($name)', async format => {
        seams.workerAvailable.mockReturnValue(false);
        vi.stubGlobal('scheduler', { yield: () => Promise.resolve() });
        vi.stubGlobal('requestIdleCallback', undefined);
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        expect(vi.getTimerCount()).toBe(1);
        fixture.renderer.dispose();
        await fixture.task();
        expect(vi.getTimerCount()).toBe(0);
        expect(seams.parsed).not.toHaveBeenCalled();
        expect(seams.freed).toHaveBeenCalledOnce();
    });

    it.each(formats)('releases an unready worker session and ignores its late reply ($name)', async format => {
        const response = deferred<unknown>();
        seams.send.mockImplementation(message => message.type === format.load ? response.promise : Promise.resolve({ type: 'disposed' }));
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        const session = seams.send.mock.calls.find(([message]) => message.type === format.load)?.[0].sessionId;
        expect(session).toBeTruthy();
        fixture.renderer.dispose();
        const events = fixture.events.mock.calls.length;
        response.resolve({ type: format.reply, count: 1, metadata: { cueCount: 1 }, timestamps: new Float64Array([1000]) });
        await fixture.task();
        expect(seams.send).toHaveBeenCalledWith({ type: format.dispose, sessionId: session });
        expect(fixture.renderer.getCacheStats()).toMatchObject({ workerReady: false, sessionId: null, totalEntries: 0 });
        expect((fixture.renderer as unknown as Probe).isLoaded).toBe(false);
        expect(fixture.events).toHaveBeenCalledTimes(events);
        expect(fixture.loaded).not.toHaveBeenCalled();
        expect(fixture.render).not.toHaveBeenCalled();
    });

    it.each(formats)('still loads a live worker renderer ($name)', async format => {
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        await fixture.task();
        expect(fixture.loaded).toHaveBeenCalledOnce();
        expect(fixture.render).toHaveBeenCalledOnce();
        expect(fixture.error).not.toHaveBeenCalled();
        expect(fixture.renderer.getCacheStats()).toMatchObject({ workerReady: true, totalEntries: 1 });
        fixture.renderer.dispose();
    });

    it.each(formats)('runs or reports an active scheduled parser without escaping its promise ($name)', async format => {
        seams.workerAvailable.mockReturnValue(false);
        vi.stubGlobal('scheduler', { yield: () => Promise.resolve() });
        const callbacks: Array<() => void> = [];
        vi.stubGlobal('requestIdleCallback', (callback: () => void) => callbacks.push(callback));
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        callbacks[0]();
        await fixture.task();
        expect(fixture.loaded).toHaveBeenCalledOnce();
        expect(seams.parsed).toHaveBeenCalledOnce();
        fixture.renderer.dispose();
    });

    it.each(formats)('contains a live scheduled parser failure ($name)', async format => {
        seams.workerAvailable.mockReturnValue(false);
        seams.parsed.mockImplementationOnce(() => {
            throw new Error('Technical parser failure');
        });
        vi.stubGlobal('scheduler', { yield: () => Promise.resolve() });
        const callbacks: Array<() => void> = [];
        vi.stubGlobal('requestIdleCallback', (callback: () => void) => callbacks.push(callback));
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        expect(() => callbacks[0]()).not.toThrow();
        await fixture.task();
        expect(fixture.error).toHaveBeenCalledOnce();
        expect(fixture.loaded).not.toHaveBeenCalled();
        fixture.renderer.dispose();
    });

    it.each([
        { name: 'PGS append', Renderer: PgsRenderer, command: 'appendPgs', subUrl: 'https://fixture.invalid/captions.sup' },
        { name: 'PGS finish', Renderer: PgsRenderer, command: 'finishPgs', subUrl: 'https://fixture.invalid/captions.sup' },
        { name: 'VobSub IDX', Renderer: VobSubRenderer, command: 'loadVobSubIdx', subUrl: 'https://fixture.invalid/captions.sub' },
        { name: 'VobSub attach', Renderer: VobSubRenderer, command: 'attachVobSubData', subUrl: 'https://fixture.invalid/captions.sub' }
    ])('does not continue progressive loading after a canceled $name reply', async format => {
        const pending = deferred<unknown>();
        const fetchMock = vi.fn(() => Promise.resolve(new Response(new Uint8Array([1, 2, 3, 4]).buffer)));
        vi.stubGlobal('fetch', fetchMock);
        seams.send.mockImplementation(message => message.type === format.command ? pending.promise : Promise.resolve(replyFor(message.type)));
        const fixture = start(format.Renderer, { subContent: undefined, idxContent: undefined, subUrl: format.subUrl, rangeRequests: false });
        await vi.advanceTimersByTimeAsync(0);
        expect(seams.send.mock.calls.some(([message]) => message.type === format.command)).toBe(true);
        fixture.renderer.dispose();
        const messages = seams.send.mock.calls.length;
        const requests = fetchMock.mock.calls.length;
        const events = fixture.events.mock.calls.length;
        pending.resolve(replyFor(format.command));
        await fixture.task();
        expect(seams.send).toHaveBeenCalledTimes(messages);
        expect(fetchMock).toHaveBeenCalledTimes(requests);
        expect(fixture.events).toHaveBeenCalledTimes(events);
        expect(fixture.loaded).not.toHaveBeenCalled();
        expect(fixture.error).not.toHaveBeenCalled();
        expect(fixture.renderer.getCacheStats()).toMatchObject({ workerReady: false, totalEntries: 0 });
    });

    it.each(formats.flatMap(format => ['reply', 'error'].map(outcome => ({ ...format, outcome }))))('does not restore frame caches after a disposed $name $outcome', async format => {
        const fixture = start(format.Renderer);
        await vi.advanceTimersByTimeAsync(0);
        await fixture.task();
        const frame = deferred<unknown>();
        seams.send.mockImplementation(message => message.type.startsWith('render') ? frame.promise : Promise.resolve({ type: 'disposed' }));
        const probe = fixture.renderer as unknown as Probe;
        probe.renderAtIndex(0);
        fixture.renderer.dispose();
        const events = fixture.events.mock.calls.length;
        if (format.outcome === 'error') frame.reject(new Error('Technical worker failure'));
        else frame.resolve({ type: format.name === 'PGS' ? 'pgsFrame' : 'vobSubFrame', frame: null });
        await vi.advanceTimersByTimeAsync(0);
        expect(fixture.renderer.getCacheStats()).toMatchObject({ cachedFrames: 0, pendingRenders: 0 });
        expect(fixture.events).toHaveBeenCalledTimes(events);
        expect(fixture.error).not.toHaveBeenCalled();
    });

    it('ignores a VobSub index lookup resolved after disposal', async () => {
        const fixture = start(VobSubRenderer);
        await vi.advanceTimersByTimeAsync(0);
        await fixture.task();
        const index = deferred<unknown>();
        seams.send.mockImplementation(message => message.type === 'findVobSubIndex' ? index.promise : Promise.resolve({ type: 'disposed' }));
        const probe = fixture.renderer as unknown as Probe;
        probe.findCurrentIndex(1);
        fixture.renderer.dispose();
        index.resolve({ type: 'vobSubIndex', index: 4 });
        await vi.advanceTimersByTimeAsync(0);
        expect(probe.cachedIndex).toBe(-1);
        expect(probe.findCurrentIndex(1)).toBe(-1);
    });

    it('keeps another renderer alive while disposing one shared-worker session', async () => {
        const responses = [deferred<unknown>(), deferred<unknown>()];
        let load = 0;
        seams.send.mockImplementation(message => message.type === 'loadPgs' ? responses[load++].promise : Promise.resolve({ type: 'disposed' }));
        const first = start(PgsRenderer);
        await vi.advanceTimersByTimeAsync(0);
        const second = start(PgsRenderer);
        await vi.advanceTimersByTimeAsync(0);
        const sessions = seams.send.mock.calls.filter(([message]) => message.type === 'loadPgs').map(([message]) => message.sessionId);
        first.renderer.dispose();
        responses.forEach(response => {
            response.resolve(replyFor('loadPgs'));
        });
        await Promise.all([first.task(), second.task()]);
        expect(first.loaded).not.toHaveBeenCalled();
        expect(second.loaded).toHaveBeenCalledOnce();
        expect(second.renderer.getCacheStats().workerReady).toBe(true);
        expect(seams.send.mock.calls.filter(([message]) => message.type === 'disposePgs')).toEqual([[{ type: 'disposePgs', sessionId: sessions[0] }]]);
        second.renderer.dispose();
    });

    it('rejects a late successful response even when the fetch ignores its abort signal', async () => {
        const response = deferred<Response>();
        vi.stubGlobal('fetch', vi.fn(() => response.promise));
        const fixture = start(PgsRenderer, { subContent: undefined, subUrl: 'https://fixture.invalid/captions.sup', streamingLoad: false, rangeRequests: false });
        await vi.advanceTimersByTimeAsync(0);
        fixture.renderer.dispose();
        response.resolve(new Response(new Uint8Array([1, 2, 3, 4]).buffer));
        await fixture.task();
        expect(seams.send).not.toHaveBeenCalled();
        expect(fixture.loaded).not.toHaveBeenCalled();
        expect(fixture.error).not.toHaveBeenCalled();
    });
});
