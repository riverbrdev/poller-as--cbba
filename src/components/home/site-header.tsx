import type { ReactNode } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { ACCOUNT_TEXT } from "@/components/account/messages";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/components/lib/utils";
import { LiveDot } from "@/components/navigation/live-dot";
import { RANKING_HREF, VERSUS_HREF } from "@/components/navigation/routes";
import { buttonVariants } from "@/components/ui/button";
import { HEADER_TEXT } from "./messages";

type SiteHeaderProps = {
  /** Zona de la cuenta a la derecha: "Ingresar" o el menú del usuario. */
  account: ReactNode;
};

/** Header común de las páginas públicas. En celular solo muestra el logo; la navegación va en la barra de abajo. */
export function SiteHeader({ account }: SiteHeaderProps) {
  return (
    // Fijo arriba. Su alto (--header-h, globals.css) lo usa el buscador del ranking para pegarse justo debajo.
    <header className="sticky top-0 z-40 h-(--header-h) border-b border-line bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        <Link href="/" aria-label="ComiDeli, ir al inicio" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg">
          <BrandLogo alt="" eager className="h-7 sm:h-9" />
          {/* Bajo 768px la etiqueta no entra en la fila: se oculta para que no haya scroll horizontal. */}
          <span className="hidden rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-ink md:inline">Cochabamba</span>
        </Link>
        {/* Bajo 768px la navegación vive en la barra de pestañas de abajo (BottomTabBar): aquí solo queda el logo. */}
        <nav aria-label="Navegación principal" className="ml-auto hidden shrink-0 items-center gap-6 text-sm font-bold md:flex">
          <Link href={RANKING_HREF} className="inline-flex min-h-11 items-center transition-colors hover:text-brand-ink">{HEADER_TEXT.restaurants}</Link>
          {/* El duelo es lo destacado del sitio: botón naranja con un puntito "en vivo" que late. */}
          <Link
            href={VERSUS_HREF}
            aria-label={HEADER_TEXT.versusLabel}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 text-white shadow-soft transition-[background-color,scale] hover:bg-brand-dark active:scale-[0.97]"
          >
            <Swords size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-12 motion-reduce:transition-none" />
            <span>{HEADER_TEXT.versus}</span>
            <LiveDot />
          </Link>
          {account}
        </nav>
      </div>
    </header>
  );
}

/** Lo que ve quien no ingresó (y lo que se muestra mientras se verifica la sesión). */
export function ParticipateLink() {
  return (
    <Link href="/login" className={cn(buttonVariants({ variant: "brand", size: "touch" }), "px-3 sm:px-4")}>
      {ACCOUNT_TEXT.participate}
    </Link>
  );
}
