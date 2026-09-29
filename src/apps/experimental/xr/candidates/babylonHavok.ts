/* eslint new-cap: ["error", { "capIsNewExceptions": ["HavokPhysics", "CreateBox", "Color3.FromHexString", "Color4.FromHexString", "Color3.White", "Vector3.Zero", "WebXRExperienceHelper.CreateAsync"] }] */
import HavokPhysics from '@babylonjs/havok';
import havokWasm from '@babylonjs/havok/lib/esm/HavokPhysics.wasm';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { WebXRLayers } from '@babylonjs/core/XR/features/WebXRLayers';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';

import { FixedStepClock } from '../fixtures/fixedStepClock';
import { FIXTURE_REMOTE, ROOM_FIXTURE } from '../fixtures/roomFixture';
import { VideoPresentation } from '../media/videoPresentation';
import { createNativeMediaLayer } from '../media/nativeMediaLayer';
import { createBabylonVideoTexture } from '../media/babylonVideoTexture';

import { FrameSampler } from './frameSampler';
import { FIXTURE_COLOURS, type ComparisonScene, type SampleListener } from './types';

export async function createComparison(canvas: HTMLCanvasElement, onSample: SampleListener): Promise<ComparisonScene> {
    const havok = await HavokPhysics({ locateFile: () => havokWasm });
    const engine = new Engine(canvas, true, { adaptToDeviceRatio: false });
    const scene = new Scene(engine);
    scene.useRightHandedSystem = true;
    scene.clearColor = Color4.FromHexString(`${FIXTURE_COLOURS.graphite}FF`);
    const camera = new UniversalCamera('comparison-camera', new Vector3(0, 1.65, 0), scene);
    camera.setTarget(new Vector3(0, 1.65, -6.5));
    camera.minZ = 0.05;
    camera.maxZ = 50;
    camera.fov = 70 * Math.PI / 180;
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambient.intensity = 1;
    ambient.groundColor = Color3.White();
    const light = new DirectionalLight('warm-key', new Vector3(0, -1, 0), scene);
    light.diffuse = Color3.FromHexString('#FFECD1');
    light.intensity = 2;

    const plugin = new HavokPlugin(true, havok);
    scene.enablePhysics(new Vector3(0, -9.81, 0), plugin);
    scene.physicsEnabled = false;
    const aggregates: PhysicsAggregate[] = [];
    let remote: PhysicsAggregate | undefined;
    for (const box of ROOM_FIXTURE) {
        const mesh = CreateBox(box.id, { width: box.size[0], height: box.size[1], depth: box.size[2] }, scene);
        mesh.position.set(...box.position);
        const material = new PBRMaterial(`${box.id}-material`, scene);
        material.albedoColor = Color3.FromHexString(FIXTURE_COLOURS[box.material]).toLinearSpace();
        material.roughness = 0.8;
        material.metallic = box.material === 'metal' ? 0.5 : 0;
        if (box.material === 'warm') material.emissiveColor = Color3.FromHexString(FIXTURE_COLOURS.warm).toLinearSpace().scale(0.5);
        mesh.material = material;
        if (box.collision === 'none') continue;
        const aggregate = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, {
            mass: box.collision === 'dynamic' ? 0.18 : 0, friction: 0.6, restitution: 0.1
        }, scene);
        aggregates.push(aggregate);
        if (box.collision === 'dynamic') {
            aggregate.body.setLinearDamping(0.5);
            aggregate.body.setAngularDamping(0.5);
            remote = aggregate;
        }
    }

    const clock = new FixedStepClock();
    const sampler = new FrameSampler();
    const xr = await WebXRExperienceHelper.CreateAsync(scene).catch(() => undefined);
    // Optional on ordinary browsers; no automatic mesh fallback hides a layer failure.
    if (xr && typeof XRWebGLBinding !== 'undefined') {
        xr.featuresManager.enableFeature(WebXRLayers.Name, 'latest', {}, true, false);
    }
    const video = new VideoPresentation({
        createTexture: surface => createBabylonVideoTexture(surface, scene, engine),
        createLayer: createNativeMediaLayer
    });
    let disposed = false;
    const resize = () => engine.resize();
    const visibility = () => clock.reset();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    resize();
    const bodies = aggregates.map(aggregate => aggregate.body);
    engine.runRenderLoop(() => {
        if (document.hidden) {
            clock.reset();
            return;
        }
        const start = performance.now();
        video.update(xr?.sessionManager.inXRSession ? xr.sessionManager.session : null,
            xr?.sessionManager.inXRSession ? xr.sessionManager.referenceSpace : null);
        clock.advance(start, seconds => plugin.executeStep(seconds, bodies));
        scene.render();
        sampler.record(performance.now() - start);
    });
    const timer = window.setInterval(() => onSample({
        ...sampler.read(), remoteHeight: remote?.transformNode.position.y || 0,
        immersive: !!xr?.sessionManager.inXRSession, mediaStatus: video.readStatus()
    }), 1000);

    return {
        setVideo: (surface, mode) => video.attach(surface, mode),
        async enterXR() {
            if (!xr) throw new Error('WebXR is unavailable in this browser.');
            await xr.enterXRAsync('immersive-vr', 'local-floor', undefined, {
                optionalFeatures: ['hand-tracking', 'layers']
            });
        },
        async exitXR() {
            if (xr?.sessionManager.inXRSession) await xr.exitXRAsync();
        },
        recallRemote() {
            if (!remote) return;
            remote.transformNode.position.set(...FIXTURE_REMOTE);
            plugin.setPhysicsBodyTransformation(remote.body, remote.transformNode);
            remote.body.setLinearVelocity(Vector3.Zero());
            remote.body.setAngularVelocity(Vector3.Zero());
        },
        async dispose() {
            if (disposed) return;
            disposed = true;
            video.dispose();
            engine.stopRenderLoop();
            window.clearInterval(timer);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', visibility);
            try {
                if (xr?.sessionManager.inXRSession) await xr.exitXRAsync();
            } finally {
                xr?.dispose();
                for (const aggregate of aggregates) aggregate.dispose();
                scene.dispose();
                engine.dispose();
            }
        }
    };
}
