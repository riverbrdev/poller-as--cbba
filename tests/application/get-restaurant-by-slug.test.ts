import { describe, expect, it, vi } from "vitest";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import { createGetRestaurantBySlug } from "@/application/restaurant/get-restaurant-by-slug";

const kingdom: RestaurantRecord = {
  id: "r1",
  name: "Pollos Kingdom",
  slug: "pollos-kingdom",
  zone: "Norte",
  address: "Av. América",
  mapsUrl: null,
  photoUrl: null,
};

function repository(): RestaurantRepository {
  return {
    listActive: async () => [kingdom],
    findActiveBySlug: vi.fn(async (slug: string) => (slug === kingdom.slug ? kingdom : null)),
  };
}

describe("getRestaurantBySlug", () => {
  it("devuelve la pollería activa por su slug", async () => {
    const get = createGetRestaurantBySlug({ restaurants: repository() });
    expect(await get("pollos-kingdom")).toEqual(kingdom);
  });

  it("devuelve null si el slug no existe", async () => {
    const get = createGetRestaurantBySlug({ restaurants: repository() });
    expect(await get("no-existe")).toBeNull();
  });

  it("no consulta el repositorio con un slug vacío", async () => {
    const restaurants = repository();
    const get = createGetRestaurantBySlug({ restaurants });

    expect(await get("   ")).toBeNull();
    expect(restaurants.findActiveBySlug).not.toHaveBeenCalled();
  });
});
