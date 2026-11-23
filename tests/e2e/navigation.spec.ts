import { expect, test } from "@playwright/test";

// Solo lee páginas públicas: no crea usuarios ni votos.
const TAB_BAR = { name: "Secciones de ComiDeli" };

test.describe("barra de pestañas en celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("muestra Ranking, Versus e Ingresar, y marca la página actual", async ({ page }) => {
    await page.goto("/ranking");
    const bar = page.getByRole("navigation", TAB_BAR);

    await expect(bar).toBeVisible();
    await expect(bar.getByRole("link", { name: "Ranking" })).toHaveAttribute("aria-current", "page");
    await expect(bar.getByRole("link", { name: "Versus: duelo en vivo" })).toHaveAttribute("href", "/versus");
    await expect(bar.getByRole("link", { name: "Ingresar" })).toHaveAttribute("href", "/login");
  });

  test("cada pestaña mide al menos 44px", async ({ page }) => {
    await page.goto("/");
    const heights = await page
      .getByRole("navigation", TAB_BAR)
      .locator("a, button")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));

    expect(heights.length).toBe(3);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(44);
    }
  });

  test("se esconde mientras se escribe en el buscador", async ({ page }) => {
    await page.goto("/ranking");
    await page.getByRole("searchbox", { name: "Buscar pollería, zona o dirección" }).focus();

    await expect(page.getByRole("navigation", TAB_BAR)).toBeHidden();
  });

  test("no aparece en la pantalla de calificar", async ({ page }) => {
    await page.goto("/ranking");
    const href = await page.locator("#locales a[href^='/calificar/']").first().getAttribute("href");
    await page.goto(href ?? "/");

    await expect(page.getByRole("navigation", TAB_BAR)).toHaveCount(0);
  });
});

test.describe("navegación en computadora", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("la barra de abajo no se ve y el header lleva al ranking", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("navigation", TAB_BAR)).toBeHidden();
    await page.getByRole("navigation", { name: "Navegación principal" }).getByRole("link", { name: "Ranking" }).click();
    await expect(page).toHaveURL("/ranking");
  });
});
