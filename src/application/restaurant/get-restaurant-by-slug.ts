import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";

/** Pollería activa para la página de calificar. Es pública: no depende del usuario. */
export function createGetRestaurantBySlug(deps: { restaurants: RestaurantRepository }) {
  return async function getRestaurantBySlug(slug: string): Promise<RestaurantRecord | null> {
    const trimmed = slug.trim();
    if (trimmed === "") {
      return null;
    }
    return deps.restaurants.findActiveBySlug(trimmed);
  };
}
