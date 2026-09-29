import {
    AmbientLight, BoxGeometry, Color, DirectionalLight, Mesh, MeshStandardMaterial,
    PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer
} from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

import { FixedStepClock } from '../fixtures/fixedStepClock';
import { ROOM_FIXTURE } from '../fixtures/roomFixture';
import { VideoPresentation } from '../media/videoPresentation';
import { createNativeMediaLayer } from '../media/nativeMediaLayer';
import { createThreeVideoTexture } from '../media/threeVideoTexture';
import { ComparisonInput } from '../input/comparisonInput';
import { createThreeControls } from '../input/threeControls';
import { bindDesktopPointer } from '../input/desktopPointer';
import { movementAction, MovementSession } from '../input/movementSession';
import { viewerWorldPosition } from '../input/movement';
import { createRapierRemote } from '../input/rapierRemote';
import { loadThreeChairs } from '../assets/threeChairs';
import type { ChairQuality } from '../assets/chairAssets';

import { FrameSampler } from './frameSampler';
import { FIXTURE_COLOURS, type ComparisonPlaybackActions, type ComparisonScene, type SampleListener } from './types';

export async function createComparison(canvas: HTMLCanvasElement, onSample: SampleListener, playback: ComparisonPlaybackActions, quality: ChairQuality): Promise<ComparisonScene> {
    await RAPIER.init();
    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(1);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    const scene = new Scene();
    scene.background = new Color(FIXTURE_COLOURS.graphite);
    const camera = new PerspectiveCamera(70, 1, 0.05, 50);
    camera.position.set(0, 1.65, 0);
    camera.lookAt(0, 1.65, -6.5);
    scene.add(new AmbientLight(0xffffff, 1));
    const light = new DirectionalLight(0xffecd1, 2);
    light.position.set(0, 3.5, 0);
    scene.add(light);

    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    const meshes: Mesh<BoxGeometry, MeshStandardMaterial>[] = [];
    let remote: Mesh<BoxGeometry, MeshStandardMaterial> | undefined;
    let remoteBody: RAPIER.RigidBody | undefined;
    for (const box of ROOM_FIXTURE) {
        const material = new MeshStandardMaterial({
            color: FIXTURE_COLOURS[box.material],
            roughness: 0.8,
            metalness: box.material === 'metal' ? 0.5 : 0,
            emissive: box.material === 'warm' ? FIXTURE_COLOURS.warm : 0,
            emissiveIntensity: 0.5
        });
        const mesh = new Mesh(new BoxGeometry(...box.size), material);
        mesh.name = box.id;
        mesh.position.set(...box.position);
        scene.add(mesh);
        meshes.push(mesh);
        if (box.collision === 'none') continue;
        const dynamic = box.collision === 'dynamic';
        const descriptor = dynamic ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
        descriptor.setTranslation(...box.position);
        if (dynamic) descriptor.setLinearDamping(0.5).setAngularDamping(0.5).setCcdEnabled(true);
        const body = world.createRigidBody(descriptor);
        const collider = RAPIER.ColliderDesc.cuboid(box.size[0] / 2, box.size[1] / 2, box.size[2] / 2)
            .setFriction(0.6).setRestitution(0.1);
        if (dynamic) collider.setMass(0.18);
        world.createCollider(collider, body);
        if (dynamic) {
            remote = mesh;
            remoteBody = body;
        }
    }

    // A failed import retains visible collision proxies and an explicit diagnostic.
    const chairs = await loadThreeChairs(scene, quality).catch(() => undefined);
    const clock = new FixedStepClock();
    const physicalRemote = createRapierRemote(remoteBody);
    const recallRemote = () => physicalRemote?.recall();
    const movement = new MovementSession(playback.pauseForMovement);
    const input = new ComparisonInput(action => {
        const move = movementAction(action);
        if (move) movement.request(move);
        if (action === 'resume-media') playback.resume();
        if (action === 'recall-remote') recallRemote();
        if (action === 'exit-xr') {
            const session = renderer.xr.getSession();
            if (session) void session.end().catch(() => input.report('Exit failed. Use headset system exit.'));
            else input.report('No immersive session is active.');
        }
    }, physicalRemote?.grab);
    const controls = createThreeControls(scene, input.state);
    const raycaster = new Raycaster();
    const unbindPointer = bindDesktopPointer(canvas, input, (x, y) => {
        raycaster.setFromCamera(new Vector2(x * 2 - 1, 1 - y * 2), camera);
        const { origin, direction } = raycaster.ray;
        return { origin: [origin.x, origin.y, origin.z], direction: [direction.x, direction.y, direction.z] };
    });
    const video = new VideoPresentation({
        createTexture: surface => createThreeVideoTexture(surface, scene),
        createLayer: createNativeMediaLayer
    });
    const sampler = new FrameSampler();
    let disposed = false;
    const resize = () => {
        if (renderer.xr.isPresenting) return;
        const width = Math.max(1, canvas.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };
    const visibility = () => {
        clock.reset();
        movement.cancel();
        input.cancel();
    };
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    resize();
    renderer.setAnimationLoop((time, frame) => {
        if (document.hidden) {
            clock.reset();
            return;
        }
        const start = performance.now();
        try {
            const moved = movement.update(renderer.xr.getSession(), renderer.xr.getReferenceSpace(), frame,
                space => renderer.xr.setReferenceSpace(space), root => {
                    camera.position.set(...viewerWorldPosition(root, [0, 1.65, 0]));
                    camera.rotation.set(0, root.yaw, 0);
                });
            if (moved) input.cancel();
        } catch {
            input.report('Movement failed. Check playback before retrying or exit XR.');
        }
        input.update(renderer.xr.getSession(), renderer.xr.getReferenceSpace(), frame);
        controls.update();
        video.update(renderer.xr.getSession(), renderer.xr.getReferenceSpace());
        clock.advance(time, seconds => {
            physicalRemote?.grab.step(seconds);
            world.timestep = seconds;
            world.step();
        });
        if (remote && remoteBody) {
            remote.material.emissive.set(physicalRemote?.grab.source() ? FIXTURE_COLOURS.warm : 0);
            remote.position.copy(remoteBody.translation());
            remote.quaternion.copy(remoteBody.rotation());
        }
        renderer.render(scene, camera);
        sampler.record(performance.now() - start);
    });
    const timer = window.setInterval(() => onSample({
        ...sampler.read(), remoteHeight: remote?.position.y || 0, immersive: renderer.xr.isPresenting,
        mediaStatus: video.readStatus(), inputStatus: input.readStatus(),
        assetStatus: chairs?.status || 'Chair asset failed to load. Collision proxies remain visible; retry by changing model detail.'
    }), 1000);

    return {
        setVideo: (surface, mode) => video.attach(surface, mode),
        async enterXR() {
            // The comparison is optional; unsupported ordinary browsers retain the fixture preview.
            if (!navigator.xr) throw new Error('WebXR is unavailable in this browser.');
            // eslint-disable-next-line compat/compat -- Guarded optional experiment; ordinary mode never requests XR.
            const session = await navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['local-floor'], optionalFeatures: ['hand-tracking', 'layers']
            });
            try {
                await renderer.xr.setSession(session);
            } catch (error) {
                await session.end();
                throw error;
            }
        },
        async exitXR() {
            await renderer.xr.getSession()?.end();
        },
        recallRemote,
        async dispose() {
            if (disposed) return;
            disposed = true;
            movement.dispose();
            unbindPointer();
            input.dispose();
            controls.dispose();
            video.dispose();
            renderer.setAnimationLoop(null);
            window.clearInterval(timer);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', visibility);
            try {
                await renderer.xr.getSession()?.end();
            } finally {
                chairs?.dispose();
                for (const mesh of meshes) {
                    mesh.geometry.dispose();
                    mesh.material.dispose();
                }
                world.free();
                renderer.dispose();
            }
        }
    };
}
