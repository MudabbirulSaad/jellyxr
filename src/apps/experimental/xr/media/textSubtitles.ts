import type { BorrowedVideoSurface } from './borrowVideoSurface';

export interface SubtitleFrame {
    text: string;
    status: string;
    warning?: boolean;
}

/** Read text without inserting markup or retaining a second subtitle timeline. */
function visibleText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node instanceof Element) {
        if (['SCRIPT', 'STYLE', 'RT'].includes(node.tagName)) return '';
        if (node.tagName === 'BR') return '\n';
    }
    return Array.from(node.childNodes).map(visibleText).join('');
}

export class TextSubtitleReader {
    private readonly cues = new WeakMap<TextTrackCue, { source: string; text: string }>();

    constructor(private readonly surface: BorrowedVideoSurface) {}

    private cueText(cue: TextTrackCue): string {
        const vtt = cue as VTTCue;
        if (typeof vtt.getCueAsHTML !== 'function') throw new Error('Unreadable text cue.');
        let cached = this.cues.get(cue);
        if (!cached || cached.source !== vtt.text) {
            cached = { source: vtt.text, text: visibleText(vtt.getCueAsHTML()).trim() };
            this.cues.set(cue, cached);
        }
        return cached.text;
    }

    private nativeText(): string[] {
        const parts: string[] = [];
        for (const track of Array.from(this.surface.video.textTracks)) {
            if (track.mode !== 'showing' || !['captions', 'subtitles'].includes(track.kind)) continue;
            for (const cue of Array.from(track.activeCues || [])) {
                const text = this.cueText(cue);
                if (text) parts.push(text);
            }
        }
        return parts;
    }

    read(): SubtitleFrame {
        const { video } = this.surface;
        if (!this.surface.isCurrent()) return { text: '', status: 'Subtitle source ended.' };
        if (video.seeking) return { text: '', status: 'Waiting for subtitles after seek.' };
        const custom = this.surface.readSubtitles?.();
        if (custom?.unsupportedRenderer) {
            return { text: '', status: `${custom.unsupportedRenderer} subtitles need a separate composition test. Use the ordinary player.`, warning: true };
        }
        const parts = this.nativeText();
        for (const element of custom?.textElements || []) {
            if (!element || element.hidden || element.classList.contains('hide')) continue;
            const text = visibleText(element).trim();
            if (text) parts.push(text);
        }
        return {
            text: parts.join('\n'),
            status: parts.length ? 'Plain-text subtitles only; styling and headset synchronization remain unqualified.' :
                'No active text cue. Check the selected track in the ordinary player.'
        };
    }
}

function wrapParagraph(text: string, measure: (value: string) => number, width: number): string[] | null {
    const lines: string[] = [];
    let line = '';
    for (const character of Array.from(text)) {
        if (measure(line + character) <= width) {
            line += character;
            continue;
        }
        if (!line) return null;
        const split = character === ' ' ? line.length : line.lastIndexOf(' ');
        lines.push(split > 0 ? line.slice(0, split) : line);
        line = ((split > 0 ? line.slice(split + 1) : '') + character).trimStart();
        if (lines.length >= 5) return null;
    }
    lines.push(line.trim());
    return lines;
}

/** Bounded comparison layout; report overflow instead of truncating a viewer's captions. */
export function wrapSubtitle(text: string, measure: (value: string) => number, width: number): string[] | null {
    if (text.length > 2000) return null;
    const lines: string[] = [];
    for (const paragraph of text.split('\n')) {
        const wrapped = wrapParagraph(paragraph, measure, width);
        if (!wrapped) return null;
        lines.push(...wrapped);
        if (lines.length > 5) return null;
    }
    return lines;
}

// The fixture's permanently visible controls occupy the lower sightline. Keep captions above them.
export const SUBTITLE_PANEL = { width: 4.8, height: 1.2, x: 0, y: 2.65, z: -6.39 };

/** Repaints only changed cues. Canvas never receives HTML or private diagnostic text. */
export function createSubtitleArtwork(surface: BorrowedVideoSurface, canvas: HTMLCanvasElement) {
    canvas.width = 1600;
    canvas.height = 400;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Subtitle drawing is unavailable.');
    const reader = new TextSubtitleReader(surface);
    let previous: string | undefined;
    let previousStatus = '';
    let status = 'No active text cue.';
    let visible = false;
    return {
        update(): boolean {
            let frame: SubtitleFrame;
            try {
                frame = reader.read();
            } catch {
                frame = { text: '', status: 'Subtitle reading failed. Use the ordinary player.', warning: true };
            }
            if (frame.text === previous && frame.status === previousStatus) return false;
            previous = frame.text;
            previousStatus = frame.status;
            status = frame.status;
            visible = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (!frame.text && !frame.warning) return true;
            context.font = '50px "Noto Sans", sans-serif';
            let lines = wrapSubtitle(frame.warning ? frame.status : frame.text, value => context.measureText(value).width, 1480);
            if (!lines) {
                status = 'Subtitle exceeds the comparison panel. Use the ordinary player.';
                lines = ['Subtitle layout unavailable.', 'Return to the ordinary player.'];
            }
            context.fillStyle = '#0B0F14';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#F2F4F7';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            for (let index = 0; index < lines.length; index++) {
                context.fillText(lines[index], 800, 200 + (index - (lines.length - 1) / 2) * 64);
            }
            visible = true;
            return true;
        },
        isVisible: () => visible,
        readStatus: () => status
    };
}
