import { and, eq } from "drizzle-orm";
import type { RatingRecord, RatingRepository } from "@/application/ports/rating-repository";
import type { Db } from "./client";
import { ratings } from "./schema";

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
  };
}
