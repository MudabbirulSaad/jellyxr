import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import { CONTROL_TARGETS } from './controlTargets';
import { controlVisualState, drawControl } from './controlArtwork';
import type { ActivationState } from './activationState';
import type { ControlLayout } from './controlLayout';

export function createThreeControls(scene: Scene, activation: ActivationState, layout: ControlLayout) {
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
    return {
        update() {
            const anchor = layout.read();
            root.position.set(...anchor.origin);
            root.rotation.y = anchor.yaw;
            const input = activation.read();
            for (const control of controls) {
                const target = layout.targets().find(value => value.id === control.target.id);
                control.mesh.visible = !!target;
                if (target) control.mesh.position.set(...target.position);
                const state = controlVisualState(control.target, input);
                if (state === control.state) continue;
                drawControl(control.target, state, control.canvas);
                control.texture.needsUpdate = true;
                control.state = state;
            }
        },
        dispose() {
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
