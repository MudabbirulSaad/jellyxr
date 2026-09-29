import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Scene } from 'three';

import type { ComparisonInput } from './comparisonInput';

/** World-space geometry uses the same endpoint as hit testing; it never intercepts input. */
export function createThreePointing(scene: Scene, input: ComparisonInput) {
    const root = new Group();
    root.visible = false;
    scene.add(root);
    const material = new MeshBasicMaterial({ color: '#A7B0BC', depthWrite: false, toneMapped: false });
    const beam = new Mesh(new CylinderGeometry(0.002, 0.002, 1, 6), material);
    const dot = new Mesh(new SphereGeometry(0.008, 8, 6), material);
    const bar = new BoxGeometry(0.032, 0.003, 0.003);
    const cross = [new Mesh(bar, material), new Mesh(bar, material)];
    cross[1].rotation.z = Math.PI / 2;
    const marker = new Group();
    marker.add(dot, ...cross);
    root.add(beam, marker);
    for (const mesh of [beam, dot, ...cross]) mesh.userData.jellyxrInputFeedback = true;
    const direction = new Vector3();
    const opposite = new Vector3();
    const up = new Vector3(0, 1, 0);
    const front = new Vector3(0, 0, 1);
    return {
        update() {
            const aim = input.readPointing();
            root.visible = !!aim;
            if (!aim) return;
            direction.set(aim.point[0] - aim.ray.origin[0], aim.point[1] - aim.ray.origin[1], aim.point[2] - aim.ray.origin[2]);
            const length = direction.length();
            beam.visible = !aim.near && length > 0.01;
            if (length > 0.00001) {
                direction.normalize();
                beam.quaternion.setFromUnitVectors(up, direction);
                marker.quaternion.setFromUnitVectors(front, opposite.copy(direction).negate());
            }
            beam.scale.y = length;
            beam.position.set((aim.ray.origin[0] + aim.point[0]) / 2, (aim.ray.origin[1] + aim.point[1]) / 2,
                (aim.ray.origin[2] + aim.point[2]) / 2);
            marker.position.set(...aim.point);
            material.color.set(aim.action && aim.action !== 'summon-controls' ? '#D7B67A' : '#A7B0BC');
            dot.visible = !aim.blocked;
            dot.scale.setScalar(aim.pressed ? 1.5 : 1);
            for (const mesh of cross) mesh.visible = aim.blocked;
        },
        dispose() {
            scene.remove(root);
            beam.geometry.dispose();
            dot.geometry.dispose();
            bar.dispose();
            material.dispose();
        }
    };
}
