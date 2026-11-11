import { expect, test, type Browser, type Page } from "@playwright/test";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import { createPasswordUser, e2eEmail, e2eUsername, randomSuffix, signInAsGoogleUser, useOwnClientIp } from "./helpers";

// Lo esperado sale de la misma base que muestra la web, sin números fijos.
// Los usuarios e2e- y sus votos se quedan en la base durante la fase de pruebas (no se borran al terminar).
const db = createDb();
const listActive = createListActiveRestaurants({ restaurants: createDrizzleRestaurantRepository(db) });

async function firstRestaurant() {
  const { restaurants } = await listActive();
  const restaurant = restaurants[0];
  if (!restaurant) throw new Error("La base no tiene pollerías");
  return restaurant;
}

test.beforeEach(async ({ context }) => {
  await useOwnClientIp(context);
});

test.describe("perfil de pollería: llegar y ver sus datos (US1)", () => {
  test("desde la home, el nombre lleva al detalle de esa pollería", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto("/");

    await page.locator("#locales").getByRole("link", { name: restaurant.name, exact: true }).first().click();

    await expect(page).toHaveURL(`/polleria/${restaurant.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: restaurant.name })).toBeVisible();
    // La home queda oculta en el DOM tras navegar (vuelve al instante con Atrás): solo cuenta lo visible.
    await expect(page.getByText(restaurant.address).filter({ visible: true })).toBeVisible();
  });

  test("Votar sigue llevando a calificar", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto("/");

    await expect(page.getByRole("link", { name: `Votar por ${restaurant.name}` }).first()).toHaveAttribute(
      "href",
      `/calificar/${restaurant.slug}`,
    );
  });

  test("muestra los 4 criterios y el estado del ranking", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto(`/polleria/${restaurant.slug}`);

    for (const title of ["Sabor y crocancia", "Cantidad y porción", "Atención y rapidez", "Local"]) {
      await expect(page.getByRole("meter", { name: title })).toBeAttached();
    }
    await expect(page.getByText(/en Cochabamba|En votación|Sin votos todavía/).first()).toBeVisible();
  });

  test("una pollería inexistente muestra no encontrada", async ({ page }) => {
    await page.goto("/polleria/no-existe-esta-polleria");
    await expect(page.getByRole("heading", { name: "No encontramos esta pollería" })).toBeVisible();
  });

  test("Volver al ranking lleva a la home", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto(`/polleria/${restaurant.slug}`);

    await page.getByRole("link", { name: "Volver al ranking" }).click();
    await expect(page).toHaveURL("/");
  });

  test("a 360px no hay desplazamiento horizontal", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto(`/polleria/${restaurant.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(360);
  });
});

const CRITERIA = ["Sabor y crocancia", "Cantidad y porción", "Atención y rapidez", "Local"] as const;

async function signedInUser(page: Page) {
  const suffix = randomSuffix();
  const user = await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });
  await signInAsGoogleUser(page.context(), user);
  return user;
}

/** Vota con las 4 notas y un comentario, igual que una persona desde el formulario. */
async function vote(page: Page, slug: string, comment: string) {
  await page.goto(`/calificar/${slug}`);
  for (const criterion of CRITERIA) {
    await page.locator("label", { has: page.getByRole("radio", { name: `${criterion}, 9`, exact: true }) }).click();
  }
  await page.getByLabel("Comentario").fill(comment);
  await page.getByRole("button", { name: "Enviar mi voto" }).click();
  // En desarrollo, la primera acción compila la ruta: se da más margen que el de 5 s por defecto.
  await expect(page.getByText("¡Gracias! Tu voto quedó guardado")).toBeVisible({ timeout: 15_000 });
}

/** La lista de reseñas visible (la home anterior puede seguir oculta en el DOM). */
const reviewList = (page: Page) => page.getByRole("region", { name: "Reseñas de la comunidad" }).filter({ visible: true });

