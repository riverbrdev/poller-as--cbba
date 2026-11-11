import type { HelpfulVoteRepository } from "@/application/ports/helpful-vote-repository";
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
  /** De las reseñas que se muestran, cuáles marcó como útiles. */
  helpfulRatingIds: string[];
};

export function createGetViewerReviewState(deps: {
  users: UserRepository;
  ratings: RatingRepository;
  helpfulVotes: HelpfulVoteRepository;
}) {
  return async function getViewerReviewState(args: {
    userId: string;
    restaurantId: string;
    /** Reseñas que se muestran en la página: solo de esas interesa saber si las marcó. */
    ratingIds: string[];
  }): Promise<ViewerReviewState> {
    const [user, mine, helpfulRatingIds] = await Promise.all([
      deps.users.findById(args.userId),
      deps.ratings.findByUserAndRestaurant(args.userId, args.restaurantId),
      deps.helpfulVotes.markedBy(args.userId, args.ratingIds),
    ]);
    return {
      myRatingId: mine?.id ?? null,
      canMarkHelpful: Boolean(user?.username),
      helpfulRatingIds,
    };
  };
}
