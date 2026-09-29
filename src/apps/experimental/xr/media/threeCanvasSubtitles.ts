import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type Scene } from 'three';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createCanvasSubtitleArtwork } from './canvasSubtitles';
import { fitVideoScreen } from './videoPresentation';

export function createThreeCanvasSubtitles(surface: BorrowedVideoSurface, scene: Scene) {
    const canvas = document.createElement('canvas');
    const artwork = createCanvasSubtitleArtwork(surface, canvas);
    let texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    let width = canvas.width;
    let height = canvas.height;
    const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    const mesh = new Mesh(new PlaneGeometry(size.width, size.height), material);
    mesh.position.set(0, 2, -6.45);
    mesh.visible = false;
    scene.add(mesh);
    return {
        update() {
            if (!artwork.update()) return;
            mesh.visible = artwork.isVisible();
            if (!mesh.visible) return;
            if (width !== canvas.width || height !== canvas.height) {
                texture.dispose();
                texture = new CanvasTexture(canvas);
                texture.colorSpace = SRGBColorSpace;
                material.map = texture;
                material.needsUpdate = true;
                width = canvas.width;
                height = canvas.height;
            }
            texture.needsUpdate = true;
        },
        isVisible: artwork.isVisible,
        readWarning: artwork.readWarning,
        readStatus: artwork.readStatus,
        dispose() {
            scene.remove(mesh);
            mesh.geometry.dispose();
            material.dispose();
            texture.dispose();
            canvas.width = canvas.height = 0;
        }
    };
}
