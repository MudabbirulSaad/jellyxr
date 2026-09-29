import { Ray } from '@babylonjs/core/Culling/ray';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';

import type { SceneSurfaceQuery } from './sceneQuery';

export function createBabylonSceneQuery(scene: Scene): SceneSurfaceQuery {
    const ray = new Ray(new Vector3(), new Vector3());
    return (input, limit) => {
        ray.origin.set(...input.origin);
        ray.direction.set(...input.direction);
        ray.length = limit;
        const hit = scene.pickWithRay(ray, mesh => {
            if (!mesh.isEnabled() || !mesh.isVisible || mesh.visibility <= 0
                || mesh.metadata?.jellyxrInputFeedback || mesh.metadata?.jellyxrControl
                || (mesh.material && (mesh.material.needAlphaBlendingForMesh(mesh) || mesh.material.needAlphaTestingForMesh(mesh)))) return false;
            // Native select events can arrive before the renderer refreshes moved world matrices.
            mesh.computeWorldMatrix(true);
            return true;
        }, false);
        return hit?.hit ? hit.distance : null;
    };
}
