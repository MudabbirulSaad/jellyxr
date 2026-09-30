import { screenGeometry } from '../fixtures/screenFixture';

import { CONTROL_TARGETS, type ControlAction, type ControlTarget } from './controlTargets';

/** Scene-local comparison setting; independent of the player and of persisted preferences. */
export class SpatialScreen {
    private percent = 100;
    private open = false;

    readSize(): number { return this.percent; }
    isOpen(): boolean { return this.open; }

    handle(action: ControlAction): { targets: readonly ControlTarget[]; focus: ControlAction; reanchor: boolean } | null {
        if (action === 'screen-open') {
            this.open = true;
        } else {
            if (!this.open) return null;
            switch (action) {
                case 'screen-close':
                    this.open = false;
                    return { targets: CONTROL_TARGETS, focus: 'screen-open', reanchor: true };
                case 'screen-smaller':
                    if (this.percent === 60) return null;
                    this.percent -= 10;
                    break;
                case 'screen-larger':
                    if (this.percent === 100) return null;
                    this.percent += 10;
                    break;
                case 'screen-reset':
                    this.percent = 100;
                    break;
                default: return null;
            }
        }
        const targets = this.targets();
        let focus: ControlAction = targets.find(target => target.id === action && target.enabled !== false)?.id || 'screen-close';
        if (action === 'screen-open') focus = this.percent > 60 ? 'screen-smaller' : 'screen-larger';
        return { targets, focus, reanchor: action === 'screen-open' };
    }

    private targets(): readonly ControlTarget[] {
        const size = screenGeometry(this.percent);
        return [
            { id: 'screen-heading', label: `Screen size · ${this.percent}%`, position: [0, 1.58, -1.4], width: 1.8, height: 0.24,
                kind: 'heading', enabled: false, description: `${size.width.toFixed(2)} × ${size.height.toFixed(2)} m envelope · aspect ratio preserved` },
            { id: 'screen-smaller', label: 'Smaller', position: [-0.6, 1.24, -1.4], width: 0.52, height: 0.22, enabled: this.percent > 60,
                description: this.percent > 60 ? '10 percentage points' : 'Minimum size · 60%' },
            { id: 'screen-larger', label: 'Larger', position: [0, 1.24, -1.4], width: 0.52, height: 0.22, enabled: this.percent < 100,
                description: this.percent < 100 ? '10 percentage points' : 'Maximum size · 100%' },
            { id: 'screen-reset', label: 'Reset size', position: [0.6, 1.24, -1.4], width: 0.52, height: 0.22, enabled: this.percent !== 100,
                description: this.percent === 100 ? 'Default size · 100%' : 'Restore 100%' },
            { id: 'screen-close', label: 'Back to controls', position: [-0.72, 0.94, -1.4], width: 0.64, height: 0.22, description: 'Keep this size' },
            { id: 'return-seat', label: 'Return to seat', position: [0, 0.94, -1.4], width: 0.64, height: 0.22, description: 'Pause and return' },
            { id: 'exit-xr', label: 'Exit XR', position: [0.72, 0.94, -1.4], width: 0.64, height: 0.22, description: 'Leave immersive view' }
        ];
    }

    status(): string { return `Screen size: ${this.percent}%.`; }
}
