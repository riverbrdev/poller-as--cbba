import type { RatingRepository } from "@/application/ports/rating-repository";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import { rankRestaurants, unratedScore, type RestaurantScore } from "@/domain/rating/ranking";
import { createListActiveRestaurants, type ZoneSummary } from "./list-active-restaurants";

export type CatalogEntry = { restaurant: RestaurantRecord; score: RestaurantScore };

export type CatalogRestaurants = {
  /**
   * Orden "Top": primero las del ranking por puesto, luego las en votación por nota
   * y al final las sin votos de la A a la Z. Sin ningún voto, queda alfabético.
   */
  restaurants: CatalogEntry[];
  zones: ZoneSummary[];
};

/**
 * Catálogo de la home con la nota bayesiana de cada pollería.
 * Usa rankRestaurants igual que el perfil, así la tarjeta y el perfil siempre muestran la misma nota.
 */
export function createListCatalogRestaurants(deps: { restaurants: RestaurantRepository; ratings: RatingRepository }) {
  const listActiveRestaurants = createListActiveRestaurants(deps);

  return async function listCatalogRestaurants(): Promise<CatalogRestaurants> {
    const [{ restaurants, zones }, stats] = await Promise.all([
      listActiveRestaurants(),
      deps.ratings.statsForActiveRestaurants(),
    ]);
    // rankRestaurants ya ordena: ranked por puesto y luego voting por nota. Su índice es el orden "Top".
    const ranking = rankRestaurants(stats).filter((score) => score.status !== "unrated");
    const scores = new Map(ranking.map((score, index) => [score.restaurantId, { score, index }]));

    const entries = restaurants.map((restaurant) => ({
      restaurant,
      score: scores.get(restaurant.id)?.score ?? unratedScore(restaurant.id),
    }));
    const topIndex = (entry: CatalogEntry) => scores.get(entry.restaurant.id)?.index ?? Number.MAX_SAFE_INTEGER;
    entries.sort(
      (a, b) => topIndex(a) - topIndex(b) || a.restaurant.name.localeCompare(b.restaurant.name, "es"),
    );

    return { restaurants: entries, zones };
  };
}
