import type { RatingRepository } from "@/application/ports/rating-repository";
import type { UserRepository } from "@/application/ports/user-repository";

/**
 * Lo que depende de quien mira el perfil de una pollería. No se cachea.
 * `signedIn` no está aquí: lo agrega la página, que es la que sabe si hay sesión.
 */
export type ViewerReviewState = {
  /** Id del voto de quien mira en esta pollería, para marcar "Tu reseña". Nunca se expone un userId. */
  myRatingId: string | null;
  /** Puede marcar "Útil": la cuenta existe en la base y tiene @usuario. */
  canMarkHelpful: boolean;
};

export function createGetViewerReviewState(deps: { users: UserRepository; ratings: RatingRepository }) {
  return async function getViewerReviewState(args: { userId: string; restaurantId: string }): Promise<ViewerReviewState> {
    const [user, mine] = await Promise.all([
      deps.users.findById(args.userId),
      deps.ratings.findByUserAndRestaurant(args.userId, args.restaurantId),
    ]);
    return {
      myRatingId: mine?.id ?? null,
      canMarkHelpful: Boolean(user?.username),
    };
  };
}
