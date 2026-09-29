/* eslint new-cap: ["error", { "capIsNewExceptions": ["CreateBox"] }] */
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene as BabylonScene } from '@babylonjs/core/scene';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Scene } from 'three';
import { describe, expect, it } from 'vitest';

import { createBabylonSceneQuery } from './babylonSceneQuery';
import { createThreeSceneQuery } from './threeSceneQuery';
import type { InputRay } from './controlTargets';

describe('candidate visible-surface queries', () => {
    it('uses moved mesh geometry, ignores hidden/transparent/feedback surfaces, and respects range in both engines', () => {
        const engine = new NullEngine();
        const a = new BabylonScene(engine);
        a.useRightHandedSystem = true;
        const parentA = new TransformNode('fixture-parent', a);
        const boxA = CreateBox('blocker', { size: 1 }, a);
        boxA.parent = parentA;
        const materialA = new StandardMaterial('opaque', a);
        boxA.material = materialA;
        const b = new Scene();
        const parentB = new Group();
        const boxB = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
        parentB.add(boxB);
        b.add(parentB);
        const ray: InputRay = { origin: [0, 0, 0], direction: [0, 0, -1] };
        const queries = [createBabylonSceneQuery(a), createThreeSceneQuery(b)];
        const check = (distance: number | null, limit = 10) => {
            for (const query of queries) {
                const hit = query(ray, limit);
                if (distance === null) expect(hit).toBeNull();
                else expect(hit).toBeCloseTo(distance);
            }
        };
        try {
            boxA.position.z = boxB.position.z = -2;
            check(1.5);
            // No render is needed between movement and a native select event.
            boxA.position.z = boxB.position.z = -4;
            check(3.5);
            check(null, 3);
            boxA.isVisible = boxB.visible = false;
            check(null);
            boxA.isVisible = boxB.visible = true;
            parentA.setEnabled(false);
            parentB.visible = false;
            check(null);
            parentA.setEnabled(true);
            parentB.visible = true;
            materialA.alpha = 0.5;
            boxB.material.transparent = true;
            check(null);
            materialA.alpha = 1;
            boxB.material.transparent = false;
            for (const flag of ['jellyxrInputFeedback', 'jellyxrControl']) {
                boxA.metadata = boxB.userData = { [flag]: true };
                check(null);
            }
            boxA.metadata = boxB.userData = {};
            check(3.5);
        } finally {
            a.dispose();
            engine.dispose();
            boxB.geometry.dispose();
            boxB.material.dispose();
        }
    });
});
