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

/** Lo que muestra el catálogo, en orden: id, estado y puesto. */
async function topOf(list: ReturnType<typeof createListCatalogRestaurants>) {
  return (await list()).restaurants.map(({ restaurant, score }) => ({
    id: restaurant.id,
    status: score.status,
    position: score.position,
  }));
}

describe("listCatalogRestaurants: el top se reordena con los votos", () => {
  const catalog = ["alfa", "bravo", "charlie", "delta", "eco"].map((id) => restaurant(id));
  // Antes: bravo y charlie en el ranking, delta en votación, alfa y eco sin votos.
  const before = [...votes("bravo", 10, 9), ...votes("charlie", 12, 7), ...votes("delta", 3, 8)];

  it("antes de votar por eco, eco va al final entre las sin votos (A–Z)", async () => {
    const { list } = setup(catalog, before);

    expect(await topOf(list)).toEqual([
      { id: "bravo", status: "ranked", position: 1 },
      { id: "charlie", status: "ranked", position: 2 },
      { id: "delta", status: "voting", position: null },
      { id: "alfa", status: "unrated", position: null },
      { id: "eco", status: "unrated", position: null },
    ]);
  });

  it("con 10 votos de 10, eco entra al ranking como #1 y empuja a las demás un puesto", async () => {
    const { list } = setup(catalog, [...before, ...votes("eco", 10, 10)]);

    // C = (9 + 7 + 8 + 10) / 4 = 8.5 → eco 9.25, bravo 8.75, charlie ≈ 7.68.
    expect(await topOf(list)).toEqual([
      { id: "eco", status: "ranked", position: 1 },
      { id: "bravo", status: "ranked", position: 2 },
      { id: "charlie", status: "ranked", position: 3 },
      { id: "delta", status: "voting", position: null },
      { id: "alfa", status: "unrated", position: null },
    ]);
  });

  it("con 9 votos de 10, eco sigue en votación detrás del ranking aunque tenga mejor nota", async () => {
    const { list } = setup(catalog, [...before, ...votes("eco", 9, 10)]);

    expect((await topOf(list)).slice(0, 3)).toEqual([
      { id: "bravo", status: "ranked", position: 1 },
      { id: "charlie", status: "ranked", position: 2 },
      { id: "eco", status: "voting", position: null },
    ]);
  });

  it("empate exacto en el segundo puesto: las dos son #2 y la siguiente es #4", async () => {
    const { list } = setup(catalog, [
      ...votes("bravo", 10, 10),
      ...votes("charlie", 10, 8),
      ...votes("delta", 10, 8),
      ...votes("eco", 10, 6),
    ]);

    expect(await topOf(list)).toEqual([
      { id: "bravo", status: "ranked", position: 1 },
      { id: "charlie", status: "ranked", position: 2 },
      { id: "delta", status: "ranked", position: 2 },
      { id: "eco", status: "ranked", position: 4 },
      { id: "alfa", status: "unrated", position: null },
    ]);
  });
});
