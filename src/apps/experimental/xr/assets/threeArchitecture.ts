import { Mesh, type Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { ROOM_ASSET, roomAssetObservation } from './roomAsset';
import { disposeChairModel } from './disposeChairModel';

export async function loadThreeArchitecture(scene: Scene, enabled = true) {
    if (!enabled) return { status: 'Plain room comparison: collision geometry only.', dispose() { /* No imported geometry. */ } };
    const start = performance.now();
    const model = await new GLTFLoader().loadAsync(ROOM_ASSET.url);
    scene.add(model.scene);
    const proxies = scene.children.filter((object): object is Mesh => object instanceof Mesh && ROOM_ASSET.replaces.includes(object.name));
    for (const proxy of proxies) proxy.visible = false;
    return {
        status: roomAssetObservation(performance.now() - start),
        dispose() {
            scene.remove(model.scene);
            disposeChairModel(model.scene);
            for (const proxy of proxies) proxy.visible = true;
        }
    };
}
