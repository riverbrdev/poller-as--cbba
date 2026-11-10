import type { ReactNode } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { ACCOUNT_TEXT } from "@/components/account/messages";
import "./home.css";

type SiteHeaderProps = {
  account: ReactNode;
  home?: boolean;
};

/** Header común de la home y de "Mi perfil". */
export function SiteHeader({ account, home = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="comideli-wrap flex min-h-[4.5rem] items-center justify-between gap-3 py-2">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-ink text-white">
            <UtensilsCrossed size={18} aria-hidden="true" />
          </span>
          ComiDeli
        </Link>
        <nav aria-label="Navegación principal" className="flex shrink-0 items-center gap-4 text-sm font-bold sm:gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/#locales" className="comideli-text-link">Pollerías</Link>
            {home && <Link href="/#metodologia" className="comideli-text-link">Cómo calificamos</Link>}
          </div>
          {account}
        </nav>
      </div>
    </header>
  );
}

/** Lo que ve quien no ingresó (y lo que se muestra mientras se verifica la sesión). */
export function ParticipateLink() {
  return <Link href="/login" className="comideli-button">{ACCOUNT_TEXT.participate}</Link>;
}
