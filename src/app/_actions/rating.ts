"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { rateLimiters, useCases } from "@/composition/container";
import { overallScore } from "@/domain/rating/criteria";
import { ratingSchema } from "@/app/_lib/rating-schemas";
import { RATINGS_CACHE_TAG } from "@/app/_data/restaurants";
import type { RatingFormState } from "@/components/rating/form-state";

const loginToRate = (slug: string) =>
  `/login?callbackUrl=${encodeURIComponent(`/calificar/${slug}`)}`;

/** Crea el voto (contracts/submit-rating-action.md). Toda la validación y autorización ocurre aquí, en el servidor. */
export async function submitRatingAction(_state: RatingFormState, formData: FormData): Promise<RatingFormState> {
  const rawSlug = formData.get("slug");
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";

  const session = await auth();
  if (!session?.user.id) {
    redirect(loginToRate(slug));
  }

  const parsed = ratingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "invalid_scores" };
  }

  const limit = await rateLimiters.rating.limit(`user:${session.user.id}`);
  if (!limit.success) {
    return { status: "error", error: "rate_limited" };
  }

  const { flavor, portion, service, place, comment } = parsed.data;
  const result = await useCases.rateRestaurant({
    userId: session.user.id,
    slug: parsed.data.slug,
    scores: { flavor, portion, service, place },
    comment,
  });
  if (!result.ok) {
    return { status: "error", error: result.error };
  }

  // Un voto cambia C y la nota de todas las pollerías: updateTag para que quien votó vea su reseña al instante.
  // La página se vuelve a renderizar con el voto ya guardado; RatingForm conserva la pantalla de "¡Gracias!".
  updateTag(RATINGS_CACHE_TAG);
  return { status: "saved", overall: overallScore(result.rating.scores) ?? 0 };
}
