// @vitest-environment node
/* eslint new-cap: ["error", { "capIsNewExceptions": ["HavokPhysics", "CreateBox"] }] */
import { readFile } from 'node:fs/promises';

import HavokPhysics from '@babylonjs/havok';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { PhysicsRaycastResult } from '@babylonjs/core/Physics/physicsRaycastResult';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import RAPIER from '@dimforge/rapier3d-compat';
import { Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';

import { screenBox } from '../fixtures/screenFixture';
import { boxRayDistance } from '../fixtures/boxGeometry';
import type { FixtureBox, Point3 } from '../fixtures/roomFixture';

import { createHavokScreen } from './havokScreen';
import { createRapierScreen } from './rapierScreen';

/** Compare real WASM ray hits to shared oriented proxies, including old-position misses. */
function exercise(place: (box: FixtureBox) => void, ray: (origin: Point3) => number | null) {
    const poses = [screenBox(), screenBox(60, { distance: 4.5, height: 1.5, tilt: 15 }),
        screenBox(80, { distance: 5, height: 2.2, tilt: -10 }), screenBox()];
    for (const box of poses) {
        place(box);
        for (const origin of [[0, box.position[1], 0], [0, box.position[1] + 0.5, 0], [3, 2, 0], [0, box.position[1], -5.9]] as const) {
            const expected = boxRayDistance(origin, [0, 0, -1], box);
            const actual = ray(origin);
            if (expected === null) expect(actual).toBeNull();
            else expect(actual).toBeCloseTo(expected, 3);
        }
    }
}

describe('actual fixed screen physics adapters', () => {
    it('moves, rotates, shrinks and resets the retained Havok body with no old collision shape', async () => {
        const bytes = await readFile('node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
        const wasmBinary = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(wasmBinary).set(bytes);
        const havok = await HavokPhysics({ wasmBinary });
        const engine = new NullEngine();
        const scene = new Scene(engine);
        scene.useRightHandedSystem = true;
        const plugin = new HavokPlugin(true, havok);
        scene.enablePhysics(new Vector3(0, 0, 0), plugin);
        scene.physicsEnabled = false;
        const initial = screenBox();
        const mesh = CreateBox('screen', { width: initial.size[0], height: initial.size[1], depth: initial.size[2] }, scene);
        mesh.position.set(...initial.position);
        const aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0, friction: 0.6, restitution: 0.1 }, scene);
        const body = aggregate.body;
        const place = createHavokScreen(aggregate, plugin);
        try {
            exercise(box => {
                place(box);
                plugin.executeStep(1 / 72, [body]);
                expect(aggregate.body).toBe(body);
                expect(mesh.position.asArray()).toEqual(box.position);
                expect(mesh.scaling.x).toBeCloseTo(box.size[0] / initial.size[0]);
            }, origin => {
                const result = new PhysicsRaycastResult();
                plugin.raycast(new Vector3(...origin), new Vector3(origin[0], origin[1], -10), result);
                return result.hasHit ? result.hitDistance : null;
            });
        } finally {
            aggregate.dispose();
            scene.dispose();
            engine.dispose();
        }
    });

    it('moves, rotates, shrinks and resets the retained Rapier body and collider', async () => {
        await RAPIER.init();
        const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
        const initial = screenBox();
        const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(...initial.position));
        const collider = world.createCollider(RAPIER.ColliderDesc.cuboid(initial.size[0] / 2, initial.size[1] / 2, initial.size[2] / 2), body);
        const mesh = new Object3D();
        const place = createRapierScreen(mesh, body, collider);
        try {
            exercise(box => {
                place(box);
                world.step();
                expect(world.bodies.len()).toBe(1);
                expect(world.colliders.len()).toBe(1);
                expect(mesh.position.toArray()).toEqual(box.position);
                expect(mesh.rotation.x).toBeCloseTo(box.pitch || 0);
                expect(mesh.scale.y).toBeCloseTo(box.size[1] / initial.size[1]);
            }, origin => {
                const hit = world.castRay(new RAPIER.Ray({ x: origin[0], y: origin[1], z: origin[2] }, { x: 0, y: 0, z: -1 }), 20, true);
                return hit?.timeOfImpact ?? null;
            });
        } finally {
            world.free();
        }
    });
});
