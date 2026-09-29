import { Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, VideoTexture, type Scene } from 'three';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';
import { createThreeSubtitles } from './threeSubtitles';

export function createThreeVideoTexture(surface: BorrowedVideoSurface, scene: Scene): VideoPresentationResource {
    const dimensions = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    // Exact-version source inspection: VideoTexture observes frames and cancels only its own callback.
    const texture = new VideoTexture(surface.video);
    texture.colorSpace = SRGBColorSpace;
    // Attachment already requires a ready frame. rVFC alone waits forever when paused.
    texture.needsUpdate = true;
    const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(dimensions.width, dimensions.height), material);
    mesh.position.set(0, 2, -6.47);
    scene.add(mesh);
    const subtitles = createThreeSubtitles(surface, scene);
    return {
        update() {
            // Three's renderer updates the borrowed video texture.
            subtitles.update();
        },
        readSubtitleStatus: subtitles.readStatus,
        dispose() {
            subtitles.dispose();
            scene.remove(mesh);
            mesh.geometry.dispose();
            material.dispose();
            texture.dispose();
        }
    };
}
