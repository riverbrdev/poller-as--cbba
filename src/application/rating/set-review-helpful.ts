import type { HelpfulVoteRepository } from "@/application/ports/helpful-vote-repository";
import type { ReviewRepository } from "@/application/ports/review-repository";
import type { UserRepository } from "@/application/ports/user-repository";

export type SetReviewHelpfulInput = {
  userId: string;
  ratingId: string;
  /** Estado deseado, no un "toggle": tocar dos veces o desde dos pestañas da el mismo resultado. */
  helpful: boolean;
};

export type SetReviewHelpfulError = "user_not_found" | "username_required" | "review_not_found" | "own_review";

export type SetReviewHelpfulResult =
  | { ok: true; helpful: boolean; helpfulCount: number; restaurantId: string }
  | { ok: false; error: SetReviewHelpfulError };

/**
 * Marca o desmarca una reseña como "Útil" (SPEC regla 9). Todo se verifica contra la base, no contra el cliente:
 * la cuenta y su @usuario, que la reseña sea pública y tenga comentario visible, y que no sea propia.
 */
export function createSetReviewHelpful(deps: {
  users: UserRepository;
  reviews: ReviewRepository;
  helpfulVotes: HelpfulVoteRepository;
}) {
  return async function setReviewHelpful(input: SetReviewHelpfulInput): Promise<SetReviewHelpfulResult> {
    const user = await deps.users.findById(input.userId);
    if (!user) {
      return { ok: false, error: "user_not_found" };
    }
    if (user.username === null) {
      return { ok: false, error: "username_required" };
    }

    const review = await deps.reviews.findPublicById(input.ratingId);
    if (!review || !review.hasVisibleComment) {
      return { ok: false, error: "review_not_found" };
    }
    if (review.authorId === user.id) {
      return { ok: false, error: "own_review" };
    }

    if (input.helpful) {
      await deps.helpfulVotes.add(review.id, user.id);
    } else {
      await deps.helpfulVotes.remove(review.id, user.id);
    }
    // El contador se lee después de escribir: nunca un +1 calculado a ciegas.
    const helpfulCount = await deps.helpfulVotes.count(review.id);
    return { ok: true, helpful: input.helpful, helpfulCount, restaurantId: review.restaurantId };
  };
}