test.describe("reseñas y conexión con el voto (US2)", () => {
  test("después de votar, Ver tu reseña la muestra primera y marcada como tuya", async ({ page }) => {
    const restaurant = await firstRestaurant();
    const user = await signedInUser(page);
    const comment = `Prueba e2e ${randomSuffix()}: crocante y bien servido`;

    await vote(page, restaurant.slug, comment);
    await page.getByRole("link", { name: "Ver tu reseña" }).click();

    await expect(page).toHaveURL(`/polleria/${restaurant.slug}#mi-resena`);
    const first = reviewList(page).getByRole("article").first();
    await expect(first).toContainText(`@${user.username}`);
    await expect(first).toContainText(comment);
    await expect(first.getByText("Tu reseña")).toBeVisible();
    // Nunca se muestran el nombre ni el correo del autor.
    await expect(reviewList(page)).not.toContainText(user.email);
  });

  test("Con comentarios sigue mostrando la reseña con comentario", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await signedInUser(page);
    const comment = `Filtro e2e ${randomSuffix()}`;
    await vote(page, restaurant.slug, comment);

    await page.goto(`/polleria/${restaurant.slug}?resenas=con-comentario`);
    await expect(reviewList(page).getByRole("link", { name: /Con comentarios/ })).toHaveAttribute("aria-current", "page");
    await expect(reviewList(page).getByRole("article").first()).toContainText(comment);
  });

  test("sin sesión se ven las reseñas pero ninguna dice Tu reseña", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await page.goto(`/polleria/${restaurant.slug}`);
    await expect(reviewList(page).getByRole("article").first()).toBeVisible();
    await expect(page.getByText("Tu reseña")).toHaveCount(0);
  });
});

/** Una persona con su propia sesión y su propia IP (para que el límite de Upstash no las cuente juntas). */
async function personIn(browser: Browser) {
  const context = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
  await useOwnClientIp(context);
  const page = await context.newPage();
  const user = await signedInUser(page);
  return { context, page, user };
}

async function secondRestaurant() {
  const { restaurants } = await listActive();
  const restaurant = restaurants[1] ?? restaurants[0];
  if (!restaurant) throw new Error("La base no tiene pollerías");
  return restaurant;
}

/** El botón Útil de la reseña más reciente (la que acaba de escribir la persona A). */
const newestHelpful = (page: Page) => reviewList(page).getByRole("article").first().getByRole("button", { name: /^Útil/ });

/** Toca Útil y espera a que el servidor confirme (el contador optimista aparece antes que la respuesta). */
async function clickHelpful(page: Page) {
  await newestHelpful(page).click();
  await expect(newestHelpful(page)).toHaveAttribute("aria-busy", "false");
}

test.describe("marcar reseñas como útiles (US3)", () => {
  test("otra persona marca Útil: cuenta una vez, se puede quitar y aparece en destacadas", async ({ browser }) => {
    const restaurant = await secondRestaurant();
    const author = await personIn(browser);
    const comment = `Útil e2e ${randomSuffix()}`;
    await vote(author.page, restaurant.slug, comment);

    const reader = await personIn(browser);
    const detail = `/polleria/${restaurant.slug}`;
    await reader.page.goto(detail);
    await expect(reviewList(reader.page).getByRole("article").first()).toContainText(comment);

    // Una segunda pestaña abierta ANTES de marcar: todavía cree que no está marcada.
    const staleTab = await reader.context.newPage();
    await staleTab.goto(detail);

    await clickHelpful(reader.page);
    await expect(newestHelpful(reader.page)).toHaveText("Útil (1)");
    await expect(newestHelpful(reader.page)).toHaveAttribute("aria-pressed", "true");

    await reader.page.reload();
    await expect(newestHelpful(reader.page)).toHaveText("Útil (1)");

    // Desde la pestaña vieja manda "marcar" otra vez: la base no la cuenta dos veces.
    await clickHelpful(staleTab);
    await expect(newestHelpful(staleTab)).toHaveText("Útil (1)");

    await reader.page.goto(`${detail}?resenas=destacadas`);
    await expect(reviewList(reader.page).getByRole("article").first()).toContainText(comment);

    await reader.page.goto(detail);
    await clickHelpful(reader.page);
    await expect(newestHelpful(reader.page)).toHaveText("Útil (0)");
    await expect(newestHelpful(reader.page)).toHaveAttribute("aria-pressed", "false");

    // Quien escribió la reseña no puede marcarla.
    await author.page.goto(detail);
    await expect(newestHelpful(author.page)).toBeDisabled();

    await author.context.close();
    await reader.context.close();
  });

  test("sin sesión, Útil lleva a ingresar y vuelve al perfil", async ({ page }) => {
    const restaurant = await secondRestaurant();
    await page.goto(`/polleria/${restaurant.slug}?resenas=con-comentario`);
    const helpful = reviewList(page).getByRole("article").first().getByRole("link", { name: /^Útil/ });
    await expect(helpful).toHaveAttribute("href", `/login?callbackUrl=${encodeURIComponent(`/polleria/${restaurant.slug}`)}`);
  });
});
