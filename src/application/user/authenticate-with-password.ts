import { isEmailAllowed, normalizeEmail } from "@/domain/user/email";
import type { PasswordHasher } from "@/application/ports/password-hasher";
import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type AuthenticateWithPasswordResult =
  | { ok: true; user: UserRecord }
  | { ok: false; error: "invalid_credentials" };

/**
 * Login con correo y contraseña. El error es genérico a propósito:
 * no revela si el correo existe ni si la cuenta usa Google.
 */
export function createAuthenticateWithPassword(deps: {
  users: UserRepository;
  hasher: PasswordHasher;
  allowedEmails?: readonly string[];
}) {
  return async function authenticateWithPassword(
    email: string,
    password: string,
  ): Promise<AuthenticateWithPasswordResult> {
    const normalizedEmail = normalizeEmail(email);
    // Mismo error genérico: no se revela que el correo existe pero no tiene acceso.
    if (!isEmailAllowed(normalizedEmail, deps.allowedEmails ?? [])) {
      return { ok: false, error: "invalid_credentials" };
    }

    const user = await deps.users.findByEmail(normalizedEmail);
    if (!user?.passwordHash) {
      return { ok: false, error: "invalid_credentials" };
    }

    const matches = await deps.hasher.verify(password, user.passwordHash);
    if (!matches) {
      return { ok: false, error: "invalid_credentials" };
    }
    return { ok: true, user };
  };
}
