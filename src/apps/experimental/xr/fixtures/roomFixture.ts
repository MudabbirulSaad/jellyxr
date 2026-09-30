import { SCREEN_FRAME } from './screenFixture';
import { overlapsBox } from './boxGeometry';

import chairCollision from '../assets/observatory/observatory-chair-collision.json';

export type Point3 = readonly [number, number, number];

export interface FixtureBox {
    id: string;
    size: Point3;
    position: Point3;
    pitch?: number;
    material: 'graphite' | 'surface' | 'metal' | 'warm' | 'screen';
    collision: 'static' | 'dynamic' | 'none';
}

export type CollisionSource = () => readonly FixtureBox[];

export const FIXTURE_REMOTE: Point3 = [0.35, 1, -1.2];
export const REMOTE_SIZE: Point3 = [0.08, 0.035, 0.19];

const seat = (id: string, x: number, z: number): FixtureBox[] => chairCollision.boxes.map(box => ({
    id: `${id}-${box.id}`, size: box.size as unknown as Point3,
    position: [x + box.position[0], box.position[1], z + box.position[2]],
    material: 'surface', collision: 'static'
}));

/** Original comparison geometry, in metres: right-handed, +Y up, forward -Z. */
export const ROOM_FIXTURE: readonly FixtureBox[] = [
    { id: 'floor', size: [12, 0.2, 14], position: [0, -0.1, 0], material: 'graphite', collision: 'static' },
    { id: 'ceiling', size: [12, 0.2, 14], position: [0, 4.1, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-left', size: [0.2, 4, 14], position: [-6, 2, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-right', size: [0.2, 4, 14], position: [6, 2, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-front', size: [12, 4, 0.2], position: [0, 2, -7], material: 'graphite', collision: 'static' },
    { id: 'wall-back', size: [12, 4, 0.2], position: [0, 2, 7], material: 'graphite', collision: 'static' },
    { id: 'screen', size: [SCREEN_FRAME.width, SCREEN_FRAME.height, SCREEN_FRAME.depth], position: [SCREEN_FRAME.x, SCREEN_FRAME.y, SCREEN_FRAME.z], material: 'screen', collision: 'static' },
    { id: 'library-plinth', size: [8, 0.35, 0.45], position: [0, 0.175, 5.2], material: 'metal', collision: 'static' },
    { id: 'light-left', size: [0.035, 0.035, 10], position: [-4.5, 3.8, 0], material: 'warm', collision: 'none' },
    { id: 'light-right', size: [0.035, 0.035, 10], position: [4.5, 3.8, 0], material: 'warm', collision: 'none' },
    ...seat('seat-left', -1.25, 1.5),
    ...seat('seat-right', 1.25, 1.5),
    { id: 'remote-stand', size: [0.32, 0.7, 0.32], position: [0.35, 0.35, -1.2], material: 'surface', collision: 'static' },
    { id: 'remote', size: REMOTE_SIZE, position: FIXTURE_REMOTE, material: 'metal', collision: 'dynamic' }
];

export const FIXTURE_SEAT: Point3 = [0, 0, 0];
export const FIXTURE_LIBRARY: Point3 = [0, 0, 6.2];

/** Footprint clearance only; actual tracked-space and mesh queries are candidate experiments. */
export function isFixtureDestinationClear(point: Point3, boxes = ROOM_FIXTURE): boolean {
    const [x, y, z] = point;
    const clearance = 0.35;
    if (!point.every(Number.isFinite) || Math.abs(y) > 0.02
        || Math.abs(x) > 5.5 || Math.abs(z) > 6.5) return false;

    return !boxes.some(box => {
        if (box.collision !== 'static' || box.id === 'floor' || box.id === 'ceiling') return false;
        return overlapsBox([x, 0.9, z], [clearance, 0.9, clearance], box);
    });
}
