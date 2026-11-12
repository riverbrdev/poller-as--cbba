import type { RatingRepository } from "@/application/ports/rating-repository";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import { rankRestaurants, unratedScore, type RestaurantScore } from "@/domain/rating/ranking";
import { createListActiveRestaurants, type ZoneSummary } from "./list-active-restaurants";

export type CatalogEntry = { restaurant: RestaurantRecord; score: RestaurantScore };

export type CatalogRestaurants = {
  /** Mismo orden que listActiveRestaurants: el catálogo no reordena por nota. */
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
    const scores = new Map(rankRestaurants(stats).map((score) => [score.restaurantId, score]));

    return {
      restaurants: restaurants.map((restaurant) => ({
        restaurant,
        score: scores.get(restaurant.id) ?? unratedScore(restaurant.id),
      })),
      zones,
    };
  };
}
