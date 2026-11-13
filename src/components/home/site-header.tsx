import type { ReactNode } from "react";
import Link from "next/link";
import { Swords, UtensilsCrossed } from "lucide-react";
import { ACCOUNT_TEXT } from "@/components/account/messages";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { HEADER_TEXT } from "./messages";

type SiteHeaderProps = {
  /** Zona de la cuenta a la derecha: "Participar" o el menú del usuario. */
  account: ReactNode;
};

/** Header común de la home y de "Mi perfil". */
export function SiteHeader({ account }: SiteHeaderProps) {
  return (
    // Fijo arriba: el avatar y su menú quedan a un toque aunque la persona haya bajado por el catálogo.
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 flex-wrap px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white"><UtensilsCrossed size={18} aria-hidden="true" /></span>
          {/* Bajo 360px la etiqueta no entra en la fila: se oculta para que no haya scroll horizontal. */}
          ComiDeli <span className="hidden rounded bg-brand-soft md:inline px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-ink">Cochabamba</span>
        </Link>
        <nav aria-label="Navegación principal" className="ml-auto flex shrink-0 items-center gap-2 text-sm font-bold sm:gap-6">
          {/* En celular se oculta para que el header fijo entre en una sola fila; el logo ya lleva al inicio. */}
          <Link href="/#locales" className="hidden min-h-11 items-center sm:inline-flex transition-colors hover:text-brand-ink">{HEADER_TEXT.restaurants}</Link>
          {/* El duelo es lo destacado del sitio: botón naranja con un puntito "en vivo" que late. */}
          <Link
            href="/versus"
            aria-label={HEADER_TEXT.versusLabel}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-3 text-white shadow-soft transition-[background-color,scale] hover:bg-brand-dark active:scale-[0.97] sm:px-4"
          >
            <Swords size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-rotate-12 motion-reduce:transition-none" />
            {/* Bajo 390px la palabra no entra junto a "Participar": quedan las espadas y el puntito; el nombre va en aria-label. */}
            <span className="max-[389px]:hidden">{HEADER_TEXT.versus}</span>
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
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
