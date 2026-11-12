import { describe, expect, it } from "vitest";
import type { RatingRecord } from "@/application/ports/rating-repository";
import type { RestaurantRecord } from "@/application/ports/restaurant-repository";
import { createGetRestaurantDetail } from "@/application/restaurant/get-restaurant-detail";
import { createListCatalogRestaurants } from "@/application/restaurant/list-catalog-restaurants";
import { compareScores } from "@/domain/rating/ranking";
import { createFakeRatingRepository, createFakeRestaurantRepository } from "./fakes";

function restaurant(id: string, zone = "Centro"): RestaurantRecord {
  return { id, name: `Pollería ${id}`, slug: id, zone, address: "Calle 1", mapsUrl: null, photoUrl: null };
}

function votes(restaurantId: string, count: number, note: number): RatingRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${restaurantId}-v${index}`,
    userId: `${restaurantId}-u${index}`,
    restaurantId,
    scores: { flavor: note, portion: note, service: note, place: note },
    comment: null,
    createdAt: new Date(2026, 0, index + 1),
  }));
}

function setup(records: RestaurantRecord[], ratings: RatingRecord[]) {
  const deps = {
    restaurants: createFakeRestaurantRepository(records),
    ratings: createFakeRatingRepository(ratings),
  };
  return { list: createListCatalogRestaurants(deps), detail: createGetRestaurantDetail(deps) };
}

describe("listCatalogRestaurants", () => {
  const names = async (list: ReturnType<typeof createListCatalogRestaurants>) =>
    (await list()).restaurants.map((entry) => entry.restaurant.id);

  it("sin votos ordena de la A a la Z aunque el repositorio las entregue en otro orden", async () => {
    const { list } = setup([restaurant("Zeta"), restaurant("Ñandú"), restaurant("alfa"), restaurant("Beta")], []);

    expect(await names(list)).toEqual(["alfa", "Beta", "Ñandú", "Zeta"]);
  });

  it("ordena ranked por puesto, luego en votación por nota y al final sin votos A–Z", async () => {
    const { list } = setup(
      [
        restaurant("Zeta"),
        restaurant("votingLow"),
        restaurant("rankedSecond"),
        restaurant("Alfa"),
        restaurant("votingHigh"),
        restaurant("rankedFirst"),
      ],
      [
        ...votes("rankedFirst", 10, 9),
        ...votes("rankedSecond", 12, 7),
        ...votes("votingHigh", 3, 8),
        ...votes("votingLow", 3, 5),
      ],
    );

    expect(await names(list)).toEqual(["rankedFirst", "rankedSecond", "votingHigh", "votingLow", "Alfa", "Zeta"]);
  });

  it("una pollería en votación con nota más alta queda detrás de una del ranking", async () => {
    const { list } = setup([restaurant("voting"), restaurant("ranked")], [...votes("voting", 5, 10), ...votes("ranked", 10, 4)]);

    expect(await names(list)).toEqual(["ranked", "voting"]);
  });

  it("devuelve las zonas de los datos", async () => {
    const { list } = setup([restaurant("A", "Norte"), restaurant("B", "Sur")], []);

    expect((await list()).zones).toEqual([
      { name: "Norte", count: 1 },
      { name: "Sur", count: 1 },
    ]);
  });

  it("asigna a cada pollería su estado: ranked con posición, voting y unrated", async () => {
    const { list } = setup(
      [restaurant("ranked"), restaurant("voting"), restaurant("unrated")],
      [...votes("ranked", 10, 8), ...votes("voting", 4, 7)],
    );

    const byId = new Map((await list()).restaurants.map((entry) => [entry.restaurant.id, entry.score]));

    expect(byId.get("ranked")).toMatchObject({ status: "ranked", voteCount: 10, position: 1 });
    expect(byId.get("voting")).toMatchObject({ status: "voting", voteCount: 4, position: null });
    expect(byId.get("unrated")).toMatchObject({ status: "unrated", voteCount: 0, score: null, position: null });
  });

  it("da la misma nota que el perfil de la pollería", async () => {
    const { list, detail } = setup([restaurant("a"), restaurant("b")], [...votes("a", 3, 9), ...votes("b", 12, 6)]);

    const fromCatalog = (await list()).restaurants.find((entry) => entry.restaurant.id === "a")?.score.score;
    const fromDetail = (await detail("a"))?.score.score;

    expect(fromCatalog).toBeTruthy();
    expect(compareScores(fromCatalog!, fromDetail!)).toBe(0);
  });

  it("con la base vacía devuelve listas vacías", async () => {
    const { list } = setup([], []);

    expect(await list()).toEqual({ restaurants: [], zones: [] });
  });
});
