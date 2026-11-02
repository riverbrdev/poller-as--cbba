import Link from "next/link";
import type { ReactNode } from "react";
import { CircleAlert, Utensils } from "lucide-react";

/** Marca de DeliCocha: isotipo naranja y nombre con "Cocha" en color principal. */
function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none">
      <span className="flex size-8 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
        <Utensils className="size-4" aria-hidden="true" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink">
        Deli<span className="text-brand">Cocha</span>
      </span>
    </Link>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/80 bg-cream/90 px-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between md:max-w-xl">
        <Brand />
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition-colors hover:text-brand"
        >
          Ver Ranking
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="w-full border-t border-line/80 bg-cream px-4 py-5 text-center">
      <p className="text-xs text-ink-muted">© 2026 DeliCocha • El ranking comunitario de pollerías</p>
    </footer>
  );
}

type AuthCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** Contenido opcional encima del icono, por ejemplo la cuenta de Google conectada. */
  topSlot?: ReactNode;
  children: ReactNode;
};

/** Marco común de las pantallas de acceso (diseño Stitch): encabezado, tarjeta centrada y pie. */
export function AuthCard({ icon, title, subtitle, topSlot, children }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col rounded-3xl border border-line bg-white p-6 shadow-[0_8px_30px_rgb(216,67,21,0.06)] sm:p-8">
            {topSlot}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-orange-100 bg-brand-soft text-brand">
                {icon}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[26px]">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-5 flex items-center justify-center">
      <div className="w-full border-t border-neutral-200" />
      <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </span>
    </div>
  );
}

/** Aviso de error con el estilo del diseño: fondo suave rojo, borde y icono. */
export function AuthAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium leading-relaxed text-red-900"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
