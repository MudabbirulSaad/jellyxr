import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import type { Scene } from '@babylonjs/core/scene';

import { createBabylonPanel } from '../candidates/babylonPanel';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createBabylonSubtitles } from './babylonSubtitles';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

/** Opaque-pass depth and zero RGBA expose only the media rectangle to the compositor. */
export function createBabylonMediaUnderlay(surface: BorrowedVideoSurface, scene: Scene): VideoPresentationResource {
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight);
    const material = new ShaderMaterial('media-underlay-aperture', scene, {
        vertexSource: 'precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; void main() { gl_Position = worldViewProjection * vec4(position, 1.0); }',
        fragmentSource: 'precision highp float; void main() { gl_FragColor = vec4(0.0); }'
    }, { attributes: ['position'], uniforms: ['worldViewProjection'], needAlphaBlending: false, needAlphaTesting: false });
    material.backFaceCulling = true;
    material.disableDepthWrite = false;
    const mesh = createBabylonPanel('media-underlay-aperture', size.width, size.height, scene);
    mesh.position.set(0, 2, -6.47);
    mesh.material = material;
    const clearMask = () => {
        mesh.dispose();
        material.dispose();
    };
    try {
        const subtitles = createBabylonSubtitles(surface, scene);
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
