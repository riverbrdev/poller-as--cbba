import { expect, test } from "@playwright/test";
import {
  E2E_PASSWORD,
  createGoogleUserWithoutUsername,
  createPasswordUser,
  currentSession,
  e2eEmail,
  e2eUsername,
  randomSuffix,
  signInAsGoogleUser,
  useOwnClientIp,
} from "./helpers";

test.beforeEach(async ({ context }) => {
  await useOwnClientIp(context);
});

test.describe("registro con correo y contraseña", () => {
  test("crea la cuenta y deja la sesión iniciada con el @usuario", async ({ page }) => {
    const suffix = randomSuffix();
    const username = e2eUsername(suffix);

    await page.goto("/register");
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(username);
    await expect(page.getByText("está disponible")).toBeVisible();
    await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(suffix));
    await page.getByLabel("Contraseña", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    // Es la primera prueba de la suite: en `pnpm dev` la home se compila en frío y puede pasar de 5 s.
    await expect(page).toHaveURL("/", { timeout: 15_000 });
    expect((await currentSession(page))?.user?.username).toBe(username);
  });

  test("avisa que el @usuario ya existe, sin distinguir mayúsculas", async ({ page }) => {
    const suffix = randomSuffix();
    const taken = e2eUsername(suffix);
    await createPasswordUser({ username: taken, email: e2eEmail(suffix) });

    await page.goto("/register");
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(taken.toUpperCase());
    await expect(page.getByText("Ese nombre de usuario ya está en uso.")).toBeVisible();

    // Aunque el aviso en vivo falle, el servidor vuelve a validar al enviar.
    const otherSuffix = randomSuffix();
    await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(otherSuffix));
    await page.getByLabel("Contraseña", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    await expect(page.locator('[data-slot="alert"]')).toHaveText("Ese nombre de usuario ya está en uso.");
    await expect(page).toHaveURL(/\/register$/);
  });
});

test.describe("ingreso con correo y contraseña", () => {
  test("entra con las credenciales correctas", async ({ page }) => {
    const suffix = randomSuffix();
    const username = e2eUsername(suffix);
    await createPasswordUser({ username, email: e2eEmail(suffix) });

    await page.goto("/login");
    await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(suffix));
    await page.getByLabel("Contraseña", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();

    await expect(page).toHaveURL("/");
    expect((await currentSession(page))?.user?.username).toBe(username);
  });

  test("muestra un error genérico con una contraseña incorrecta", async ({ page }) => {
    const suffix = randomSuffix();
    await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });

    await page.goto("/login");
    await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(suffix));
    await page.getByLabel("Contraseña", { exact: true }).fill("otra-clave-123");
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();

    await expect(page.locator('[data-slot="alert"]')).toHaveText("Correo o contraseña incorrectos.");
    await expect(page).toHaveURL(/\/login$/);
    expect(await currentSession(page)).toBeNull();
  });

  test("bloquea después de demasiados intentos desde la misma IP", async ({ page }) => {
    const suffix = randomSuffix();
    await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });

    // El límite de login es de 10 intentos por ventana: el intento 11 debe ser rechazado por rate limit.
    for (let attempt = 1; attempt <= 11; attempt++) {
      await page.goto("/login");
      await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(suffix));
      await page.getByLabel("Contraseña", { exact: true }).fill(`clave-mala-${attempt}`);
      await page.getByRole("button", { name: "Ingresar", exact: true }).click();
      await expect(page.locator('[data-slot="alert"]')).toBeVisible();
    }

    await expect(page.locator('[data-slot="alert"]')).toHaveText(
      "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentar.",
    );
  });
});

test.describe("acceso protegido", () => {
  test("mandar a calificar sin sesión lleva a iniciar sesión, recordando a dónde volver", async ({ page }) => {
    await page.goto("/calificar/lolo-chicken");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fcalificar%2Flolo-chicken$/);
  });

  test("la pantalla de elegir username exige sesión", async ({ page }) => {
    await page.goto("/onboarding/username");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("cuenta de Google sin username", () => {
  test("al entrar a una ruta protegida va a elegir username y luego vuelve a esa ruta", async ({ context, page }) => {
    const user = await createGoogleUserWithoutUsername();
    await signInAsGoogleUser(context, user);

    await page.goto("/calificar/lolo-chicken");
    await expect(page).toHaveURL(/\/onboarding\/username\?callbackUrl=%2Fcalificar%2Flolo-chicken$/);

    const username = e2eUsername();
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(username);
    await expect(page.getByText("está disponible")).toBeVisible();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await expect(page).toHaveURL("/calificar/lolo-chicken");
    expect((await currentSession(page))?.user?.username).toBe(username);
  });

  test("sin ruta pendiente, después de elegir username va al inicio", async ({ context, page }) => {
    const user = await createGoogleUserWithoutUsername();
    await signInAsGoogleUser(context, user);

    await page.goto("/onboarding/username");
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(e2eUsername());
    await expect(page.getByText("está disponible")).toBeVisible();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await expect(page).toHaveURL("/");
  });

  test("no puede elegir un username que ya tiene otra cuenta", async ({ context, page }) => {
    const takenSuffix = randomSuffix();
    const taken = e2eUsername(takenSuffix);
    await createPasswordUser({ username: taken, email: e2eEmail(takenSuffix) });

    const user = await createGoogleUserWithoutUsername();
    await signInAsGoogleUser(context, user);

    await page.goto("/onboarding/username");
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(taken);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await expect(page.locator('[data-slot="alert"]')).toHaveText("Ese nombre de usuario ya está en uso.");
    await expect(page).toHaveURL(/\/onboarding\/username$/);
  });
});
