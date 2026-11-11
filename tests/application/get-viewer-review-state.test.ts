import { describe, expect, it } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import type { UserRecord } from "@/application/ports/user-repository";
import { createGetViewerReviewState } from "@/application/rating/get-viewer-review-state";
import { createFakeRatingRepository, createFakeUserRepository } from "./fakes";

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
  return createGetViewerReviewState({
    users: createFakeUserRepository([user("u1", "berni"), user("u2", "carla"), user("u3", null)]),
    ratings: createFakeRatingRepository([vote]),
  });
}

describe("getViewerReviewState", () => {
  it("sin voto en esa pollería: myRatingId null", async () => {
    expect(await setup()({ userId: "u2", restaurantId: "r1" })).toEqual({ myRatingId: null, canMarkHelpful: true });
  });

  it("con voto: devuelve el id de su voto", async () => {
    expect((await setup()({ userId: "u1", restaurantId: "r1" })).myRatingId).toBe("rating-1");
  });

  it("sin @usuario no puede marcar Útil", async () => {
    expect((await setup()({ userId: "u3", restaurantId: "r1" })).canMarkHelpful).toBe(false);
  });

  it("si la cuenta no existe en la base no puede marcar Útil", async () => {
    expect((await setup()({ userId: "fantasma", restaurantId: "r1" })).canMarkHelpful).toBe(false);
  });
});
