import type { ActivationState } from './activationState';
import { controlVisualState, type ControlVisualState } from './controlArtwork';
import type { ControlAction, ControlTarget } from './controlTargets';

export interface ControlPanel {
    paint(target: ControlTarget, state: ControlVisualState, hint?: string): void;
    dispose(): void;
}

/** Bound GPU owners to the current view; unchanged panels need no canvas redraw or upload. */
export class ControlPanels {
    private panels = new Map<ControlAction, { panel: ControlPanel; target: ControlTarget; state: string }>();

    constructor(private readonly create: (target: ControlTarget) => ControlPanel) {}

    update(targets: readonly ControlTarget[], input: ReturnType<ActivationState['read']>, hint?: string): void {
        for (const [id, entry] of this.panels) {
            const target = targets.find(value => value.id === id);
            if (!target || target.width !== entry.target.width || target.height !== entry.target.height || target.kind !== entry.target.kind) {
                entry.panel.dispose();
                this.panels.delete(id);
            }
        }
        for (const target of targets) {
            let entry = this.panels.get(target.id);
            if (!entry) {
                entry = { panel: this.create(target), target, state: '' };
                this.panels.set(target.id, entry);
            }
            const state = controlVisualState(target, input);
            const message = target.id === 'cancel-floor' ? hint : undefined;
            const key = `${state}:${message || ''}`;
            if (entry.state === key && entry.target === target) continue;
            entry.panel.paint(target, state, message);
            entry.state = key;
            entry.target = target;
        }
    }

    dispose(): void {
        for (const entry of this.panels.values()) entry.panel.dispose();
        this.panels.clear();
    }
}
