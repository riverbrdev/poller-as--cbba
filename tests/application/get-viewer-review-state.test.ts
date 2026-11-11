import { describe, expect, it } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import type { UserRecord } from "@/application/ports/user-repository";
import { createGetViewerReviewState } from "@/application/rating/get-viewer-review-state";
import { createFakeHelpfulVoteRepository, createFakeRatingRepository, createFakeUserRepository } from "./fakes";

function user(id: string, username: string | null): UserRecord {
  return { id, username, googleId: `g-${id}`, passwordHash: null, name: `Nombre ${id}`, email: `${id}@example.com`, avatarUrl: null };
}

const vote: RatingRecord = {
  id: "rating-1",
  userId: "u1",
  restaurantId: "r1",
  scores: { flavor: 9, portion: 7, service: 8, place: 6 },
  comment: "Rico",
  createdAt: new Date("2026-11-06T12:00:00Z"),
};

function setup() {
  const helpfulVotes = createFakeHelpfulVoteRepository();
  const get = createGetViewerReviewState({
    users: createFakeUserRepository([user("u1", "berni"), user("u2", "carla"), user("u3", null)]),
    ratings: createFakeRatingRepository([vote]),
    helpfulVotes,
  });
  return Object.assign(get, { helpfulVotes });
}

describe("getViewerReviewState", () => {
  it("sin voto en esa pollería: myRatingId null", async () => {
    expect(await setup()({ userId: "u2", restaurantId: "r1", ratingIds: [] })).toEqual({
      myRatingId: null,
      canMarkHelpful: true,
      helpfulRatingIds: [],
    });
  });

  it("con voto: devuelve el id de su voto", async () => {
    expect((await setup()({ userId: "u1", restaurantId: "r1", ratingIds: [] })).myRatingId).toBe("rating-1");
  });

  it("sin @usuario no puede marcar Útil", async () => {
    expect((await setup()({ userId: "u3", restaurantId: "r1", ratingIds: [] })).canMarkHelpful).toBe(false);
  });

  it("si la cuenta no existe en la base no puede marcar Útil", async () => {
    expect((await setup()({ userId: "fantasma", restaurantId: "r1", ratingIds: [] })).canMarkHelpful).toBe(false);
  });

  it("devuelve solo las marcas de esta persona entre las reseñas mostradas", async () => {
    const get = setup();
    await get.helpfulVotes.add("rev-a", "u2");
    await get.helpfulVotes.add("rev-b", "u1");
    await get.helpfulVotes.add("rev-c", "u2");
    const state = await get({ userId: "u2", restaurantId: "r1", ratingIds: ["rev-a", "rev-b"] });
    expect(state.helpfulRatingIds).toEqual(["rev-a"]);
  });
});
