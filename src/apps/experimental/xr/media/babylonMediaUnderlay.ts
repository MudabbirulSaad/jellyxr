import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import type { ReadCaptionSettings } from './captionSettings';
import { createBabylonSubtitles } from './babylonSubtitles';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

/** Opaque-pass depth and zero RGBA expose only the media rectangle to the compositor. */
export function createBabylonMediaUnderlay(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE, readSettings?: ReadCaptionSettings): VideoPresentationResource {
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight, screenPercent);
    const material = new ShaderMaterial('media-underlay-aperture', scene, {
        vertexSource: 'precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; void main() { gl_Position = worldViewProjection * vec4(position, 1.0); }',
        fragmentSource: 'precision highp float; void main() { gl_FragColor = vec4(0.0); }'
    }, { attributes: ['position'], uniforms: ['worldViewProjection'], needAlphaBlending: false, needAlphaTesting: false });
    material.backFaceCulling = true;
    material.disableDepthWrite = false;
    const mesh = createBabylonPanel('media-underlay-aperture', size.width, size.height, scene);
    mesh.rotation.x = screenGeometry(screenPercent, pose).pitch;
    mesh.position.set(...screenGeometry(screenPercent, pose).videoPosition);
    mesh.material = material;
    const clearMask = () => {
        mesh.dispose();
        material.dispose();
    };
    try {
        const subtitles = createBabylonSubtitles(surface, scene, screenPercent, pose, readSettings);
        return {
            update: subtitles.update,
            readSubtitleStatus: subtitles.readStatus,
            dispose() {
                try {
                    subtitles.dispose();
                } finally {
                    clearMask();
                }
            }
        };
    } catch (error) {
        clearMask();
        throw error;
    }
}
