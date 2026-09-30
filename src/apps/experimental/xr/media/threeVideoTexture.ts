import { Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, VideoTexture, type Scene } from 'three';

import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import type { ReadCaptionSettings } from './captionSettings';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';
import { createThreeSubtitles } from './threeSubtitles';

export function createThreeVideoTexture(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE, readSettings?: ReadCaptionSettings): VideoPresentationResource {
    const dimensions = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight, screenPercent);
    // Exact-version source inspection: VideoTexture observes frames and cancels only its own callback.
    const texture = new VideoTexture(surface.video);
    texture.colorSpace = SRGBColorSpace;
    // Attachment already requires a ready frame. rVFC alone waits forever when paused.
    texture.needsUpdate = true;
    const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
    const mesh = new Mesh(new PlaneGeometry(dimensions.width, dimensions.height), material);
    mesh.name = 'borrowed-video-screen';
    mesh.rotation.x = screenGeometry(screenPercent, pose).pitch;
    mesh.position.set(...screenGeometry(screenPercent, pose).videoPosition);
    scene.add(mesh);
    const subtitles = createThreeSubtitles(surface, scene, screenPercent, pose, readSettings);
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
