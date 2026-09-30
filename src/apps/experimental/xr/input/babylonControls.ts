import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

import { createBabylonPanel } from '../candidates/babylonPanel';
import { createBabylonCanvasTexture } from '../candidates/babylonCanvasTexture';

import { controlCanvasSize, drawControl } from './controlArtwork';
import { ControlPanels } from './controlPanels';
import type { ActivationState } from './activationState';
import type { ControlLayout } from './controlLayout';
import type { FloorSelection } from './floorSelection';
import { drawFloorAim } from './floorArtwork';

export function createBabylonControls(scene: Scene, activation: ActivationState, layout: ControlLayout, floor: FloorSelection) {
    const root = new TransformNode('control-anchor', scene);
    const controls = new ControlPanels(target => {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = controlCanvasSize(target);
        const texture = createBabylonCanvasTexture(target.id, canvas, scene);
        const material = new StandardMaterial(target.id, scene);
        material.disableLighting = true;
        material.emissiveTexture = texture;
        material.backFaceCulling = true;
        const mesh = createBabylonPanel(target.id, target.width, target.height, scene);
        mesh.metadata = { jellyxrControl: true };
        mesh.position.set(...target.position);
        mesh.parent = root;
        mesh.material = material;
        return {
            paint(value, state, hint) {
                mesh.position.set(...value.position);
                drawControl(value, state, canvas, hint);
                texture.update();
            },
            dispose() {
                mesh.dispose();
                material.dispose();
                texture.dispose();
            }
        };
    });
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = floorCanvas.height = 512;
    const floorTexture = createBabylonCanvasTexture('floor-aim', floorCanvas, scene);
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
            controls.update(layout.targets(floor.isActive()), activation.read(), floor.isActive() ? floor.hint() : undefined);
        },
        dispose() {
            floorMesh.dispose();
            floorMaterial.dispose();
            floorTexture.dispose();
            controls.dispose();
            root.dispose();
        }
    };
}
