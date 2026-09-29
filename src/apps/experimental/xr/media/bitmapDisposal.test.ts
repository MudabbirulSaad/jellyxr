import { PgsRenderer, VobSubRenderer } from 'libbitsub';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// The patched backend is not a root export; this regression must exercise its real init/destroy code.
// eslint-disable-next-line sonarjs/no-internal-api-use
import { WebGPURenderer } from '../../../../../node_modules/libbitsub/dist/ts/webgpu-renderer';
// eslint-disable-next-line sonarjs/no-internal-api-use -- Test the exact patched backend ownership boundary.
import { WebGL2Renderer } from '../../../../../node_modules/libbitsub/dist/ts/webgl2-renderer';

const pending = vi.hoisted(() => {
    const gate = { wasm: Promise.resolve(), release: () => { /* Replaced for each test. */ } };
    return {
        get wasm() { return gate.wasm; },
        release: () => gate.release(),
        reset: () => {
            gate.wasm = new Promise<void>(resolve => {
                gate.release = resolve;
            });
        }
    };
});

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(release => {
        resolve = release;
    });
    return { promise, resolve };
}

describe('installed bitmap WebGPU startup disposal', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it.each(['adapter', 'device', 'vertex', 'fragment', 'pipeline', 'complete'])(
        'cannot resurrect GPU resources after destruction during %s initialization', async stage => {
            const pause = deferred<void>();
            const entered = deferred<void>();
            async function waitAt<T>(step: string, value: T): Promise<T> {
                if (stage === step) {
                    entered.resolve();
                    await pause.promise;
                }
                return value;
            }
            const buffer = { destroy: vi.fn() };
            let shaders = 0;
            const device = {
                destroy: vi.fn(),
                createShaderModule: vi.fn(() => {
                    const step = shaders++ === 0 ? 'vertex' : 'fragment';
                    return { getCompilationInfo: () => waitAt(step, { messages: [] }) };
                }),
                createSampler: vi.fn(() => ({})),
                createBuffer: vi.fn(() => buffer),
                createBindGroupLayout: vi.fn(() => ({})),
                createPipelineLayout: vi.fn(() => ({})),
                createRenderPipelineAsync: vi.fn(() => waitAt('pipeline', {}))
            };
            const adapter = { requestDevice: vi.fn(() => waitAt('device', device)) };
            const requestAdapter = vi.fn(() => waitAt('adapter', adapter));
            vi.stubGlobal('navigator', { gpu: { requestAdapter, getPreferredCanvasFormat: () => 'bgra8unorm' } });
            // WebGPU's enum spelling is part of its platform API.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            vi.stubGlobal('GPUBufferUsage', { UNIFORM: 1, COPY_DST: 2 });
            vi.stubGlobal('GPUShaderStage', { VERTEX: 1, FRAGMENT: 2 });
            const renderer = new WebGPURenderer();
            const task = renderer.init();
            if (stage === 'complete') {
                await task;
                expect(renderer.initialized).toBe(true);
            } else {
                await entered.promise;
            }
            renderer.destroy();
            const allocations = device.createBuffer.mock.calls.length;
            pause.resolve();
            await expect(task).resolves.toBeUndefined();
            expect(renderer.initialized).toBe(false);
            expect(device.createBuffer).toHaveBeenCalledTimes(allocations);
            expect(adapter.requestDevice).toHaveBeenCalledTimes(stage === 'adapter' ? 0 : 1);
            expect(device.destroy).toHaveBeenCalledTimes(stage === 'adapter' ? 0 : 1);
            if (allocations) expect(buffer.destroy).toHaveBeenCalledOnce();
            await renderer.init();
            expect(requestAdapter).toHaveBeenCalledOnce();
            renderer.destroy();
            expect(device.destroy).toHaveBeenCalledTimes(stage === 'adapter' ? 0 : 1);
        }
    );
});

// This exact installed module is also used by libbitsub's public renderer classes.
vi.mock('../../../../../node_modules/libbitsub/dist/ts/wasm', () => ({ initWasm: () => pending.wasm }));

type LifecycleProbe = {
    init(): Promise<void>;
    loadSubtitles(): Promise<void>;
    tempCanvas: HTMLCanvasElement | null;
    useWebGPU: boolean;
    useWebGL2: boolean;
};

