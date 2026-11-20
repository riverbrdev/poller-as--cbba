import Link from "next/link";
import { ChevronLeft, Wrench } from "lucide-react";
import { ADMIN_TEXT } from "./messages";

type AdminWelcomeProps = {
  /** Solo el `@usuario`: el área de administración no muestra correo ni nombre (FR-011). */
  username: string;
};

/** Pantalla de entrada del admin en esta entrega: saludo y aviso de herramientas en camino (FR-008). */
export function AdminWelcome({ username }: AdminWelcomeProps) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-ink-muted">{ADMIN_TEXT.breadcrumb}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">{ADMIN_TEXT.title}</h1>
            <span className="rounded-full border border-brand/15 bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand-ink">
              {ADMIN_TEXT.badge}
            </span>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand/20 bg-white px-4 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {ADMIN_TEXT.backToRanking}
        </Link>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <p className="truncate text-xl font-bold">{ADMIN_TEXT.greeting(username)}</p>
        <div className="mt-5 flex gap-3 rounded-xl bg-surface-soft p-4">
          <Wrench className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold">{ADMIN_TEXT.comingSoonTitle}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{ADMIN_TEXT.comingSoon}</p>
          </div>
        </div>
      </section>
    </>
  );
}
