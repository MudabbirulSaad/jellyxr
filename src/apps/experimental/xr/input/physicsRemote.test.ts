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
import { describe, expect, it, vi } from 'vitest';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';

import { ROOM_FIXTURE, type Point3 } from '../fixtures/roomFixture';
import { PhysicsScheduler, type PhysicsActivity } from '../fixtures/physicsScheduler';

import { createHavokRemote } from './havokRemote';
import { createRapierRemote } from './rapierRemote';
import type { RemoteGrab } from './remoteGrab';
import { createHavokActivity } from './havokActivity';

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
    expect(remote.grab.begin('fixture-controller', position())).toBe(true);
    // Approach an open library compartment from its front, avoiding the chair and top shelf.
    for (const point of [[0.35, 3, -1.2], [2.75, 3, 5.7], [2.75, 1.6, 5.7], [2.75, 1.6, 5.2]] as const) {
        remote.grab.update('fixture-controller', point);
        advance(300);
        point.forEach((value, axis) => {
            expect(position()[axis]).toBeCloseTo(value, 2);
        });
    }
    remote.grab.release();
    advance(144);
    expect(position()[1]).toBeGreaterThan(1.17);
    expect(position()[1]).toBeLessThan(1.19);
    const settled = position();
    advance(144);
    settled.forEach((value, axis) => {
        expect(position()[axis]).toBeCloseTo(value, 3);
    });
}

function exerciseIdle(remote: PhysicsActivity & { grab: RemoteGrab; recall(): void }, position: () => Point3, step: () => void) {
    const scheduler = new PhysicsScheduler(remote);
    let revision = {};
    let time = 0;
    let executed = 0;
    const frame = (suspended = false): number => {
        time += 15; // Exact millisecond interval avoids a floating-point boundary after the long gap.
        return scheduler.advance(time, suspended, revision, seconds => {
            remote.grab.step(seconds);
            step();
            executed++;
        });
    };
    const advance = (frames: number) => {
        for (let i = 0; i < frames; i++) frame();
    };
    const expectIdle = () => {
        advance(720);
        expect(remote.awake()).toBe(false);
        const previous = executed;
        const settled = position();
        advance(144);
        expect(executed).toBe(previous);
        expect(position()).toEqual(settled);
        expect(scheduler.status()).toContain('Idle (native sleep)');
    };
    expectIdle();
    time += 7200000;
    expect(frame()).toBe(0);
    remote.recall();
    expect(remote.awake()).toBe(true);
    expect(frame()).toBe(0); // Start a new time interval, not a two-hour catch-up.
    expect(frame()).toBe(1);
    expectIdle();
    expect(position()[1]).toBeGreaterThan(0.70);
    expect(position()[1]).toBeLessThan(0.74);

    expect(remote.grab.begin('sleep-fixture', position())).toBe(true);
    remote.grab.update('sleep-fixture', [1, 1.3, -1.2]);
    advance(240);
    const heldSteps = executed;
    advance(144);
    expect(executed - heldSteps).toBeGreaterThanOrEqual(144);
    expect(executed - heldSteps).toBeLessThanOrEqual(156);
    expect(position()[1]).toBeCloseTo(1.3, 2);
    remote.grab.release(); // Same adapter release used for lost input.
    expect(remote.awake()).toBe(true);
    const heldPosition = position();
    expect(frame(true)).toBe(0);
    time += 7200000;
    expect(frame()).toBe(0);
    expect(position()).toEqual(heldPosition);
    expect(frame()).toBe(1);
    expectIdle();
    expect(position()[1]).toBeLessThan(0.1);

    revision = {}; // A successful RoomCollision update replaces this identity.
    frame();
    expect(remote.awake()).toBe(true);
    expect(frame()).toBe(1);
    expectIdle();
}

describe('actual comparison physics adapters', () => {
    it('runs Havok hold, wall stop, recall and shelf placement without a renderer or headset', async () => {
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
        const remote = createHavokRemote(aggregate, plugin, havok);
        try {
            const position = (): Point3 => {
                const p = aggregate.transformNode.position;
                return [p.x, p.y, p.z];
            };
            const step = () => plugin.executeStep(1 / 72, aggregates.map(value => value.body));
            exercise(remote, position, step);
            exerciseIdle(remote, position, step);
            expect(createHavokActivity({ _pluginData: null }, havok).awake()).toBe(true);
            const observe = vi.spyOn(havok, 'HP_Body_GetActivationState');
            try {
                observe.mockReturnValueOnce([havok.Result.RESULT_INVALIDHANDLE, havok.ActivationState.INACTIVE]);
                expect(createHavokActivity(aggregate.body, havok).awake()).toBe(true);
                const activity = createHavokActivity(aggregate.body, havok);
                observe.mockImplementationOnce(() => {
                    throw new Error('Technical unavailable query');
                });
                expect(activity.awake()).toBe(true);
                const calls = observe.mock.calls.length;
                expect(activity.awake()).toBe(true);
                expect(observe).toHaveBeenCalledTimes(calls);
                activity.wake(); // A failed query must not disable the independent native wake operation.
            } finally {
                observe.mockRestore();
            }
            expect(createHavokActivity(aggregate.body, havok).awake()).toBe(true);
        } finally {
            remote.grab.release();
            aggregates.forEach(value => {
                value.dispose();
            });
            scene.dispose();
            engine.dispose();
        }
    });

    it('runs Rapier hold, wall stop, recall and shelf placement with the same fixtures', async () => {
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
            const position = (): Point3 => {
                const p = body!.translation();
                return [p.x, p.y, p.z];
            };
            exercise(remote, position, () => world.step());
            exerciseIdle(remote, position, () => world.step());
        } finally {
            remote.grab.release();
            world.free();
        }
    });
});
