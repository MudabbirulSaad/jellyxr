import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Page from 'components/Page';
import loading from 'components/loading/loading';

import { readCatalogueFixture } from './fixtures/catalogueFixture';
import type { ComparisonSample, ComparisonScene } from './candidates/types';

type Candidate = 'babylon' | 'three';

export function Component() {
    const canvas = useRef<HTMLCanvasElement>(null);
    const active = useRef<ComparisonScene>();
    const [candidate, setCandidate] = useState<Candidate>('babylon');
    const [status, setStatus] = useState('Loading comparison scene…');
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [sample, setSample] = useState<ComparisonSample>();
    const [offset, setOffset] = useState(0);
    const catalogue = readCatalogueFixture({ offset, limit: 24 });

    useEffect(() => loading.hide(), []);

    useEffect(() => {
        let cancelled = false;
        let instance: ComparisonScene | undefined;
        const target = canvas.current;
        setReady(false);
        setSample(undefined);
        setStatus('Loading comparison scene…');
        const start = async () => {
            const module = candidate === 'babylon' ?
                await import('./candidates/babylonHavok') : await import('./candidates/threeRapier');
            if (cancelled || !target) return;
            instance = await module.createComparison(target, value => {
                if (!cancelled) setSample(value);
            });
            if (cancelled) {
                await instance.dispose();
                return;
            }
            active.current = instance;
            setReady(true);
            setStatus('Room and falling-remote fixture ready. Media and input qualification are not attached yet.');
        };
        void start().catch(error => {
            console.error('XR comparison startup failed', error);
            if (!cancelled) setStatus('The comparison scene could not start. Check the developer console and reload this page.');
        });
        return () => {
            cancelled = true;
            active.current = undefined;
            if (instance) void instance.dispose().catch(() => undefined);
        };
    }, [candidate]);

    const chooseBabylon = useCallback(() => setCandidate('babylon'), []);
    const chooseThree = useCallback(() => setCandidate('three'), []);
    const recall = useCallback(() => active.current?.recallRemote(), []);
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

    return (
        <Page id='xrComparisonPage' title='JellyXR technical comparison' isNowPlayingBarEnabled={false}>
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
                    <Button onClick={enter} disabled={!ready || busy || !!sample?.immersive}>Enter XR comparison</Button>
                    <Button onClick={exit} disabled={!sample?.immersive || busy}>Exit XR</Button>
                </Stack>
                <Typography role='status' component='p' gutterBottom sx={{ marginTop: 2 }}>{status}</Typography>
                <Box component='canvas' key={candidate} ref={canvas} aria-label='Technical Observatory room preview'
                    sx={{ display: 'block', width: '100%', height: '55vh', backgroundColor: '#151B23' }} />
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
        </Page>
    );
}
