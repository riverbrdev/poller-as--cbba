import { isValidComment, normalizeComment, validateRatingScores, type RatingScores } from "@/domain/rating/criteria";
import type { RatingRecord, RatingRepository } from "@/application/ports/rating-repository";
import type { RestaurantRepository } from "@/application/ports/restaurant-repository";
import type { UserRepository } from "@/application/ports/user-repository";

export type RateRestaurantInput = {
  userId: string;
  slug: string;
  scores: Partial<RatingScores>;
  comment?: string | null;
};

export type RateRestaurantError =
  | "invalid_scores"
  | "comment_too_long"
  | "user_not_found"
  | "username_required"
  | "restaurant_not_found"
  | "already_rated";

export type RateRestaurantResult = { ok: true; rating: RatingRecord } | { ok: false; error: RateRestaurantError };

/**
 * Califica una pollería (SPEC §4, reglas 1 y 2): un solo voto por usuario y pollería, sin edición.
 * Verifica el username contra la base, no solo contra el token de sesión.
 */
export function createRateRestaurant(deps: {
  users: UserRepository;
  restaurants: RestaurantRepository;
  ratings: RatingRepository;
}) {
  return async function rateRestaurant(input: RateRestaurantInput): Promise<RateRestaurantResult> {
    const validation = validateRatingScores(input.scores);
    if (!validation.valid) {
      return { ok: false, error: "invalid_scores" };
    }

    const comment = normalizeComment(input.comment);
    if (!isValidComment(comment)) {
      return { ok: false, error: "comment_too_long" };
    }

    const user = await deps.users.findById(input.userId);
    if (!user) {
      return { ok: false, error: "user_not_found" };
    }
    if (user.username === null) {
      return { ok: false, error: "username_required" };
    }

    const restaurant = await deps.restaurants.findActiveBySlug(input.slug);
    if (!restaurant) {
      return { ok: false, error: "restaurant_not_found" };
    }

    const rating = await deps.ratings.createIfAbsent({
      userId: user.id,
      restaurantId: restaurant.id,
      scores: validation.scores,
      comment,
    });
    if (!rating) {
      return { ok: false, error: "already_rated" };
    }
    return { ok: true, rating };
  };
}
