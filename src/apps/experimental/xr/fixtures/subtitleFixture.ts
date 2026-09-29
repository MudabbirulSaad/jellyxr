/** Original labelled cues for the eight-second calibration clip; never attach to Jellyfin media. */
export function installSubtitleFixture(video: HTMLVideoElement) {
    if (typeof VTTCue === 'undefined') return null;
    const track = video.addTextTrack('subtitles', 'JellyXR technical captions', 'en');
    const entries = [
        [0.25, 2.25, 'TECHNICAL CAPTION 1\nClear this text at 2.25 seconds.'],
        [3, 5, 'TECHNICAL CAPTION 2\nPause or seek to check synchronization.'],
        [5.75, 7.75, 'TECHNICAL CAPTION 3\nThe caption gap must remain empty.']
    ] as const;
    for (const [start, end, text] of entries) {
        track.addCue(new VTTCue(start, end, text));
    }
    track.mode = 'showing';
    return {
        setEnabled: (enabled: boolean) => { track.mode = enabled ? 'showing' : 'disabled'; },
        dispose() {
            track.mode = 'disabled';
            while (track.cues?.length) track.removeCue(track.cues[0]);
        }
    };
}
