import { cacheLife } from "next/cache";
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
