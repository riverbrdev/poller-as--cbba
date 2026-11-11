import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import type { ReviewFilter, ReviewRepository, ReviewRow } from "@/application/ports/review-repository";
import type { Db } from "./client";
import { ratingHelpfulVotes, ratings, restaurants, users } from "./schema";

// Comentario público: null si fue ocultado por moderación (SPEC §4 regla 8).
const publicComment = sql<string | null>`case when ${ratings.commentStatus} = 'hidden' then null else ${ratings.comment} end`;
const hasVisibleComment = sql`${ratings.comment} is not null and ${ratings.commentStatus} = 'visible'`;
// Se cuenta siempre: no hay contador guardado que pueda desincronizarse.
const helpfulCount = sql<number>`(select count(*)::int from ${ratingHelpfulVotes} where ${ratingHelpfulVotes.ratingId} = ${ratings.id})`;

/** Votos visibles de una pollería activa. */
function visibleReviewsOf(restaurantId: string): SQL {
  return and(
    eq(ratings.restaurantId, restaurantId),
    eq(ratings.status, "visible"),
    eq(restaurants.status, "active"),
  ) as SQL;
}

function whereFor(restaurantId: string, filter: ReviewFilter): SQL {
  const base = visibleReviewsOf(restaurantId);
  if (filter === "with-comment") return and(base, hasVisibleComment) as SQL;
  if (filter === "featured") return and(base, hasVisibleComment, sql`${helpfulCount} >= 1`) as SQL;
  return base;
}

function orderFor(filter: ReviewFilter): SQL[] {
  const recent = [desc(ratings.createdAt), desc(ratings.id)];
  return filter === "featured" ? [sql`${helpfulCount} desc`, ...recent] : recent;
}

export function createDrizzleReviewRepository(db: Db): ReviewRepository {
  return {
    async list({ restaurantId, filter, limit }) {
      const rows = await db
        .select({
          id: ratings.id,
          restaurantId: ratings.restaurantId,
          // Del autor solo lo público: nunca name ni email.
          authorUsername: users.username,
          authorAvatarUrl: users.avatarUrl,
          flavorScore: ratings.flavorScore,
          portionScore: ratings.portionScore,
          serviceScore: ratings.serviceScore,
          placeScore: ratings.placeScore,
          comment: publicComment,
          helpfulCount,
          createdAt: ratings.createdAt,
        })
        .from(ratings)
        .innerJoin(users, eq(users.id, ratings.userId))
        .innerJoin(restaurants, eq(restaurants.id, ratings.restaurantId))
        .where(whereFor(restaurantId, filter))
        .orderBy(...orderFor(filter))
        .limit(limit);

      return rows.map(
        (row): ReviewRow => ({
          id: row.id,
          restaurantId: row.restaurantId,
          authorUsername: row.authorUsername,
          authorAvatarUrl: row.authorAvatarUrl,
          scores: {
            flavor: row.flavorScore,
            portion: row.portionScore,
            service: row.serviceScore,
            place: row.placeScore,
          },
          comment: row.comment,
          helpfulCount: Number(row.helpfulCount),
          createdAt: row.createdAt,
        }),
      );
    },

    async counts(restaurantId) {
      const [row] = await db
        .select({
          all: sql<number>`count(*)::int`,
          withComment: sql<number>`(count(*) filter (where ${hasVisibleComment}))::int`,
          featured: sql<number>`(count(*) filter (where ${hasVisibleComment} and ${helpfulCount} >= 1))::int`,
        })
        .from(ratings)
        .innerJoin(restaurants, eq(restaurants.id, ratings.restaurantId))
        .where(visibleReviewsOf(restaurantId));
      return {
        all: Number(row?.all ?? 0),
        withComment: Number(row?.withComment ?? 0),
        featured: Number(row?.featured ?? 0),
      };
    },
  };
}
