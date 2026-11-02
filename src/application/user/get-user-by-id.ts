import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

/** Lee la cuenta actual para refrescar la sesión (por ejemplo, después de elegir username). */
export function createGetUserById(deps: { users: UserRepository }) {
  return async function getUserById(userId: string): Promise<UserRecord | null> {
    return deps.users.findById(userId);
  };
}
