import { and, asc, eq } from "drizzle-orm";
import type { RestaurantRepository } from "@/application/ports/restaurant-repository";
import type { Db } from "./client";
import { restaurants } from "./schema";

const restaurantFields = {
  id: restaurants.id,
  name: restaurants.name,
  slug: restaurants.slug,
  zone: restaurants.zone,
  address: restaurants.address,
  mapsUrl: restaurants.mapsUrl,
  photoUrl: restaurants.photoUrl,
};

export function createDrizzleRestaurantRepository(db: Db): RestaurantRepository {
  return {
    async listActive() {
      // Las ocultas (status = 'hidden') nunca salen en el catálogo público.
      return db
        .select(restaurantFields)
        .from(restaurants)
        .where(eq(restaurants.status, "active"))
        .orderBy(asc(restaurants.createdAt), asc(restaurants.name));
    },

    async findActiveBySlug(slug) {
      const [restaurant] = await db
        .select(restaurantFields)
        .from(restaurants)
        .where(and(eq(restaurants.slug, slug), eq(restaurants.status, "active")))
        .limit(1);
      return restaurant ?? null;
    },
  };
}
