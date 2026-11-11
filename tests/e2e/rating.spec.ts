import { expect, test, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import { ratings } from "@/infrastructure/db/schema";
import {
  E2E_PASSWORD,
  createGoogleUserWithoutUsername,
  createPasswordUser,
  e2eEmail,
  e2eUsername,
  randomSuffix,
  signInAsGoogleUser,
  useOwnClientIp,
} from "./helpers";

// Los usuarios e2e- y sus votos se quedan en la base durante la fase de pruebas (no se borran al terminar).
const db = createDb();
const listActive = createListActiveRestaurants({ restaurants: createDrizzleRestaurantRepository(db) });

const SCORES = { "Sabor y crocancia": 9, "Cantidad y porción": 7, "Atención y rapidez": 8, Local: 6 } as const;

async function firstRestaurant() {
  const { restaurants } = await listActive();
  const restaurant = restaurants[0];
  if (!restaurant) throw new Error("La base no tiene pollerías");
  return restaurant;
}

async function signedInUser(page: Page) {
  const suffix = randomSuffix();
  const user = await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });
  await signInAsGoogleUser(page.context(), user);
  return user;
}

/** Elige una nota tocando el segmento de la escala (el radio nativo está oculto visualmente). */
async function pickScore(page: Page, criterion: string, score: number) {
  await page.locator("label", { has: page.getByRole("radio", { name: `${criterion}, ${score}`, exact: true }) }).click();
}

async function ratingsOf(userId: string) {
  return db.select().from(ratings).where(eq(ratings.userId, userId));
}

test.beforeEach(async ({ context }) => {
  await useOwnClientIp(context);
});

test.describe("botones de la tarjeta", () => {
  test("cada tarjeta tiene Votar y, si hay ubicación, Mapa con el enlace de la base", async ({ page }) => {
    const { restaurants } = await listActive();
    await page.goto("/");

    for (const restaurant of restaurants) {
      const vote = page.getByRole("link", { name: `Votar por ${restaurant.name}` }).first();
      await expect(vote).toHaveAttribute("href", `/calificar/${restaurant.slug}`);

      const map = page.getByRole("link", { name: `Ver ubicación de ${restaurant.name} en el mapa` });
      if (restaurant.mapsUrl) {
        await expect(map.first()).toHaveAttribute("href", restaurant.mapsUrl);
        await expect(map.first()).toHaveAttribute("target", "_blank");
        await expect(map.first()).toHaveAttribute("rel", /noopener/);
      } else {
        await expect(map).toHaveCount(0);
      }
    }
  });
});

test.describe("calificar una pollería", () => {
  test("desde la tarjeta llega al formulario de esa pollería", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await signedInUser(page);

    await page.goto("/");
    await page.getByRole("link", { name: `Votar por ${restaurant.name}` }).first().click();

    await expect(page).toHaveURL(`/calificar/${restaurant.slug}`);
    await expect(page.getByRole("heading", { name: restaurant.name }).first()).toBeVisible();
  });

  test("califica los 4 criterios y el voto queda guardado", async ({ page }) => {
    const restaurant = await firstRestaurant();
    const user = await signedInUser(page);
    await page.goto(`/calificar/${restaurant.slug}`);

    const submit = page.getByRole("button", { name: "Enviar mi voto" });
    await pickScore(page, "Sabor y crocancia", SCORES["Sabor y crocancia"]);
    await pickScore(page, "Cantidad y porción", SCORES["Cantidad y porción"]);
    await pickScore(page, "Atención y rapidez", SCORES["Atención y rapidez"]);
    // El avance está en la columna de computadora y en la barra fija del celular: se mira el visible.
    await expect(page.getByText("3 de 4 criterios").filter({ visible: true })).toBeVisible();
    await expect(submit).toBeDisabled();

    await pickScore(page, "Local", SCORES.Local);
    await page.getByLabel("Comentario").fill("  Pide con llajua doble  ");
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole("heading", { name: "¡Gracias! Tu voto quedó guardado" })).toBeVisible();
    const saved = await ratingsOf(user.id);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      restaurantId: restaurant.id,
      flavorScore: 9,
      portionScore: 7,
      serviceScore: 8,
      placeScore: 6,
      comment: "Pide con llajua doble",
    });
  });

  test("una pollería inexistente muestra la página de no encontrada", async ({ page }) => {
    await signedInUser(page);
    await page.goto("/calificar/no-existe-esta-polleria");
    await expect(page.getByRole("heading", { name: "No encontramos esta pollería" })).toBeVisible();
  });
});

