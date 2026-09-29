/* eslint new-cap: ["error", { "capIsNewExceptions": ["CreateCylinder", "CreateSphere", "CreateBox", "Color3.FromHexString", "Quaternion.FromUnitVectorsToRef"] }] */
import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';

import type { ComparisonInput } from './comparisonInput';

export function createBabylonPointing(scene: Scene, input: ComparisonInput) {
    const root = new TransformNode('input-feedback', scene);
    root.setEnabled(false);
    const material = new StandardMaterial('input-feedback', scene);
    material.disableLighting = true;
    material.disableDepthWrite = true;
    material.diffuseColor = new Color3(0, 0, 0);
    material.specularColor = new Color3(0, 0, 0);
    const beam = CreateCylinder('input-ray', { diameter: 0.004, height: 1, tessellation: 6 }, scene);
    const dot = CreateSphere('input-point', { diameter: 0.016, segments: 6 }, scene);
    const cross = [0, 1].map(index => CreateBox(`input-blocked-${index}`, { width: 0.032, height: 0.003, depth: 0.003 }, scene));
    cross[1].rotation.z = Math.PI / 2;
    const marker = new TransformNode('input-marker', scene);
    beam.parent = marker.parent = root;
    for (const mesh of [dot, ...cross]) mesh.parent = marker;
    for (const mesh of [beam, dot, ...cross]) {
        mesh.material = material;
        mesh.metadata = { jellyxrInputFeedback: true };
    }
    beam.rotationQuaternion = new Quaternion();
    marker.rotationQuaternion = new Quaternion();
    const direction = new Vector3();
    const opposite = new Vector3();
    const up = new Vector3(0, 1, 0);
    const front = new Vector3(0, 0, 1);
    const neutral = Color3.FromHexString('#A7B0BC').toLinearSpace(true);
    const focused = Color3.FromHexString('#D7B67A').toLinearSpace(true);
    return {
        update() {
            const aim = input.readPointing();
            root.setEnabled(!!aim);
            if (!aim) return;
            direction.set(aim.point[0] - aim.ray.origin[0], aim.point[1] - aim.ray.origin[1], aim.point[2] - aim.ray.origin[2]);
            const length = direction.length();
            beam.setEnabled(!aim.near && length > 0.01);
            if (length > 0.00001) {
                direction.normalize();
                Quaternion.FromUnitVectorsToRef(up, direction, beam.rotationQuaternion!);
                direction.negateToRef(opposite);
                Quaternion.FromUnitVectorsToRef(front, opposite, marker.rotationQuaternion!);
            }
            beam.scaling.y = length;
            beam.position.set((aim.ray.origin[0] + aim.point[0]) / 2, (aim.ray.origin[1] + aim.point[1]) / 2,
                (aim.ray.origin[2] + aim.point[2]) / 2);
            marker.position.set(...aim.point);
            material.emissiveColor.copyFrom(aim.action && aim.action !== 'summon-controls' ? focused : neutral);
            dot.setEnabled(!aim.blocked);
            dot.scaling.setAll(aim.pressed ? 1.5 : 1);
            for (const mesh of cross) mesh.setEnabled(aim.blocked);
        },
        dispose() {
            root.dispose();
            material.dispose();
        }
    };
}
