import { normalizeUsername, validateUsername } from "@/domain/user/username";
import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type ChooseUsernameResult =
  | { ok: true; user: UserRecord }
  | {
      ok: false;
      error: "invalid_username" | "username_taken" | "username_already_set" | "user_not_found";
    };

/**
 * Onboarding de la cuenta de Google: elige el `username` público una sola vez.
 * Después no se puede cambiar en v1, para que nadie se haga pasar por otro.
 */
export function createChooseUsername(deps: { users: UserRepository }) {
  return async function chooseUsername(userId: string, username: string): Promise<ChooseUsernameResult> {
    if (!validateUsername(username).valid) {
      return { ok: false, error: "invalid_username" };
    }

    const user = await deps.users.findById(userId);
    if (!user) {
      return { ok: false, error: "user_not_found" };
    }
    if (user.username !== null) {
      return { ok: false, error: "username_already_set" };
    }

    const normalized = normalizeUsername(username);
    if (await deps.users.findByUsername(normalized)) {
      return { ok: false, error: "username_taken" };
    }

    const updated = await deps.users.setUsername(userId, normalized);
    if (!updated.ok) {
      return { ok: false, error: "username_taken" };
    }
    return { ok: true, user: updated.user };
  };
}
