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
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import RAPIER from '@dimforge/rapier3d-compat';
import { describe, expect, it } from 'vitest';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';

import { ROOM_FIXTURE, type Point3 } from '../fixtures/roomFixture';

import { createHavokRemote } from './havokRemote';
import { createRapierRemote } from './rapierRemote';
import type { RemoteGrab } from './remoteGrab';

function exercise(remote: { grab: RemoteGrab; recall(): void }, position: () => Point3, step: () => void) {
    const advance = (frames: number) => {
        for (let i = 0; i < frames; i++) {
            remote.grab.step(1 / 72);
            step();
        }
    };
    advance(144);
    expect(position()[1]).toBeGreaterThan(0.70);
    expect(position()[1]).toBeLessThan(0.74);
    expect(remote.grab.begin('fixture-controller', position())).toBe(true);
    remote.grab.update('fixture-controller', [20, 1.2, -1.2]);
    advance(240);
    expect(position()[0]).toBeGreaterThan(5);
    expect(position()[0]).toBeLessThan(5.87);
    remote.grab.release();
    advance(144);
    expect(position()[1]).toBeLessThan(0.1);
    remote.recall();
    advance(144);
    expect(position()[0]).toBeCloseTo(0.35, 1);
    expect(position()[1]).toBeGreaterThan(0.70);
    expect(position()[1]).toBeLessThan(0.74);
}

describe('actual comparison physics adapters', () => {
    it('runs Havok hold, swept wall stop, release and recall without a renderer or headset', async () => {
        const bytes = await readFile('node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
        const wasmBinary = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(wasmBinary).set(bytes);
        const havok = await HavokPhysics({ wasmBinary });
        const engine = new NullEngine();
        const scene = new Scene(engine);
        const plugin = new HavokPlugin(true, havok);
        scene.enablePhysics(new Vector3(0, -9.81, 0), plugin);
        scene.physicsEnabled = false;
        const aggregates = ROOM_FIXTURE.filter(box => box.collision !== 'none').map(box => {
            const mesh = CreateBox(box.id, { width: box.size[0], height: box.size[1], depth: box.size[2] }, scene);
            mesh.position.set(...box.position);
            return new PhysicsAggregate(mesh, PhysicsShapeType.BOX, {
                mass: box.collision === 'dynamic' ? 0.18 : 0, friction: 0.6, restitution: 0.1
            }, scene);
        });
        const aggregate = aggregates.find(value => value.transformNode.name === 'remote')!;
        const remote = createHavokRemote(aggregate, plugin);
        try {
            exercise(remote, () => {
                const p = aggregate.transformNode.position;
                return [p.x, p.y, p.z];
            }, () => plugin.executeStep(1 / 72, aggregates.map(value => value.body)));
        } finally {
            remote.grab.release();
            aggregates.forEach(value => {
                value.dispose();
            });
            scene.dispose();
            engine.dispose();
        }
    });

    it('runs Rapier hold, swept wall stop, release and recall with the same fixtures', async () => {
        await RAPIER.init();
        const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
        world.timestep = 1 / 72;
        let body: RAPIER.RigidBody | undefined;
        for (const box of ROOM_FIXTURE) {
            if (box.collision === 'none') continue;
            const dynamic = box.collision === 'dynamic';
            const descriptor = dynamic ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
            descriptor.setTranslation(...box.position).setCcdEnabled(dynamic);
            if (dynamic) descriptor.setLinearDamping(0.5).setAngularDamping(0.5);
            const rigidBody = world.createRigidBody(descriptor);
            const collider = RAPIER.ColliderDesc.cuboid(...box.size.map(v => v / 2) as [number, number, number])
                .setFriction(0.6).setRestitution(0.1);
            if (dynamic) collider.setMass(0.18);
            world.createCollider(collider, rigidBody);
            if (dynamic) body = rigidBody;
        }
        const remote = createRapierRemote(body)!;
        try {
            exercise(remote, () => {
                const p = body!.translation();
                return [p.x, p.y, p.z];
            }, () => world.step());
        } finally {
            remote.grab.release();
            world.free();
        }
    });
});
