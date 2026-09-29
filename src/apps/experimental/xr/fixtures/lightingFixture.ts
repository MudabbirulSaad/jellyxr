import type { Point3 } from './roomFixture';

/** Static comparison fill only. Directions point from the surface towards each source. */
export const COMPARISON_LIGHTS: readonly { id: string; towardSource: Point3; colour: string; intensity: number }[] = [
    { id: 'warm-key', towardSource: [1, 1, 1], colour: '#FFECD1', intensity: 2 },
    { id: 'upper-fill', towardSource: [-1, 1, -1], colour: '#FFFFFF', intensity: 1.5 },
    { id: 'lower-left-fill', towardSource: [-1, -1, 1], colour: '#FFFFFF', intensity: 0.75 },
    { id: 'lower-right-fill', towardSource: [1, -1, -1], colour: '#FFFFFF', intensity: 0.75 }
];
