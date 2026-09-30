/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync"] }] */
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import type { Scene } from '@babylonjs/core/scene';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';

import { ROOM_ASSET, roomAssetObservation } from './roomAsset';

export async function loadBabylonArchitecture(scene: Scene, enabled = true) {
    if (!enabled) return { status: 'Plain room comparison: collision geometry only.', dispose() { /* No imported geometry. */ } };
    const start = performance.now();
    const container = await LoadAssetContainerAsync(ROOM_ASSET.url, scene, { pluginExtension: '.glb' });
    container.addAllToScene();
    const proxies = scene.meshes.filter(mesh => ROOM_ASSET.replaces.includes(mesh.name));
    for (const proxy of proxies) proxy.isVisible = false;
    return {
        status: roomAssetObservation(performance.now() - start),
        dispose() {
            container.dispose();
            for (const proxy of proxies) proxy.isVisible = true;
        }
    };
}
