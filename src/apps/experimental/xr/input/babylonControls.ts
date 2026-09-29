import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

import { createBabylonPanel } from '../candidates/babylonPanel';

import { CONTROL_TARGETS } from './controlTargets';
import { controlVisualState, drawControl } from './controlArtwork';
import type { ActivationState } from './activationState';
import type { ControlLayout } from './controlLayout';
import type { FloorSelection } from './floorSelection';
import { drawFloorAim } from './floorArtwork';

export function createBabylonControls(scene: Scene, activation: ActivationState, layout: ControlLayout, floor: FloorSelection) {
    const root = new TransformNode('control-anchor', scene);
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
        mesh.parent = root;
        mesh.material = material;
        return { target, canvas, texture, material, mesh, state: 'idle' };
    });
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = floorCanvas.height = 512;
    const floorTexture = new DynamicTexture('floor-aim', floorCanvas, scene, false);
    floorTexture.hasAlpha = true;
    const floorMaterial = new StandardMaterial('floor-aim', scene);
    floorMaterial.disableLighting = true;
    floorMaterial.emissiveTexture = floorTexture;
    floorMaterial.opacityTexture = floorTexture;
    const floorMesh = createBabylonPanel('floor-aim', 0.7, 0.7, scene);
    floorMesh.material = floorMaterial;
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.setEnabled(false);
    let floorValid: boolean | undefined;
    return {
        update() {
            const aim = floor.read();
            floorMesh.setEnabled(floor.isActive() && !!aim.point);
            if (aim.point) floorMesh.position.set(aim.point[0], 0.012, aim.point[2]);
            if (floorValid !== aim.valid) {
                drawFloorAim(floorCanvas, aim.valid);
                floorTexture.update();
                floorValid = aim.valid;
            }

            const anchor = layout.read();
            root.position.set(...anchor.origin);
            root.rotation.y = anchor.yaw;
            const input = activation.read();
            for (const control of controls) {
                const target = layout.targets(floor.isActive()).find(value => value.id === control.target.id);
                control.mesh.setEnabled(!!target);
                if (target) control.mesh.position.set(...target.position);
                const state = controlVisualState(control.target, input);
                const hint = control.target.id === 'cancel-floor' && floor.isActive() ? floor.hint() : undefined;
                const key = `${state}:${hint || ''}`;
                if (key === control.state) continue;
                drawControl(control.target, state, control.canvas, hint);
                control.texture.update();
                control.state = key;
            }
        },
        dispose() {
            floorMesh.dispose();
            floorMaterial.dispose();
            floorTexture.dispose();
            for (const control of controls) {
                control.mesh.dispose();
                control.material.dispose();
                control.texture.dispose();
            }
            root.dispose();
        }
    };
}
