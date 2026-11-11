import type { RatingScores } from "@/domain/rating/criteria";

/** Filtros de la lista de reseñas. */
export type ReviewFilter = "all" | "featured" | "with-comment";

/**
 * Reseña tal como la devuelve el repositorio. Del autor solo trae `username` y `avatarUrl`:
 * nunca `name`, `email` ni su id (SPEC §3).
 * `comment` ya viene `null` si el comentario fue ocultado por moderación (comment_status = 'hidden').
 */
export type ReviewRow = {
  id: string;
  restaurantId: string;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  scores: RatingScores;
  comment: string | null;
  helpfulCount: number;
  createdAt: Date;
};

export type ReviewCounts = { all: number; withComment: number; featured: number };

/**
 * Puerto: lo implementa infrastructure/.
 * Solo votos con status 'visible' de pollerías 'active'. Orden estable, siempre terminando en `id DESC`:
 * - all: created_at DESC
 * - with-comment: comentario no nulo y visible; created_at DESC
 * - featured: como with-comment y con al menos una marca "Útil"; marcas DESC, created_at DESC
 */
export interface ReviewRepository {
  list(args: { restaurantId: string; filter: ReviewFilter; limit: number }): Promise<ReviewRow[]>;
  counts(restaurantId: string): Promise<ReviewCounts>;
}
