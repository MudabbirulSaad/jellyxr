import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';
import { createBabylonCanvasTexture } from '../candidates/babylonCanvasTexture';

import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createBabylonCanvasSubtitles } from './babylonCanvasSubtitles';
import { createSubtitleArtwork } from './textSubtitles';
import { captionGeometry, readDefaultCaptions, type ReadCaptionSettings } from './captionSettings';

export function createBabylonSubtitles(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE,
    readSettings: ReadCaptionSettings = readDefaultCaptions) {
    const rich = createBabylonCanvasSubtitles(surface, scene, screenPercent, pose);
    const panel = captionGeometry(readSettings(), screenPercent, pose);
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas, rich.readWarning, readSettings);
    const texture = createBabylonCanvasTexture('borrowed-subtitles', canvas, scene);
    texture.hasAlpha = true;
    const material = new StandardMaterial('borrowed-subtitles', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.disableDepthWrite = true;
    material.backFaceCulling = true;
    const mesh = createBabylonPanel('borrowed-subtitles', panel.width, panel.height, scene);
    mesh.rotation.x = screenGeometry(screenPercent, pose).pitch;
    mesh.position.set(...panel.position);
    mesh.material = material;
    mesh.setEnabled(false);
    return {
        update() {
            rich.update();
            mesh.position.set(...captionGeometry(readSettings(), screenPercent, pose).position);
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
