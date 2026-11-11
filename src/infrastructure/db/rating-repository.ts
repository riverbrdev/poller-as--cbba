import { and, eq, sql } from "drizzle-orm";
import type { RatingRecord, RatingRepository, RestaurantRatingStats } from "@/application/ports/rating-repository";
import type { Db } from "./client";
import { ratings, restaurants } from "./schema";

const ratingFields = {
  id: ratings.id,
  userId: ratings.userId,
  restaurantId: ratings.restaurantId,
  flavorScore: ratings.flavorScore,
  portionScore: ratings.portionScore,
  serviceScore: ratings.serviceScore,
  placeScore: ratings.placeScore,
  comment: ratings.comment,
  createdAt: ratings.createdAt,
};

type RatingRow = {
  id: string;
  userId: string;
  restaurantId: string;
  flavorScore: number;
  portionScore: number;
  serviceScore: number;
  placeScore: number;
  comment: string | null;
  createdAt: Date;
};

function toRecord(row: RatingRow): RatingRecord {
  return {
    id: row.id,
    userId: row.userId,
    restaurantId: row.restaurantId,
    scores: {
      flavor: row.flavorScore,
      portion: row.portionScore,
      service: row.serviceScore,
      place: row.placeScore,
    },
    comment: row.comment,
    createdAt: row.createdAt,
  };
}

/** Los conteos y sumas llegan como enteros de Postgres; se verifica que sean enteros seguros antes de usarlos. */
function toSafeInteger(value: unknown, label: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`Valor no entero en las estadísticas (${label}): ${String(value)}`);
  }
  return number;
}

export function createDrizzleRatingRepository(db: Db): RatingRepository {
  return {
    async findByUserAndRestaurant(userId, restaurantId) {
      const [row] = await db
        .select(ratingFields)
        .from(ratings)
        .where(and(eq(ratings.userId, userId), eq(ratings.restaurantId, restaurantId)))
        .limit(1);
      return row ? toRecord(row) : null;
    },

    async createIfAbsent(rating) {
      // Una sola sentencia: dos envíos simultáneos dejan una sola fila (la primera).
      const [row] = await db
        .insert(ratings)
        .values({
          userId: rating.userId,
          restaurantId: rating.restaurantId,
          flavorScore: rating.scores.flavor,
          portionScore: rating.scores.portion,
          serviceScore: rating.scores.service,
          placeScore: rating.scores.place,
          comment: rating.comment,
        })
        .onConflictDoNothing({ target: [ratings.userId, ratings.restaurantId] })
        .returning(ratingFields);
      return row ? toRecord(row) : null;
    },

    async statsForActiveRestaurants(): Promise<RestaurantRatingStats[]> {
      // Una sola consulta: v, C y R salen de la misma foto de los datos.
      // No se filtra por comment_status: un comentario oculto no saca la nota del cálculo (SPEC regla 8).
      const rows = await db
        .select({
          restaurantId: ratings.restaurantId,
          voteCount: sql<number>`count(*)::int`,
          flavor: sql<number>`sum(${ratings.flavorScore})::int`,
          portion: sql<number>`sum(${ratings.portionScore})::int`,
          service: sql<number>`sum(${ratings.serviceScore})::int`,
          place: sql<number>`sum(${ratings.placeScore})::int`,
        })
        .from(ratings)
        .innerJoin(restaurants, eq(restaurants.id, ratings.restaurantId))
        .where(and(eq(ratings.status, "visible"), eq(restaurants.status, "active")))
        .groupBy(ratings.restaurantId);

      return rows.map((row) => ({
        restaurantId: row.restaurantId,
        voteCount: toSafeInteger(row.voteCount, "count"),
        criteriaTotals: {
          flavor: toSafeInteger(row.flavor, "flavor"),
          portion: toSafeInteger(row.portion, "portion"),
          service: toSafeInteger(row.service, "service"),
          place: toSafeInteger(row.place, "place"),
        },
      }));
    },
  };
}
