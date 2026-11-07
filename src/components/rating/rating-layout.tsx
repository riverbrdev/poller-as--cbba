import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type RatingHeroSlots = { banner: ReactNode; card: ReactNode };

type RatingLayoutProps = {
  hero: RatingHeroSlots;
  /** Contenido extra de la columna lateral en computadora (nota, avance, botón). */
  aside?: ReactNode;
  children: ReactNode;
};

export const CATALOG_HREF = "/#locales";

/**
 * Esqueleto visual de la pantalla de calificar (diseño Stitch):
 * celular → foto arriba y una hoja blanca que sube sobre ella;
 * computadora → columna lateral fija con la pollería y columna principal con el contenido.
 */
export function RatingLayout({ hero, aside, children }: RatingLayoutProps) {
  return (
    <div className="relative min-h-screen bg-cream text-ink lg:py-10">
      <Link
        href={CATALOG_HREF}
        className="absolute left-4 top-4 z-20 inline-flex size-11 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur-md transition-colors hover:bg-white lg:static lg:mx-auto lg:mb-6 lg:flex lg:size-auto lg:min-h-11 lg:w-full lg:max-w-6xl lg:justify-start lg:gap-2 lg:bg-transparent lg:px-8 lg:text-sm lg:font-semibold lg:text-ink-muted lg:shadow-none lg:backdrop-blur-none lg:hover:bg-transparent lg:hover:text-brand-ink"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span className="sr-only lg:not-sr-only">Volver al catálogo</span>
      </Link>

      <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-10 lg:px-8">
        <div className="lg:hidden">{hero.banner}</div>

        <aside className="hidden lg:sticky lg:top-8 lg:block">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-[0_8px_25px_rgba(58,35,20,0.06)]">
            {hero.card}
            {aside ? <div className="mt-6 border-t border-line pt-6">{aside}</div> : null}
          </div>
        </aside>

        <main className="relative -mt-7 rounded-t-[28px] bg-white px-5 pb-10 pt-7 sm:px-8 lg:mt-0 lg:rounded-3xl lg:border lg:border-line lg:p-10 lg:shadow-[0_8px_25px_rgba(58,35,20,0.06)]">
          {children}
        </main>
      </div>
    </div>
  );
}
