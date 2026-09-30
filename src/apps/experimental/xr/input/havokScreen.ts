/* eslint new-cap: ["error", { "capIsNewExceptions": ["Vector3.Zero", "Quaternion.Identity"] }] */
import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { PhysicsPrestepType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { PhysicsShapeBox } from '@babylonjs/core/Physics/v2/physicsShape';
import type { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import type { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';

import type { FixtureBox } from '../fixtures/roomFixture';
import { SCREEN_FRAME } from '../fixtures/screenFixture';

/** Aggregate retains ownership of the replacement shape and the same fixed body. */
export function createHavokScreen(screen: PhysicsAggregate, plugin: HavokPlugin) {
    return (box: FixtureBox): void => {
        const node = screen.transformNode;
        const oldPosition = node.position.clone();
        const oldRotation = node.rotationQuaternion;
        const previous = screen.body.getPrestepType();
        const oldShape = screen.shape;
        const shape = new PhysicsShapeBox(Vector3.Zero(), Quaternion.Identity(), new Vector3(...box.size), node.getScene());
        shape.material = screen.material;
        const pitch = box.pitch || 0;
        screen.body.setPrestepType(PhysicsPrestepType.TELEPORT);
        try {
            screen.body.shape = shape;
            node.position.set(...box.position);
            node.rotationQuaternion = new Quaternion(Math.sin(pitch / 2), 0, 0, Math.cos(pitch / 2));
            plugin.setPhysicsBodyTransformation(screen.body, node);
        } catch (error) {
            screen.body.shape = oldShape;
            node.position.copyFrom(oldPosition);
            node.rotationQuaternion = oldRotation;
            plugin.setPhysicsBodyTransformation(screen.body, node);
            shape.dispose();
            throw error;
        } finally {
            screen.body.setPrestepType(previous);
        }
        screen.shape = shape;
        node.scaling.set(box.size[0] / SCREEN_FRAME.width, box.size[1] / SCREEN_FRAME.height, 1);
        oldShape.dispose();
    };
}
