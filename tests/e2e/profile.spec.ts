import { expect, test } from "@playwright/test";
import {
  createPasswordUser,
  currentSession,
  deleteE2eUsers,
  e2eEmail,
  e2eUsername,
  randomSuffix,
  signInAsGoogleUser,
  useOwnClientIp,
} from "./helpers";

test.beforeEach(async ({ context }) => {
  await useOwnClientIp(context);
});

test.afterAll(async () => {
  await deleteE2eUsers();
});

test("sin sesión, el header muestra Participar y /mi-perfil pide ingresar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Participar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menú de tu cuenta" })).toHaveCount(0);

  // Logo y "Participar" entran en una sola fila a 360px: el header fijo no se come la pantalla.
  expect((await page.getByRole("banner").boundingBox())?.height).toBeLessThan(90);

  await page.goto("/mi-perfil");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fmi-perfil/);
});

test("con sesión: menú del avatar → Mi perfil → Cerrar sesión", async ({ page }) => {
  const suffix = randomSuffix();
  const user = await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });
  await signInAsGoogleUser(page.context(), user);

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Participar" })).toHaveCount(0);
  await page.getByRole("button", { name: "Menú de tu cuenta" }).click();
  await expect(page.getByText(`@${user.username}`)).toBeVisible();
  await page.getByRole("menuitem", { name: "Mi perfil" }).click();

  await expect(page).toHaveURL(/\/mi-perfil$/);
  await expect(page.getByRole("heading", { name: "Mi perfil", level: 1 })).toBeVisible();
  const card = page.locator("main section");
  await expect(card.getByRole("heading", { name: user.name })).toBeVisible();
  await expect(card.getByText(user.email)).toBeVisible();
  await expect(card.getByText("Correo y contraseña")).toBeVisible();

  await card.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Participar" })).toBeVisible();
  expect(await currentSession(page)).toBeNull();
});

test("Cerrar sesión desde el menú del avatar", async ({ page }) => {
  const suffix = randomSuffix();
  const user = await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });
  await signInAsGoogleUser(page.context(), user);

  await page.goto("/");
  await page.getByRole("button", { name: "Menú de tu cuenta" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();

  await expect(page.getByRole("link", { name: "Participar" })).toBeVisible();
  expect(await currentSession(page)).toBeNull();
});

test("el header queda fijo: el menú del avatar sigue a mano al bajar por el catálogo", async ({ page }) => {
  const suffix = randomSuffix();
  const user = await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });
  await signInAsGoogleUser(page.context(), user);

  await page.goto("/");
  const header = page.getByRole("banner");
  // Con sesión, logo y avatar también entran en una sola fila a 360px.
  expect((await header.boundingBox())?.height).toBeLessThan(90);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const avatar = page.getByRole("button", { name: "Menú de tu cuenta" });
  await expect(avatar).toBeInViewport();
  await avatar.click();
  await expect(page.getByRole("menuitem", { name: "Cerrar sesión" })).toBeVisible();
});
