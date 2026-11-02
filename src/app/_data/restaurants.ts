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
