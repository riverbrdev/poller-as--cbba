import type { ReactNode } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { ACCOUNT_TEXT } from "@/components/account/messages";

type SiteHeaderProps = {
  /** Zona de la cuenta a la derecha: "Participar" o el menú del usuario. */
  account: ReactNode;
};

/** Header común de la home y de "Mi perfil". */
export function SiteHeader({ account }: SiteHeaderProps) {
  return (
    // Fijo arriba: el avatar y su menú quedan a un toque aunque la persona haya bajado por el catálogo.
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white"><UtensilsCrossed size={18} aria-hidden="true" /></span>
          ComiDeli <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-ink">Cochabamba</span>
        </Link>
        <nav aria-label="Navegación principal" className="flex shrink-0 items-center gap-4 text-xs font-bold uppercase tracking-wide sm:gap-6">
          {/* En celular se oculta para que el header fijo entre en una sola fila; el logo ya lleva al inicio. */}
          <Link href="/#locales" className="hidden hover:text-brand sm:inline">El roster</Link>
          {account}
        </nav>
      </div>
    </header>
  );
}

/** Lo que ve quien no ingresó (y lo que se muestra mientras se verifica la sesión). */
export function ParticipateLink() {
  return (
    <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl bg-brand px-3 text-white hover:bg-brand-dark sm:px-4">
      {ACCOUNT_TEXT.participate}
    </Link>
  );
}
