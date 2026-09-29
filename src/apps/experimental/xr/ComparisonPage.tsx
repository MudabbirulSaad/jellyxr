import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';

import Page from 'components/Page';
import loading from 'components/loading/loading';
import { playbackManager } from 'components/playback/playbackmanager';

import { readCatalogueFixture } from './fixtures/catalogueFixture';
import type { ComparisonSample, ComparisonScene } from './candidates/types';
import { borrowVideoSurface } from './media/borrowVideoSurface';
import type { VideoPresentationMode } from './media/videoPresentation';
import fixtureVideoUrl from './fixtures/video-orientation.mp4';
import { installSubtitleFixture } from './fixtures/subtitleFixture';
import { installAssFixture } from './fixtures/assFixture';
import { installPgsFixture } from './fixtures/pgsFixture';
import type { ChairQuality } from './assets/chairAssets';

type Candidate = 'babylon' | 'three';
type CanvasCaptionFixture = Awaited<ReturnType<typeof installAssFixture>> & { acquire?(): () => void };

function ComparisonFrame({ embedded, children }: PropsWithChildren<{ embedded: boolean }>) {
    if (embedded) return <div>{children}</div>;
    return <Page id='xrComparisonPage' title='JellyXR technical comparison' isNowPlayingBarEnabled={false}>{children}</Page>;
}

