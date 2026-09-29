import type { ComparisonInput } from './comparisonInput';
import type { InputRay } from './controlTargets';

export function bindDesktopPointer(
    canvas: HTMLCanvasElement, input: ComparisonInput, createRay: (x: number, y: number) => InputRay
): () => void {
    const ray = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return createRay((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    };
    const move = (event: PointerEvent) => input.pointer('move', ray(event));
    const down = (event: PointerEvent) => {
        if (event.button === 0) input.pointer('down', ray(event));
    };
    const up = (event: PointerEvent) => {
        if (event.button === 0) input.pointer('up', ray(event));
    };
    const cancel = () => input.pointer('cancel', null);
    const key = (event: KeyboardEvent) => {
        if (!['Enter', ' ', 'Escape', 'Home', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        if (!event.repeat) input.key(event.type === 'keydown' ? 'down' : 'up', event.key);
    };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', cancel);
    canvas.addEventListener('pointerleave', cancel);
    canvas.addEventListener('keydown', key);
    canvas.addEventListener('keyup', key);
    canvas.addEventListener('blur', cancel);
    window.addEventListener('blur', cancel);
    return () => {
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerdown', down);
        canvas.removeEventListener('pointerup', up);
        canvas.removeEventListener('pointercancel', cancel);
        canvas.removeEventListener('pointerleave', cancel);
        canvas.removeEventListener('keydown', key);
        canvas.removeEventListener('keyup', key);
        canvas.removeEventListener('blur', cancel);
        window.removeEventListener('blur', cancel);
    };
}
