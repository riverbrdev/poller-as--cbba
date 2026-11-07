import { describe, expect, it } from "vitest";
import type { RestaurantRecord } from "@/application/ports/restaurant-repository";
import type { UserRecord } from "@/application/ports/user-repository";
import { createRateRestaurant } from "@/application/rating/rate-restaurant";
import {
  createFakeRatingRepository,
  createFakeRestaurantRepository,
  createFakeUserRepository,
} from "./fakes";

const kingdom: RestaurantRecord = {
  id: "r1",
  name: "Pollos Kingdom",
  slug: "pollos-kingdom",
  zone: "Norte",
  address: "Av. América",
  mapsUrl: null,
  photoUrl: null,
};

const user = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: "u1",
  username: "juan",
  googleId: null,
  passwordHash: "hashed:x",
  name: "Juan",
  email: "juan@example.com",
  avatarUrl: null,
  ...overrides,
});

const scores = { flavor: 9, portion: 7, service: 8, place: 6 };

function setup(users: UserRecord[] = [user()]) {
  const ratings = createFakeRatingRepository();
  const rate = createRateRestaurant({
    users: createFakeUserRepository(users),
    restaurants: createFakeRestaurantRepository([kingdom]),
    ratings,
  });
  return { rate, ratings };
}

describe("rateRestaurant", () => {
  it("guarda un voto válido con el comentario recortado", async () => {
    const { rate, ratings } = setup();

    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores, comment: "  rico  " });

    expect(result.ok).toBe(true);
    expect(ratings.all()).toHaveLength(1);
    expect(ratings.all()[0]).toMatchObject({ userId: "u1", restaurantId: "r1", scores, comment: "rico" });
  });

  it("guarda null si el comentario es solo espacios", async () => {
    const { rate, ratings } = setup();

    await rate({ userId: "u1", slug: "pollos-kingdom", scores, comment: "   " });

    expect(ratings.all()[0]?.comment).toBeNull();
  });

  it("rechaza si falta un criterio", async () => {
    const { rate, ratings } = setup();

    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores: { flavor: 9, portion: 7, service: 8 } });

    expect(result).toEqual({ ok: false, error: "invalid_scores" });
    expect(ratings.all()).toHaveLength(0);
  });

  it("rechaza una nota fuera de rango", async () => {
    const { rate } = setup();
    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores: { ...scores, place: 11 } });
    expect(result).toEqual({ ok: false, error: "invalid_scores" });
  });

  it("rechaza un comentario de más de 280 caracteres", async () => {
    const { rate } = setup();
    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores, comment: "a".repeat(281) });
    expect(result).toEqual({ ok: false, error: "comment_too_long" });
  });

  it("rechaza si el usuario no existe", async () => {
    const { rate } = setup([]);
    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores });
    expect(result).toEqual({ ok: false, error: "user_not_found" });
  });

  it("exige username aunque haya sesión", async () => {
    const { rate } = setup([user({ username: null })]);
    const result = await rate({ userId: "u1", slug: "pollos-kingdom", scores });
    expect(result).toEqual({ ok: false, error: "username_required" });
  });

  it("rechaza una pollería inexistente u oculta", async () => {
    const { rate } = setup();
    const result = await rate({ userId: "u1", slug: "no-existe", scores });
    expect(result).toEqual({ ok: false, error: "restaurant_not_found" });
  });

  it("no permite votar dos veces ni cambia el voto original", async () => {
    const { rate, ratings } = setup();
    await rate({ userId: "u1", slug: "pollos-kingdom", scores });

    const second = await rate({
      userId: "u1",
      slug: "pollos-kingdom",
      scores: { flavor: 1, portion: 1, service: 1, place: 1 },
    });

    expect(second).toEqual({ ok: false, error: "already_rated" });
    expect(ratings.all()).toHaveLength(1);
    expect(ratings.all()[0]?.scores).toEqual(scores);
  });
});
