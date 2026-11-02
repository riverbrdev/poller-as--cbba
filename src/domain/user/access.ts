/**
 * Rutas que requieren sesión. El ranking y los perfiles son públicos (SPEC §2).
 * Esto solo decide redirecciones: la autorización real se verifica en el servidor, en cada caso de uso.
 */
const LOGIN_REQUIRED_PREFIXES = ["/calificar", "/sugerir", "/mi-perfil"];
const ONBOARDING_PATH = "/onboarding/username";

export type AccessState = {
  pathname: string;
  hasSession: boolean;
  hasUsername: boolean;
};

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Devuelve la ruta a la que hay que redirigir, o null si puede seguir. */
export function redirectFor({ pathname, hasSession, hasUsername }: AccessState): string | null {
  if (pathname === ONBOARDING_PATH) {
    return hasSession ? null : "/login";
  }
  if (!startsWithAny(pathname, LOGIN_REQUIRED_PREFIXES)) {
    return null;
  }
  if (!hasSession) {
    return "/login";
  }
  return hasUsername ? null : ONBOARDING_PATH;
}
