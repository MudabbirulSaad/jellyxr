/* eslint new-cap: ["error", { "capIsNewExceptions": ["CreatePlane"] }] */
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Constants } from '@babylonjs/core/Engines/constants';
import type { Engine } from '@babylonjs/core/Engines/engine';
import type { Scene } from '@babylonjs/core/scene';
import '@babylonjs/core/Engines/Extensions/engine.videoTexture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';
import { createBabylonSubtitles } from './babylonSubtitles';

export function createBabylonVideoTexture(
    surface: BorrowedVideoSurface, scene: Scene, engine: Engine
): VideoPresentationResource {
    const { video } = surface;
    const dimensions = fitVideoScreen(video.videoWidth, video.videoHeight);
    // Do not use Babylon VideoTexture: its constructor changes CORS/media properties.
    const texture = new RawTexture(null, video.videoWidth, video.videoHeight,
        Constants.TEXTUREFORMAT_RGBA, scene, false, false, Texture.BILINEAR_SAMPLINGMODE);
    const material = new StandardMaterial('borrowed-video', scene);
    material.disableLighting = true;
    material.emissiveTexture = texture;
    material.backFaceCulling = false;
    const mesh = CreatePlane('borrowed-video-screen', dimensions, scene);
    mesh.position.set(0, 2, -6.47);
    // Keep the authored UV direction; rotating this plane would mirror the borrowed video.
    mesh.material = material;
    const subtitles = createBabylonSubtitles(surface, scene);
    let lastTime = -1;
    return {
        update() {
            subtitles.update();
            if (video.readyState < 2 || video.currentTime === lastTime) return;
            const internal = texture.getInternalTexture();
            engine.updateVideoTexture(internal, video, false);
            if (!internal || internal._isDisabled) throw new Error('Video texture upload rejected.');
            lastTime = video.currentTime;
        },
        readSubtitleStatus: subtitles.readStatus,
        dispose() {
            subtitles.dispose();
            mesh.dispose();
            material.dispose();
            texture.dispose();
        }
    };
}
