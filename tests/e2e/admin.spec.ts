import { expect, test } from "@playwright/test";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { ADMIN_TEXT } from "@/components/admin/messages";
import { parseAdminAllowlist } from "@/domain/user/admin";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import {
  E2E_ADMIN_EMAIL,
  createGoogleUser,
  findUserById,
  getOrCreateGoogleAdmin,
  setUserRole,
  signInAsGoogleUser,
  useOwnClientIp,
} from "./helpers";

// Spec 003: acceso de administradores. Los usuarios e2e- se mantienen en la base.

const listActive = createListActiveRestaurants({ restaurants: createDrizzleRestaurantRepository(createDb()) });

test.beforeAll(() => {
  // Playwright carga .env.local, pero un `pnpm dev` ya abierto no lo relee: hay que reiniciarlo.
  if (!parseAdminAllowlist(process.env.ADMIN_EMAILS).has(E2E_ADMIN_EMAIL)) {
    throw new Error(`Agrega ${E2E_ADMIN_EMAIL} a ADMIN_EMAILS en .env.local y reinicia pnpm dev.`);
  }
});

test.beforeEach(async ({ context }) => {
  await useOwnClientIp(context);
});

test("visitante: /admin pide iniciar sesión", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin$/);
  await expect(page.getByText(ADMIN_TEXT.title)).toHaveCount(0);
});

test("usuario normal: /admin responde igual que una página que no existe (FR-013)", async ({ page }) => {
  const user = await createGoogleUser();
  await signInAsGoogleUser(page.context(), user);

  const missing = await page.goto("/no-existe-e2e");
  const missingTitle = await page.title();
  const missingHeading = await page.getByRole("heading", { level: 1 }).first().textContent();

  const response = await page.goto("/admin");

  expect(missing?.status()).toBe(404);
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/admin$/);
  expect(await page.title()).toBe(missingTitle);
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(missingHeading ?? "");
  await expect(page.getByText(ADMIN_TEXT.title)).toHaveCount(0);
});

test("admin: ve su saludo en /admin y llega solo desde el login (US2-1)", async ({ page }) => {
  const admin = await getOrCreateGoogleAdmin();
  await signInAsGoogleUser(page.context(), admin);

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Administración · ComiDeli");
  await expect(page.getByRole("heading", { name: ADMIN_TEXT.title, level: 1 })).toBeVisible();
  await expect(page.getByText(ADMIN_TEXT.greeting("e2e_admin"))).toBeVisible();
  await expect(page.getByText(E2E_ADMIN_EMAIL)).toHaveCount(0);

  // El login con Google termina en el onboarding, que ahora manda al admin a /admin.
  await page.goto(`/onboarding/username?callbackUrl=${encodeURIComponent("/mi-perfil")}`);
  await expect(page).toHaveURL(/\/admin$/);
});

test("admin: navega el sitio público sin que lo devuelvan a /admin y sin enlaces hacia ahí (FR-009, FR-012)", async ({
  page,
}) => {
  const admin = await getOrCreateGoogleAdmin();
  const restaurant = (await listActive()).restaurants[0];
  if (!restaurant) throw new Error("La base no tiene pollerías");
  await signInAsGoogleUser(page.context(), admin);

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Menú de tu cuenta" }).click();
  await expect(page.locator('a[href*="/admin"]')).toHaveCount(0);

  await page.goto(`/calificar/${restaurant.slug}`);
  await expect(page).toHaveURL(`/calificar/${restaurant.slug}`);
  await expect(page.getByRole("heading", { name: restaurant.name }).first()).toBeVisible();
});

test("admin cuyo correo ya no está en la lista: /admin lo rechaza y lo baja a usuario (US3-1)", async ({ page }) => {
  // Una cuenta de Google con rol admin cuyo correo no está en ADMIN_EMAILS (como si lo hubieran quitado).
  const user = await createGoogleUser();
  await setUserRole(user.id, "admin");
  await signInAsGoogleUser(page.context(), user);

  const response = await page.goto("/admin");

  expect(response?.status()).toBe(404);
  expect((await findUserById(user.id))?.role).toBe("user");
});
