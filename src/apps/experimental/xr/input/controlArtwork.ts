import type { ControlTarget } from './controlTargets';
import type { ActivationState } from './activationState';

export function controlVisualState(target: ControlTarget, input: ReturnType<ActivationState['read']>): 'idle' | 'focus' | 'pressed' {
    if (input.pressed === target.id) return 'pressed';
    return input.hover === target.id ? 'focus' : 'idle';
}

/** Opaque world-space text, with shape and explicit state text in addition to colour. */
export function drawControl(target: ControlTarget, state: 'idle' | 'focus' | 'pressed', canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Control text canvas unavailable.');
    context.fillStyle = '#151B23';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = state === 'idle' ? '#A7B0BC' : '#D7B67A';
    context.lineWidth = state === 'pressed' ? 12 : 5;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.textAlign = 'center';
    context.fillStyle = '#F2F4F7';
    context.font = '36px "Noto Sans", sans-serif';
    context.fillText(target.label, canvas.width / 2, 92);
    context.font = '24px "Noto Sans", sans-serif';
    context.fillStyle = '#A7B0BC';
    const text = { idle: 'Technical control', focus: 'Focused', pressed: 'Press held' };
    context.fillText(text[state], canvas.width / 2, 144);
}
