import { describe, expect, it } from "vitest";
import type { UserRecord } from "@/application/ports/user-repository";
import { createSetReviewHelpful } from "@/application/rating/set-review-helpful";
import { createFakeHelpfulVoteRepository, createFakeReviewRepository, createFakeUserRepository, type FakeReview } from "./fakes";

function user(id: string, username: string | null): UserRecord {
  return { id, username, googleId: `g-${id}`, passwordHash: null, name: `Nombre ${id}`, email: `${id}@example.com`, avatarUrl: null };
}

function review(id: string, overrides: Partial<FakeReview> = {}): FakeReview {
  return {
    id,
    restaurantId: "r1",
    authorId: "autor",
    authorUsername: "autor",
    authorAvatarUrl: null,
    scores: { flavor: 9, portion: 8, service: 7, place: 6 },
    comment: "Muy rico",
    helpfulCount: 0,
    createdAt: new Date("2026-11-01T12:00:00Z"),
    ...overrides,
  };
}

function setup() {
  const helpfulVotes = createFakeHelpfulVoteRepository();
  const setHelpful = createSetReviewHelpful({
    users: createFakeUserRepository([user("autor", "autor"), user("ana", "ana"), user("beto", "beto"), user("sin", null)]),
    reviews: createFakeReviewRepository([
      review("ok"),
      review("oculto", { visible: false }),
      review("sin-comentario", { comment: null }),
      review("comentario-oculto", { commentVisible: false }),
      review("polleria-oculta", { restaurantActive: false }),
    ]),
    helpfulVotes,
  });
  return { setHelpful, helpfulVotes };
}

describe("setReviewHelpful", () => {
  it("usuario inexistente", async () => {
    const { setHelpful } = setup();
    expect(await setHelpful({ userId: "fantasma", ratingId: "ok", helpful: true })).toEqual({ ok: false, error: "user_not_found" });
  });

  it("sin @usuario no puede marcar", async () => {
    const { setHelpful } = setup();
    expect(await setHelpful({ userId: "sin", ratingId: "ok", helpful: true })).toEqual({ ok: false, error: "username_required" });
  });

  it.each(["oculto", "sin-comentario", "comentario-oculto", "polleria-oculta", "no-existe"])(
    "reseña no marcable (%s) → review_not_found",
    async (ratingId) => {
      const { setHelpful, helpfulVotes } = setup();
      expect(await setHelpful({ userId: "ana", ratingId, helpful: true })).toEqual({ ok: false, error: "review_not_found" });
      expect(helpfulVotes.size()).toBe(0);
    },
  );

  it("nadie marca su propia reseña", async () => {
    const { setHelpful, helpfulVotes } = setup();
    expect(await setHelpful({ userId: "autor", ratingId: "ok", helpful: true })).toEqual({ ok: false, error: "own_review" });
    expect(helpfulVotes.size()).toBe(0);
  });

  it("marcar dos veces cuenta una sola (idempotente)", async () => {
    const { setHelpful } = setup();
    expect(await setHelpful({ userId: "ana", ratingId: "ok", helpful: true })).toEqual({
      ok: true,
      helpful: true,
      helpfulCount: 1,
      restaurantId: "r1",
    });
    expect(await setHelpful({ userId: "ana", ratingId: "ok", helpful: true })).toMatchObject({ helpfulCount: 1 });
  });

  it("desmarcar baja el contador y desmarcar otra vez no hace nada", async () => {
    const { setHelpful } = setup();
    await setHelpful({ userId: "ana", ratingId: "ok", helpful: true });
    expect(await setHelpful({ userId: "ana", ratingId: "ok", helpful: false })).toMatchObject({ helpful: false, helpfulCount: 0 });
    expect(await setHelpful({ userId: "ana", ratingId: "ok", helpful: false })).toMatchObject({ helpfulCount: 0 });
  });

  it("dos personas distintas suman dos", async () => {
    const { setHelpful } = setup();
    await setHelpful({ userId: "ana", ratingId: "ok", helpful: true });
    expect(await setHelpful({ userId: "beto", ratingId: "ok", helpful: true })).toMatchObject({ helpfulCount: 2 });
  });
});
