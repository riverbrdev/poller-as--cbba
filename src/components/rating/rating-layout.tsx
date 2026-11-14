import { BackHomeLink } from "@/components/ui/back-home-link";
import type { ReactNode } from "react";



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
      <div className="absolute left-4 top-4 z-20 lg:static lg:mx-auto lg:mb-6 lg:max-w-6xl lg:px-8"><BackHomeLink href="/#locales" label="Volver al catálogo" /></div>

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
