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
    <header className="border-b border-line bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white"><UtensilsCrossed size={18} aria-hidden="true" /></span>
          ComiDeli <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-ink">Cochabamba</span>
        </Link>
        <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide sm:gap-6">
          <Link href="/#locales" className="hover:text-brand">El roster</Link>
          {account}
        </nav>
      </div>
    </header>
  );
}

/** Lo que ve quien no ingresó (y lo que se muestra mientras se verifica la sesión). */
export function ParticipateLink() {
  return (
    <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-white hover:bg-brand-dark">
      {ACCOUNT_TEXT.participate}
    </Link>
  );
}
