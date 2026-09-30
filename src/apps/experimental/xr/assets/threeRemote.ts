import { Color, Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { disposeChairModel } from './disposeChairModel';
import { REMOTE_ASSET, remoteAssetObservation } from './remoteAsset';

/** Parent visuals to the existing body proxy; add no competing physics state. */
export async function loadThreeRemote(proxy: Mesh<BufferGeometry, MeshStandardMaterial> | undefined) {
    if (!proxy) throw new Error('Remote physics proxy is missing.');
    const start = performance.now();
    const model = await new GLTFLoader().loadAsync(REMOTE_ASSET.url);
    // Find by the manifest's semantic name, never by exporter/material ordering.
    const materials: MeshStandardMaterial[] = [];
    model.scene.traverse(object => {
        if (!(object instanceof Mesh)) return;
        for (const value of [object.material].flat()) {
            if (value instanceof MeshStandardMaterial && value.name === REMOTE_ASSET.feedback.material) materials.push(value);
        }
    });
    const feedback = materials[0];
    if (!feedback) {
        disposeChairModel(model.scene);
        throw new Error('Remote feedback material is missing.');
    }
    const passive = feedback.emissive.clone();
    const heldColour = new Color(REMOTE_ASSET.feedback.colourSrgb).multiplyScalar(REMOTE_ASSET.feedback.intensity);
    const visible = proxy.material.visible;
    proxy.add(model.scene);
    proxy.material.visible = false; // Keep the parent enabled so model children render and remain pickable.
    let disposed = false;
    let lastHeld = false;
    return {
        status: remoteAssetObservation(performance.now() - start),
        setHeld(held: boolean) {
            if (disposed || held === lastHeld) return;
            lastHeld = held;
            feedback.emissive.copy(held ? heldColour : passive);
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            proxy.remove(model.scene);
            proxy.material.visible = visible;
            disposeChairModel(model.scene);
        }
    };
}
