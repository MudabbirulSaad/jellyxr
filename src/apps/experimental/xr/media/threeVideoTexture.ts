import { Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, VideoTexture, type Scene } from 'three';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

export function createThreeVideoTexture(surface: BorrowedVideoSurface, scene: Scene): VideoPresentationResource {
    const dimensions = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    // Exact-version source inspection: VideoTexture observes frames and cancels only its own callback.
    const texture = new VideoTexture(surface.video);
    texture.colorSpace = SRGBColorSpace;
    const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(dimensions.width, dimensions.height), material);
    mesh.position.set(0, 2, -6.47);
    scene.add(mesh);
    return {
        update() { /* Three's renderer updates the borrowed video texture. */ },
        dispose() {
            scene.remove(mesh);
            mesh.geometry.dispose();
            material.dispose();
            texture.dispose();
        }
    };
}
