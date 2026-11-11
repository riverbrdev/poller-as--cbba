import type { ReviewFilter } from "@/application/ports/review-repository";

/** Cómo se ve cada filtro en la URL (?resenas=…). En español porque la URL la ve la gente. */
export const REVIEW_FILTER_SLUGS = {
  all: "todas",
  featured: "destacadas",
  "with-comment": "con-comentario",
} as const satisfies Record<ReviewFilter, string>;

export type ReviewFilterSlug = (typeof REVIEW_FILTER_SLUGS)[ReviewFilter];

export const REVIEW_QUERY_PARAMS = { filter: "resenas", visible: "ver" } as const;

/** Enlace al perfil con un filtro y cuántas reseñas mostrar. Omite lo que es valor por defecto. */
export function reviewsHref(slug: string, filter: ReviewFilter, visible: number, defaultVisible: number): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set(REVIEW_QUERY_PARAMS.filter, REVIEW_FILTER_SLUGS[filter]);
  if (visible !== defaultVisible) params.set(REVIEW_QUERY_PARAMS.visible, String(visible));
  const query = params.toString();
  return `/polleria/${slug}${query ? `?${query}` : ""}`;
}
