import { isEmailAllowed, normalizeEmail } from "@/domain/user/email";
import type { UserRecord, UserRepository } from "@/application/ports/user-repository";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

export type SignInWithGoogleResult =
  | { ok: true; user: UserRecord; isNewUser: boolean }
  | { ok: false; error: "email_not_allowed" | "email_registered_with_password" | "google_id_taken" };

/**
 * Login con Google (SPEC §4, regla 2b): no une cuentas.
 * Si el correo ya existe como cuenta de contraseña, se rechaza.
 * Las cuentas nuevas nacen sin `username`: el usuario lo elige después.
 */
export function createSignInWithGoogle(deps: { users: UserRepository; allowedEmails?: readonly string[] }) {
  return async function signInWithGoogle(profile: GoogleProfile): Promise<SignInWithGoogleResult> {
    // Va primero: una cuenta que ya existe tampoco entra si su correo salió de la lista.
    if (!isEmailAllowed(profile.email, deps.allowedEmails ?? [])) {
      return { ok: false, error: "email_not_allowed" };
    }

    const byGoogleId = await deps.users.findByGoogleId(profile.googleId);
    if (byGoogleId) {
      return { ok: true, user: byGoogleId, isNewUser: false };
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
    return { ok: true, user: created.user, isNewUser: true };
  };
}
