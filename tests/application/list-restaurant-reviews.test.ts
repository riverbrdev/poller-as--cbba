import { describe, expect, it } from "vitest";
import {
  FALLBACK_USERNAME,
  REVIEWS_PAGE_SIZE,
  createListRestaurantReviews,
} from "@/application/rating/list-restaurant-reviews";
import { createFakeReviewRepository, type FakeReview } from "./fakes";

function review(index: number, overrides: Partial<FakeReview> = {}): FakeReview {
  return {
    id: `rev-${String(index).padStart(3, "0")}`,
    restaurantId: "r1",
    authorId: `user-${index}`,
    authorUsername: `user_${index}`,
    authorAvatarUrl: null,
    scores: { flavor: 9, portion: 8, service: 7, place: 6 },
    comment: `Comentario ${index}`,
    helpfulCount: 0,
    createdAt: new Date(2026, 0, 1, 0, index),
    ...overrides,
  };
}

function list(reviews: FakeReview[]) {
  return createListRestaurantReviews({ reviews: createFakeReviewRepository(reviews) });
}

describe("listRestaurantReviews", () => {
  it("ordena de la más reciente a la más antigua", async () => {
    const result = await list([review(1), review(3), review(2)])({ restaurantId: "r1", filter: "all", limit: 10 });
    expect(result.reviews.map((item) => item.id)).toEqual(["rev-003", "rev-002", "rev-001"]);
  });

  it("con comentarios excluye los votos sin comentario y los de comentario oculto", async () => {
    const result = await list([
      review(1),
      review(2, { comment: null }),
      review(3, { commentVisible: false }),
    ])({ restaurantId: "r1", filter: "with-comment", limit: 10 });
    expect(result.reviews.map((item) => item.id)).toEqual(["rev-001"]);
  });

  it("un comentario oculto llega como null pero el voto mantiene sus notas", async () => {
    const result = await list([review(1, { commentVisible: false })])({ restaurantId: "r1", filter: "all", limit: 10 });
    expect(result.reviews[0]).toMatchObject({ comment: null, scores: { flavor: 9, portion: 8, service: 7, place: 6 } });
  });

  it("los votos ocultos no aparecen ni cuentan", async () => {
    const result = await list([review(1), review(2, { visible: false })])({ restaurantId: "r1", filter: "all", limit: 10 });
    expect(result.reviews.map((item) => item.id)).toEqual(["rev-001"]);
    expect(result.counts.all).toBe(1);
  });

  it("tandas de 10: con 11 hay más; con 10 no", async () => {
    const eleven = Array.from({ length: 11 }, (_, index) => review(index));
    const withMore = await list(eleven)({ restaurantId: "r1", filter: "all", limit: REVIEWS_PAGE_SIZE });
    expect(withMore.reviews).toHaveLength(10);
    expect(withMore.hasMore).toBe(true);

    const exact = await list(eleven.slice(0, 10))({ restaurantId: "r1", filter: "all", limit: REVIEWS_PAGE_SIZE });
    expect(exact.hasMore).toBe(false);
  });

  it("cuenta todas y con comentarios", async () => {
    const result = await list([review(1), review(2, { comment: null }), review(3)])({
      restaurantId: "r1",
      filter: "all",
      limit: 10,
    });
    expect(result.counts).toMatchObject({ all: 3, withComment: 2 });
  });

  it("destacadas: solo con marcas, de más a menos", async () => {
    const result = await list([
      review(1, { helpfulCount: 2 }),
      review(2, { helpfulCount: 0 }),
      review(3, { helpfulCount: 5 }),
    ])({ restaurantId: "r1", filter: "featured", limit: 10 });
    expect(result.reviews.map((item) => item.id)).toEqual(["rev-003", "rev-001"]);
  });

  it("del autor solo expone username y avatar, nunca nombre, correo ni id", async () => {
    const result = await list([review(1)])({ restaurantId: "r1", filter: "all", limit: 10 });
    const [first] = result.reviews;
    expect(Object.keys(first!.author).sort()).toEqual(["avatarUrl", "username"]);
    expect(first).not.toHaveProperty("userId");
    expect(first).not.toHaveProperty("authorId");
    expect(JSON.stringify(first)).not.toContain("user-1");
  });

  it("sin username muestra el genérico", async () => {
    const result = await list([review(1, { authorUsername: null })])({ restaurantId: "r1", filter: "all", limit: 10 });
    expect(result.reviews[0]?.author.username).toBe(FALLBACK_USERNAME);
  });

  it("calcula la nota del voto con 1 decimal", async () => {
    const result = await list([review(1)])({ restaurantId: "r1", filter: "all", limit: 10 });
    expect(result.reviews[0]?.overall).toBe(7.5);
  });
});
