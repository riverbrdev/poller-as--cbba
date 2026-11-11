import type { ReviewCounts, ReviewFilter, ReviewRepository, ReviewRow } from "@/application/ports/review-repository";
import { overallScore, type RatingScores } from "@/domain/rating/criteria";

/** Reseñas por tanda (botón "Cargar más") y máximo que se muestra de una vez. */
export const REVIEWS_PAGE_SIZE = 10;
export const REVIEWS_MAX_VISIBLE = 200;

/** Si un usuario no tuviera @usuario (no debería: calificar lo exige), se muestra esto y nunca su nombre. */
export const FALLBACK_USERNAME = "Usuario";

/** Reseña pública. Del autor solo `username` y `avatarUrl` (SPEC §3). */
export type Review = {
  id: string;
  author: { username: string; avatarUrl: string | null };
  scores: RatingScores;
  /** Promedio simple de los 4 criterios del voto, con 1 decimal. */
  overall: number;
  comment: string | null;
  helpfulCount: number;
  /** ISO 8601. La pantalla lo convierte en "Hace 2 días". */
  createdAt: string;
};

export type ReviewList = { reviews: Review[]; counts: ReviewCounts; hasMore: boolean };

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    author: { username: row.authorUsername ?? FALLBACK_USERNAME, avatarUrl: row.authorAvatarUrl },
    scores: row.scores,
    overall: overallScore(row.scores) ?? 0,
    comment: row.comment,
    helpfulCount: row.helpfulCount,
    createdAt: row.createdAt.toISOString(),
  };
}

const clampLimit = (limit: number) =>
  Math.min(REVIEWS_MAX_VISIBLE, Math.max(REVIEWS_PAGE_SIZE, Number.isFinite(limit) ? Math.floor(limit) : REVIEWS_PAGE_SIZE));

/** Reseñas visibles de una pollería, por tandas, con los conteos de cada filtro. */
export function createListRestaurantReviews(deps: { reviews: ReviewRepository }) {
  return async function listRestaurantReviews(args: {
    restaurantId: string;
    filter: ReviewFilter;
    limit: number;
  }): Promise<ReviewList> {
    const limit = clampLimit(args.limit);
    // Se pide una de más para saber si quedan reseñas sin mostrar.
    const [rows, counts] = await Promise.all([
      deps.reviews.list({ restaurantId: args.restaurantId, filter: args.filter, limit: limit + 1 }),
      deps.reviews.counts(args.restaurantId),
    ]);
    return {
      reviews: rows.slice(0, limit).map(toReview),
      counts,
      hasMore: rows.length > limit,
    };
  };
}
