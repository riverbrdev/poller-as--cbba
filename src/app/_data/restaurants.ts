import { cacheLife, cacheTag } from "next/cache";
import type { RatingCriterionKey } from "@/domain/rating/criteria";
import { scoreDisplay, type RankingStatus, type ScoreDisplay } from "@/domain/rating/ranking";
import { useCases } from "@/composition/container";

/**
 * Catálogo de la home. Se cachea unos minutos: la página sigue prerenderizada y rápida,
 * y una pollería nueva (por ejemplo, una sugerencia aprobada) aparece sola al vencer la caché.
 */
export async function getActiveRestaurants() {
  "use cache";
  cacheLife("minutes");
  return useCases.listActiveRestaurants();
}

/** Pollería de la página de calificar. Es pública (no depende del usuario), así que también se cachea. */
export async function getRestaurantBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  return useCases.getRestaurantBySlug(slug);
}

/** Etiqueta de caché de todo lo que depende de los votos. Un voto cambia C y la nota de todas las pollerías. */
export const RATINGS_CACHE_TAG = "ratings";

/** Lo que recibe la página de detalle. Serializable: sin bigint ni fracciones (contracts/restaurant-detail-page.md). */
export type RestaurantDetailDto = {
  restaurant: {
    slug: string;
    name: string;
    zone: string;
    address: string;
    mapsUrl: string | null;
    photoUrl: string | null;
  };
  voteCount: number;
  status: RankingStatus;
  position: number | null;
  /** Nota lista para mostrar (de scoreDisplay); null si no tiene votos. */
  display: ScoreDisplay | null;
  criteriaAverages: Record<RatingCriterionKey, number> | null;
};

/**
 * Perfil público de una pollería con su nota bayesiana.
 * Un voto cambia C y por lo tanto la nota de todas: se invalida con updateTag("ratings").
 */
export async function getRestaurantDetail(slug: string): Promise<RestaurantDetailDto | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(RATINGS_CACHE_TAG);
  const detail = await useCases.getRestaurantDetail(slug);
  if (!detail) {
    return null;
  }
  const { restaurant, score } = detail;
  return {
    restaurant: {
      slug: restaurant.slug,
      name: restaurant.name,
      zone: restaurant.zone,
      address: restaurant.address,
      mapsUrl: restaurant.mapsUrl,
      photoUrl: restaurant.photoUrl,
    },
    voteCount: score.voteCount,
    status: score.status,
    position: score.position,
    display: score.score ? scoreDisplay(score.score) : null,
    criteriaAverages: score.criteriaAverages,
  };
}
