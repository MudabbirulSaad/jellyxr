import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createSubtitleArtwork, SUBTITLE_PANEL } from './textSubtitles';

export function createThreeSubtitles(surface: BorrowedVideoSurface, scene: Scene) {
    const canvas = document.createElement('canvas');
    const artwork = createSubtitleArtwork(surface, canvas);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(SUBTITLE_PANEL.width, SUBTITLE_PANEL.height), material);
    mesh.position.set(SUBTITLE_PANEL.x, SUBTITLE_PANEL.y, SUBTITLE_PANEL.z);
    mesh.visible = false;
    scene.add(mesh);
    return {
        update() {
            if (!artwork.update()) return;
            mesh.visible = artwork.isVisible();
            if (mesh.visible) texture.needsUpdate = true;
        },
        readStatus: artwork.readStatus,
        dispose() {
            scene.remove(mesh);
            mesh.geometry.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = 0;
            canvas.height = 0;
        }
    };
}
