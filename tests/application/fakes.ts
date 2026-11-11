import type { PasswordHasher } from "@/application/ports/password-hasher";
import type {
  NewRating,
  RatingRecord,
  RatingRepository,
  RestaurantRatingStats,
} from "@/application/ports/rating-repository";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import type { ReviewFilter, ReviewRepository, ReviewRow } from "@/application/ports/review-repository";
import type {
  CreateUserResult,
  NewUser,
  SetUsernameResult,
  UserRecord,
  UserRepository,
} from "@/application/ports/user-repository";

/**
 * Repositorio en memoria que respeta los mismos índices únicos que la base:
 * username sin distinguir mayúsculas, email y google_id.
 */
export function createFakeUserRepository(initial: UserRecord[] = []): UserRepository & {
  all(): UserRecord[];
} {
  const users = new Map<string, UserRecord>(initial.map((user) => [user.id, { ...user }]));
  let nextId = 1;

  const findWhere = (predicate: (user: UserRecord) => boolean) =>
    [...users.values()].find(predicate) ?? null;

  return {
    all: () => [...users.values()],
    findById: async (id) => findWhere((user) => user.id === id),
    findByEmail: async (email) => findWhere((user) => user.email === email),
    findByGoogleId: async (googleId) => findWhere((user) => user.googleId === googleId),
    findByUsername: async (username) =>
      findWhere((user) => user.username?.toLowerCase() === username),
    async create(newUser: NewUser): Promise<CreateUserResult> {
      if (newUser.username && findWhere((u) => u.username?.toLowerCase() === newUser.username)) {
        return { ok: false, conflict: "username_taken" };
      }
      if (findWhere((u) => u.email === newUser.email)) {
        return { ok: false, conflict: "email_taken" };
      }
      if (newUser.googleId && findWhere((u) => u.googleId === newUser.googleId)) {
        return { ok: false, conflict: "google_id_taken" };
      }
      const user: UserRecord = { ...newUser, id: `user-${nextId++}` };
      users.set(user.id, user);
      return { ok: true, user };
    },
    async setUsername(id, username): Promise<SetUsernameResult> {
      const current = users.get(id);
      if (!current) {
        throw new Error(`usuario ${id} no existe en el fake`);
      }
      if (findWhere((u) => u.id !== id && u.username?.toLowerCase() === username)) {
        return { ok: false, conflict: "username_taken" };
      }
      const updated = { ...current, username };
      users.set(id, updated);
      return { ok: true, user: updated };
    },
  };
}

/** Hash falso y reversible: solo para probar la lógica, nunca bcrypt real. */
export const fakeHasher: PasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  verify: async (password, hash) => hash === `hashed:${password}`,
};

/**
 * Repositorio de votos en memoria. Respeta el índice único (user_id, restaurant_id) de la base.
 * `hidden`: ids de votos ocultos (status 'hidden'), que no cuentan en las estadísticas.
 */
export function createFakeRatingRepository(
  initial: RatingRecord[] = [],
  hidden: Set<string> = new Set(),
): RatingRepository & {
  all(): RatingRecord[];
} {
  const ratings: RatingRecord[] = initial.map((rating) => ({ ...rating }));
  let nextId = 1;

  const find = (userId: string, restaurantId: string) =>
    ratings.find((rating) => rating.userId === userId && rating.restaurantId === restaurantId) ?? null;

  return {
    all: () => [...ratings],
    findByUserAndRestaurant: async (userId, restaurantId) => find(userId, restaurantId),
    async createIfAbsent(newRating: NewRating) {
      if (find(newRating.userId, newRating.restaurantId)) {
        return null;
      }
      const rating: RatingRecord = { ...newRating, id: `rating-${nextId++}`, createdAt: new Date() };
      ratings.push(rating);
      return rating;
    },
    async statsForActiveRestaurants() {
      const byRestaurant = new Map<string, RestaurantRatingStats>();
      for (const rating of ratings.filter((item) => !hidden.has(item.id))) {
        const stats = byRestaurant.get(rating.restaurantId) ?? {
          restaurantId: rating.restaurantId,
          voteCount: 0,
          criteriaTotals: { flavor: 0, portion: 0, service: 0, place: 0 },
        };
        stats.voteCount += 1;
        stats.criteriaTotals.flavor += rating.scores.flavor;
        stats.criteriaTotals.portion += rating.scores.portion;
        stats.criteriaTotals.service += rating.scores.service;
        stats.criteriaTotals.place += rating.scores.place;
        byRestaurant.set(rating.restaurantId, stats);
      }
      return [...byRestaurant.values()];
    },
  };
}

/** Repositorio de pollerías en memoria: `records` son las activas. */
export function createFakeRestaurantRepository(records: RestaurantRecord[]): RestaurantRepository {
  return {
    listActive: async () => records,
    findActiveBySlug: async (slug) => records.find((record) => record.slug === slug) ?? null,
  };
}

/** Reseña del fake: como la fila de la base, con el autor y los estados de moderación. */
export type FakeReview = Omit<ReviewRow, "comment"> & {
  authorId: string;
  /** Comentario tal como se guardó (antes de aplicar la moderación). */
  comment: string | null;
  /** status del voto; false = 'hidden'. */
  visible?: boolean;
  /** comment_status; false = 'hidden'. */
  commentVisible?: boolean;
  /** status de la pollería; false = 'hidden'. */
  restaurantActive?: boolean;
};

/** Repositorio de reseñas en memoria: mismos filtros y orden que la tabla de data-model.md. */
export function createFakeReviewRepository(reviews: FakeReview[]): ReviewRepository {
  const isPublic = (review: FakeReview) => review.visible !== false && review.restaurantActive !== false;
  const hasVisibleComment = (review: FakeReview) => review.comment !== null && review.commentVisible !== false;
  const byRecent = (a: FakeReview, b: FakeReview) =>
    b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id);

  const matches = (filter: ReviewFilter) => (review: FakeReview) => {
    if (filter === "with-comment") return hasVisibleComment(review);
    if (filter === "featured") return hasVisibleComment(review) && review.helpfulCount >= 1;
    return true;
  };

  const toRow = (review: FakeReview): ReviewRow => ({
    id: review.id,
    restaurantId: review.restaurantId,
    authorUsername: review.authorUsername,
    authorAvatarUrl: review.authorAvatarUrl,
    scores: review.scores,
    comment: review.commentVisible === false ? null : review.comment,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt,
  });

  const ofRestaurant = (restaurantId: string) =>
    reviews.filter((review) => review.restaurantId === restaurantId && isPublic(review));

  return {
    async list({ restaurantId, filter, limit }) {
      const sorted = ofRestaurant(restaurantId)
        .filter(matches(filter))
        .sort(filter === "featured" ? (a, b) => b.helpfulCount - a.helpfulCount || byRecent(a, b) : byRecent);
      return sorted.slice(0, limit).map(toRow);
    },
    async counts(restaurantId) {
      const visible = ofRestaurant(restaurantId);
      return {
        all: visible.length,
        withComment: visible.filter(matches("with-comment")).length,
        featured: visible.filter(matches("featured")).length,
      };
    },
  };
}
