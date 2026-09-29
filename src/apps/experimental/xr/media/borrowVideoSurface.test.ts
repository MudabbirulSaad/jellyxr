import { describe, expect, it, vi } from 'vitest';

import Events from 'utils/events';

import { borrowVideoSurface, type VideoPresentationPlayer } from './borrowVideoSurface';

const createOwner = () => {
    const video = document.createElement('video');
    video.setAttribute('src', 'data:video/mp4,');
    video.currentTime = 12;
    video.autoplay = false;
    video.loop = false;
    video.muted = false;
    const play = vi.spyOn(video, 'play').mockResolvedValue();
    const pause = vi.spyOn(video, 'pause').mockImplementation(() => undefined);
    const load = vi.spyOn(video, 'load').mockImplementation(() => undefined);
    const player: VideoPresentationPlayer = {
        id: 'htmlvideoplayer', isLocalPlayer: true, getVideoPresentationSurface: () => video
    };
    const owner = { getCurrentPlayer: vi.fn(() => player) };
    return { owner, player, video, play, pause, load };
};

describe('borrowed player surface', () => {
    it('keeps the same element and does not take over playback on borrow or release', () => {
        const { owner, video, play, pause, load } = createOwner();
        const invalidated = vi.fn();
        const lease = borrowVideoSurface(owner, invalidated);
        expect(lease?.video).toBe(video);
        expect(lease?.isCurrent()).toBe(true);
        lease?.release();
        lease?.release();
        expect(lease?.isCurrent()).toBe(false);
        expect(video.getAttribute('src')).toBe('data:video/mp4,');
        expect(video.currentTime).toBe(12);
        expect([video.autoplay, video.loop, video.muted]).toEqual([false, false, false]);
        expect(play).not.toHaveBeenCalled();
        expect(pause).not.toHaveBeenCalled();
        expect(load).not.toHaveBeenCalled();
        expect(invalidated).not.toHaveBeenCalled();
    });

    it('invalidates once on stop and removes later event callbacks', () => {
        const { owner, video } = createOwner();
        const invalidated = vi.fn();
        const lease = borrowVideoSurface(owner, invalidated);
        Events.trigger(owner, 'playbackstop');
        Events.trigger(owner, 'playerchange');
        video.dispatchEvent(new Event('emptied'));
        expect(lease?.isCurrent()).toBe(false);
        expect(invalidated).toHaveBeenCalledExactlyOnceWith('playback-stopped');
    });

    it('rejects remote and non-video players without accessing their surface', () => {
        const getter = vi.fn();
        expect(borrowVideoSurface({ getCurrentPlayer: () => ({ id: 'cast', getVideoPresentationSurface: getter }) }, vi.fn())).toBeNull();
        expect(borrowVideoSurface({ getCurrentPlayer: () => undefined }, vi.fn())).toBeNull();
        expect(getter).not.toHaveBeenCalled();
    });

    it('detects element replacement even if an owner event was missed', () => {
        const { owner, player } = createOwner();
        const invalidated = vi.fn();
        const lease = borrowVideoSurface(owner, invalidated);
        player.getVideoPresentationSurface = () => document.createElement('video');
        expect(lease?.isCurrent()).toBe(false);
        expect(invalidated).toHaveBeenCalledExactlyOnceWith('media-replaced');
    });

    it('detaches on media errors and can subsequently borrow a fresh surface', () => {
        const { owner, video } = createOwner();
        const invalidated = vi.fn();
        const first = borrowVideoSurface(owner, invalidated);
        video.dispatchEvent(new Event('error'));
        expect(first?.isCurrent()).toBe(false);
        const next = borrowVideoSurface(owner, vi.fn());
        expect(next?.isCurrent()).toBe(true);
        next?.release();
        expect(invalidated).toHaveBeenCalledExactlyOnceWith('media-error');
    });
});
