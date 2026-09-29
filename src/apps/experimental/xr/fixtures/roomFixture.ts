export type Point3 = readonly [number, number, number];

export interface FixtureBox {
    id: string;
    size: Point3;
    position: Point3;
    material: 'graphite' | 'surface' | 'metal' | 'warm' | 'screen';
    collision: 'static' | 'dynamic' | 'none';
}

export const FIXTURE_REMOTE: Point3 = [0.35, 1, -1.2];

const seat = (id: string, x: number, z: number): FixtureBox[] => [
    {
        id: `${id}-base`, size: [0.72, 0.45, 0.72], position: [x, 0.225, z],
        material: 'surface', collision: 'static'
    },
    {
        id: `${id}-back`, size: [0.72, 0.9, 0.12], position: [x, 0.9, z + 0.3],
        material: 'surface', collision: 'static'
    }
];

/** Original comparison geometry, in metres: right-handed, +Y up, forward -Z. */
export const ROOM_FIXTURE: readonly FixtureBox[] = [
    { id: 'floor', size: [12, 0.2, 14], position: [0, -0.1, 0], material: 'graphite', collision: 'static' },
    { id: 'ceiling', size: [12, 0.2, 14], position: [0, 4.1, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-left', size: [0.2, 4, 14], position: [-6, 2, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-right', size: [0.2, 4, 14], position: [6, 2, 0], material: 'graphite', collision: 'static' },
    { id: 'wall-front', size: [12, 4, 0.2], position: [0, 2, -7], material: 'graphite', collision: 'static' },
    { id: 'wall-back', size: [12, 4, 0.2], position: [0, 2, 7], material: 'graphite', collision: 'static' },
    { id: 'screen', size: [6.4, 3.6, 0.04], position: [0, 2, -6.5], material: 'screen', collision: 'static' },
    { id: 'library-plinth', size: [8, 0.35, 0.45], position: [0, 0.175, 5.2], material: 'metal', collision: 'static' },
    { id: 'light-left', size: [0.035, 0.035, 10], position: [-4.5, 3.8, 0], material: 'warm', collision: 'none' },
    { id: 'light-right', size: [0.035, 0.035, 10], position: [4.5, 3.8, 0], material: 'warm', collision: 'none' },
    ...seat('seat-left', -1.25, 1.5),
    ...seat('seat-right', 1.25, 1.5),
    { id: 'remote', size: [0.08, 0.035, 0.19], position: FIXTURE_REMOTE, material: 'metal', collision: 'dynamic' }
];

export const FIXTURE_SEAT: Point3 = [0, 0, 0];
export const FIXTURE_LIBRARY: Point3 = [0, 0, 6.2];

/** Footprint clearance only; actual tracked-space and mesh queries are candidate experiments. */
export function isFixtureDestinationClear(point: Point3): boolean {
    const [x, y, z] = point;
    const clearance = 0.35;
    if (!point.every(Number.isFinite) || Math.abs(y) > 0.02
        || Math.abs(x) > 5.5 || Math.abs(z) > 6.5) return false;

    return !ROOM_FIXTURE.some(box => {
        if (box.collision !== 'static' || box.id === 'floor' || box.id === 'ceiling') return false;
        const [width, height, depth] = box.size;
        const [bx, by, bz] = box.position;
        return by - height / 2 < 1.8
            && Math.abs(x - bx) < width / 2 + clearance
            && Math.abs(z - bz) < depth / 2 + clearance;
    });
}
