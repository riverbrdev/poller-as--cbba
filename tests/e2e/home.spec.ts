import { expect, test } from "@playwright/test";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";
import { createListCatalogRestaurants } from "@/application/restaurant/list-catalog-restaurants";
import { formatScore } from "@/domain/rating/ranking";
import { duelResult } from "@/domain/versus/duel";
import { createDb } from "@/infrastructure/db/client";
import { createDrizzleRatingRepository } from "@/infrastructure/db/rating-repository";
import { createDrizzleRestaurantRepository } from "@/infrastructure/db/restaurant-repository";
import { createDrizzleVersusRepository } from "@/infrastructure/db/versus-repository";

// Estas pruebas solo leen: lo esperado sale de la misma base que muestra la home, sin números fijos.
const db = createDb();
const listActive = createListActiveRestaurants({
  restaurants: createDrizzleRestaurantRepository(db),
});
const listCatalog = createListCatalogRestaurants({
  restaurants: createDrizzleRestaurantRepository(db),
  ratings: createDrizzleRatingRepository(db),
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

  test("cada tarjeta muestra la nota de la pollería junto a sus votos", async ({ page }) => {
    const { restaurants } = await listCatalog();
    await page.goto("/");

    for (const { restaurant, score } of restaurants) {
      const card = page.locator("#locales article", { has: page.locator("h3", { hasText: restaurant.name }) }).first();
      const row = card.getByTestId("restaurant-score");
      if (score.score === null) {
        await expect(row).toContainText("Sin votos");
      } else {
        await expect(row).toContainText(formatScore(score.score));
        await expect(row).toContainText(`${score.voteCount} `);
      }
    }
  });

  test("cada tarjeta lleva la etiqueta #N de su puesto, y solo las que están en el ranking", async ({ page }) => {
    const { restaurants } = await listCatalog();
    await page.goto("/");

    for (const { restaurant, score } of restaurants) {
      const card = page.locator("#locales article", { has: page.locator("h3", { hasText: restaurant.name }) }).first();
      const badge = card.getByTestId("ranking-position");
      if (score.status === "ranked" && score.position !== null) {
        await expect(badge).toHaveText(`#${score.position}`);
      } else {
        await expect(badge).toHaveCount(0);
      }
    }
  });

  test("abre ordenado por el top del ranking y permite ordenar de la A a la Z", async ({ page }) => {
    const { restaurants } = await listCatalog();
    const titles = page.locator("#locales article h3");
    await page.goto("/");

    await expect(page.getByRole("combobox", { name: "Ordenar pollerías" })).toHaveValue("top");
    await expect(titles).toHaveText(restaurants.map(({ restaurant }) => restaurant.name));

    await page.getByRole("combobox", { name: "Ordenar pollerías" }).selectOption("name");

    const alphabetical = restaurants.map(({ restaurant }) => restaurant.name).sort((a, b) => a.localeCompare(b, "es"));
    await expect(titles).toHaveText(alphabetical);
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

test.describe("versus en la home", () => {
  const versusRepo = createDrizzleVersusRepository(db);

  test("la franja del duelo muestra los porcentajes de la base y lleva a /versus", async ({ page }) => {
    const { percentages } = duelResult(await versusRepo.counts());
    // Con movimiento reducido no hay conteo: los porcentajes se ven finales desde el inicio.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const strip = page.locator("#duelo");
    await expect(strip.getByRole("heading", { level: 2 })).toContainText("Lolo Chicken");
    await expect(strip.getByRole("heading", { level: 2 })).toContainText("Ricono");
    await expect(strip).toContainText(`${percentages["lolo-chicken"]}%`);
    await expect(strip).toContainText(`${percentages.ricono}%`);

    await strip.getByRole("link", { name: /Elige tu bando|Tu voto está con/ }).click();
    await expect(page).toHaveURL(/\/versus$/);
  });

  test("la casilla del duelo en el hero lleva a /versus", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Versus: Lolo Chicken contra Ricono" }).click();
    await expect(page).toHaveURL(/\/versus$/);
  });

  test("/api/versus devuelve el resultado público del duelo", async ({ request }) => {
    const { percentages, total } = duelResult(await versusRepo.counts());
    const response = await request.get("/api/versus");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.percentages).toEqual(percentages);
    expect(body.total).toBe(total);
  });

  test("en vivo: cada 30 s consulta el resultado y actualiza barra, porcentajes y líder", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/");
    const live = await (await page.request.get("/api/versus")).json();
    const [left, right] = live.participants as { slug: "lolo-chicken" | "ricono"; name: string }[];
    if (!left || !right) throw new Error("El duelo no está disponible en la base");

    // Resultado nuevo: el de la izquierda pasa adelante con 80 %.
    await page.route("**/api/versus", (route) =>
      route.fulfill({
        json: {
          ...live,
          counts: { [left.slug]: 8, [right.slug]: 2 },
          percentages: { [left.slug]: 80, [right.slug]: 20 },
          total: 10,
          leader: left.slug,
        },
      }),
    );
    await page.clock.runFor(30_000);

    const strip = page.locator("#duelo");
    await expect(page.getByTestId(`duel-percent-${left.slug}`)).toHaveText("80%");
    await expect(page.getByTestId(`duel-percent-${right.slug}`)).toHaveText("20%");
    await expect(strip).toContainText(`${left.name} va ganando`);
    await expect(strip).toContainText("10 votos en el duelo");
    await expect(strip.locator(".duel-bar-left")).toHaveAttribute("style", /width: 80%/);
  });

  test("el botón Versus del header se ve en celular", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Versus: duelo en vivo" })).toBeVisible();
  });
});
