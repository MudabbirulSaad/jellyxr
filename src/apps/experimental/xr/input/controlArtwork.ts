import type { ControlTarget } from './controlTargets';
import type { ActivationState } from './activationState';

export type ControlVisualState = 'idle' | 'focus' | 'pressed' | 'disabled';

export function controlVisualState(target: ControlTarget, input: ReturnType<ActivationState['read']>): ControlVisualState {
    if (target.enabled === false) return target.kind && target.kind !== 'key' ? 'idle' : 'disabled';
    if (input.pressed === target.id) return 'pressed';
    return (input.hover || input.focus) === target.id ? 'focus' : 'idle';
}

/** Opaque world-space text, with shape and explicit state text in addition to colour. */
export function drawControl(target: ControlTarget, state: ControlVisualState, canvas: HTMLCanvasElement, hint?: string): void {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Control text canvas unavailable.');
    context.fillStyle = '#151B23';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = { disabled: '#586271', idle: '#A7B0BC', focus: '#D7B67A', pressed: '#D7B67A' }[state];
    context.lineWidth = state === 'pressed' ? 12 : 5;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    if (target.kind === 'key') {
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '80px "Noto Sans", sans-serif';
        context.fillStyle = state === 'disabled' ? '#A7B0BC' : '#F2F4F7';
        context.fillText(target.label, canvas.width / 2, canvas.height / 2);
        return;
    }
    if (target.kind === 'field' || target.kind === 'message') {
        drawTextPanel(target, canvas, context);
        return;
    }
    if (target.kind) {
        drawCatalogue(target, state, canvas, context);
        return;
    }
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#F2F4F7';
    context.font = '36px "Noto Sans", sans-serif';
    context.fillText(target.label, canvas.width / 2, canvas.height * 0.43);
    context.font = '24px "Noto Sans", sans-serif';
    context.fillStyle = '#A7B0BC';
    const text = { idle: target.description || 'Technical control', focus: 'Focused', pressed: 'Press held', disabled: target.description || 'Unavailable on this page' };
    context.fillText(hint || text[state], canvas.width / 2, canvas.height * 0.76);
}

function drawTextPanel(target: ControlTarget, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    const field = target.kind === 'field';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = `${field ? 28 : 44}px "Noto Sans", sans-serif`;
    context.fillStyle = field ? '#A7B0BC' : '#F2F4F7';
    let y = field ? 20 : 190;
    for (const line of wrapControlText(target.label, canvas.width - 64, value => context.measureText(value).width)) {
        context.fillText(line, 32, y);
        y += field ? 36 : 56;
    }
    y += 18;
    context.font = `${field ? 38 : 32}px "Noto Sans", sans-serif`;
    context.fillStyle = field ? '#F2F4F7' : '#A7B0BC';
    for (const line of wrapControlText(target.description || '', canvas.width - 64, value => context.measureText(value).width)) {
        context.fillText(line, 32, y);
        y += 50;
    }
}

/** Measured word wrapping, including unbroken identifiers; the fixture's full title stays visible. */
export function wrapControlText(text: string, width: number, measure: (value: string) => number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (line && measure(`${line} ${word}`) > width) {
            lines.push(line);
            line = '';
        }
        const chunks = splitLongWord(word, width, measure);
        if (chunks.length > 1) {
            lines.push(...chunks.slice(0, -1));
            line = chunks[chunks.length - 1];
        } else { line = line ? `${line} ${word}` : word; }
    }
    if (line.trim()) lines.push(line.trim());
    return lines.map(value => value.trim());
}

function splitLongWord(word: string, width: number, measure: (value: string) => number): string[] {
    const chunks: string[] = [];
    let chunk = '';
    for (const character of word) {
        if (chunk && measure(chunk + character) > width) {
            chunks.push(chunk);
            chunk = '';
        }
        chunk += character;
    }
    if (chunk) chunks.push(chunk);
    return chunks;
}

function drawCatalogue(target: ControlTarget, state: ControlVisualState, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = '#F2F4F7';
    if (target.kind === 'heading') {
        context.font = 'bold 44px "Noto Sans", sans-serif';
        context.fillText(target.label, 32, 24);
        context.font = '30px "Noto Sans", sans-serif';
        context.fillStyle = '#A7B0BC';
        let y = 90;
        for (const line of wrapControlText(target.description || '', canvas.width - 64, value => context.measureText(value).width)) {
            context.fillText(line, 32, y);
            y += 40;
        }
        return;
    }
    const card = target.kind === 'card';
    const margin = 28;
    const width = canvas.width - margin * 2;
    const artworkHeight = card ? 115 : 145;
    if (target.artwork === 'calibration') {
        const colours = ['#35475A', '#59728A', '#D7B67A', '#A7B0BC'];
        colours.forEach((colour, index) => {
            context.fillStyle = colour;
            context.fillRect(margin + index * width / colours.length, margin, width / colours.length, artworkHeight);
        });
        context.fillStyle = '#0B0F14';
        context.fillRect(margin + 12, margin + 12, width - 24, 42);
        context.fillStyle = '#F2F4F7';
        context.font = '26px "Noto Sans", sans-serif';
        context.fillText('Calibration artwork', margin + 22, margin + 18);
    } else {
        context.fillStyle = '#0B0F14';
        context.fillRect(margin, margin, width, artworkHeight);
        context.fillStyle = '#A7B0BC';
        context.font = '28px "Noto Sans", sans-serif';
        context.fillText('No artwork', margin + 18, margin + 40);
    }
    let y = margin + artworkHeight + 22;
    context.font = `${card ? 30 : 44}px "Noto Sans", sans-serif`;
    context.fillStyle = '#F2F4F7';
    const lines = wrapControlText(target.label, width, value => context.measureText(value).width);
    for (const line of lines) {
        context.fillText(line, margin, y);
        y += card ? 38 : 56;
    }
    if (!card) {
        y += 22;
        context.font = '30px "Noto Sans", sans-serif';
        context.fillStyle = '#A7B0BC';
        for (const line of wrapControlText(target.description || '', width, value => context.measureText(value).width)) {
            context.fillText(line, margin, y);
            y += 40;
        }
    } else {
        context.font = '24px "Noto Sans", sans-serif';
        context.fillStyle = '#A7B0BC';
        const action = { pressed: 'Press held', focus: 'Focused · Open details', idle: 'Open technical details', disabled: 'Unavailable' }[state];
        context.fillText(action, margin, canvas.height - 46);
    }
}

export function controlCanvasSize(target: ControlTarget): readonly [number, number] {
    let width = 512;
    if (target.kind === 'key') width = 192;
    if (target.kind && ['heading', 'field', 'message', 'detail'].includes(target.kind)) width = 1024;
    return [width, Math.round(width * target.height / target.width)];
}
