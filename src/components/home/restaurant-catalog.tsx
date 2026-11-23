"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CATALOG_TEXT } from "./messages";
import { RestaurantCard, type RestaurantCardData } from "./restaurant-card";

export type CatalogRestaurant = RestaurantCardData & { slug: string };
export type CatalogZone = { name: string; count: number };

type RestaurantCatalogProps = {
  restaurants: CatalogRestaurant[];
  zones: CatalogZone[];
};

/** "top": el orden que llega del servidor (ranking); "name": A–Z. */
type SortOrder = "top" | "name";

const ALL_ZONES = "all";

const chipClass = (active: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition-colors ${
    active
      ? "border-brand-dark bg-brand-dark text-white shadow-soft"
      : "border-line bg-white text-ink-muted hover:border-brand-ink hover:text-brand-ink"
  }`;

export function RestaurantCatalog({ restaurants, zones }: RestaurantCatalogProps) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(ALL_ZONES);
  const [sort, setSort] = useState<SortOrder>("top");

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
    <section id="locales" aria-labelledby="locales-title" className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-ink">{CATALOG_TEXT.eyebrow}</p>
          <h1 id="locales-title" className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {CATALOG_TEXT.title}
          </h1>
          <p className="mt-2 text-base text-ink-muted">{CATALOG_TEXT.lead}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
          <p aria-live="polite" className="rounded-full border border-line bg-white px-3 py-2 text-sm font-bold text-ink-muted">
            {CATALOG_TEXT.count(visible.length)}
          </p>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 shadow-soft focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
            <SlidersHorizontal size={16} className="shrink-0 text-brand" aria-hidden="true" />
            <span className="sr-only">{CATALOG_TEXT.sortLabel}</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOrder)}
              className="min-h-11 bg-white text-base font-semibold outline-none"
            >
              <option value="top">{CATALOG_TEXT.sortTop}</option>
              <option value="name">{CATALOG_TEXT.sortName}</option>
            </select>
          </label>
        </div>
      </div>

      {/* Buscador y zonas pegados bajo el header mientras se baja por las tarjetas: se cambia de zona sin volver a subir. */}
      <div className="sticky top-(--header-h) z-30 -mx-5 mb-6 flex flex-col gap-3 border-b border-line/70 bg-cream/95 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 text-brand shadow-soft focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{CATALOG_TEXT.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={CATALOG_TEXT.searchPlaceholder}
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/70"
          />
        </label>

        {/* Chips de zona: una sola fila con scroll horizontal, sin barra visible. Las zonas salen de los datos. */}
        <div
          role="group"
          aria-label={CATALOG_TEXT.zonesLabel}
          className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button type="button" aria-pressed={zone === ALL_ZONES} onClick={() => setZone(ALL_ZONES)} className={chipClass(zone === ALL_ZONES)}>
            {CATALOG_TEXT.allZones} ({restaurants.length})
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
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-base text-ink-muted">
          <UtensilsCrossed className="mx-auto mb-3 text-brand" size={28} aria-hidden="true" />
          {CATALOG_TEXT.empty}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-base text-ink-muted">
          <p>{CATALOG_TEXT.noResults}</p>
          <button
            type="button"
            onClick={clearFilters}
            className={cn(buttonVariants({ variant: "brand", size: "touch" }), "mt-4")}
          >
            {CATALOG_TEXT.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {visible.map((item) => (
            <RestaurantCard key={item.slug} restaurant={item} />
          ))}
        </div>
      )}
    </section>
  );
}
