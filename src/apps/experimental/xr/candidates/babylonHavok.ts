/* eslint new-cap: ["error", { "capIsNewExceptions": ["HavokPhysics", "CreateBox", "Color3.FromHexString", "Color4.FromHexString", "Color3.White", "Vector3.Zero", "Matrix.Identity", "WebXRExperienceHelper.CreateAsync"] }] */
import HavokPhysics from '@babylonjs/havok';
import havokWasm from '@babylonjs/havok/lib/esm/HavokPhysics.wasm';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import { WebXRExperienceHelper } from '@babylonjs/core/XR/webXRExperienceHelper';
import { WebXRLayers } from '@babylonjs/core/XR/features/WebXRLayers';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';

import { PhysicsScheduler } from '../fixtures/physicsScheduler';
import { ROOM_FIXTURE } from '../fixtures/roomFixture';
import { RoomCollision } from '../fixtures/roomCollision';
import { COMPARISON_LIGHTS } from '../fixtures/lightingFixture';
import { VideoPresentation } from '../media/videoPresentation';
import { createNativeMediaLayer } from '../media/nativeMediaLayer';
import { createBabylonVideoTexture } from '../media/babylonVideoTexture';
import { createBabylonMediaUnderlay } from '../media/babylonMediaUnderlay';
import { ComparisonInput } from '../input/comparisonInput';
import { createBabylonControls } from '../input/babylonControls';
import { createBabylonSceneQuery } from '../input/babylonSceneQuery';
import { createBabylonPointing } from '../input/babylonPointing';
import { bindDesktopPointer } from '../input/desktopPointer';
import { movementAction, MovementSession } from '../input/movementSession';
import { SessionRecovery } from '../input/sessionRecovery';
import { viewerWorldPosition } from '../input/movement';
import { createHavokRemote } from '../input/havokRemote';
import { createHavokScreen } from '../input/havokScreen';
import { loadBabylonChairs } from '../assets/babylonChairs';
import { loadBabylonArchitecture } from '../assets/babylonArchitecture';
import type { ChairQuality } from '../assets/chairAssets';
import '@babylonjs/core/Culling/ray';

import { FrameSampler } from './frameSampler';
import { FIXTURE_COLOURS, type ComparisonPlaybackActions, type ComparisonScene, type SampleListener } from './types';

