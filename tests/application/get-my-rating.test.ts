import { describe, expect, it } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import { createGetMyRating } from "@/application/rating/get-my-rating";
import { createFakeRatingRepository } from "./fakes";

const rating: RatingRecord = {
  id: "rating-1",
  userId: "u1",
  restaurantId: "r1",
  scores: { flavor: 9, portion: 7, service: 8, place: 6 },
  comment: null,
  createdAt: new Date("2026-11-06T12:00:00Z"),
};

describe("getMyRating", () => {
  const getMyRating = createGetMyRating({ ratings: createFakeRatingRepository([rating]) });

  it("devuelve el voto del usuario para esa pollería", async () => {
    expect(await getMyRating("u1", "r1")).toEqual(rating);
  });

  it("devuelve null si el usuario votó otra pollería", async () => {
    expect(await getMyRating("u1", "r2")).toBeNull();
  });

  it("devuelve null si otro usuario votó esa pollería", async () => {
    expect(await getMyRating("u2", "r1")).toBeNull();
  });
});
