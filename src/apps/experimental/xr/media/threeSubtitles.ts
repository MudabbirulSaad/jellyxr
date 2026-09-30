import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import { screenGeometry } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createThreeCanvasSubtitles } from './threeCanvasSubtitles';
import { createSubtitleArtwork } from './textSubtitles';

export function createThreeSubtitles(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100) {
    const rich = createThreeCanvasSubtitles(surface, scene, screenPercent);
    const panel = screenGeometry(screenPercent).captions;
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas, rich.readWarning);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(panel.width, panel.height), material);
    mesh.name = 'borrowed-subtitles';
    mesh.position.set(...panel.position);
    mesh.visible = false;
    scene.add(mesh);
    return {
        update() {
            rich.update();
            if (!artwork.update()) return;
            mesh.visible = artwork.isVisible();
            if (mesh.visible) texture.needsUpdate = true;
        },
        readStatus: () => rich.isVisible() ? rich.readStatus() : artwork.readStatus(),
        dispose() {
            rich.dispose();
            scene.remove(mesh);
            mesh.geometry.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = 0;
            canvas.height = 0;
        }
    };
}
