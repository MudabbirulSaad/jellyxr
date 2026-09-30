import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import { CONTROL_TARGETS, type ControlAction, type ControlTarget } from './controlTargets';
import { SpatialCaptions } from './spatialCaptions';

type Setting = 'size' | 'distance' | 'height' | 'tilt';
interface ScreenView { targets: readonly ControlTarget[]; focus: ControlAction; reanchor: boolean }
const settings: readonly Setting[] = ['size', 'distance', 'height', 'tilt'];
const controls: Record<Setting, { label: string; unit: string; decimals: number; min: number; max: number; step: number;
    decrease: ControlAction; increase: ControlAction; less: string; more: string }> = {
    size: { label: 'Screen size', unit: '%', decimals: 0, min: 60, max: 100, step: 10,
        decrease: 'screen-smaller', increase: 'screen-larger', less: 'Smaller', more: 'Larger' },
    distance: { label: 'Seat distance', unit: ' m', decimals: 2, min: 4, max: 6.5, step: 0.25,
        decrease: 'screen-closer', increase: 'screen-farther', less: 'Closer', more: 'Farther' },
    height: { label: 'Centre height', unit: ' m', decimals: 1, min: 1.2, max: 2.8, step: 0.1,
        decrease: 'screen-lower', increase: 'screen-higher', less: 'Lower', more: 'Higher' },
    tilt: { label: 'Tilt', unit: '°', decimals: 0, min: -15, max: 15, step: 5,
        decrease: 'screen-tilt-down', increase: 'screen-tilt-up', less: 'Tilt down', more: 'Tilt up' }
};

/** Scene-local comparison setting; independent of the player and persisted preferences. */
export class SpatialScreen {
    readonly captions = new SpatialCaptions();
    private captionsOpen = false;
    private percent = 100;
    private pose = DEFAULT_SCREEN_POSE;
    private setting: Setting = 'size';
    private open = false;
    private message = '';

    constructor(private readonly place: (percent: number, pose: ScreenPose) => string | null = () => null) {}

    readSize(): number { return this.percent; }
    readPose(): ScreenPose { return this.pose; }
    isOpen(): boolean { return this.open; }
    isCaptionsOpen(): boolean { return this.captionsOpen; }
    private value(): number { return this.setting === 'size' ? this.percent : this.pose[this.setting]; }
    private isDefault(): boolean { return this.percent === 100 && this.pose.distance === 6.5 && this.pose.height === 2 && this.pose.tilt === 0; }

    handle(action: ControlAction): ScreenView | null {
        if (action === 'screen-open') {
            this.open = true;
            this.captionsOpen = false;
        } else {
            if (!this.open) return null;
            if (action === 'caption-open' || this.captionsOpen) {
                return this.handleCaptions(action);
            }
            if (action === 'screen-close') {
                this.open = false;
                return { targets: CONTROL_TARGETS, focus: 'screen-open', reanchor: true };
            }
            if (action === 'screen-next-setting') {
                this.setting = settings[(settings.indexOf(this.setting) + 1) % settings.length];
                this.message = '';
            } else if (!this.adjust(action)) {
                return null;
            }
        }
        const targets = this.targets();
        const control = controls[this.setting];
        let focus: ControlAction = targets.find(target => target.id === action && target.enabled !== false)?.id || 'screen-close';
        if (action === 'screen-open') focus = this.value() > control.min ? control.decrease : control.increase;
        return { targets, focus, reanchor: action === 'screen-open' };
    }

    private handleCaptions(action: ControlAction): ScreenView | null {
        if (action === 'caption-close') {
            this.captionsOpen = false;
            return { targets: this.targets(), focus: 'caption-open', reanchor: true };
        }
        if (action !== 'caption-open' && !this.captions.handle(action)) return null;
        this.captionsOpen = true;
        const targets = this.captions.targets();
        const focus = targets.find(target => target.id === action && target.enabled !== false)?.id || 'caption-size';
        return { targets, focus, reanchor: action === 'caption-open' };
    }

    private adjust(action: ControlAction): boolean {
        const control = controls[this.setting];
        let percent = this.percent;
        let pose = this.pose;
        if (action === 'screen-reset') {
            percent = 100;
            pose = DEFAULT_SCREEN_POSE;
        } else {
            const direction = Number(action === control.increase) - Number(action === control.decrease);
            if (!direction) return false;
            const value = Math.round((this.value() + direction * control.step) * 100) / 100;
            if (value < control.min || value > control.max) return false;
            if (this.setting === 'size') percent = value;
            else pose = { ...pose, [this.setting]: value };
        }
        this.message = this.place(percent, pose) || '';
        if (!this.message) {
            this.percent = percent;
            this.pose = pose;
        }
        return true;
    }

    private targets(): readonly ControlTarget[] {
        const size = screenGeometry(this.percent, this.pose);
        const c = controls[this.setting];
        const value = this.value();
        const next = settings[(settings.indexOf(this.setting) + 1) % settings.length];
        const description = this.setting === 'size' ? `${size.width.toFixed(2)} × ${size.height.toFixed(2)} m envelope · aspect ratio preserved` :
            `${c.min.toFixed(c.decimals)}–${c.max.toFixed(c.decimals)}${c.unit} · room clearance required`;
        return [
            { id: 'screen-heading', label: `${c.label} · ${value.toFixed(c.decimals)}${c.unit}`, position: [-0.275, 1.58, -1.4], width: 1.25, height: 0.24,
                kind: 'heading', enabled: false, description: this.message || description },
            { id: 'screen-next-setting', label: controls[next].label, position: [0.665, 1.58, -1.4], width: 0.45, height: 0.24, description: 'Next setting' },
            { id: c.decrease, label: c.less, position: [-0.6, 1.24, -1.4], width: 0.52, height: 0.22, enabled: value > c.min,
                description: value > c.min ? `Step: ${c.step}${c.unit}` : 'Lower limit reached' },
            { id: c.increase, label: c.more, position: [0, 1.24, -1.4], width: 0.52, height: 0.22, enabled: value < c.max,
                description: value < c.max ? `Step: ${c.step}${c.unit}` : 'Upper limit reached' },
            { id: 'screen-reset', label: 'Reset screen', position: [0.6, 1.24, -1.4], width: 0.52, height: 0.22, enabled: !this.isDefault(), description: 'Default size and pose' },
            { id: 'screen-close', label: 'Back to controls', position: [-0.9, 0.91, -1.4], width: 0.52, height: 0.28, description: 'Keep this placement' },
            { id: 'caption-open', label: 'Captions', position: [-0.3, 0.91, -1.4], width: 0.52, height: 0.28, description: 'Plain-text settings' },
            { id: 'return-seat', label: 'Return to seat', position: [0.3, 0.91, -1.4], width: 0.52, height: 0.28, description: 'Pause and return' },
            { id: 'exit-xr', label: 'Exit XR', position: [0.9, 0.91, -1.4], width: 0.52, height: 0.28, description: 'Leave immersive view' }
        ];
    }

    status(): string { return `Screen size: ${this.percent}%. Distance: ${this.pose.distance.toFixed(2)} m; centre: ${this.pose.height.toFixed(1)} m; tilt: ${this.pose.tilt}°. ${this.message}`; }
}
