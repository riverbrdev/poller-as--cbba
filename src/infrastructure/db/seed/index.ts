// Carga las pollerías iniciales. Uso: pnpm db:seed
// Es idempotente: si el slug ya existe, la pollería no se vuelve a insertar.
import { toSlug } from "../../../domain/restaurant/slug.ts";
import { createDb } from "../client.ts";
import { restaurants } from "../schema.ts";
import { seedRestaurants } from "./restaurants.ts";

const rows = seedRestaurants.map((restaurant) => {
  const slug = toSlug(restaurant.name);
  return { ...restaurant, slug, photoUrl: `/pollerias/${slug}.webp` };
});

const inserted = await createDb()
  .insert(restaurants)
  .values(rows)
  .onConflictDoNothing({ target: restaurants.slug })
  .returning({ slug: restaurants.slug });

console.log(`Seed: ${inserted.length} pollerías nuevas, ${rows.length - inserted.length} ya existían.`);
