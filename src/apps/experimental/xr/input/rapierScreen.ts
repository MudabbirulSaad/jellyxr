import type RAPIER from '@dimforge/rapier3d-compat';
import type { Object3D } from 'three';

import type { FixtureBox } from '../fixtures/roomFixture';
import { SCREEN_FRAME } from '../fixtures/screenFixture';

/** Update the retained fixed body and visible backing together; no extra collider is left behind. */
export function createRapierScreen(mesh: Object3D, body: RAPIER.RigidBody, collider: RAPIER.Collider) {
    return (box: FixtureBox): void => {
        const position = body.translation();
        const rotation = body.rotation();
        const half = collider.halfExtents();
        if (!half) throw new Error('The screen requires a box collider.');
        const [x, y, z] = box.position;
        const pitch = box.pitch || 0;
        try {
            collider.setHalfExtents({ x: box.size[0] / 2, y: box.size[1] / 2, z: box.size[2] / 2 });
            body.setTranslation({ x, y, z }, true);
            body.setRotation({ x: Math.sin(pitch / 2), y: 0, z: 0, w: Math.cos(pitch / 2) }, true);
        } catch (error) {
            collider.setHalfExtents(half);
            body.setTranslation(position, true);
            body.setRotation(rotation, true);
            throw error;
        }
        mesh.position.set(x, y, z);
        mesh.rotation.set(pitch, 0, 0);
        mesh.scale.set(box.size[0] / SCREEN_FRAME.width, box.size[1] / SCREEN_FRAME.height, 1);
    };
}
