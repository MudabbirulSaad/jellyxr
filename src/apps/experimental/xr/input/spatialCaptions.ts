import { DEFAULT_CAPTION_SETTINGS, type CaptionSettings } from '../media/captionSettings';

import type { ControlAction, ControlTarget } from './controlTargets';

function next<T>(values: readonly T[], current: T): T {
    return values[(values.indexOf(current) + 1) % values.length];
}

function backingLabel(backing: CaptionSettings['backing']): string {
    if (backing === 1) return 'Opaque';
    return backing === 0 ? 'None' : '75%';
}

/** Plain-text presentation only; never selects a track or mutates player preferences. */
export class SpatialCaptions {
    private settings = DEFAULT_CAPTION_SETTINGS;
    read = (): CaptionSettings => this.settings;

    handle(action: ControlAction): boolean {
        const current = this.settings;
        if (action === 'caption-size') {
            this.settings = { ...current, size: next([1, 1.25, 1.5] as const, current.size) };
        } else if (action === 'caption-backing') {
            this.settings = { ...current, backing: next([1, 0.75, 0] as const, current.backing) };
        } else if (action === 'caption-position') {
            this.settings = { ...current, position: next(['Upper', 'Centre', 'Lower'] as const, current.position) };
        } else if (action === 'caption-reset') {
            this.settings = DEFAULT_CAPTION_SETTINGS;
        } else {
            return false;
        }
        return true;
    }

    targets(): readonly ControlTarget[] {
        const { size, backing, position } = this.settings;
        return [
            { id: 'caption-heading', label: 'Plain-text captions', description: 'ASS and bitmap keep their authored layout.',
                position: [2.025, 2.5, -2.5], width: 1.25, height: 0.6, kind: 'heading', enabled: false },
            { id: 'caption-size', label: `Size · ${size * 100}%`, description: 'Change caption size', position: [1.7, 1.96, -2.5], width: 0.6, height: 0.34 },
            { id: 'caption-backing', label: `Backing · ${backingLabel(backing)}`, description: 'Change backing',
                position: [2.35, 1.96, -2.5], width: 0.6, height: 0.34 },
            { id: 'caption-position', label: `Placement · ${position}`, description: 'Change position', position: [1.7, 1.5, -2.5], width: 0.6, height: 0.34 },
            { id: 'caption-reset', label: 'Reset captions', description: 'Restore defaults', position: [2.35, 1.5, -2.5], width: 0.6, height: 0.34,
                enabled: size !== 1 || backing !== 1 || position !== 'Upper' },
            { id: 'caption-close', label: 'Back to screen', description: 'Keep settings', position: [1.7, 1.04, -2.5], width: 0.6, height: 0.34 },
            { id: 'return-seat', label: 'Return to seat', description: 'Pause and return', position: [2.35, 1.04, -2.5], width: 0.6, height: 0.34 },
            { id: 'exit-xr', label: 'Exit XR', description: 'Leave immersive view', position: [2.025, 0.58, -2.5], width: 0.6, height: 0.34 }
        ];
    }
}
