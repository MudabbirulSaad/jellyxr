const CANCELLATION_NAME = 'ActionSheetCancelledError';

export function actionSheetCancelled(): Error {
    const error = new Error('ActionSheet closed without resolving');
    error.name = CANCELLATION_NAME;
    return error;
}

/** Dismissal is not a failed selection; actual loading/selection errors remain visible. */
export function ignoreActionSheetCancellation(error: unknown): void {
    // The inherited ES5 transform does not preserve native Error subclass instanceof checks.
    if (!(error instanceof Error) || error.name !== CANCELLATION_NAME) throw error;
}
