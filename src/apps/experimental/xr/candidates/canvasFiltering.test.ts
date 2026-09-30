import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Scene } from '@babylonjs/core/scene';
import { describe, expect, it, vi } from 'vitest';

import { createBabylonControls } from '../input/babylonControls';
import { ActivationState } from '../input/activationState';
import { ControlLayout } from '../input/controlLayout';
import { FloorSelection } from '../input/floorSelection';
import { controlCanvasSize } from '../input/controlArtwork';
import { createBabylonSubtitles } from '../media/babylonSubtitles';

// The installed renderer owns real meshes/textures; drawing has separate coverage.
vi.mock('../input/controlArtwork', async importOriginal => ({
    ...await importOriginal<typeof import('../input/controlArtwork')>(), drawControl: vi.fn()
}));
vi.mock('../input/floorArtwork', () => ({ drawFloorAim: vi.fn() }));
vi.mock('../media/textSubtitles', () => ({
    createSubtitleArtwork: (_surface: unknown, canvas: HTMLCanvasElement) => {
        canvas.width = 1600;
        canvas.height = 600;
        let dirty = true;
        return {
            update: () => {
                const value = dirty;
                dirty = false;
                return value;
            },
            isVisible: () => true, readStatus: () => 'Technical text'
        };
    }
}));
vi.mock('../media/canvasSubtitles', () => ({
    createCanvasSubtitleArtwork: (_surface: unknown, canvas: HTMLCanvasElement) => {
        let frame = 0;
        return {
            update: (force?: boolean) => {
                if (!force && frame >= 2) return false;
                if (!force) frame++;
                [canvas.width, canvas.height] = frame === 1 ? [1280, 720] : [1920, 1080];
                return true;
            },
            isVisible: () => true, readWarning: () => undefined, readStatus: () => 'Technical canvas'
        };
    }
}));

describe('canvas minification and dimension ownership', () => {
    it.each([false, true])('preserves artwork dimensions and dirty uploads when needPOTTextures=%s', needPOT => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
        const engine = new NullEngine();
        vi.spyOn(engine, 'needPOTTextures', 'get').mockReturnValue(needPOT);
        const upload = vi.spyOn(engine, 'updateDynamicTexture');
        const scene = new Scene(engine);
        const layout = new ControlLayout();
        layout.update({ position: [0, 1.65, 0], forward: [0, 0, -1] });
        const controls = createBabylonControls(scene, new ActivationState(), layout, new FloorSelection());
        const video = document.createElement('video');
        Object.defineProperties(video, { videoWidth: { value: 1920 }, videoHeight: { value: 1080 } });
        const release = vi.fn();
        const subtitles = createBabylonSubtitles({ video, isCurrent: () => true, release }, scene);
        const textureFor = (name: string) => (scene.getMeshByName(name)!.material as StandardMaterial).emissiveTexture!;
        const expectFiltering = (texture: Texture) => {
            expect(texture.getInternalTexture()!.generateMipMaps).toBe(!needPOT);
            expect(texture.samplingMode).toBe(needPOT ? Texture.BILINEAR_SAMPLINGMODE : Texture.TRILINEAR_SAMPLINGMODE);
        };
        try {
            controls.update();
            subtitles.update();
            for (const target of layout.targets()) {
                const texture = textureFor(target.id) as Texture;
                expectFiltering(texture);
                const [width, height] = controlCanvasSize(target);
                expect(texture.getSize()).toEqual({ width, height });
            }
            expectFiltering(scene.getTextureByName('floor-aim') as Texture);
            const text = textureFor('borrowed-subtitles') as Texture;
            expectFiltering(text);
            expect(text.getSize()).toEqual({ width: 1600, height: 600 });
            const rich = textureFor('borrowed-ass') as Texture;
            expectFiltering(rich);
            expect(rich.getSize()).toEqual({ width: 1280, height: 720 });
            controls.update();
            subtitles.update();
            const replacement = textureFor('borrowed-ass') as Texture;
            expect(replacement).not.toBe(rich);
            expect(scene.textures).not.toContain(rich);
            expectFiltering(replacement);
            expect(replacement.getSize()).toEqual({ width: 1920, height: 1080 });
            expect(textureFor('borrowed-subtitles')).toBe(text);
            const resources = [...scene.textures];
            upload.mockClear();
            for (let frame = 0; frame < 100; frame++) {
                controls.update();
                subtitles.update();
            }
            expect(upload).not.toHaveBeenCalled();
            expect(scene.textures).toEqual(resources);
            controls.dispose();
            subtitles.dispose();
            expect(scene.textures).toHaveLength(0);
            expect(release).not.toHaveBeenCalled();
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });
});
