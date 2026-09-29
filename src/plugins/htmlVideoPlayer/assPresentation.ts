/** Exact-version seam for libass-wasm 4.2.4. Never mutate or dispose the renderer. */
export interface AssPresentationRenderer {
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;
    renderAhead?: number;
    oneshotState?: { iteration?: number; eventStart?: number | null; eventOver?: boolean };
}

export function readAssPresentation(renderer?: AssPresentationRenderer | null) {
    if (!renderer?.canvas || renderer.ctx?.canvas !== renderer.canvas) return null;
    const state = renderer.oneshotState;
    // These fields are set by the same synchronous draw/clear path in render-ahead mode.
    const revision = renderer.renderAhead && state ? `${state.iteration}:${state.eventStart}:${state.eventOver}` : undefined;
    return { canvas: renderer.canvas, revision, format: 'ASS' as const };
}
