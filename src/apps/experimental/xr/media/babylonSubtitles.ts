import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createBabylonCanvasSubtitles } from './babylonCanvasSubtitles';
import { createSubtitleArtwork } from './textSubtitles';

export function createBabylonSubtitles(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE) {
    const rich = createBabylonCanvasSubtitles(surface, scene, screenPercent, pose);
    const panel = screenGeometry(screenPercent, pose).captions;
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas, rich.readWarning);
    const texture = new DynamicTexture('borrowed-subtitles', canvas, scene, false);
    const material = new StandardMaterial('borrowed-subtitles', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.backFaceCulling = true;
    const mesh = createBabylonPanel('borrowed-subtitles', panel.width, panel.height, scene);
    mesh.rotation.x = screenGeometry(screenPercent, pose).pitch;
    mesh.position.set(...panel.position);
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
