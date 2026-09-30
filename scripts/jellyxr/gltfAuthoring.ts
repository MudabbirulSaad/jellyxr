import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { Object3D } from 'three';

// GLTFExporter's binary path needs Blob.arrayBuffer, not a browser or canvas shim.
class BlobReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    readAsArrayBuffer(blob: Blob): Promise<void> {
        return blob.arrayBuffer().then(result => {
            this.result = result;
            this.onloadend?.();
        });
    }
}

export async function exportGlb(root: Object3D): Promise<ArrayBuffer> {
    Object.defineProperty(globalThis, 'FileReader', { value: BlobReader, configurable: true });
    const binary = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
    if (!(binary instanceof ArrayBuffer)) throw new Error('Expected binary glTF.');
    return binary;
}