test.describe("votar sin sesión", () => {
  async function logIn(page: Page, email: string) {
    await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  }

  test("pide ingresar y, al hacerlo, vuelve al formulario de la pollería elegida", async ({ page }) => {
    const restaurant = await firstRestaurant();
    const suffix = randomSuffix();
    await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });

    await page.goto("/");
    await page.getByRole("link", { name: `Votar por ${restaurant.name}` }).first().click();

    await expect(page).toHaveURL(`/login?callbackUrl=${encodeURIComponent(`/calificar/${restaurant.slug}`)}`);
    await expect(page.getByText("Necesitas una cuenta para votar.")).toBeVisible();
    await logIn(page, e2eEmail(suffix));

    await expect(page).toHaveURL(`/calificar/${restaurant.slug}`);
  });

  test("una cuenta de Google sin username elige su nombre y vuelve al formulario", async ({ context, page }) => {
    const restaurant = await firstRestaurant();
    const user = await createGoogleUserWithoutUsername();
    await signInAsGoogleUser(context, user);

    await page.goto(`/calificar/${restaurant.slug}`);
    await expect(page).toHaveURL(/\/onboarding\/username\?callbackUrl=/);
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(e2eUsername());
    await expect(page.getByText("está disponible")).toBeVisible();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();

    await expect(page).toHaveURL(`/calificar/${restaurant.slug}`);
  });

  test("no redirige a otro sitio aunque el callbackUrl lo pida", async ({ page }) => {
    const suffix = randomSuffix();
    await createPasswordUser({ username: e2eUsername(suffix), email: e2eEmail(suffix) });

    await page.goto(`/login?callbackUrl=${encodeURIComponent("https://malo.example.com")}`);
    await logIn(page, e2eEmail(suffix));

    await expect(page).toHaveURL("/");
  });

  test("al crear una cuenta nueva también vuelve al formulario", async ({ page }) => {
    const restaurant = await firstRestaurant();
    const suffix = randomSuffix();
    const target = `/calificar/${restaurant.slug}`;

    await page.goto(`/register?callbackUrl=${encodeURIComponent(target)}`);
    await page.getByLabel("Nombre de usuario", { exact: true }).fill(e2eUsername(suffix));
    await expect(page.getByText("está disponible")).toBeVisible();
    await page.getByLabel("Correo electrónico", { exact: true }).fill(e2eEmail(suffix));
    await page.getByLabel("Contraseña", { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();

    await expect(page).toHaveURL(target);
  });
});

test.describe("ya voté esta pollería", () => {
  async function fillAll(page: Page, score: number) {
    for (const criterion of Object.keys(SCORES)) {
      await pickScore(page, criterion, score);
    }
  }

  test("al volver ve sus notas en solo lectura, sin formulario", async ({ page }) => {
    const restaurant = await firstRestaurant();
    await signedInUser(page);
    await page.goto(`/calificar/${restaurant.slug}`);
    await fillAll(page, 8);
    await page.getByRole("button", { name: "Enviar mi voto" }).click();
    await expect(page.getByRole("heading", { name: "¡Gracias! Tu voto quedó guardado" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { name: "Ya calificaste esta pollería" })).toBeVisible();
    await expect(page.getByText("Los votos son definitivos y no se pueden cambiar.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar mi voto" })).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(0);
  });

  test("un segundo envío desde otra pestaña se rechaza y el voto original no cambia", async ({ context, page }) => {
    const restaurant = await firstRestaurant();
    const user = await signedInUser(page);

    // Las dos pestañas abren el formulario antes de que exista el voto.
    const secondTab = await context.newPage();
    await page.goto(`/calificar/${restaurant.slug}`);
    await secondTab.goto(`/calificar/${restaurant.slug}`);

    await fillAll(page, 9);
    await page.getByRole("button", { name: "Enviar mi voto" }).click();
    await expect(page.getByRole("heading", { name: "¡Gracias! Tu voto quedó guardado" })).toBeVisible();

    await fillAll(secondTab, 2);
    await secondTab.getByRole("button", { name: "Enviar mi voto" }).click();
    await expect(secondTab.getByText("Ya calificaste esta pollería.", { exact: true }).filter({ visible: true })).toBeVisible();

    const saved = await ratingsOf(user.id);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ flavorScore: 9, portionScore: 9, serviceScore: 9, placeScore: 9 });
  });
});
