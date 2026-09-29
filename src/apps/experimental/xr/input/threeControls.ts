import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import { CONTROL_TARGETS } from './controlTargets';
import { controlVisualState, drawControl } from './controlArtwork';
import type { ActivationState } from './activationState';
import type { ControlLayout } from './controlLayout';
import type { FloorSelection } from './floorSelection';
import { drawFloorAim } from './floorArtwork';

export function createThreeControls(scene: Scene, activation: ActivationState, layout: ControlLayout, floor: FloorSelection) {
    const root = new Group();
    scene.add(root);
    const controls = CONTROL_TARGETS.map(target => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 192;
        drawControl(target, 'idle', canvas);
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
        const mesh = new Mesh(new PlaneGeometry(target.width, target.height), material);
        mesh.position.set(...target.position);
        root.add(mesh);
        return { target, canvas, texture, material, mesh, state: 'idle' };
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
            const input = activation.read();
            for (const control of controls) {
                const target = layout.targets(floor.isActive()).find(value => value.id === control.target.id);
                control.mesh.visible = !!target;
                if (target) control.mesh.position.set(...target.position);
                const state = controlVisualState(control.target, input);
                const hint = control.target.id === 'cancel-floor' && floor.isActive() ? floor.hint() : undefined;
                const key = `${state}:${hint || ''}`;
                if (key === control.state) continue;
                drawControl(control.target, state, control.canvas, hint);
                control.texture.needsUpdate = true;
                control.state = key;
            }
        },
        dispose() {
            scene.remove(floorMesh);
            floorMesh.geometry.dispose();
            floorMaterial.dispose();
            floorTexture.dispose();
            for (const control of controls) {
                root.remove(control.mesh);
                control.mesh.geometry.dispose();
                control.material.dispose();
                control.texture.dispose();
            }
            scene.remove(root);
        }
    };
}
