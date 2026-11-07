/**
 * Rutas que requieren sesión. El ranking y los perfiles son públicos (SPEC §2).
 * Esto solo decide redirecciones: la autorización real se verifica en el servidor, en cada caso de uso.
 */
const LOGIN_REQUIRED_PREFIXES = ["/calificar", "/sugerir", "/mi-perfil"];
const LOGIN_PATH = "/login";
const ONBOARDING_PATH = "/onboarding/username";
const HOME_PATH = "/";

export type AccessState = {
  pathname: string;
  hasSession: boolean;
  hasUsername: boolean;
};

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Agrega `?callbackUrl=` para que, al terminar de ingresar, la persona vuelva a donde estaba. */
const withCallback = (path: string, callbackPath: string) => `${path}?callbackUrl=${encodeURIComponent(callbackPath)}`;

/** Devuelve la ruta a la que hay que redirigir, o null si puede seguir. */
export function redirectFor({ pathname, hasSession, hasUsername }: AccessState): string | null {
  if (pathname === ONBOARDING_PATH) {
    return hasSession ? null : LOGIN_PATH;
  }
  if (!startsWithAny(pathname, LOGIN_REQUIRED_PREFIXES)) {
    return null;
  }
  if (!hasSession) {
    return withCallback(LOGIN_PATH, pathname);
  }
  return hasUsername ? null : withCallback(ONBOARDING_PATH, pathname);
}

// Caracteres de control o barra invertida: algunos navegadores los normalizan y terminan en otro sitio.
const hasUnsafeCharacter = (value: string) =>
  [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f || char === "\\";
  });

/**
 * A dónde volver después de ingresar. Solo acepta rutas internas ("/algo"), para evitar
 * redirecciones abiertas a otro sitio ("//malo.com", "https://…", "javascript:…"). Si no, al inicio.
 */
export function safeCallbackPath(value: string | null | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return HOME_PATH;
  }
  if (hasUnsafeCharacter(value)) {
    return HOME_PATH;
  }
  return value;
}
