import { describe, expect, it, vi } from 'vitest';

import { ComparisonInput } from './comparisonInput';
import { bindDesktopPointer } from './desktopPointer';

describe('desktop comparison pointer wiring', () => {
    it('maps canvas-local coordinates, commits once, and detaches its event listeners', () => {
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 50, width: 400, height: 200 } as DOMRect);
        const action = vi.fn();
        const input = new ComparisonInput(action);
        const ray = vi.fn(() => ({ origin: [-0.3, 1.18, 0] as const, direction: [0, 0, -1] as const }));
        const unbind = bindDesktopPointer(canvas, input, ray);
        const dispatch = (type: string) => canvas.dispatchEvent(new MouseEvent(type, { clientX: 200, clientY: 100, button: 0 }));
        dispatch('pointerdown');
        dispatch('pointerup');
        expect(ray).toHaveBeenCalledWith(0.25, 0.25);
        expect(action).toHaveBeenCalledExactlyOnceWith('select-fixture');
        unbind();
        dispatch('pointerdown');
        dispatch('pointerup');
        expect(action).toHaveBeenCalledTimes(1);
        input.dispose();
    });

    it('cancels a held keyboard action on blur and a held pointer on leaving the canvas', () => {
        const canvas = document.createElement('canvas');
        const action = vi.fn();
        const input = new ComparisonInput(action);
        const unbind = bindDesktopPointer(canvas, input, () => ({ origin: [-0.3, 1.18, 0], direction: [0, 0, -1] }));
        canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        canvas.dispatchEvent(new Event('blur'));
        canvas.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
        canvas.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
        canvas.dispatchEvent(new Event('pointerleave'));
        canvas.dispatchEvent(new MouseEvent('pointerup', { button: 0 }));
        expect(action).not.toHaveBeenCalled();
        unbind();
        input.dispose();
    });
});
