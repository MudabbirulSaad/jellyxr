/* eslint new-cap: ["error", { "capIsNewExceptions": ["CreatePlane"] }] */
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import type { Scene } from '@babylonjs/core/scene';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createSubtitleArtwork, SUBTITLE_PANEL } from './textSubtitles';

export function createBabylonSubtitles(surface: BorrowedVideoSurface, scene: Scene) {
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas);
    const texture = new DynamicTexture('borrowed-subtitles', canvas, scene, false);
    const material = new StandardMaterial('borrowed-subtitles', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.backFaceCulling = false;
    const mesh = CreatePlane('borrowed-subtitles', SUBTITLE_PANEL, scene);
    mesh.position.set(SUBTITLE_PANEL.x, SUBTITLE_PANEL.y, SUBTITLE_PANEL.z);
    mesh.material = material;
    mesh.setEnabled(false);
    return {
        update() {
            if (!artwork.update()) return;
            mesh.setEnabled(artwork.isVisible());
            if (artwork.isVisible()) texture.update();
        },
        readStatus: artwork.readStatus,
        dispose() {
            mesh.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = 0;
            canvas.height = 0;
        }
    };
}
