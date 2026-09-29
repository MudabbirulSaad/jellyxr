import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createCanvasSubtitleArtwork } from './canvasSubtitles';
import { fitVideoScreen } from './videoPresentation';

export function createBabylonCanvasSubtitles(surface: BorrowedVideoSurface, scene: Scene) {
    const canvas = document.createElement('canvas');
    const artwork = createCanvasSubtitleArtwork(surface, canvas);
    let texture = new DynamicTexture('borrowed-ass', canvas, scene, false);
    texture.hasAlpha = true;
    const material = new StandardMaterial('borrowed-ass', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.disableDepthWrite = true;
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    const mesh = createBabylonPanel('borrowed-ass', size.width, size.height, scene);
    mesh.position.set(0, 2, -6.45);
    mesh.material = material;
    mesh.setEnabled(false);
    return {
        update() {
            if (!artwork.update()) return;
            mesh.setEnabled(artwork.isVisible());
            if (!artwork.isVisible()) return;
            const dimensions = texture.getSize();
            if (dimensions.width !== canvas.width || dimensions.height !== canvas.height) {
                texture.dispose();
                texture = new DynamicTexture('borrowed-ass', canvas, scene, false);
                texture.hasAlpha = true;
                material.emissiveTexture = texture;
                material.opacityTexture = texture;
                // DynamicTexture construction resets its canvas backing size.
                artwork.update(true);
            }
            texture.update();
        },
        isVisible: artwork.isVisible,
        readWarning: artwork.readWarning,
        readStatus: artwork.readStatus,
        dispose() {
            mesh.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = canvas.height = 0;
        }
    };
}