export async function createComparison(canvas: HTMLCanvasElement, onSample: SampleListener, playback: ComparisonPlaybackActions, quality: ChairQuality, detailedRoom: boolean): Promise<ComparisonScene> {
    const havok = await HavokPhysics({ locateFile: () => havokWasm });
    const engine = new Engine(canvas, true, { adaptToDeviceRatio: false, useExactSrgbConversions: true });
    const scene = new Scene(engine);
    scene.useRightHandedSystem = true;
    scene.clearColor = Color4.FromHexString(`${FIXTURE_COLOURS.graphite}FF`);
    const camera = new UniversalCamera('comparison-camera', new Vector3(0, 1.65, 0), scene);
    camera.setTarget(new Vector3(0, 1.65, -6.5));
    camera.minZ = 0.05;
    camera.maxZ = 50;
    camera.fov = 70 * Math.PI / 180;
    scene.imageProcessingConfiguration.toneMappingEnabled = false;
    scene.imageProcessingConfiguration.exposure = 1;
    scene.imageProcessingConfiguration.contrast = 1;
    for (const fixture of COMPARISON_LIGHTS) {
        const direction = new Vector3(...fixture.towardSource).normalize().negate();
        const light = new DirectionalLight(fixture.id, direction, scene);
        light.diffuse = Color3.FromHexString(fixture.colour).toLinearSpace(true);
        light.intensity = fixture.intensity;
    }

    const plugin = new HavokPlugin(true, havok);
    scene.enablePhysics(new Vector3(0, -9.81, 0), plugin);
    scene.physicsEnabled = false;
    const aggregates: PhysicsAggregate[] = [];
    let remote: PhysicsAggregate | undefined;
    for (const box of ROOM_FIXTURE) {
        const mesh = CreateBox(box.id, { width: box.size[0], height: box.size[1], depth: box.size[2] }, scene);
        mesh.position.set(...box.position);
        const material = new PBRMaterial(`${box.id}-material`, scene);
        material.albedoColor = Color3.FromHexString(FIXTURE_COLOURS[box.material]).toLinearSpace(true);
        material.roughness = 0.8;
        material.metallic = box.material === 'metal' ? 0.5 : 0;
        if (box.material === 'warm') material.emissiveColor = Color3.FromHexString(FIXTURE_COLOURS.warm).toLinearSpace(true).scale(0.5);
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

    const screen = aggregates.find(aggregate => aggregate.transformNode.name === 'screen')!;
    const room = new RoomCollision(createHavokScreen(screen, plugin));

    // A failed import retains visible collision proxies and an explicit diagnostic.
    const chairs = await loadBabylonChairs(scene, quality).catch(() => undefined);
    const architecture = await loadBabylonArchitecture(scene, detailedRoom).catch(() => undefined);
    const sampler = new FrameSampler();
    const xr = await WebXRExperienceHelper.CreateAsync(scene).catch(() => undefined);
    // Optional on ordinary browsers; no automatic mesh fallback hides a layer failure.
    if (xr && typeof XRWebGLBinding !== 'undefined') {
        xr.featuresManager.enableFeature(WebXRLayers.Name, 'latest', {}, true, false);
    }
    const video = new VideoPresentation({
        createTexture: (surface, screenPercent, pose) => createBabylonVideoTexture(surface, scene, engine, screenPercent, pose),
        createLayer: (surface, session, space, screenPercent, pose) => createNativeMediaLayer(surface, session, space,
            (percent, placement) => createBabylonMediaUnderlay(surface, scene, percent, placement), screenPercent, pose)
    });
    const physicalRemote = remote ? createHavokRemote(remote, plugin, havok, room.read) : undefined;
    const simulation = new PhysicsScheduler(physicalRemote || { awake: () => true, wake: () => undefined });
    const remoteMaterial = scene.getMaterialByName('remote-material');
    const updateRemoteFeedback = () => {
        if (remoteMaterial instanceof PBRMaterial) {
            const held = !!physicalRemote?.grab.source();
            remoteMaterial.emissiveColor.set(held ? 0.3 : 0, held ? 0.15 : 0, 0);
        }
    };
    const recallRemote = () => physicalRemote?.recall();
    const movement = new MovementSession(() => playback.pause('movement'), room.destinationClear);
    const input = new ComparisonInput(action => {
        if (recovery.isSuspended()) return;
        const move = movementAction(action);
        if (move) movement.request(move);
        if (action === 'resume-media') playback.resume();
        if (action === 'recall-remote') recallRemote();
        if (action === 'exit-xr') {
            if (xr?.sessionManager.inXRSession) void xr.exitXRAsync().catch(() => input.report('Exit failed. Use headset system exit.'));
            else input.report('No immersive session is active.');
        }
    }, physicalRemote?.grab, point => {
        if (!recovery.isSuspended()) movement.requestDestination(point);
    }, createBabylonSceneQuery(scene), room);
    const controls = createBabylonControls(scene, input.state, input.layout, input.floor);
    const pointing = createBabylonPointing(scene, input);
    const recovery = new SessionRecovery({
        cancelPending() {
            movement.cancel();
            input.update(null, null);
            input.cancel();
            simulation.reset();
            video.interrupt();
        },
        pause: playback.pause,
        report: message => input.report(message)
    });
    const unbindPointer = bindDesktopPointer(canvas, input, (x, y) => {
        const ray = scene.createPickingRay(x * engine.getRenderWidth(), y * engine.getRenderHeight(), Matrix.Identity(), camera);
        return { origin: [ray.origin.x, ray.origin.y, ray.origin.z], direction: [ray.direction.x, ray.direction.y, ray.direction.z] };
    });
    let disposed = false;
    const resize = () => engine.resize();
    const visibility = () => {
        if (document.hidden) recovery.pageVisibility(true);
        else recovery.pageVisibility(false);
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    resize();
    const bodies = aggregates.map(aggregate => aggregate.body);
    engine.runRenderLoop(() => {
        recovery.bind(xr?.sessionManager.inXRSession ? xr.sessionManager.session : null,
            xr?.sessionManager.inXRSession ? xr.sessionManager.referenceSpace : null);
        if (document.hidden || !recovery.canPresent()) {
            simulation.reset();
            return;
        }
        const start = performance.now();
        try {
            const moved = movement.update(xr?.sessionManager.inXRSession ? xr.sessionManager.session : null,
                xr?.sessionManager.inXRSession ? xr.sessionManager.referenceSpace : null,
                xr?.sessionManager.inXRSession ? xr.sessionManager.currentFrame || undefined : undefined,
                space => {
                    if (xr) xr.sessionManager.referenceSpace = space;
                }, root => {
                    camera.position.set(...viewerWorldPosition(root, [0, 1.65, 0]));
                    camera.rotation.set(0, root.yaw, 0);
                });
            if (moved) input.summonControls();
        } catch {
            input.report('Movement failed. Check playback before retrying or exit XR.');
        }
        input.update(xr?.sessionManager.inXRSession ? xr.sessionManager.session : null,
            xr?.sessionManager.inXRSession ? xr.sessionManager.referenceSpace : null,
            xr?.sessionManager.inXRSession ? xr.sessionManager.currentFrame || undefined : undefined, {
                position: [camera.position.x, camera.position.y, camera.position.z],
                forward: [-Math.sin(camera.rotation.y), 0, -Math.cos(camera.rotation.y)]
            });
        controls.update();
        pointing.update();
        video.update(xr?.sessionManager.inXRSession ? xr.sessionManager.session : null,
            xr?.sessionManager.inXRSession ? xr.sessionManager.referenceSpace : null, input.screen.readSize(), input.screen.readPose());
        simulation.advance(start, recovery.isSuspended(), room.read(), seconds => {
            physicalRemote?.grab.step(seconds);
            plugin.executeStep(seconds, bodies);
        });
        updateRemoteFeedback();
        scene.render();
        sampler.record(performance.now() - start);
    });
    const timer = window.setInterval(() => onSample({
        ...sampler.read(), physicsStatus: simulation.status(), remoteHeight: remote?.transformNode.position.y || 0,
        immersive: !!xr?.sessionManager.inXRSession, mediaStatus: video.readStatus(), inputStatus: input.readStatus(),
        assetStatus: [chairs?.status || 'Chair asset failed to load. Collision proxies remain visible; retry by changing model detail.',
            architecture?.status || 'Room shell failed to load. Collision proxies remain visible; retry by changing room detail.'].join(' ')
    }), 1000);

    return {
        setVideo: (surface, mode) => video.attach(surface, mode),
        async enterXR() {
            if (!xr) throw new Error('WebXR is unavailable in this browser.');
            await xr.enterXRAsync('immersive-vr', 'local-floor', undefined, {
                optionalFeatures: ['hand-tracking', 'layers']
            });
            recovery.bind(xr.sessionManager.session, xr.sessionManager.referenceSpace);
        },
        async exitXR() {
            if (xr?.sessionManager.inXRSession) await xr.exitXRAsync();
        },
        recallRemote,
        summonControls: () => input.summonControls(),
        async dispose() {
            if (disposed) return;
            disposed = true;
            recovery.dispose();
            movement.dispose();
            unbindPointer();
            input.dispose();
            controls.dispose();
            pointing.dispose();
            video.dispose();
            engine.stopRenderLoop();
            window.clearInterval(timer);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', visibility);
            try {
                if (xr?.sessionManager.inXRSession) await xr.exitXRAsync();
            } finally {
                xr?.dispose();
                chairs?.dispose();
                architecture?.dispose();
                for (const aggregate of aggregates) aggregate.dispose();
                scene.dispose();
                engine.dispose();
            }
        }
    };
}
