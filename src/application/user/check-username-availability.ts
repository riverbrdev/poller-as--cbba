import { normalizeUsername, validateUsername } from "@/domain/user/username";
import type { UserRepository } from "@/application/ports/user-repository";

export type CheckUsernameAvailabilityResult =
  | { ok: true; available: boolean }
  | { ok: false; error: "invalid_username" };

/** Para el aviso "@juanperez está disponible" mientras la persona escribe. */
export function createCheckUsernameAvailability(deps: { users: UserRepository }) {
  return async function checkUsernameAvailability(
    username: string,
  ): Promise<CheckUsernameAvailabilityResult> {
    if (!validateUsername(username).valid) {
      return { ok: false, error: "invalid_username" };
    }
    const existing = await deps.users.findByUsername(normalizeUsername(username));
    return { ok: true, available: existing === null };
  };
}
