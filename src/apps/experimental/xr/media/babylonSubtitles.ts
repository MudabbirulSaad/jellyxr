import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createBabylonCanvasSubtitles } from './babylonCanvasSubtitles';
import { createSubtitleArtwork, SUBTITLE_PANEL } from './textSubtitles';

export function createBabylonSubtitles(surface: BorrowedVideoSurface, scene: Scene) {
    const rich = createBabylonCanvasSubtitles(surface, scene);
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas, rich.readWarning);
    const texture = new DynamicTexture('borrowed-subtitles', canvas, scene, false);
    const material = new StandardMaterial('borrowed-subtitles', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.backFaceCulling = true;
    const mesh = createBabylonPanel('borrowed-subtitles', SUBTITLE_PANEL.width, SUBTITLE_PANEL.height, scene);
    mesh.position.set(SUBTITLE_PANEL.x, SUBTITLE_PANEL.y, SUBTITLE_PANEL.z);
    mesh.material = material;
    mesh.setEnabled(false);
    return {
        update() {
            rich.update();
            if (!artwork.update()) return;
            mesh.setEnabled(artwork.isVisible());
            if (artwork.isVisible()) texture.update();
        },
        readStatus: () => rich.isVisible() ? rich.readStatus() : artwork.readStatus(),
        dispose() {
            rich.dispose();
            mesh.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = 0;
            canvas.height = 0;
        }
    };
}
