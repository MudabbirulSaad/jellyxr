import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import { CONTROL_TARGETS } from './controlTargets';
import { controlVisualState, drawControl } from './controlArtwork';
import type { ActivationState } from './activationState';

export function createBabylonControls(scene: Scene, activation: ActivationState) {
    const controls = CONTROL_TARGETS.map(target => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 192;
        drawControl(target, 'idle', canvas);
        const texture = new DynamicTexture(target.id, canvas, scene, false);
        texture.update();
        const material = new StandardMaterial(target.id, scene);
        material.disableLighting = true;
        material.emissiveTexture = texture;
        material.backFaceCulling = true;
        const mesh = createBabylonPanel(target.id, target.width, target.height, scene);
        mesh.position.set(...target.position);
        mesh.material = material;
        return { target, canvas, texture, material, mesh, state: 'idle' };
    });
    return {
        update() {
            const input = activation.read();
            for (const control of controls) {
                const state = controlVisualState(control.target, input);
                if (state === control.state) continue;
                drawControl(control.target, state, control.canvas);
                control.texture.update();
                control.state = state;
            }
        },
        dispose() {
            for (const control of controls) {
                control.mesh.dispose();
                control.material.dispose();
                control.texture.dispose();
            }
        }
    };
}
