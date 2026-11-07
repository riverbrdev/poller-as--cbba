import type { RatingRecord, RatingRepository } from "@/application/ports/rating-repository";

/** El voto que el usuario ya dio a esa pollería, si existe. Sirve para mostrar "Ya calificaste" (FR-019a). */
export function createGetMyRating(deps: { ratings: RatingRepository }) {
  return async function getMyRating(userId: string, restaurantId: string): Promise<RatingRecord | null> {
    return deps.ratings.findByUserAndRestaurant(userId, restaurantId);
  };
}
