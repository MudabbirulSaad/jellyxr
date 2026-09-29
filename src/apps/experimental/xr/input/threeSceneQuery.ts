import { Mesh, Raycaster, Vector3, type Material, type Scene } from 'three';

import type { SceneSurfaceQuery } from './sceneQuery';

function opaque(material: Material): boolean {
    return material.visible && !material.transparent && material.opacity > 0 && material.alphaTest === 0;
}

export function createThreeSceneQuery(scene: Scene): SceneSurfaceQuery {
    const picker = new Raycaster();
    const origin = new Vector3();
    const direction = new Vector3();
    return (ray, limit) => {
        scene.updateMatrixWorld();
        const meshes: Mesh[] = [];
        scene.traverseVisible(object => {
            if (!(object instanceof Mesh) || object.userData.jellyxrInputFeedback || object.userData.jellyxrControl) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            if (materials.some(opaque)) meshes.push(object);
        });
        picker.set(origin.set(...ray.origin), direction.set(...ray.direction));
        picker.near = 0;
        picker.far = limit;
        const hit = picker.intersectObjects(meshes, false).find(value => {
            const mesh = value.object as Mesh;
            const material = Array.isArray(mesh.material) ? mesh.material[value.face?.materialIndex || 0] : mesh.material;
            return material && opaque(material);
        });
        return hit?.distance ?? null;
    };
}
