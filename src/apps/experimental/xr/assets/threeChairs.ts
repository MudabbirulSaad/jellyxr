import { Mesh, type Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { assetObservation, chairAsset, CHAIR_POSITIONS, type ChairQuality } from './chairAssets';
import { disposeChairModel } from './disposeChairModel';

export async function loadThreeChairs(scene: Scene, quality: ChairQuality) {
    const start = performance.now();
    const model = await new GLTFLoader().loadAsync(chairAsset(quality).url);
    const instances = CHAIR_POSITIONS.map(position => {
        const instance = model.scene.clone(true);
        instance.position.set(position[0], position[1], position[2]);
        scene.add(instance);
        return instance;
    });
    scene.traverse(object => {
        if (object instanceof Mesh && object.name.startsWith('seat-')) object.visible = false;
    });
    return {
        status: assetObservation(quality, performance.now() - start),
        dispose() {
            for (const instance of instances) scene.remove(instance);
            disposeChairModel(model.scene);
        }
    };
}
