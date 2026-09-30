import { isFixtureDestinationClear, type Point3 } from '../fixtures/roomFixture';

export interface ViewerRoot {
    readonly origin: Point3;
    readonly yaw: number;
}

export const INITIAL_VIEWER_ROOT: ViewerRoot = { origin: [0, 0, 0], yaw: 0 };
export const SNAP_RADIANS = Math.PI / 6;

export function rotateFloorPoint(point: Point3, yaw: number): Point3 {
    const cosine = Math.cos(yaw);
    const sine = Math.sin(yaw);
    return [cosine * point[0] + sine * point[2], point[1], -sine * point[0] + cosine * point[2]];
}

export function viewerWorldPosition(root: ViewerRoot, trackedPosition: Point3): Point3 {
    const rotated = rotateFloorPoint(trackedPosition, root.yaw);
    return [root.origin[0] + rotated[0], root.origin[1] + rotated[1], root.origin[2] + rotated[2]];
}

function isValid(root: ViewerRoot, trackedPosition: Point3): boolean {
    return Number.isFinite(root.yaw) && root.origin.every(Number.isFinite) && trackedPosition.every(Number.isFinite);
}

/** Moves the viewer's floor projection, preserving measured height and current orientation. */
export function teleportViewer(root: ViewerRoot, trackedPosition: Point3, destination: Point3, destinationClear: (point: Point3) => boolean = isFixtureDestinationClear): ViewerRoot | null {
    if (!isValid(root, trackedPosition) || !destinationClear(destination)) return null;
    const rotated = rotateFloorPoint(trackedPosition, root.yaw);
    return { origin: [destination[0] - rotated[0], 0, destination[2] - rotated[2]], yaw: root.yaw };
}

/** Rotates around the tracked viewer, not the room origin: no lateral head translation. */
export function snapViewer(root: ViewerRoot, trackedPosition: Point3, direction: -1 | 1): ViewerRoot | null {
    if (!isValid(root, trackedPosition)) return null;
    const world = viewerWorldPosition(root, trackedPosition);
    const yaw = root.yaw + direction * SNAP_RADIANS;
    const rotated = rotateFloorPoint(trackedPosition, yaw);
    return { origin: [world[0] - rotated[0], root.origin[1], world[2] - rotated[2]], yaw };
}

/** Native space describes the inverse origin transform; never rotate/translate room meshes. */
export function inverseReferenceTransform(root: ViewerRoot): { position: Point3; orientation: readonly [number, number, number, number] } {
    const inverseOrigin = rotateFloorPoint([-root.origin[0], -root.origin[1], -root.origin[2]], -root.yaw);
    return { position: inverseOrigin, orientation: [0, Math.sin(-root.yaw / 2), 0, Math.cos(-root.yaw / 2)] };
}

export interface MovementHost {
    /** Must pause the existing playback owner before applying any new viewing position. */
    pauseForMovement(): void;
    applyRoot(root: ViewerRoot): void;
}

/** Applies an already-validated destination only after the owner accepts pause. Never resumes. */
export function applyMovement(root: ViewerRoot | null, host: MovementHost): boolean {
    if (!root) return false;
    host.pauseForMovement();
    host.applyRoot(root);
    return true;
}
