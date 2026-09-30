import { Mesh, NoBlending, PlaneGeometry, ShaderMaterial, type Scene } from 'three';

import { DEFAULT_SCREEN_POSE, screenGeometry, type ScreenPose } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createThreeSubtitles } from './threeSubtitles';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

/** Depth-tested zero RGBA reveals the video underlay, while nearer scene objects remain opaque. */
export function createThreeMediaUnderlay(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100, pose: ScreenPose = DEFAULT_SCREEN_POSE): VideoPresentationResource {
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight, screenPercent);
    const material = new ShaderMaterial({
        vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
        blending: NoBlending, depthWrite: true, depthTest: true, toneMapped: false
    });
    const mesh = new Mesh(new PlaneGeometry(size.width, size.height), material);
    mesh.name = 'media-underlay-aperture';
    mesh.rotation.x = screenGeometry(screenPercent, pose).pitch;
    mesh.position.set(...screenGeometry(screenPercent, pose).videoPosition);
    scene.add(mesh);
    const clearMask = () => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        material.dispose();
    };
    try {
        const subtitles = createThreeSubtitles(surface, scene, screenPercent, pose);
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
