import type { AdminAccess } from "./get-admin-access";

const ADMIN_PATH = "/admin";

/**
 * A dónde mandar a alguien al terminar de ingresar con Google (spec 003, FR-009).
 * Un admin va siempre a la pantalla de administración, aunque haya pedido otra página: no hay
 * botón para llegar ahí. El resto vuelve a donde estaba.
 * `requested` ya viene validado por `safeCallbackPath`.
 */
export function createPostSignInDestination(deps: { getAdminAccess: (userId: string) => Promise<AdminAccess> }) {
  return async function postSignInDestination(userId: string, requested: string): Promise<string> {
    const access = await deps.getAdminAccess(userId);
    return access.ok ? ADMIN_PATH : requested;
  };
}