describe('installed bitmap renderer disposal', () => {
    beforeEach(() => {
        pending.reset();
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((kind: string) => kind === '2d' ? {} as CanvasRenderingContext2D : null);
        vi.stubGlobal('ResizeObserver', class {
            observe() { /* No layout in jsdom. */ }
            disconnect() { /* No observer registration in jsdom. */ }
        });
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        document.body.textContent = '';
    });

    it.each([
        { backend: 'webgpu', stage: 'init' },
        { backend: 'webgpu', stage: 'reject' },
        { backend: 'webgpu', stage: 'canvas' },
        { backend: 'webgl2', stage: 'init' },
        { backend: 'webgl2', stage: 'reject' },
        { backend: 'webgl2', stage: 'canvas' }
    ])('does not activate or fall back from a disposed $backend backend during $stage', async ({ backend, stage }) => {
        const gate = deferred<void>();
        const reached = deferred<void>();
        const Backend = backend === 'webgpu' ? WebGPURenderer : WebGL2Renderer;
        const init = vi.spyOn(Backend.prototype, 'init').mockImplementation(async () => {
            if (stage !== 'canvas') {
                reached.resolve();
                await gate.promise;
                if (stage === 'reject') throw new Error('Canceled backend');
            }
        });
        vi.spyOn(Backend.prototype, 'setCanvas').mockImplementation(async () => {
            reached.resolve();
            await gate.promise;
        });
        if (backend === 'webgpu') {
            vi.stubGlobal('navigator', { gpu: {} });
        } else {
            vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
        }
        vi.spyOn(PgsRenderer.prototype as unknown as LifecycleProbe, 'loadSubtitles').mockResolvedValue();
        const fallback = vi.fn();
        const events = vi.fn();
        const video = document.createElement('video');
        const renderer = new PgsRenderer({ video, subContent: new ArrayBuffer(0), onEvent: events, onWebGPUFallback: fallback, onWebGL2Fallback: fallback });
        pending.release();
        await reached.promise;
        expect(init).toHaveBeenCalledOnce();
        renderer.dispose();
        const eventCount = events.mock.calls.length;
        gate.resolve();
        await vi.advanceTimersByTimeAsync(0);
        expect(fallback).not.toHaveBeenCalled();
        expect(events).toHaveBeenCalledTimes(eventCount);
        const probe = renderer as unknown as LifecycleProbe;
        expect(probe.useWebGPU).toBe(false);
        expect(probe.useWebGL2).toBe(false);
    });

    it.each([
        { name: 'PGS', Renderer: PgsRenderer, stage: 'yield' },
        { name: 'VobSub', Renderer: VobSubRenderer, stage: 'yield' },
        { name: 'PGS', Renderer: PgsRenderer, stage: 'load' },
        { name: 'VobSub', Renderer: VobSubRenderer, stage: 'load' },
        { name: 'PGS', Renderer: PgsRenderer, stage: 'complete' },
        { name: 'VobSub', Renderer: VobSubRenderer, stage: 'complete' }
    ])('disposes safely at $stage startup ($name)', async ({ Renderer, stage }) => {
        const prototype = Renderer.prototype as unknown as LifecycleProbe;
        const loadGate = deferred<void>();
        const load = vi.spyOn(prototype, 'loadSubtitles').mockReturnValue(loadGate.promise);
        const originalInit = prototype.init;
        let task!: Promise<void>;
        vi.spyOn(prototype, 'init').mockImplementation(function (this: LifecycleProbe) {
            task = originalInit.call(this);
            return task;
        });
        const parent = document.createElement('div');
        const video = document.createElement('video');
        parent.append(video);
        document.body.append(parent);
        const renderer = new Renderer({ video, subContent: new ArrayBuffer(0) });
        pending.release();
        await Promise.resolve();
        expect(parent.querySelector('canvas')).not.toBeNull();
        if (stage !== 'yield') await vi.advanceTimersByTimeAsync(0);
        if (stage === 'complete') {
            loadGate.resolve();
            await task;
            expect(requestAnimationFrame).toHaveBeenCalledOnce();
        }
        renderer.dispose();
        loadGate.resolve();
        await vi.advanceTimersByTimeAsync(0);
        await task;
        expect(parent.querySelector('canvas')).toBeNull();
        expect((renderer as unknown as LifecycleProbe).tempCanvas).toBeNull();
        expect(load).toHaveBeenCalledTimes(stage === 'yield' ? 0 : 1);
        expect(requestAnimationFrame).toHaveBeenCalledTimes(stage === 'complete' ? 1 : 0);
    });

    it.each([{ name: 'PGS', Renderer: PgsRenderer }, { name: 'VobSub', Renderer: VobSubRenderer }])('does not create resources after disposal during WASM initialization ($name)', async ({ Renderer }) => {
        const prototype = Renderer.prototype as unknown as LifecycleProbe;
        const originalInit = prototype.init;
        const tasks: Promise<void>[] = [];
        vi.spyOn(prototype, 'init').mockImplementation(function (this: LifecycleProbe) {
            const task = originalInit.call(this);
            tasks.push(task);
            return task;
        });
        const load = vi.spyOn(prototype, 'loadSubtitles').mockResolvedValue();
        const parent = document.createElement('div');
        const video = document.createElement('video');
        parent.append(video);
        document.body.append(parent);
        const renderer = new Renderer({ video, subContent: new ArrayBuffer(0) });
        renderer.dispose();
        pending.release();
        await tasks[0];
        try {
            expect(parent.querySelector('canvas')).toBeNull();
            expect(load).not.toHaveBeenCalled();
            expect((renderer as unknown as LifecycleProbe).tempCanvas).toBeNull();
        } finally {
            renderer.dispose();
        }
    });
});
