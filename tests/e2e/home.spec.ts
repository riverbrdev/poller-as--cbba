import { expect, test } from "@playwright/test";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";

// Estas pruebas solo leen: lo esperado sale de la misma base que muestra la home, sin números fijos.
const listActive = createListActiveRestaurants({
  restaurants: createDrizzleRestaurantRepository(createDb()),
});

test.describe("catálogo de locales", () => {
  test("muestra todas las pollerías activas de la base", async ({ page }) => {
    const { restaurants } = await listActive();
    expect(restaurants.length).toBeGreaterThan(0);

    await page.goto("/");

    await expect(page.locator("#locales article")).toHaveCount(restaurants.length);
    for (const restaurant of restaurants) {
      await expect(page.locator("#locales article h3", { hasText: restaurant.name }).first()).toBeAttached();
    }
  });

  test("ofrece un chip por cada zona de la base y filtra por ella", async ({ page }) => {
    const { restaurants, zones } = await listActive();
    await page.goto("/");

    await expect(page.getByRole("button", { name: `Todas (${restaurants.length})` })).toBeVisible();
    for (const zone of zones) {
      await expect(page.getByRole("button", { name: `${zone.name} (${zone.count})` })).toBeVisible();
    }

    const smallest = [...zones].sort((a, b) => a.count - b.count)[0];
    if (!smallest) throw new Error("La base no tiene zonas");
    await page.getByRole("button", { name: `${smallest.name} (${smallest.count})` }).click();

    await expect(page.locator("#locales article")).toHaveCount(smallest.count);
  });

  test("busca por nombre", async ({ page }) => {
    const { restaurants } = await listActive();
    const target = restaurants[0];
    if (!target) throw new Error("La base no tiene pollerías");
    await page.goto("/");

    await page.getByRole("searchbox").fill(target.name);

    await expect(page.locator("#locales article h3", { hasText: target.name }).first()).toBeVisible();
  });

  test("sin resultados ofrece limpiar los filtros", async ({ page }) => {
    const { restaurants } = await listActive();
    await page.goto("/");

    await page.getByRole("searchbox").fill("zzzz-no-existe");
    await expect(page.getByText("No encontramos pollerías con esos filtros")).toBeVisible();
    await expect(page.locator("#locales article")).toHaveCount(0);

    await page.getByRole("button", { name: "Limpiar filtros" }).click();

    await expect(page.locator("#locales article")).toHaveCount(restaurants.length);
  });

  test("a 360px no hay scroll horizontal en la página", async ({ page }) => {
    await page.goto("/");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("las zonas táctiles principales miden al menos 44px", async ({ page }) => {
    await page.goto("/");

    const heights = await page
      .locator("#locales button, #locales a[href^='http']")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));

    expect(heights.length).toBeGreaterThan(0);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });
});
