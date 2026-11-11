import type { RatingScores } from "@/domain/rating/criteria";
import type { RestaurantRatingStats } from "@/domain/rating/ranking";

export type { RestaurantRatingStats };

/** Voto tal como lo devuelve el repositorio (SPEC §3). */
export type RatingRecord = {
  id: string;
  userId: string;
  restaurantId: string;
  scores: RatingScores;
  comment: string | null;
  createdAt: Date;
};

export type NewRating = {
  userId: string;
  restaurantId: string;
  scores: RatingScores;
  comment: string | null;
};

/** Puerto: lo implementa infrastructure/. */
export interface RatingRepository {
  findByUserAndRestaurant(userId: string, restaurantId: string): Promise<RatingRecord | null>;
  /**
   * Hace INSERT … ON CONFLICT DO NOTHING sobre el índice único (user_id, restaurant_id).
   * Devuelve null si el usuario ya había votado: los votos no se editan (SPEC regla 1).
   */
  createIfAbsent(rating: NewRating): Promise<RatingRecord | null>;
  /**
   * Estadísticas para el ranking bayesiano: solo votos con status 'visible' de pollerías 'active'.
   * Devuelve sumas enteras por criterio, sin promedios ni redondeos (los calcula domain/rating/ranking.ts).
   */
  statsForActiveRestaurants(): Promise<RestaurantRatingStats[]>;
}
