import type { RatingRepository } from "@/application/ports/rating-repository";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import { rankRestaurants, type RestaurantScore } from "@/domain/rating/ranking";

export type RestaurantDetail = { restaurant: RestaurantRecord; score: RestaurantScore };

/**
 * Perfil público de una pollería: sus datos y su nota bayesiana.
 * La nota se calcula con las estadísticas de TODAS las pollerías (C depende de todas),
 * con la misma función que el ranking, así ambos siempre coinciden.
 */
export function createGetRestaurantDetail(deps: { restaurants: RestaurantRepository; ratings: RatingRepository }) {
  return async function getRestaurantDetail(slug: string): Promise<RestaurantDetail | null> {
    const trimmed = slug.trim();
    if (trimmed === "") {
      return null;
    }

    const restaurant = await deps.restaurants.findActiveBySlug(trimmed);
    if (!restaurant) {
      return null;
    }

    const ranking = rankRestaurants(await deps.ratings.statsForActiveRestaurants());
    const score = ranking.find((item) => item.restaurantId === restaurant.id) ?? unrated(restaurant.id);
    return { restaurant, score };
  };
}

/** Una pollería sin votos no aparece en las estadísticas: no tiene nota ni posición. */
function unrated(restaurantId: string): RestaurantScore {
  return { restaurantId, voteCount: 0, score: null, criteriaAverages: null, status: "unrated", position: null };
}