export function Component({ embedded = false }: { embedded?: boolean } = {}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const fixtureVideo = useRef<HTMLVideoElement>(null);
    const fixtureSubtitles = useRef<ReturnType<typeof installSubtitleFixture>>(null);
    const canvasFixture = useRef<CanvasCaptionFixture | null>(null);
    const [captionKind, setCaptionKind] = useState<'text' | 'ass' | 'pgs'>('text');
    const [bitmapBackend, setBitmapBackend] = useState('Not started');
    const captionEnabled = useRef(true);
    const mediaOwner = useRef<'fixture' | 'jellyfin' | null>(null);
    const active = useRef<ComparisonScene>();
    const [candidate, setCandidate] = useState<Candidate>('babylon');
    const [chairQuality, setChairQuality] = useState<ChairQuality>('detailed');
    const [status, setStatus] = useState('Loading comparison scene…');
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [sample, setSample] = useState<ComparisonSample>();
    const [offset, setOffset] = useState(0);
    const [mediaMode, setMediaMode] = useState<VideoPresentationMode>('media-layer');
    const [fixtureCaptions, setFixtureCaptions] = useState(true);
    const catalogue = readCatalogueFixture({ offset, limit: 24 });

    useEffect(() => {
        if (!embedded) loading.hide();
    }, [embedded]);

    useEffect(() => {
        const video = fixtureVideo.current;
        if (!video) return;
        const subtitles = installSubtitleFixture(video);
        fixtureSubtitles.current = subtitles;
        return () => {
            subtitles?.dispose();
            fixtureSubtitles.current = null;
        };
    }, []);

    useEffect(() => {
        if (captionKind === 'text' || !fixtureVideo.current) return;
        let cancelled = false;
        let fixture: CanvasCaptionFixture | undefined;
        const failed = () => {
            if (!cancelled) setStatus('Caption fixture could not load. Switch to Text fixture and retry.');
        };
        const installed = captionKind === 'ass' ? installAssFixture(fixtureVideo.current, failed) :
            installPgsFixture(fixtureVideo.current, failed, name => {
                if (!cancelled) setBitmapBackend(name);
            });
        void installed.then(value => {
            fixture = value;
            if (cancelled) {
                value.dispose();
            } else {
                canvasFixture.current = value;
                if (!captionEnabled.current) value.setEnabled(false);
            }
        }).catch(failed);
        return () => {
            cancelled = true;
            canvasFixture.current = null;
            fixture?.dispose();
        };
    }, [captionKind]);

    useEffect(() => {
        let cancelled = false;
        let instance: ComparisonScene | undefined;
        const target = canvas.current;
        const fixture = fixtureVideo.current;
        setReady(false);
        setSample(undefined);
        setStatus('Loading comparison scene…');
        const onResumeError = () => setStatus('Resume failed. Try Start technical video again.');
        const start = async () => {
            const module = candidate === 'babylon' ?
                await import('./candidates/babylonHavok') : await import('./candidates/threeRapier');
            if (cancelled || !target) return;
            instance = await module.createComparison(target, value => {
                if (!cancelled) setSample(value);
            }, {
                pause(reason) {
                    fixture?.pause();
                    if (mediaOwner.current === 'jellyfin') {
                        const player = playbackManager.getCurrentPlayer();
                        if (!player?.isLocalPlayer || player.id !== 'htmlvideoplayer') throw new Error('Playback owner changed.');
                        playbackManager.pause();
                        if (!player.getVideoPresentationSurface()?.paused) throw new Error('Pause not confirmed.');
                    }
                    if (reason === 'tracking-reset') {
                        setStatus('Tracking changed. Video paused and XR is closing. Enter again when ready.');
                    } else if (reason === 'session-ended') {
                        setStatus('XR session ended. Video paused; resume deliberately in the ordinary player or comparison.');
                    } else {
                        setStatus('Video paused for movement or interruption. Select Resume video when ready.');
                    }
                },
                resume() {
                    if (mediaOwner.current === 'fixture' && fixture) {
                        setStatus('Resume requested for the technical video.');
                        void fixture.play().catch(onResumeError);
                    } else if (mediaOwner.current === 'jellyfin') {
                        const player = playbackManager.getCurrentPlayer();
                        if (player?.isLocalPlayer && player.id === 'htmlvideoplayer') {
                            playbackManager.unpause();
                            setStatus('Resume requested through Jellyfin’s playback owner.');
                        }
                    } else {
                        setStatus('No video is attached. Attach playback or start the technical fixture first.');
                    }
                }
            }, chairQuality);
            if (cancelled) {
                await instance.dispose();
                return;
            }
            active.current = instance;
            setReady(true);
            setStatus('Room ready. Select a video path, then attach current playback or start the technical fixture.');
        };
        void start().catch(error => {
            console.error('XR comparison startup failed', error);
            if (!cancelled) setStatus('The comparison scene could not start. Check the developer console and reload this page.');
        });
        return () => {
            cancelled = true;
            fixture?.pause();
            // Active XR disposal must reach the current owner before this attachment is cleared.
            if (instance) void instance.dispose().catch(() => undefined);
            mediaOwner.current = null;
            active.current = undefined;
        };
    }, [candidate, chairQuality]);

    const chooseBabylon = useCallback(() => setCandidate('babylon'), []);
    const chooseThree = useCallback(() => setCandidate('three'), []);
    const detailedChairs = useCallback(() => setChairQuality('detailed'), []);
    const reducedChairs = useCallback(() => setChairQuality('reduced'), []);
    const recall = useCallback(() => active.current?.recallRemote(), []);
    const summonControls = useCallback(() => active.current?.summonControls(), []);
    const enter = useCallback(() => {
        const instance = active.current;
        if (!instance) return;
        setBusy(true);
        void instance.enterXR().then(() => {
            setStatus('Immersive comparison running. This is a technical fixture, not the production cinema.');
        }).catch(() => {
            setStatus('Immersive entry failed or was declined. Use a secure, XR-capable browser and try again.');
        }).finally(() => setBusy(false));
    }, []);
    const exit = useCallback(() => {
        const instance = active.current;
        if (!instance) return;
        setBusy(true);
        void instance.exitXR().then(() => {
            setStatus('Returned to the desktop comparison.');
        }).catch(() => {
            setStatus('The session could not end cleanly. Use the headset system exit, then reload.');
        }).finally(() => setBusy(false));
    }, []);
    const previous = useCallback(() => setOffset(value => Math.max(0, value - 24)), []);
    const next = useCallback(() => setOffset(value => Math.min(984, value + 24)), []);
    const chooseLayers = useCallback(() => setMediaMode('media-layer'), []);
    const chooseTexture = useCallback(() => setMediaMode('video-texture'), []);
    const toggleFixtureCaptions = useCallback(() => {
        captionEnabled.current = !fixtureCaptions;
        if (captionKind !== 'text') canvasFixture.current?.setEnabled(!fixtureCaptions);
        else fixtureSubtitles.current?.setEnabled(!fixtureCaptions);
        setFixtureCaptions(!fixtureCaptions);
    }, [fixtureCaptions, captionKind]);
    const chooseTextCaptions = useCallback(() => {
        setCaptionKind('text');
        setFixtureCaptions(true);
        captionEnabled.current = true;
        fixtureSubtitles.current?.setEnabled(true);
    }, []);
    const chooseAssCaptions = useCallback(() => {
        fixtureSubtitles.current?.setEnabled(false);
        canvasFixture.current?.setEnabled(true);
        setFixtureCaptions(true);
        captionEnabled.current = true;
        setCaptionKind('ass');
    }, []);
    const choosePgsCaptions = useCallback(() => {
        fixtureSubtitles.current?.setEnabled(false);
        canvasFixture.current?.setEnabled(true);
        setFixtureCaptions(true);
        captionEnabled.current = true;
        setCaptionKind('pgs');
    }, []);
    const attachPlayback = useCallback(() => {
        const instance = active.current;
        if (!instance) return;
        fixtureVideo.current?.pause();
        const surface = borrowVideoSurface(playbackManager, () => {
            mediaOwner.current = null;
            setStatus('Jellyfin changed or stopped the video. Attach current playback again.');
        });
        if (!surface) {
            setStatus('No local Jellyfin video is available. Start playback through the ordinary player, or use the labelled fixture.');
            return;
        }
        instance.setVideo(surface, mediaMode);
        mediaOwner.current = 'jellyfin';
        setStatus('Attached Jellyfin’s existing video. Playback and progress remain owned by Jellyfin.');
    }, [mediaMode]);
    const attachFixture = useCallback((startPlayback: boolean) => {
        const video = fixtureVideo.current;
        const instance = active.current;
        if (!video || !instance) return;
        if (playbackManager.isPlaying()) {
            setStatus('Stop ordinary playback before starting the technical fixture.');
            return;
        }
        let current = true;
        let capturedFixture: CanvasCaptionFixture | null = null;
        let releaseCaption: (() => void) | undefined;
        instance.setVideo({
            video, isCurrent: () => current && fixtureVideo.current === video,
            readSubtitles: () => {
                if (!current) return;
                if (capturedFixture !== canvasFixture.current) {
                    releaseCaption?.();
                    capturedFixture = canvasFixture.current;
                    releaseCaption = capturedFixture?.acquire?.();
                }
                return capturedFixture?.read();
            },
            release: () => {
                current = false;
                releaseCaption?.();
            }
        }, mediaMode);
        mediaOwner.current = 'fixture';
        if (startPlayback) {
            void video.play().then(() => setStatus('Silent technical video started. This is not a Jellyfin delivery-path test.'))
                .catch(() => setStatus('The technical video could not start. Try Start technical video again.'));
        } else {
            setStatus('Technical video attached. Its playback position and paused state are unchanged.');
        }
    }, [mediaMode]);
    const playFixture = useCallback(() => attachFixture(true), [attachFixture]);
    const attachFixtureOnly = useCallback(() => attachFixture(false), [attachFixture]);
    const detachVideo = useCallback(() => {
        active.current?.setVideo(null, mediaMode);
        fixtureVideo.current?.pause();
        mediaOwner.current = null;
        setStatus('Presentation detached. Jellyfin playback, if active, is unchanged.');
    }, [mediaMode]);

    return (
        <ComparisonFrame embedded={embedded}>
            <Box sx={{ padding: '5rem 2rem 2rem', color: '#F2F4F7', backgroundColor: '#0B0F14' }}>
                <Typography variant='h4' component='h1'>Renderer and physics comparison</Typography>
                <Typography component='p' gutterBottom>
                    M2 technical fixture. Original room geometry and synthetic catalogue only. No Jellyfin playback is started here.
                </Typography>
                <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
                    <Button variant={candidate === 'babylon' ? 'contained' : 'outlined'} onClick={chooseBabylon} disabled={busy || !!sample?.immersive}>
                        Babylon 9.27.1 / Havok 1.3.14
                    </Button>
                    <Button variant={candidate === 'three' ? 'contained' : 'outlined'} onClick={chooseThree} disabled={busy || !!sample?.immersive}>
                        Three 0.186.0 / Rapier 0.20.0
                    </Button>
                    <Button onClick={recall} disabled={!ready || busy}>Recall remote</Button>
                    <Button onClick={summonControls} disabled={!ready || busy}>Bring controls here</Button>
                    <Button onClick={enter} disabled={!ready || busy || !!sample?.immersive}>Enter XR comparison</Button>
                    <Button onClick={exit} disabled={!sample?.immersive || busy}>Exit XR</Button>
                </Stack>
                <Typography role='status' component='p' gutterBottom sx={{ marginTop: 2 }}>{status}</Typography>
                <Stack direction='row' spacing={2}>
                    <Button onClick={detailedChairs} aria-pressed={chairQuality === 'detailed'} disabled={busy || !!sample?.immersive}>Detailed chair model</Button>
                    <Button onClick={reducedChairs} aria-pressed={chairQuality === 'reduced'} disabled={busy || !!sample?.immersive}>Reduced chair model</Button>
                </Stack>
                <Typography component='p'>{sample?.assetStatus || 'Loading original chair assets…'}</Typography>
                <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
                    <Button onClick={chooseLayers} aria-pressed={mediaMode === 'media-layer'} variant={mediaMode === 'media-layer' ? 'contained' : 'outlined'} disabled={busy || !!sample?.immersive}>Media layer</Button>
                    <Button onClick={chooseTexture} aria-pressed={mediaMode === 'video-texture'} variant={mediaMode === 'video-texture' ? 'contained' : 'outlined'} disabled={busy || !!sample?.immersive}>Video texture</Button>
                    <Button onClick={attachPlayback} disabled={!ready || busy}>Attach current Jellyfin video</Button>
                    <Button onClick={playFixture} disabled={!ready || busy}>Start technical video</Button>
                    <Button onClick={attachFixtureOnly} disabled={!ready || busy}>Attach technical video</Button>
                    <Button onClick={detachVideo} disabled={!ready || busy}>Detach video</Button>
                </Stack>
                <Typography component='p' gutterBottom>{sample?.mediaStatus || 'No video attached.'}</Typography>
                <Typography component='p'>Both paths compare plain-text captions and borrowed renderer canvases. Media layer mode tests video beneath a masked projection; alpha and foreground occlusion still need Quest validation. The PGS fixture does not qualify server-delivered bitmap tracks. Return to the ordinary player if video or captions are unavailable. Fonts, timing, placement and headset readability remain unqualified.</Typography>
                <Button onClick={chooseTextCaptions} aria-pressed={captionKind === 'text'}>Text fixture</Button>
                <Button onClick={chooseAssCaptions} aria-pressed={captionKind === 'ass'}>ASS fixture</Button>
                <Button onClick={choosePgsCaptions} aria-pressed={captionKind === 'pgs'}>PGS fixture</Button>
                <Button onClick={toggleFixtureCaptions} aria-pressed={fixtureCaptions}>{fixtureCaptions ? 'Hide fixture captions' : 'Show fixture captions'}</Button>
                {captionKind === 'pgs' && <Typography component='p'>Technical PGS renderer: {bitmapBackend}. Server-delivered bitmap tracks remain unqualified.</Typography>}
                <Box sx={{ width: '12rem', maxWidth: '100%', position: 'relative' }}>
                    <Box component='video' ref={fixtureVideo} src={fixtureVideoUrl} muted loop controls playsInline preload='metadata'
                        aria-label='Silent orientation fixture source' sx={{ width: '100%' }} />
                </Box>
                <Box component='canvas' key={`${candidate}-${chairQuality}`} ref={canvas} tabIndex={0} aria-label='Technical Observatory room preview'
                    sx={{ display: 'block', width: '100%', height: '55vh', backgroundColor: '#151B23' }} />
                <Typography component='p'>{sample?.inputStatus || 'Spatial controls are preparing.'}</Typography>
                <Typography component='p'>Room controls use world-space hit testing. On PC, click a target or focus the canvas, use arrow keys and press Enter. In XR, point and deliberately trigger or pinch. Movement pauses video and requires Resume. Looking alone does nothing. Hands, depth and comfort still need Quest validation.</Typography>
                <Typography component='p'>The pointer endpoint marks the selected surface. A cross means a control or floor destination is blocked. Move your aim into clear space; an obstructed control cannot activate. Tracking loss removes the pointer and cancels the press.</Typography>
                <Typography component='p'>To recover controls after turning, trigger or pinch while pointing at empty room space. On PC, use Bring controls here or press Home on the canvas. The controls settle in front of you and stay anchored; deliberate movement recalls them again.</Typography>
                <Typography component='p'>Choose floor arms teleport selection. Point at clear floor and confirm with trigger or pinch; Cancel move leaves you in place. On PC, use arrow keys to adjust the destination after Choose floor, Enter to confirm and Escape to cancel. A blocked destination never moves you.</Typography>
                <Typography component='p'>Remote fixture: bring a controller close and hold its grip, or bring thumb and index finger close and pinch. Release to drop. Recall remote restores it to the stand. Held orientation is constrained; throwing and production remote controls are not part of this fixture.</Typography>
                <Typography component='p' gutterBottom sx={{ marginTop: 2 }}>
                    {sample ? `${sample.frames} frames; recent p95 application work ${sample.p95WorkMs.toFixed(2)} ms; remote height ${sample.remoteHeight.toFixed(3)} m.` : 'Frame observations will appear after the scene starts.'}
                    {' '}These timings exclude GPU, compositor and video decoding; they are not Quest qualification.
                </Typography>
                <Typography variant='h6' component='h2'>Local catalogue fixture: {catalogue.total} items</Typography>
                <Typography>Page {Math.floor(offset / 24) + 1}. Only this page is returned to the view. These are technical records, not films.</Typography>
                <Stack direction='row' spacing={2}>
                    <Button onClick={previous} disabled={offset === 0}>Previous fixture page</Button>
                    <Button onClick={next} disabled={catalogue.nextOffset === null}>Next fixture page</Button>
                </Stack>
                <ul>{catalogue.items.map(item => <li key={item.id}>{item.title}{item.artwork === 'missing' ? ' / Missing-artwork case' : ''}</li>)}</ul>
            </Box>
        </ComparisonFrame>
    );
}
