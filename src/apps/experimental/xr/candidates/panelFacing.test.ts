// @vitest-environment node
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';
import { Scene } from '@babylonjs/core/scene';
import { PlaneGeometry } from 'three';
import { describe, expect, it } from 'vitest';

import { CONTROL_TARGETS, hitControl } from '../input/controlTargets';

import { createBabylonPanel } from './babylonPanel';

describe('comparison panel front and artwork orientation', () => {
    it('aligns both real geometries with front-only hit regions without mirroring UVs', () => {
        const engine = new NullEngine();
        const scene = new Scene(engine);
        scene.useRightHandedSystem = true;
        try {
            for (const target of CONTROL_TARGETS) {
                const mesh = createBabylonPanel(target.id, target.width, target.height, scene);
                const three = new PlaneGeometry(target.width, target.height);
                const positions = mesh.getVerticesData('position')!;
                const normals = mesh.getVerticesData('normal')!;
                const uv = mesh.getVerticesData('uv')!;
                for (let vertex = 0; vertex < positions.length / 3; vertex++) {
                    expect(normals[vertex * 3 + 2]).toBe(1);
                    const matching = Array.from({ length: three.attributes.position.count }, (_, index) => index)
                        .find(index => Math.abs(three.attributes.position.getX(index) - positions[vertex * 3]) < 0.00001
                            && Math.abs(three.attributes.position.getY(index) - positions[vertex * 3 + 1]) < 0.00001)!;
                    expect(matching).toBeDefined();
                    expect(three.attributes.normal.getZ(matching)).toBe(1);
                    expect(uv[vertex * 2]).toBe(three.attributes.uv.getX(matching));
                    expect(uv[vertex * 2 + 1]).toBe(three.attributes.uv.getY(matching));
                }
                const [x, y, z] = target.position;
                expect(hitControl({ origin: [x, y, z + 0.1], direction: [0, 0, -1] })).toBe(target.id);
                expect(hitControl({ origin: [x, y, z - 0.1], direction: [0, 0, 1] })).toBeNull();
                mesh.dispose();
                three.dispose();
            }
        } finally {
            scene.dispose();
            engine.dispose();
        }
    });
});
