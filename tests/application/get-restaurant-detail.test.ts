import { describe, expect, it, vi } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import type { RestaurantRecord } from "@/application/ports/restaurant-repository";
import { createGetRestaurantDetail } from "@/application/restaurant/get-restaurant-detail";
import { compareScores, rankRestaurants } from "@/domain/rating/ranking";
import { createFakeRatingRepository, createFakeRestaurantRepository } from "./fakes";

function restaurant(id: string, slug: string): RestaurantRecord {
  return { id, name: `Pollería ${id}`, slug, zone: "Centro", address: "Calle 1", mapsUrl: null, photoUrl: null };
}

const kingdom = restaurant("r1", "kingdom");
const lolo = restaurant("r2", "lolo");

function votes(restaurantId: string, count: number, note: number, prefix = restaurantId): RatingRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-v${index}`,
    userId: `${prefix}-u${index}`,
    restaurantId,
    scores: { flavor: note, portion: note, service: note, place: note },
    comment: null,
    createdAt: new Date(2026, 0, index + 1),
  }));
}

function setup(ratings: RatingRecord[], hidden: Set<string> = new Set()) {
  const ratingRepo = createFakeRatingRepository(ratings, hidden);
  const restaurantRepo = createFakeRestaurantRepository([kingdom, lolo]);
  const findSpy = vi.spyOn(restaurantRepo, "findActiveBySlug");
  const get = createGetRestaurantDetail({ restaurants: restaurantRepo, ratings: ratingRepo });
  return { get, ratingRepo, findSpy };
}

describe("getRestaurantDetail", () => {
  it("con slug vacío devuelve null sin consultar", async () => {
    const { get, findSpy } = setup([]);
    expect(await get("   ")).toBeNull();
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("con slug inexistente u oculto devuelve null", async () => {
    const { get } = setup([]);
    expect(await get("no-existe")).toBeNull();
  });

  it("sin votos: unrated, sin nota ni posición", async () => {
    const { get } = setup(votes("r2", 3, 7));
    const detail = await get("kingdom");
    expect(detail?.restaurant).toEqual(kingdom);
    expect(detail?.score).toMatchObject({ status: "unrated", score: null, voteCount: 0, position: null });
  });

  it("con 3 votos: en votación, con la misma nota que el ranking", async () => {
    const ratings = [...votes("r1", 3, 9), ...votes("r2", 12, 6)];
    const { get, ratingRepo } = setup(ratings);
    const detail = await get("kingdom");
    const fromRanking = rankRestaurants(await ratingRepo.statsForActiveRestaurants()).find((item) => item.restaurantId === "r1");

    expect(detail?.score).toMatchObject({ status: "voting", voteCount: 3, position: null });
    expect(compareScores(detail!.score.score!, fromRanking!.score!)).toBe(0);
  });

  it("con 10 votos: en el ranking, con posición", async () => {
    const { get } = setup([...votes("r1", 10, 9), ...votes("r2", 10, 6)]);
    expect((await get("kingdom"))?.score).toMatchObject({ status: "ranked", position: 1 });
    expect((await get("lolo"))?.score).toMatchObject({ status: "ranked", position: 2 });
  });

  it("un voto oculto no cuenta en la nota", async () => {
    const ratings = votes("r1", 2, 8);
    const { get } = setup(ratings, new Set([ratings[0]!.id]));
    expect((await get("kingdom"))?.score.voteCount).toBe(1);
  });
});
