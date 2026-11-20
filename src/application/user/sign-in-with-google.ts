import { type AdminAllowlist, isAllowlistedEmail } from "@/domain/user/admin";
import { normalizeEmail } from "@/domain/user/email";
import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type SignInWithGoogleResult =
  | { ok: true; user: UserRecord; isNewUser: boolean }
  | { ok: false; error: "email_registered_with_password" | "google_id_taken" };

/**
 * Login con Google (SPEC §4, regla 2b): no une cuentas.
 * Si el correo ya existe como cuenta de contraseña, se rechaza.
 * Las cuentas nuevas nacen sin `username`: el usuario lo elige después.
 *
 * Rol (spec 003, FR-003 y FR-004): la cuenta es `admin` si su correo guardado está en la lista
 * autorizada, y `user` si no. Google ya exige el correo verificado (ver composition/auth.ts).
 */
export function createSignInWithGoogle(deps: { users: UserRepository; adminEmails: AdminAllowlist }) {
  /** Ajusta el rol a la lista. Solo escribe si cambia. */
  async function withRoleFromAllowlist(user: UserRecord): Promise<UserRecord> {
    const expected = isAllowlistedEmail(user.email, deps.adminEmails) ? "admin" : "user";
    return user.role === expected ? user : deps.users.setRole(user.id, expected);
  }

  return async function signInWithGoogle(profile: GoogleProfile): Promise<SignInWithGoogleResult> {
    const byGoogleId = await deps.users.findByGoogleId(profile.googleId);
    if (byGoogleId) {
      return { ok: true, user: await withRoleFromAllowlist(byGoogleId), isNewUser: false };
    }

    const email = normalizeEmail(profile.email);
    const byEmail = await deps.users.findByEmail(email);
    if (byEmail) {
      return { ok: false, error: "email_registered_with_password" };
    }

    const created = await deps.users.create({
      username: null,
      googleId: profile.googleId,
      passwordHash: null,
      name: profile.name,
      email,
      avatarUrl: profile.avatarUrl,
    });

    if (!created.ok) {
      return {
        ok: false,
        error: created.conflict === "google_id_taken" ? "google_id_taken" : "email_registered_with_password",
      };
    }
    return { ok: true, user: await withRoleFromAllowlist(created.user), isNewUser: true };
  };
}
