/** Pollería tal como la devuelve el repositorio. `mapsUrl` y `photoUrl` son opcionales en la BD (SPEC §3). */
export type RestaurantRecord = {
  id: string;
  name: string;
  slug: string;
  zone: string;
  address: string;
  mapsUrl: string | null;
  photoUrl: string | null;
};

/** Puerto: lo implementa infrastructure/. */
export interface RestaurantRepository {
  /** Solo pollerías con status `active`, en el orden en que se agregaron. */
  listActive(): Promise<RestaurantRecord[]>;
  /** La pollería con ese slug, solo si está `active`. Si no existe o está oculta, `null`. */
  findActiveBySlug(slug: string): Promise<RestaurantRecord | null>;
}
