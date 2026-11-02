import { asc, eq } from "drizzle-orm";
import type { RestaurantRepository } from "@/application/ports/restaurant-repository";
import type { Db } from "./client";
import { restaurants } from "./schema";

export function createDrizzleRestaurantRepository(db: Db): RestaurantRepository {
  return {
    async listActive() {
      // Las ocultas (status = 'hidden') nunca salen en el catálogo público.
      return db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          slug: restaurants.slug,
          zone: restaurants.zone,
          address: restaurants.address,
          mapsUrl: restaurants.mapsUrl,
          photoUrl: restaurants.photoUrl,
        })
        .from(restaurants)
        .where(eq(restaurants.status, "active"))
        .orderBy(asc(restaurants.createdAt), asc(restaurants.name));
    },
  };
}
