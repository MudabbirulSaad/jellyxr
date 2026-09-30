import { Mesh, Texture, type Material, type Object3D } from 'three';

/** Cloned chair instances share the source model's materials, textures and decoded images. */
export function disposeChairModel(root: Object3D) {
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    const images = new Set<{ close?: () => void }>();
    root.traverse(object => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        for (const material of [object.material].flat()) materials.add(material);
    });
    for (const material of materials) {
        for (const value of Object.values(material)) {
            if (value instanceof Texture) textures.add(value);
        }
        material.dispose();
    }
    for (const texture of textures) {
        if (texture.source.data) images.add(texture.source.data as { close?: () => void });
        texture.dispose();
    }
    for (const image of images) image.close?.();
}
