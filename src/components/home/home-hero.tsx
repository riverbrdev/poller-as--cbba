import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ListChecks } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { HERO_TEXT } from "./messages";

export type HeroLogo = { name: string; slug: string; photoUrl: string };

type HomeHeroProps = {
  restaurantCount: number;
  zoneCount: number;
  criteriaCount: number;
  /** Hasta 9 logos reales: 8 en celular y tablet, 9 (3×3) en escritorio. */
  logos: HeroLogo[];
};

export const HERO_LOGO_COUNT = 9;

// Entra una sola vez al cargar. Con "reducir movimiento" no se anima (motion-safe).
const enter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700";

export function HomeHero({ restaurantCount, zoneCount, criteriaCount, logos }: HomeHeroProps) {
  return (
    <section aria-labelledby="hero-title" className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14 lg:pb-16 lg:pt-16">
        <div className={enter}>
          <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-ink">
            {HERO_TEXT.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-5 max-w-3xl text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-[3.25rem] xl:text-[4.25rem]">
            {HERO_TEXT.titleStart} <span className="block text-brand">{HERO_TEXT.titleHighlight}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">{HERO_TEXT.lead}</p>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm sm:gap-x-6">
            <Fact value={restaurantCount} label={HERO_TEXT.restaurants(restaurantCount)} />
            <Fact value={zoneCount} label={HERO_TEXT.zones(zoneCount)} />
            <Fact value={criteriaCount} label={HERO_TEXT.criteria} />
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#locales" className={cn(buttonVariants({ variant: "brand", size: "touch-lg" }))}>
              {HERO_TEXT.primaryAction}
              <ArrowDown aria-hidden="true" />
            </a>
            <a href="#metodologia" className={cn(buttonVariants({ variant: "brand-outline", size: "touch-lg" }))}>
              <ListChecks aria-hidden="true" />
              {HERO_TEXT.secondaryAction}
            </a>
          </div>
        </div>

        {logos.length > 0 ? (
          <ul className={`grid grid-cols-4 gap-2.5 sm:grid-cols-8 sm:gap-3 lg:grid-cols-3 lg:gap-4 ${enter} motion-safe:[animation-delay:150ms] motion-safe:[animation-fill-mode:backwards]`}>
            {logos.slice(0, HERO_LOGO_COUNT).map((logo, index) => (
              // El noveno solo completa el 3×3 de escritorio; en las otras grillas sobraría una celda.
              <li key={logo.slug} className={index === HERO_LOGO_COUNT - 1 ? "hidden lg:block" : undefined}>
                <Link
                  href={`/calificar/${logo.slug}`}
                  aria-label={HERO_TEXT.rateLogo(logo.name)}
                  className="group relative block aspect-square overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <Image
                    src={logo.photoUrl}
                    alt=""
                    fill
                    loading="eager"
                    sizes="(min-width: 1024px) 9rem, (min-width: 640px) 12vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <li className="flex items-baseline gap-1.5">
      <strong className="text-2xl font-extrabold text-ink">{value}</strong>
      <span className="text-ink-muted">{label}</span>
    </li>
  );
}
