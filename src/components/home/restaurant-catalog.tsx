"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Search, UtensilsCrossed } from "lucide-react";
import { RestaurantCard, type RestaurantCardData } from "./restaurant-card";

export type CatalogZone = { name: string; count: number };

type RestaurantCatalogProps = {
  restaurants: RestaurantCardData[];
  zones: CatalogZone[];
};

type SortOrder = "initial" | "name";

function searchable(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es");
}

const chipClass = (active: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-bold transition-colors ${
    active
      ? "border-brand-ink bg-brand-soft text-brand-ink"
      : "border-line-strong bg-white text-ink-muted hover:border-brand-ink hover:text-brand-ink"
  }`;

export function RestaurantCatalog({ restaurants, zones }: RestaurantCatalogProps) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOrder>("initial");

  const visible = useMemo(() => {
    const text = searchable(query.trim());
    const matches = restaurants.filter(
      (item) => (zone === null || item.zone === zone) &&
        searchable(`${item.name} ${item.zone} ${item.address}`).includes(text),
    );
    return sort === "name" ? matches.sort((a, b) => a.name.localeCompare(b.name, "es")) : matches;
  }, [restaurants, query, zone, sort]);

  const clearFilters = () => {
    setQuery("");
    setZone(null);
  };

  return (
    <section id="locales" aria-labelledby="locales-title" className="scroll-mt-16 border-t border-line bg-surface-soft py-14 sm:py-20">
      <div className="comideli-wrap">
        <p className="comideli-kicker">El catálogo</p>
        <h2 id="locales-title" className="comideli-section-title mt-3">Pollerías de Cochabamba</h2>
        <p className="mt-3 max-w-lg text-base leading-7 text-ink-muted">
          Busca un local por nombre o explora las pollerías de tu zona.
        </p>

        <div role="search" aria-label="Catálogo de pollerías" className="mt-7 rounded-2xl border border-line bg-white p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
            <label className="grid min-w-0 gap-2 text-sm font-bold text-ink">
              Buscar pollería
              <span className="relative">
                <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-ink" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, zona o dirección"
                  className="min-h-12 w-full rounded-lg border border-line-strong bg-surface-soft pr-3 pl-10 text-base font-medium placeholder:text-ink-muted"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink">
              Ordenar por
              <span className="relative">
                <ArrowDownUp size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-ink" aria-hidden="true" />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOrder)}
                  className="min-h-12 w-full rounded-lg border border-line-strong bg-surface-soft pr-3 pl-9 text-base font-medium"
                >
                  <option value="initial">Orden inicial</option>
                  <option value="name">Nombre A–Z</option>
                </select>
              </span>
            </label>
          </div>

          <div role="group" aria-labelledby="zone-filter-label" className="mt-4 border-t border-line pt-4">
            <p id="zone-filter-label" className="mb-1 text-sm font-bold text-ink">Zona</p>
            <div className="flex gap-2 overflow-x-auto px-1 pt-1 pb-2 sm:flex-wrap">
              <button type="button" aria-pressed={zone === null} onClick={() => setZone(null)} className={chipClass(zone === null)}>
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
        </div>

        <p role="status" className="mt-5 mb-4 text-sm font-bold text-ink-muted">
          {visible.length} {visible.length === 1 ? "pollería" : "pollerías"}
        </p>

        {visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => <RestaurantCard key={item.slug} restaurant={item} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line-strong bg-white p-7 text-center text-sm text-ink-muted">
            <UtensilsCrossed className="mx-auto mb-3 text-brand-ink" size={26} aria-hidden="true" />
            {restaurants.length === 0 ? (
              <p>Aún no hay pollerías en el catálogo.</p>
            ) : (
              <>
                <p className="text-base font-bold text-ink">No encontramos pollerías con esos filtros</p>
                <p className="mt-1">Prueba con otro nombre o zona.</p>
                <button type="button" onClick={clearFilters} className="comideli-secondary-button mt-4">
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
