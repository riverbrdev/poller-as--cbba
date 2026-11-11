import type { CSSProperties } from "react";
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
  /** Hasta 5 logos reales: uno grande (2×2) y cuatro chicos alrededor. */
  logos: HeroLogo[];
};

export const HERO_LOGO_COUNT = 5;

/** La casilla naranja va en la fila de abajo, al centro: después del cuarto logo. */
const FAVORITE_TILE_POSITION = 4;

// Entra una sola vez al cargar. Con "reducir movimiento" no se anima (motion-safe).
const enter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700";
// Cada casilla del mosaico aparece un poco después de la anterior.
const tileEnter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 motion-safe:[animation-fill-mode:backwards]";
const tileDelay = (index: number): CSSProperties => ({ animationDelay: `${250 + index * 90}ms` });

export function HomeHero({ restaurantCount, zoneCount, criteriaCount, logos }: HomeHeroProps) {
  const tiles = logos.slice(0, HERO_LOGO_COUNT);
  const favoriteAt = Math.min(FAVORITE_TILE_POSITION, tiles.length);

  return (
    <section aria-labelledby="hero-title" className="overflow-hidden border-b border-line bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14 lg:pb-16 lg:pt-16">
        <div className={enter}>
          <p className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-ink">
            {HERO_TEXT.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-5 font-extrabold tracking-tight">
            <span className="block max-w-2xl text-[1.875rem] leading-[1.1] text-balance sm:text-5xl lg:text-[2.5rem] xl:text-5xl">
              {HERO_TEXT.titleStart}
            </span>
            <span className="mt-1 block text-[clamp(4.5rem,24vw,8rem)] leading-[0.95] tracking-tighter text-brand lg:text-[6.5rem] xl:text-[8rem]">
              <span className="relative inline-block">
                {HERO_TEXT.titleHighlight}
                <TitleUnderline />
              </span>
              {HERO_TEXT.titleEnd}
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">{HERO_TEXT.lead}</p>

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

        {tiles.length > 0 ? (
          // Mosaico: el primer logo ocupa 2×2 y el resto se acomoda alrededor (3 columnas; 4 en tablet, donde sobra el último logo).
          <ul className="grid w-full grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-3 lg:gap-4">
            {tiles.map((logo, index) => {
              const position = index < favoriteAt ? index : index + 1;
              return [
                index === favoriteAt ? <FavoriteTile key="favorita" style={tileDelay(favoriteAt)} /> : null,
                <LogoTile key={logo.slug} logo={logo} featured={index === 0} tabletHidden={index === HERO_LOGO_COUNT - 1} style={tileDelay(position)} />,
              ];
            })}
            {favoriteAt === tiles.length ? <FavoriteTile style={tileDelay(favoriteAt)} /> : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

/** Trazo de marcador bajo "llajta": se dibuja una vez al cargar; con movimiento reducido ya aparece dibujado. */
function TitleUnderline() {
  return (
    <svg viewBox="0 0 200 20" fill="none" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[97%] h-auto w-full">
      <path
        d="M4 13 C 45 6, 110 3, 196 9"
        pathLength={1}
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        className="text-ink [stroke-dasharray:1] motion-safe:animate-draw"
      />
    </svg>
  );
}

type LogoTileProps = { logo: HeroLogo; featured: boolean; tabletHidden: boolean; style: CSSProperties };

function LogoTile({ logo, featured, tabletHidden, style }: LogoTileProps) {
  return (
    <li className={cn("group", tileEnter, featured && "col-span-2 row-span-2", tabletHidden && "sm:hidden lg:block")} style={style}>
      <Link
        href={`/calificar/${logo.slug}`}
        aria-label={HERO_TEXT.rateLogo(logo.name)}
        className="relative block aspect-square overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-[translate,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-card-hover motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
      >
        <Image
          src={logo.photoUrl}
          alt=""
          fill
          loading="eager"
          sizes={featured ? "(min-width: 1024px) 18rem, (min-width: 640px) 48vw, 62vw" : "(min-width: 1024px) 9rem, (min-width: 640px) 24vw, 30vw"}
          className="object-cover transition-[scale] duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* El nombre aparece al pasar el mouse o al llegar con el teclado. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent px-3 pb-2.5 pt-8 font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-has-focus-visible:opacity-100",
            featured ? "text-base" : "text-xs",
          )}
        >
          {logo.name}
        </span>
      </Link>
    </li>
  );
}

/** Casilla naranja del mosaico: rompe la repetición de logos y lleva al catálogo. */
function FavoriteTile({ style }: { style: CSSProperties }) {
  return (
    <li className={cn("group", tileEnter)} style={style}>
      <a
        href="#locales"
        className="flex aspect-square flex-col justify-between rounded-2xl bg-brand-dark p-3 text-white shadow-card transition-[translate,scale,background-color,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:bg-brand-ink group-hover:shadow-card-hover active:scale-[0.98] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:p-4"
      >
        <span className="text-sm font-extrabold leading-tight sm:text-lg">{HERO_TEXT.favoriteTitle}</span>
        <span className="inline-flex items-center gap-1 text-xs font-bold sm:text-sm">
          {HERO_TEXT.favoriteAction}
          <ArrowDown size={14} aria-hidden="true" />
        </span>
      </a>
    </li>
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
