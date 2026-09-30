/* eslint new-cap: ["error", { "capIsNewExceptions": ["HP_Body_GetActivationState", "HP_Body_SetActivationState"] }] */
import type { HavokPhysicsWithBindings, HP_BodyId } from '@babylonjs/havok';

import type { PhysicsActivity } from '../fixtures/physicsScheduler';

/** Babylon 9.27.1 has no public sleep query. Keep its pinned native-handle seam here. */
export function createHavokActivity(body: { _pluginData: unknown }, havok: HavokPhysicsWithBindings): PhysicsActivity {
    const bodyId = (): HP_BodyId | null => {
        const id = (body._pluginData as { hpBodyId?: unknown } | null)?.hpBodyId;
        return Array.isArray(id) && id.length === 1 && typeof id[0] === 'bigint' ? id as HP_BodyId : null;
    };
    let unavailable = false;
    return {
        awake() {
            const id = bodyId();
            if (!id || unavailable) return true;
            try {
                const [result, state] = havok.HP_Body_GetActivationState(id);
                return result !== havok.Result.RESULT_OK || state !== havok.ActivationState.INACTIVE;
            } catch {
                // Compatibility fallback: keep stepping instead of freezing an unobserved body.
                unavailable = true;
                return true;
            }
        },
        wake() {
            const id = bodyId();
            if (!id) return;
            try {
                if (havok.HP_Body_SetActivationState(id, havok.ActivationState.ACTIVE) !== havok.Result.RESULT_OK) unavailable = true;
            } catch {
                unavailable = true;
            }
        }
    };
}
