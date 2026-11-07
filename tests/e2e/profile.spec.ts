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
