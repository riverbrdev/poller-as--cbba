import { describe, expect, it } from "vitest";
import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";
import { createListActiveRestaurants } from "@/application/restaurant/list-active-restaurants";

const restaurant = (name: string, zone: string): RestaurantRecord => ({
  id: name,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  zone,
  address: "Av. Ejemplo",
  mapsUrl: null,
  photoUrl: null,
});

const repositoryWith = (records: RestaurantRecord[]): RestaurantRepository => ({
  listActive: async () => records,
});

describe("listActiveRestaurants", () => {
  it("devuelve las pollerías en el mismo orden que el repositorio", async () => {
    const records = [restaurant("Zeta", "Norte"), restaurant("Alfa", "Centro")];
    const list = createListActiveRestaurants({ restaurants: repositoryWith(records) });

    const { restaurants } = await list();

    expect(restaurants.map((item) => item.name)).toEqual(["Zeta", "Alfa"]);
  });

  it("deriva las zonas de los datos, con su conteo y en orden alfabético", async () => {
    const list = createListActiveRestaurants({
      restaurants: repositoryWith([
        restaurant("A", "Norte"),
        restaurant("B", "Sarco"),
        restaurant("C", "Norte"),
        restaurant("D", "Centro"),
        restaurant("E", "Norte"),
      ]),
    });

    const { zones } = await list();

    expect(zones).toEqual([
      { name: "Centro", count: 1 },
      { name: "Norte", count: 3 },
      { name: "Sarco", count: 1 },
    ]);
  });

  it("incluye una zona nueva sin tocar código", async () => {
    const list = createListActiveRestaurants({ restaurants: repositoryWith([restaurant("A", "Quillacollo")]) });

    expect((await list()).zones).toEqual([{ name: "Quillacollo", count: 1 }]);
  });

  it("con la base vacía devuelve listas vacías", async () => {
    const list = createListActiveRestaurants({ restaurants: repositoryWith([]) });

    expect(await list()).toEqual({ restaurants: [], zones: [] });
  });
});
