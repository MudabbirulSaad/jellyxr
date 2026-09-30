import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Scene } from '@babylonjs/core/scene';

/** Minify canvas artwork without allowing WebGL1 mipmap rounding to resize it. */
export function createBabylonCanvasTexture(name: string, canvas: HTMLCanvasElement, scene: Scene): DynamicTexture {
    const mipmaps = !scene.getEngine().needPOTTextures;
    return new DynamicTexture(name, canvas, scene, mipmaps,
        mipmaps ? Texture.TRILINEAR_SAMPLINGMODE : Texture.BILINEAR_SAMPLINGMODE);
}
