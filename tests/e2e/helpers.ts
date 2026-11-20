import { randomBytes } from "node:crypto";
import type { BrowserContext, Page } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { like } from "drizzle-orm";
import { bcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleUserRepository } from "@/infrastructure/db/user-repository";
import { users } from "@/infrastructure/db/schema";

// Todo dato de prueba lleva este prefijo: así la limpieza no toca cuentas reales.
const E2E_EMAIL_DOMAIN = "@example.com";
const E2E_PREFIX = "e2e-";
const SESSION_COOKIE = "authjs.session-token";
export const E2E_PASSWORD = "secreto123";

const db = createDb();
const repo = createDrizzleUserRepository(db);

/** Sufijo aleatorio corto, en minúsculas, para no repetir usernames ni correos entre corridas. */
export function randomSuffix(): string {
  return randomBytes(4).toString("hex");
}

export function e2eEmail(suffix = randomSuffix()): string {
  return `${E2E_PREFIX}${suffix}${E2E_EMAIL_DOMAIN}`;
}

export function e2eUsername(suffix = randomSuffix()): string {
  return `e2e_${suffix}`;
}

/** Cada prueba recibe su propia IP simulada, para que el rate limit de Upstash no las cuente juntas. */
export async function useOwnClientIp(context: BrowserContext): Promise<void> {
  const octet = () => Math.floor(Math.random() * 250) + 1;
  await context.setExtraHTTPHeaders({ "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}` });
}

/** Cuenta con contraseña, creada directo en la base (más rápido que pasar por el formulario). */
export async function createPasswordUser(options: { username: string; email: string }) {
  const result = await repo.create({
    username: options.username,
    googleId: null,
    passwordHash: await bcryptPasswordHasher.hash(E2E_PASSWORD),
    name: options.username,
    email: options.email,
    avatarUrl: null,
  });
  if (!result.ok) {
    throw new Error(`No se pudo crear el usuario de prueba: ${result.conflict}`);
  }
  return result.user;
}

/** Cuenta de Google sin username: el estado en el que queda tras el primer ingreso con Google. */
export async function createGoogleUserWithoutUsername(suffix = randomSuffix()) {
  const result = await repo.create({
    username: null,
    googleId: `e2e-google-${suffix}`,
    passwordHash: null,
    name: `Google ${suffix}`,
    email: e2eEmail(suffix),
    avatarUrl: null,
  });
  if (!result.ok) {
    throw new Error(`No se pudo crear la cuenta de Google de prueba: ${result.conflict}`);
  }
  return result.user;
}

/** Cuenta de Google con username, como la de alguien que ya completó el onboarding. */
export async function createGoogleUser(suffix = randomSuffix()) {
  const result = await repo.create({
    username: e2eUsername(suffix),
    googleId: `e2e-google-${suffix}`,
    passwordHash: null,
    name: `Google ${suffix}`,
    email: e2eEmail(suffix),
    avatarUrl: null,
  });
  if (!result.ok) {
    throw new Error(`No se pudo crear la cuenta de Google de prueba: ${result.conflict}`);
  }
  return result.user;
}

/**
 * Admin de prueba (spec 003). Correo fijo porque tiene que coincidir con ADMIN_EMAILS de .env.local.
 * Nunca se agrega a ADMIN_EMAILS de Vercel: example.com no da cuentas de Google.
 */
export const E2E_ADMIN_EMAIL = `${E2E_PREFIX}admin${E2E_EMAIL_DOMAIN}`;

/** Reutiliza el admin de prueba si ya existe (el correo es único) y le asegura el rol admin. */
export async function getOrCreateGoogleAdmin() {
  const existing = await repo.findByEmail(E2E_ADMIN_EMAIL);
  if (existing) {
    return repo.setRole(existing.id, "admin");
  }
  const result = await repo.create({
    username: "e2e_admin",
    googleId: "e2e-google-admin",
    passwordHash: null,
    name: "Admin e2e",
    email: E2E_ADMIN_EMAIL,
    avatarUrl: null,
  });
  if (!result.ok) {
    throw new Error(`No se pudo crear el admin de prueba: ${result.conflict}`);
  }
  return repo.setRole(result.user.id, "admin");
}

/** Cambia el rol directo en la base, como lo haría alguien a mano (corte urgente). */
export async function setUserRole(userId: string, role: "user" | "admin") {
  return repo.setRole(userId, role);
}

/** Relee la cuenta desde la base, para comprobar su rol después de una petición. */
export async function findUserById(userId: string) {
  return repo.findById(userId);
}

/**
 * Simula la sesión que deja Auth.js después de un login con Google.
 * No pasa por Google: firma el mismo JWT que firmaría Auth.js con AUTH_SECRET.
 */
export async function signInAsGoogleUser(context: BrowserContext, user: { id: string; username: string | null; email: string; name: string }) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta AUTH_SECRET en .env.local para firmar la sesión de prueba.");
  }
  const token = await encode({
    secret,
    salt: SESSION_COOKIE,
    token: { sub: user.id, userId: user.id, username: user.username, name: user.name, email: user.email },
  });
  await context.addCookies([
    { name: SESSION_COOKIE, value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
}

/** Lee la sesión que ve el navegador, a través de la ruta oficial de Auth.js. */
export async function currentSession(page: Page): Promise<{ user?: { id?: string; username?: string | null } } | null> {
  const response = await page.request.get("/api/auth/session");
  const body = (await response.json()) as { user?: { id?: string; username?: string | null } } | null;
  return body && Object.keys(body).length > 0 ? body : null;
}

/**
 * Limpieza manual antes del lanzamiento: borra los usuarios e2e- y, por cascade, sus votos y marcas.
 * Durante la fase de pruebas no se llama: los datos de prueba se mantienen.
 */
export async function deleteE2eUsers(): Promise<void> {
  await db.delete(users).where(like(users.email, `${E2E_PREFIX}%${E2E_EMAIL_DOMAIN}`));
}
