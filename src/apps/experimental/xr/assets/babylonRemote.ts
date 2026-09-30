/* eslint new-cap: ["error", { "capIsNewExceptions": ["LoadAssetContainerAsync", "Color3.FromHexString"] }] */
import { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import type { Scene } from '@babylonjs/core/scene';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';

import { REMOTE_ASSET, remoteAssetObservation } from './remoteAsset';

/** The imported roots follow the existing physics transform; the proxy retains its body. */
export async function loadBabylonRemote(scene: Scene, proxy: TransformNode | undefined) {
    if (!(proxy instanceof AbstractMesh)) throw new Error('Remote physics proxy is missing.');
    const start = performance.now();
    const container = await LoadAssetContainerAsync(REMOTE_ASSET.url, scene, { pluginExtension: '.glb' });
    const feedback = container.materials.find(material => material.name === REMOTE_ASSET.feedback.material);
    if (!(feedback instanceof PBRMaterial)) {
        container.dispose();
        throw new Error('Remote feedback material is missing.');
    }
    const passive = feedback.emissiveColor.clone();
    const heldColour = Color3.FromHexString(REMOTE_ASSET.feedback.colourSrgb).toLinearSpace(true).scale(REMOTE_ASSET.feedback.intensity);
    const visible = proxy.isVisible;
    container.addAllToScene();
    for (const root of container.rootNodes) root.parent = proxy;
    proxy.isVisible = false;
    let disposed = false;
    let lastHeld = false;
    return {
        status: remoteAssetObservation(performance.now() - start),
        setHeld(held: boolean) {
            if (disposed || held === lastHeld) return;
            lastHeld = held;
            feedback.emissiveColor.copyFrom(held ? heldColour : passive);
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            container.dispose();
            if (!proxy.isDisposed()) proxy.isVisible = visible;
        }
    };
}
