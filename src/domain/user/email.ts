/** Forma en que se guarda y compara un correo: sin espacios y en minúsculas. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Lista de correos con acceso mientras la app está en pruebas.
 * Una lista vacía significa "sin restricción": así la app no queda bloqueada por error.
 */
export function isEmailAllowed(email: string, allowedEmails: readonly string[]): boolean {
  if (allowedEmails.length === 0) {
    return true;
  }
  const normalized = normalizeEmail(email);
  return allowedEmails.some((allowed) => normalizeEmail(allowed) === normalized);
}
