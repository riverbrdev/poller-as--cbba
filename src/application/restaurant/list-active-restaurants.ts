import type { RestaurantRecord, RestaurantRepository } from "@/application/ports/restaurant-repository";

export type ZoneSummary = { name: string; count: number };

export type ActiveRestaurants = {
  restaurants: RestaurantRecord[];
  /** Zonas derivadas de los datos (no hardcodeadas), ordenadas alfabéticamente, con cuántas pollerías tiene cada una. */
  zones: ZoneSummary[];
};

function summarizeZones(restaurants: RestaurantRecord[]): ZoneSummary[] {
  const counts = new Map<string, number>();
  for (const restaurant of restaurants) {
    counts.set(restaurant.zone, (counts.get(restaurant.zone) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/** Catálogo público de la home: las pollerías activas y las zonas para filtrarlas. */
export function createListActiveRestaurants(deps: { restaurants: RestaurantRepository }) {
  return async function listActiveRestaurants(): Promise<ActiveRestaurants> {
    const restaurants = await deps.restaurants.listActive();
    return { restaurants, zones: summarizeZones(restaurants) };
  };
}
