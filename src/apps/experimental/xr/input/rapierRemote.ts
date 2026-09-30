import { RigidBodyType, type RigidBody } from '@dimforge/rapier3d-compat';

import { FIXTURE_REMOTE, type CollisionSource } from '../fixtures/roomFixture';

import { remoteHalfBounds, RemoteGrab } from './remoteGrab';

export function createRapierRemote(body: RigidBody | undefined, collisions?: CollisionSource) {
    if (!body) return undefined;
    let heldRotation = body.rotation();
    const zero = { x: 0, y: 0, z: 0 };
    const stop = () => {
        body.setLinvel(zero, true);
        body.setAngvel(zero, true);
    };
    const grab = new RemoteGrab({
        read() {
            const p = body.translation();
            const q = body.rotation();
            return { position: [p.x, p.y, p.z], half: remoteHalfBounds([q.x, q.y, q.z, q.w]) };
        },
        hold() {
            heldRotation = body.rotation();
            stop();
            body.setBodyType(RigidBodyType.KinematicPositionBased, true);
        },
        move(p) {
            body.setNextKinematicTranslation({ x: p[0], y: p[1], z: p[2] });
            body.setNextKinematicRotation(heldRotation);
        },
        release() {
            body.setBodyType(RigidBodyType.Dynamic, true);
            stop();
        }
    }, collisions);
    return {
        grab,
        recall() {
            grab.release();
            body.setTranslation({ x: FIXTURE_REMOTE[0], y: FIXTURE_REMOTE[1], z: FIXTURE_REMOTE[2] }, true);
            body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
            stop();
        }
    };
}
