import { expect, test } from "@playwright/test";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import { useOwnClientIp } from "./helpers";

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
