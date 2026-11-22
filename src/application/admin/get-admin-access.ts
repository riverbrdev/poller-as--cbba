import { type AdminAllowlist, isAllowlistedEmail } from "@/domain/user/admin";
import type { UserRepository } from "@/application/ports/user-repository";

/** Solo lleva el `@usuario`: nunca correo, nombre ni id de Google (FR-011). */
export type AdminAccess =
  | { ok: true; admin: { username: string } }
  | { ok: false; reason: "not_admin" | "needs_username" };

/**
 * Autorización del área de administración (spec 003, FR-007). Se llama en **cada** pedido.
 * Relee la cuenta de la base y exige las tres cosas: cuenta de Google, rol admin y correo en la
 * lista en este momento. Si el correo salió de la lista, baja la cuenta a `user` (corte inmediato).
 * No sube el rol: eso solo pasa al ingresar con Google (FR-003).
 */
export function createGetAdminAccess(deps: { users: UserRepository; adminEmails: AdminAllowlist }) {
  return async function getAdminAccess(userId: string): Promise<AdminAccess> {
    const user = await deps.users.findById(userId);
    if (!user) {
      return { ok: false, reason: "not_admin" };
    }

    const qualifies = user.googleId !== null && isAllowlistedEmail(user.email, deps.adminEmails);
    if (user.role === "admin" && !qualifies) {
      await deps.users.setRole(user.id, "user");
      return { ok: false, reason: "not_admin" };
    }
    if (user.role !== "admin") {
      return { ok: false, reason: "not_admin" };
    }
    if (user.username === null) {
      return { ok: false, reason: "needs_username" };
    }
    return { ok: true, admin: { username: user.username } };
  };
}
