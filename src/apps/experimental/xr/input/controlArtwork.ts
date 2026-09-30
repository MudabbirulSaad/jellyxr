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
        context.font = `${80 * (target.textScale || 1)}px "Noto Sans", sans-serif`;
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
    const scale = target.textScale || 1;
    const text = { idle: target.description || 'Technical control', focus: 'Focused', pressed: 'Press held', disabled: target.description || 'Unavailable' };
    const title = textBlock(context, target.label, 36 * scale, canvas.width - 48);
    const sizeState = { idle: 'Change size', focus: 'Focused', pressed: 'Press held', disabled: 'Unavailable' };
    const description = textBlock(context, hint || (target.id === 'text-size' ? `${scale * 100}% · ${sizeState[state]}` : text[state]), 24 * scale, canvas.width - 48);
    const y = (canvas.height - title.height - description.height - 8) / 2;
    drawBlock(context, title, canvas.width / 2, y, '#F2F4F7', 'center');
    drawBlock(context, description, canvas.width / 2, y + title.height + 8, '#A7B0BC', 'center');
}

interface TextBlock { lines: string[]; font: string; lineHeight: number; height: number }

function textBlock(context: CanvasRenderingContext2D, text: string, size: number, width: number, bold = false): TextBlock {
    const font = `${bold ? 'bold ' : ''}${size}px "Noto Sans", sans-serif`;
    context.font = font;
    const lines = wrapControlText(text, width, value => context.measureText(value).width);
    return { lines, font, lineHeight: size * 1.2, height: lines.length * size * 1.2 };
}

function drawBlock(context: CanvasRenderingContext2D, block: TextBlock, x: number, y: number, colour: string, align: CanvasTextAlign = 'left'): void {
    context.font = block.font;
    context.textAlign = align;
    context.textBaseline = 'top';
    context.fillStyle = colour;
    block.lines.forEach((line, index) => {
        context.fillText(line, x, y + index * block.lineHeight);
    });
}

function drawTextPanel(target: ControlTarget, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    const field = target.kind === 'field';
    const scale = target.textScale || 1;
    const title = textBlock(context, target.label, (field ? 28 : 44) * scale, canvas.width - 64);
    const description = textBlock(context, target.description || '', (field ? 38 : 32) * scale, canvas.width - 64);
    const y = field ? 20 : (canvas.height - title.height - description.height - 18) / 2;
    drawBlock(context, title, 32, y, field ? '#A7B0BC' : '#F2F4F7');
    drawBlock(context, description, 32, y + title.height + 18, field ? '#F2F4F7' : '#A7B0BC');
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
    const scale = target.textScale || 1;
    if (target.kind === 'heading') {
        const title = textBlock(context, target.label, 44 * scale, canvas.width - 64, true);
        const description = textBlock(context, target.description || '', 30 * scale, canvas.width - 64);
        drawBlock(context, title, 32, 24, '#F2F4F7');
        drawBlock(context, description, 32, 24 + title.height + 12, '#A7B0BC');
        return;
    }
    const card = target.kind === 'card';
    const margin = 28;
    const width = canvas.width - margin * 2;
    const action = { pressed: 'Press held', focus: 'Focused · Open details', idle: 'Open technical details', disabled: 'Unavailable' }[state];
    const title = textBlock(context, target.label, (card ? 30 : 44) * scale, width);
    const description = textBlock(context, card ? action : target.description || '', (card ? 24 : 30) * scale, width);
    // Give text priority; never reduce its requested size to preserve calibration artwork.
    const artworkHeight = Math.max(0, Math.min(card ? 115 : 145,
        canvas.height - margin * 2 - title.height - description.height - 44));
    drawArtwork(target, context, margin, width, artworkHeight, scale);
    const y = margin + artworkHeight + 22;
    drawBlock(context, title, margin, y, '#F2F4F7');
    drawBlock(context, description, margin, card ? canvas.height - margin - description.height : y + title.height + 22, '#A7B0BC');
}

function drawArtwork(target: ControlTarget, context: CanvasRenderingContext2D, margin: number, width: number, height: number, scale: number): void {
    if (!height) return;
    if (target.artwork === 'calibration') {
        const colours = ['#35475A', '#59728A', '#D7B67A', '#A7B0BC'];
        colours.forEach((colour, index) => {
            context.fillStyle = colour;
            context.fillRect(margin + index * width / colours.length, margin, width / colours.length, height);
        });
    } else {
        context.fillStyle = '#0B0F14';
        context.fillRect(margin, margin, width, height);
    }
    const label = textBlock(context, target.artwork === 'calibration' ? 'Calibration artwork' : 'No artwork', 26 * scale, width - 32);
    if (label.height + 24 > height) return;
    context.fillStyle = '#0B0F14';
    context.fillRect(margin + 8, margin + 8, width - 16, label.height + 16);
    drawBlock(context, label, margin + 16, margin + 16, '#F2F4F7');
}

export function controlCanvasSize(target: ControlTarget): readonly [number, number] {
    let width = 512;
    if (target.kind === 'key') width = 192;
    if (target.kind && ['heading', 'field', 'message', 'detail'].includes(target.kind)) width = 1024;
    return [width, Math.round(width * target.height / target.width)];
}
