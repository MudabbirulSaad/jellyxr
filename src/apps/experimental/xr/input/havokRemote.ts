/* eslint new-cap: ["error", { "capIsNewExceptions": ["Vector3.Zero", "Quaternion.Identity"] }] */
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PhysicsMotionType, PhysicsPrestepType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import type { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import type { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import type { HavokPhysicsWithBindings } from '@babylonjs/havok';

import { FIXTURE_REMOTE, type CollisionSource } from '../fixtures/roomFixture';

import { remoteHalfBounds, RemoteGrab } from './remoteGrab';
import { createHavokActivity } from './havokActivity';

export function createHavokRemote(remote: PhysicsAggregate, plugin: HavokPlugin, havok: HavokPhysicsWithBindings, collisions?: CollisionSource) {
    const activity = createHavokActivity(remote.body, havok);
    let heldRotation = Quaternion.Identity();
    const rotation = () => remote.transformNode.rotationQuaternion || Quaternion.Identity();
    const stop = () => {
        remote.body.setLinearVelocity(Vector3.Zero());
        remote.body.setAngularVelocity(Vector3.Zero());
    };
    const grab = new RemoteGrab({
        read() {
            const p = remote.transformNode.position;
            const q = rotation();
            return { position: [p.x, p.y, p.z], half: remoteHalfBounds([q.x, q.y, q.z, q.w]) };
        },
        hold() {
            heldRotation = rotation().clone();
            stop();
            remote.body.setMotionType(PhysicsMotionType.ANIMATED);
            activity.wake();
        },
        move(p) {
            remote.body.setTargetTransform(new Vector3(...p), heldRotation);
        },
        release() {
            remote.body.setMotionType(PhysicsMotionType.DYNAMIC);
            stop();
            activity.wake();
        }
    }, collisions);
    return {
        grab,
        awake: () => !!grab.source() || activity.awake(),
        wake: activity.wake,
        recall() {
            grab.release();
            const previous = remote.body.getPrestepType();
            // Havok ignores setPhysicsBodyTransformation when pre-step is disabled (its default).
            remote.body.setPrestepType(PhysicsPrestepType.TELEPORT);
            try {
                remote.transformNode.position.set(...FIXTURE_REMOTE);
                remote.transformNode.rotationQuaternion = Quaternion.Identity();
                plugin.setPhysicsBodyTransformation(remote.body, remote.transformNode);
            } finally {
                remote.body.setPrestepType(previous);
            }
            stop();
            activity.wake();
        }
    };
}
