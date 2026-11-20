import { normalizeEmail } from "./email";

/** Correos de los administradores, ya normalizados (spec 003, FR-002 y FR-003). */
export type AdminAllowlist = ReadonlySet<string>;

// "local@dominio": exactamente un @, con texto a ambos lados.
const hasEmailShape = (value: string) => {
  const parts = value.split("@");
  return parts.length === 2 && parts[0] !== "" && parts[1] !== "";
};

/**
 * Lee la lista de correos autorizados tal como viene de la configuración ("a@x.com, B@x.com").
 * Ignora los elementos vacíos o mal escritos. Sin valor, nadie es admin.
 */
export function parseAdminAllowlist(raw: string | undefined): AdminAllowlist {
  const emails = (raw ?? "").split(",").map(normalizeEmail).filter(hasEmailShape);
  return new Set(emails);
}

/** Compara sin distinguir mayúsculas ni espacios alrededor. */
export function isAllowlistedEmail(email: string, allowlist: AdminAllowlist): boolean {
  return allowlist.has(normalizeEmail(email));
}
