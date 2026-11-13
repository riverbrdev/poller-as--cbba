import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import type { RestaurantRecord } from "@/application/ports/restaurant-repository";
import { createListCatalogRestaurants } from "@/application/restaurant/list-catalog-restaurants";
import { scoreDisplay } from "@/domain/rating/ranking";
import { RestaurantCard } from "@/components/home/restaurant-card";
import { createFakeRatingRepository, createFakeRestaurantRepository } from "../application/fakes";

/**
 * Etiquetas #1, #2, #3… de las tarjetas del catálogo: salen del puesto del ranking, así que aparecen,
 * desaparecen y cambian de pollería solas a medida que llegan votos. Recorre el camino completo:
 * votos → caso de uso → datos de la tarjeta (como getCatalogRestaurants) → HTML de la tarjeta.
 */

function restaurant(id: string): RestaurantRecord {
  return { id, name: `Pollería ${id}`, slug: id, zone: "Centro", address: "Calle 1", mapsUrl: null, photoUrl: null };
}

function votes(restaurantId: string, count: number, note: number, from = 0): RatingRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${restaurantId}-v${from + index}`,
    userId: `${restaurantId}-u${from + index}`,
    restaurantId,
    scores: { flavor: note, portion: note, service: note, place: note },
    comment: null,
    createdAt: new Date(2026, 0, index + 1),
  }));
}

/** Etiqueta que muestra cada tarjeta (null si no tiene), con el mismo mapeo que la home. */
async function badges(ratings: RatingRecord[]) {
  const catalog = ["alfa", "bravo", "charlie", "delta"].map(restaurant);
  const list = createListCatalogRestaurants({
    restaurants: createFakeRestaurantRepository(catalog),
    ratings: createFakeRatingRepository(ratings),
  });
  const { restaurants } = await list();
  const shown: Record<string, string | null> = {};
  for (const { restaurant: r, score } of restaurants) {
    const html = renderToStaticMarkup(
      createElement(RestaurantCard, {
        restaurant: {
          name: r.name,
          slug: r.slug,
          zone: r.zone,
          address: r.address,
          photoUrl: r.photoUrl,
          mapsUrl: r.mapsUrl,
          rating: {
            status: score.status,
            voteCount: score.voteCount,
            position: score.position,
            display: score.score ? scoreDisplay(score.score) : null,
          },
        },
      }),
    );
    const match = /data-testid="ranking-position"[^>]*>.*?(#\d+)<\/span>/.exec(html);
    shown[r.id] = match?.[1] ?? null;
  }
  return shown;
}

describe("etiquetas de puesto en las tarjetas del catálogo", () => {
  // Como hoy en la base: dos en el ranking y una tercera en votación con 5 votos.
  const today = [...votes("alfa", 14, 9), ...votes("bravo", 46, 8), ...votes("charlie", 5, 7)];

  it("con dos pollerías de 10+ votos solo hay #1 y #2; la de 5 votos no lleva etiqueta", async () => {
    expect(await badges(today)).toEqual({ alfa: "#1", bravo: "#2", charlie: null, delta: null });
  });

  it("con 9 votos la tercera sigue sin etiqueta", async () => {
    expect(await badges([...today, ...votes("charlie", 4, 7, 5)])).toMatchObject({ charlie: null });
  });

  it("al llegar a 10 votos la tercera aparece con #3", async () => {
    expect(await badges([...today, ...votes("charlie", 5, 7, 5)])).toEqual({ alfa: "#1", bravo: "#2", charlie: "#3", delta: null });
  });

  it("si la que entra tiene mejor nota, se lleva el #1 y las demás bajan un puesto", async () => {
    expect(await badges([...today, ...votes("delta", 10, 10)])).toEqual({ alfa: "#2", bravo: "#3", charlie: null, delta: "#1" });
  });

  it("si cambian las notas, las etiquetas cambian de pollería", async () => {
    // bravo recibe muchos 10 y supera a alfa.
    expect(await badges([...today, ...votes("bravo", 40, 10, 46)])).toMatchObject({ alfa: "#2", bravo: "#1" });
  });

  it("en un empate exacto las dos comparten el puesto", async () => {
    expect(await badges([...votes("alfa", 10, 9), ...votes("bravo", 10, 8), ...votes("charlie", 10, 8)])).toEqual({
      alfa: "#1",
      bravo: "#2",
      charlie: "#2",
      delta: null,
    });
  });
});
