/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync"] }] */
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import type { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';

import { assetObservation, chairAsset, CHAIR_POSITIONS, type ChairQuality } from './chairAssets';

export async function loadBabylonChairs(scene: Scene, quality: ChairQuality) {
    const start = performance.now();
    const container = await LoadAssetContainerAsync(chairAsset(quality).url, scene, { pluginExtension: '.glb' });
    const instances = CHAIR_POSITIONS.map(position => {
        const instance = container.instantiateModelsToScene();
        for (const root of instance.rootNodes) {
            if (root instanceof TransformNode) root.position.set(position[0], position[1], position[2]);
        }
        return instance;
    });
    for (const mesh of scene.meshes) {
        if (mesh.name.startsWith('seat-')) mesh.isVisible = false;
    }
    return {
        status: assetObservation(quality, performance.now() - start),
        dispose() {
            instances.forEach(instance => {
                instance.dispose();
            });
            container.dispose();
        }
    };
}
