"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { RestaurantCard, type RestaurantCardData } from "./restaurant-card";

export type CatalogRestaurant = RestaurantCardData & { slug: string };
export type CatalogZone = { name: string; count: number };

type RestaurantCatalogProps = {
  restaurants: CatalogRestaurant[];
  zones: CatalogZone[];
};

type SortOrder = "initial" | "name";

const ALL_ZONES = "Todas";
const PRIORITY_CARDS = 3;

const chipClass = (active: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide transition-colors ${
    active ? "bg-brand text-white shadow-sm" : "bg-surface-soft text-ink-muted hover:bg-brand-soft hover:text-brand-ink"
  }`;

export function RestaurantCatalog({ restaurants, zones }: RestaurantCatalogProps) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(ALL_ZONES);
  const [sort, setSort] = useState<SortOrder>("initial");

  const visible = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("es");
    const matches = restaurants.filter(
      (item) =>
        (zone === ALL_ZONES || item.zone === zone) &&
        `${item.name} ${item.zone} ${item.address}`.toLocaleLowerCase("es").includes(text),
    );
    return sort === "name" ? [...matches].sort((a, b) => a.name.localeCompare(b.name, "es")) : matches;
  }, [restaurants, query, zone, sort]);

  const clearFilters = () => {
    setQuery("");
    setZone(ALL_ZONES);
  };

  return (
    <section id="locales" aria-labelledby="locales-title" className="mx-auto max-w-7xl scroll-mt-4 px-5 pb-16 pt-12 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Catálogo completo</p>
          <h2 id="locales-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Todos los broasters de Cochabamba
          </h2>
          <p className="mt-2 text-sm text-ink-muted">Explora los locales del roster y encuentra tu próximo favorito.</p>
        </div>
        <p aria-live="polite" className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink-muted">
          {visible.length} {visible.length === 1 ? "local" : "locales"}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-line bg-white p-3 shadow-[0_5px_20px_rgba(58,35,20,0.05)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-surface-soft px-4 text-brand focus-within:ring-2 focus-within:ring-brand">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar pollería, zona o dirección</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pollería, zona o dirección..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
            />
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line px-3 sm:w-auto">
            <SlidersHorizontal size={16} className="shrink-0 text-brand" aria-hidden="true" />
            <span className="sr-only">Ordenar pollerías</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOrder)}
              className="w-full bg-white text-sm font-semibold outline-none"
            >
              <option value="initial">Orden inicial</option>
              <option value="name">Nombre A–Z</option>
            </select>
          </label>
        </div>

        {/* Chips de zona: una sola fila con scroll horizontal, sin barra visible. Las zonas salen de los datos. */}
        <div
          role="group"
          aria-label="Filtrar por zona"
          className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button type="button" aria-pressed={zone === ALL_ZONES} onClick={() => setZone(ALL_ZONES)} className={chipClass(zone === ALL_ZONES)}>
            Todas ({restaurants.length})
          </button>
          {zones.map((item) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={zone === item.name}
              onClick={() => setZone(item.name)}
              className={chipClass(zone === item.name)}
            >
              {item.name} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-ink-muted">
          <UtensilsCrossed className="mx-auto mb-3 text-brand" size={28} aria-hidden="true" />
          Aún no hay pollerías en el catálogo. Vuelve pronto.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-ink-muted">
          <p>No encontramos pollerías con esos filtros. Prueba con otro nombre o zona.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, index) => (
            <RestaurantCard key={item.slug} restaurant={item} priority={index < PRIORITY_CARDS} />
          ))}
        </div>
      )}
    </section>
  );
}
