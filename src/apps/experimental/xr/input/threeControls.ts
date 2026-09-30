import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import { controlCanvasSize, drawControl } from './controlArtwork';
import { ControlPanels } from './controlPanels';
import type { ActivationState } from './activationState';
import type { ControlLayout } from './controlLayout';
import type { FloorSelection } from './floorSelection';
import { drawFloorAim } from './floorArtwork';

export function createThreeControls(scene: Scene, activation: ActivationState, layout: ControlLayout, floor: FloorSelection) {
    const root = new Group();
    scene.add(root);
    const controls = new ControlPanels(target => {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = controlCanvasSize(target);
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
        const mesh = new Mesh(new PlaneGeometry(target.width, target.height), material);
        mesh.userData.jellyxrControl = true;
        mesh.position.set(...target.position);
        root.add(mesh);
        return {
            paint(value, state, hint) {
                mesh.position.set(...value.position);
                drawControl(value, state, canvas, hint);
                texture.needsUpdate = true;
            },
            dispose() {
                root.remove(mesh);
                mesh.geometry.dispose();
                material.dispose();
                texture.dispose();
            }
        };
    });
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = floorCanvas.height = 512;
    const floorTexture = new CanvasTexture(floorCanvas);
    floorTexture.colorSpace = SRGBColorSpace;
    const floorMaterial = new MeshBasicMaterial({ map: floorTexture, transparent: true, toneMapped: false });
    const floorMesh = new Mesh(new PlaneGeometry(0.7, 0.7), floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.visible = false;
    scene.add(floorMesh);
    let floorValid: boolean | undefined;
    return {
        update() {
            const aim = floor.read();
            floorMesh.visible = floor.isActive() && !!aim.point;
            if (aim.point) floorMesh.position.set(aim.point[0], 0.012, aim.point[2]);
            if (floorValid !== aim.valid) {
                drawFloorAim(floorCanvas, aim.valid);
                floorTexture.needsUpdate = true;
                floorValid = aim.valid;
            }

            const anchor = layout.read();
            root.position.set(...anchor.origin);
            root.rotation.y = anchor.yaw;
            controls.update(layout.targets(floor.isActive()), activation.read(), floor.isActive() ? floor.hint() : undefined);
        },
        dispose() {
            scene.remove(floorMesh);
            floorMesh.geometry.dispose();
            floorMaterial.dispose();
            floorTexture.dispose();
            controls.dispose();
            scene.remove(root);
        }
    };
}
