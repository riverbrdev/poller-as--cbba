"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { rateLimiters, useCases } from "@/composition/container";
import { reviewsCacheTag } from "@/app/_data/restaurants";
import { helpfulSchema } from "@/app/_lib/review-schemas";
import type { HelpfulActionResult } from "@/components/restaurant/helpful-button";

/**
 * Marca o desmarca una reseña como "Útil" (contracts/set-helpful-action.md).
 * El cliente solo manda qué reseña y el estado deseado; el resto se relee de la base con la sesión.
 */
export async function setHelpfulAction(formData: FormData): Promise<HelpfulActionResult> {
  const rawSlug = formData.get("slug");
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";

  const session = await auth();
  if (!session?.user.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/polleria/${slug}`)}`);
  }

  const parsed = helpfulSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const limit = await rateLimiters.helpful.limit(`user:${session.user.id}`);
  if (!limit.success) {
    return { ok: false, error: "rate_limited" };
  }

  const result = await useCases.setReviewHelpful({
    userId: session.user.id,
    ratingId: parsed.data.ratingId,
    helpful: parsed.data.helpful,
  });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  // Las marcas no cambian ninguna nota: solo se refrescan las reseñas de esa pollería.
  updateTag(reviewsCacheTag(result.restaurantId));
  return { ok: true, helpful: result.helpful, helpfulCount: result.helpfulCount };
}
