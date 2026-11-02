"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Trophy, UtensilsCrossed } from "lucide-react";
import { MethodologySection } from "@/components/home/methodology-section";
import { RestaurantCard } from "@/components/home/restaurant-card";

const restaurants = [
  { name: "Lolo Chicken", zone: "Centro", address: "Baptista entre Calle España", image: "/pollerias/lolo-chicken.webp", maps: "https://maps.app.goo.gl/YTtH4iUrwjWZrHTWA" },
  { name: "Chicken's Kingdom", zone: "Norte", address: "Av. Gualberto Villarroel 1160", image: "/pollerias/chickens-kingdom.webp", maps: "https://maps.app.goo.gl/2uqpUTMeApJPcmSx9" },
  { name: "Chester's Fried Chicken", zone: "Norte", address: "Av. América", image: "/pollerias/chesters-fried-chicken.webp", maps: "https://maps.app.goo.gl/xtg22FRnr4c7x4vNA" },
  { name: "Pollos Vizzio's", zone: "Norte", address: "Av. Julio Rodríguez Morales", image: "/pollerias/pollos-vizzios.webp", maps: "https://maps.app.goo.gl/pBUH9dknMgaq9H329" },
  { name: "Pollos Choco Express", zone: "Norte", address: "Av. Martin De La Rocha 1531", image: "/pollerias/pollos-choco-express.webp", maps: "https://maps.app.goo.gl/xq7Q7ZjrFr3nnCS16" },
  { name: "Holly Molly", zone: "Norte", address: "Av. Calancha entre Av. Humboldt", image: "/pollerias/holly-molly.webp", maps: "https://maps.app.goo.gl/JiHVtznPFoNmAXDq5" },
] as const;

export default function Home() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("Todas");
  const [sort, setSort] = useState("initial");
  const visible = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("es");
    const matches = restaurants.filter((item) =>
      (zone === "Todas" || item.zone === zone) &&
      `${item.name} ${item.zone} ${item.address}`.toLocaleLowerCase("es").includes(text),
    );
    return sort === "name" ? [...matches].sort((a, b) => a.name.localeCompare(b.name, "es")) : matches;
  }, [query, zone, sort]);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white"><UtensilsCrossed size={18} aria-hidden="true" /></span>
            ComiDeli <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-ink">Cochabamba</span>
          </Link>
          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide sm:gap-6">
            <a href="#locales" className="hover:text-brand">El roster</a>
            <a href="#podio" className="hover:text-brand">El podio</a>
            <Link href="/login" className="rounded-xl bg-brand px-4 py-3 text-white hover:bg-brand-dark">Participar</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-12 sm:px-8 lg:grid-cols-[1fr_17rem] lg:items-center lg:pb-14 lg:pt-16">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-ink">Ranking broaster Cochabamba 2026</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">El ranking definitivo del <span className="text-brand  decoration-wavy decoration-[3px] underline-offset-8">pollo broaster</span> en Cochabamba</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">Conoce las pollerías de la ciudad. Pronto podrás calificar sabor, precio, cantidad y atención para construir un ranking hecho por la comunidad.</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_25px_rgba(58,35,20,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-2"><span className="text-[11px] font-extrabold uppercase tracking-wide">Roster inicial</span><span className="text-xs font-bold text-brand">Cochabamba</span></div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat value="6" label="Locales" /><Stat value="2" label="Zonas" /><Stat value="100%" label="Local" />
            </div>
            <p className="mt-4 text-center text-[11px] text-ink-muted">El ranking se definirá con votos reales.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-8" aria-label="Buscar pollerías">
          <div className="rounded-2xl border border-line bg-white p-3 shadow-[0_5px_20px_rgba(58,35,20,0.05)] sm:p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <label className="flex min-h-12 items-center gap-3 rounded-xl bg-surface-soft px-4 text-brand"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar pollería, zona o dirección</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pollería, zona o dirección..." className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70" /></label>
              <label className="sr-only" htmlFor="zone">Filtrar por zona</label>
              <select id="zone" value={zone} onChange={(event) => setZone(event.target.value)} className="min-h-12 rounded-xl border border-line bg-white px-4 text-sm font-semibold"><option>Todas</option><option>Centro</option><option>Norte</option></select>
              <label className="flex min-h-12 items-center gap-2 rounded-xl border border-line px-3"><SlidersHorizontal size={16} className="text-brand" aria-hidden="true" /><span className="sr-only">Ordenar pollerías</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-white text-sm font-semibold outline-none"><option value="initial">Orden inicial</option><option value="name">Nombre A–Z</option></select></label>
            </div>
            <p className="mt-3 pl-1 text-xs font-bold text-brand-ink">{visible.length} locales encontrados</p>
          </div>
        </section>

        <section id="podio" className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pt-20">
          <div className="mb-9 text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-brand-ink"><Trophy size={13} aria-hidden="true" /> Podio cochabambino</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">El Podio <span className="text-brand underline decoration-wavy decoration-orange-300 underline-offset-8">Top 3 Broaster</span> de Cochabamba</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-muted">Vista previa de los puestos 1, 2 y 3. El orden oficial se definirá cuando haya votos reales de la comunidad.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
            <RestaurantCard restaurant={restaurants[0]} rank={2} />
            <RestaurantCard restaurant={restaurants[1]} rank={1} />
            <RestaurantCard restaurant={restaurants[2]} rank={3} />
          </div>
        </section>
        <section id="locales" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Catálogo completo</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Todos los broasters de Cochabamba</h2>
              <p className="mt-2 text-sm text-ink-muted">Explora los locales del roster inicial y encuentra tu próximo favorito.</p>
            </div>
            <span className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink-muted">{visible.length} locales visibles</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => <RestaurantCard key={item.name} restaurant={item} />)}
          </div>
          {visible.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line-strong bg-white p-8 text-center text-sm text-ink-muted">No encontramos pollerías con esos filtros. Prueba con otro nombre o zona.</p>
          )}
        </section>
        <MethodologySection />
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl bg-cream px-2 py-3"><strong className="block text-xl font-black text-brand">{value}</strong><span className="text-[10px] text-ink-muted">{label}</span></div>;
}
