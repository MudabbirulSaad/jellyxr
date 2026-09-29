/* eslint new-cap: ["error", { "capIsNewExceptions": ["CreatePlane"] }] */
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';

/** +Z front matching the shared hit regions, without rotating/mirroring the artwork. */
export function createBabylonPanel(name: string, width: number, height: number, scene: Scene) {
    return CreatePlane(name, { width, height, sideOrientation: Mesh.BACKSIDE }, scene);
}
