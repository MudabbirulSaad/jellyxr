import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';

import { playbackManager } from 'components/playback/playbackmanager';
import Events from 'utils/events';

const Workbench = lazy(() => import('./ComparisonPage').then(module => ({ default: module.Component })));

function containInput(event: React.SyntheticEvent) {
    event.stopPropagation();
}

function hasLocalVideo(): boolean {
    const player = playbackManager.getCurrentPlayer();
    return !!(player?.isLocalPlayer && player.id === 'htmlvideoplayer' && player.getVideoPresentationSurface());
}

/** Opt-in only: preserves the inherited video view instead of triggering stop-on-navigation. */
export default function ComparisonOverlay() {
    const [available, setAvailable] = useState(hasLocalVideo);
    const [open, setOpen] = useState(false);
    const show = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setOpen(true);
    }, []);
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const refresh = () => setAvailable(hasLocalVideo());
        Events.on(playbackManager, 'playbackstart', refresh);
        Events.on(playbackManager, 'playbackstop', refresh);
        Events.on(playbackManager, 'playerchange', refresh);
        return () => {
            Events.off(playbackManager, 'playbackstart', refresh);
            Events.off(playbackManager, 'playbackstop', refresh);
            Events.off(playbackManager, 'playerchange', refresh);
        };
    }, []);

    return (
        <>
            {available && !open && (
                <Button variant='contained' onClick={show} onKeyDown={containInput}
                    sx={{ position: 'fixed', top: '5rem', right: '1rem', zIndex: 2100 }}>
                    Open XR media test
                </Button>
            )}
            <Dialog open={open} fullScreen onClose={close} aria-labelledby='xr-media-test-title'
                onKeyDown={containInput} onWheel={containInput} onClick={containInput}>
                <DialogTitle id='xr-media-test-title'>XR media test — existing Jellyfin player</DialogTitle>
                <DialogContent>
                    <Typography>The player remains open underneath. Choose a presentation path, then attach its existing video. Closing this test detaches the scene without stopping Jellyfin.</Typography>
                    <Suspense fallback={<Typography role='status'>Preparing media comparison…</Typography>}>
                        {open && <Workbench embedded />}
                    </Suspense>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>Return to Jellyfin player</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
