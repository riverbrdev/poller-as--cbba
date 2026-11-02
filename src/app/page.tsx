import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { getActiveRestaurants } from "@/app/_data/restaurants";
import { MethodologySection } from "@/components/home/methodology-section";
import { RestaurantCatalog } from "@/components/home/restaurant-catalog";

export default async function Home() {
  const { restaurants, zones } = await getActiveRestaurants();

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
              <Stat value={String(restaurants.length)} label="Locales" /><Stat value={String(zones.length)} label="Zonas" /><Stat value="100%" label="Local" />
            </div>
            <p className="mt-4 text-center text-[11px] text-ink-muted">El ranking se definirá con votos reales.</p>
          </div>
        </section>

        {/* El podio Top 3 vuelve cuando haya calificaciones suficientes para el ranking bayesiano (SPEC §4). */}
        <RestaurantCatalog restaurants={restaurants} zones={zones} />
        <MethodologySection />
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl bg-cream px-2 py-3"><strong className="block text-xl font-black text-brand">{value}</strong><span className="text-[11px] text-ink-muted">{label}</span></div>;
}
