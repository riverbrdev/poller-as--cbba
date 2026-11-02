import { normalizeEmail } from "@/domain/user/email";
import { validatePassword } from "@/domain/user/password";
import { normalizeUsername, validateUsername } from "@/domain/user/username";
import type { PasswordHasher } from "@/application/ports/password-hasher";
import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type RegisterWithPasswordInput = { username: string; email: string; password: string };

export type RegisterWithPasswordResult =
  | { ok: true; user: UserRecord }
  | {
      ok: false;
      error:
        | "invalid_username"
        | "invalid_password"
        | "username_taken"
        | "email_registered_with_password"
        | "email_registered_with_google";
    };

/**
 * Registro con correo y contraseña (SPEC §4, reglas 2a y 2b).
 * Si el correo ya existe, no une cuentas: informa con qué método está registrado.
 */
export function createRegisterWithPassword(deps: {
  users: UserRepository;
  hasher: PasswordHasher;
}) {
  return async function registerWithPassword(
    input: RegisterWithPasswordInput,
  ): Promise<RegisterWithPasswordResult> {
    if (!validateUsername(input.username).valid) {
      return { ok: false, error: "invalid_username" };
    }
    if (!validatePassword(input.password).valid) {
      return { ok: false, error: "invalid_password" };
    }

    const username = normalizeUsername(input.username);
    const email = normalizeEmail(input.email);

    if (await deps.users.findByUsername(username)) {
      return { ok: false, error: "username_taken" };
    }

    const existing = await deps.users.findByEmail(email);
    if (existing?.passwordHash) {
      return { ok: false, error: "email_registered_with_password" };
    }
    if (existing) {
      return { ok: false, error: "email_registered_with_google" };
    }

    const passwordHash = await deps.hasher.hash(input.password);
    const created = await deps.users.create({
      username,
      googleId: null,
      passwordHash,
      name: username,
      email,
      avatarUrl: null,
    });

    if (!created.ok) {
      return {
        ok: false,
        error: created.conflict === "username_taken" ? "username_taken" : "email_registered_with_password",
      };
    }
    return { ok: true, user: created.user };
  };
}
