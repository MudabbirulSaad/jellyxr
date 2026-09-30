import { Mesh, NoBlending, PlaneGeometry, ShaderMaterial, type Scene } from 'three';

import { screenGeometry } from '../fixtures/screenFixture';

import type { BorrowedVideoSurface } from './borrowVideoSurface';
import { createThreeSubtitles } from './threeSubtitles';
import { fitVideoScreen, type VideoPresentationResource } from './videoPresentation';

/** Depth-tested zero RGBA reveals the video underlay, while nearer scene objects remain opaque. */
export function createThreeMediaUnderlay(surface: BorrowedVideoSurface, scene: Scene, screenPercent = 100): VideoPresentationResource {
    const size = fitVideoScreen(surface.video.videoWidth, surface.video.videoHeight, screenPercent);
    const material = new ShaderMaterial({
        vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'void main() { gl_FragColor = vec4(0.0); }',
        blending: NoBlending, depthWrite: true, depthTest: true, toneMapped: false
    });
    const mesh = new Mesh(new PlaneGeometry(size.width, size.height), material);
    mesh.name = 'media-underlay-aperture';
    mesh.position.set(...screenGeometry(screenPercent).videoPosition);
    scene.add(mesh);
    const clearMask = () => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        material.dispose();
    };
    try {
        const subtitles = createThreeSubtitles(surface, scene, screenPercent);
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
