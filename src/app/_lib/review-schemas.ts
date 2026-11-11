// Validación en el borde (CLAUDE.md, regla 4) de los parámetros del perfil de pollería.
import { z } from "zod";
import type { ReviewFilter } from "@/application/ports/review-repository";
import { REVIEWS_MAX_VISIBLE, REVIEWS_PAGE_SIZE } from "@/application/rating/list-restaurant-reviews";
import { REVIEW_FILTER_SLUGS } from "@/components/restaurant/review-query";

const FILTER_BY_SLUG = Object.fromEntries(
  Object.entries(REVIEW_FILTER_SLUGS).map(([filter, slug]) => [slug, filter]),
) as Record<string, ReviewFilter>;

const firstValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

/**
 * `?resenas=` y `?ver=`. Un valor inválido nunca da error: cae al valor por defecto.
 * `ver` es múltiplo de la tanda, entre una tanda y el máximo.
 */
export const reviewsQuerySchema = z.object({
  resenas: z.preprocess(
    firstValue,
    z
      .enum(Object.values(REVIEW_FILTER_SLUGS) as [string, ...string[]])
      .catch(REVIEW_FILTER_SLUGS.all)
      .default(REVIEW_FILTER_SLUGS.all)
      .transform((slug): ReviewFilter => FILTER_BY_SLUG[slug] ?? "all"),
  ),
  ver: z.preprocess(
    firstValue,
    z.coerce
      .number()
      .int()
      .min(REVIEWS_PAGE_SIZE)
      .max(REVIEWS_MAX_VISIBLE)
      .multipleOf(REVIEWS_PAGE_SIZE)
      .catch(REVIEWS_PAGE_SIZE)
      .default(REVIEWS_PAGE_SIZE),
  ),
});

export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;

/** Marcar o desmarcar "Útil". `helpful` es el estado deseado ("true" / "false"), no un toggle. */
export const helpfulSchema = z.object({
  ratingId: z.uuid({ message: "invalid_input" }),
  helpful: z.enum(["true", "false"], { message: "invalid_input" }).transform((value) => value === "true"),
  slug: z.string().trim().min(1, { message: "invalid_input" }),
});
