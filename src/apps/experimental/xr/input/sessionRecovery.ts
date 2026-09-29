export type PauseReason = 'movement' | 'visibility-lost' | 'session-ended' | 'tracking-reset';

interface RecoveryHost {
    cancelPending(): void;
    pause(reason: PauseReason): void;
    report(message: string): void;
}

/** Event-driven recovery also runs when a hidden headset stops requesting animation frames. */
export class SessionRecovery {
    private session: XRSession | null = null;
    private space: XRReferenceSpace | null = null;
    private invalidated = false;
    private pageHidden = false;

    constructor(private readonly host: RecoveryHost) {}

    bind(session: XRSession | null, space: XRReferenceSpace | null): void {
        if (session !== this.session) {
            this.unbind();
            this.session = session;
            this.invalidated = false;
            session?.addEventListener('visibilitychange', this.visibility);
            session?.addEventListener('end', this.ended);
            if (session && session.visibilityState !== 'visible') this.interrupt('visibility-lost');
        }
        if (space !== this.space) {
            this.space?.removeEventListener('reset', this.reset);
            this.space = space;
            space?.addEventListener('reset', this.reset);
        }
    }

    isSuspended(): boolean {
        return this.pageHidden || this.invalidated || (!!this.session && this.session.visibilityState !== 'visible');
    }

    canPresent(): boolean {
        // A system overlay may blur focus while the room remains visible. Keep head-tracked
        // rendering there, but leave playback, input and physics suspended.
        return !this.pageHidden && !this.invalidated && this.session?.visibilityState !== 'hidden';
    }

    pageVisibility(hidden: boolean): void {
        if (hidden && !this.pageHidden) this.interrupt('visibility-lost');
        this.pageHidden = hidden;
    }

    private interrupt(reason: PauseReason): void {
        this.host.cancelPending();
        try {
            this.host.pause(reason);
        } catch {
            this.host.report('Pause could not be confirmed. Exit XR and pause in the ordinary player.');
        }
    }

    private visibility = (): void => {
        if (this.session?.visibilityState !== 'visible') this.interrupt('visibility-lost');
    };

    private ended = (): void => {
        if (!this.invalidated) this.interrupt('session-ended');
        this.invalidated = true;
    };

    private reset = (): void => {
        if (!this.session || this.invalidated) return;
        this.invalidated = true;
        this.interrupt('tracking-reset');
        // Do not guess a new world origin from a discontinuity. Re-entry is deliberate.
        void this.session.end().catch(() => {
            this.host.report('Tracking changed and XR could not close. Use the headset system exit.');
        });
    };

    private unbind(): void {
        this.session?.removeEventListener('visibilitychange', this.visibility);
        this.session?.removeEventListener('end', this.ended);
        this.space?.removeEventListener('reset', this.reset);
        this.space = null;
    }

    dispose(): void {
        if (this.session && !this.invalidated) this.interrupt('session-ended');
        this.unbind();
        this.session = null;
        this.invalidated = true;
    }
}
