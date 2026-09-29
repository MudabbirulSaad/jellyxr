import type { ControlAction } from './controlTargets';

/** One pending action, with logical focus retained after input loss. Hover never commits. */
export class ActivationState {
    private pending: { source: string; target: ControlAction } | null = null;
    private focus: ControlAction | null = null;
    private hover: ControlAction | null = null;

    observe(source: string, target: ControlAction | null): void {
        if (this.pending && this.pending.source !== source) return;
        this.hover = target;
        if (target) this.focus = target;
        if (this.pending && this.pending.target !== target) this.pending = null;
    }

    begin(source: string, target: ControlAction | null): void {
        // A second input cannot steal or duplicate a held action.
        if (this.pending || !target) return;
        this.observe(source, target);
        this.pending = { source, target };
    }

    commit(source: string, target: ControlAction | null): ControlAction | null {
        if (!this.pending || this.pending.source !== source) return null;
        const action = this.pending.target === target ? target : null;
        this.pending = null;
        return action;
    }

    cancel(source?: string): void {
        if (!source || this.pending?.source === source) this.pending = null;
        this.hover = null;
    }

    read() {
        return { focus: this.focus, hover: this.hover, pressed: this.pending?.target || null, source: this.pending?.source };
    }
}
