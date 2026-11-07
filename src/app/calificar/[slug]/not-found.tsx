import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-[0_8px_25px_rgba(58,35,20,0.06)]">
        <UtensilsCrossed size={36} className="mx-auto text-brand" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black tracking-tight">No encontramos esta pollería</h1>
        <p className="mt-2 text-sm text-ink-muted">Puede que ya no esté disponible.</p>
        <Link
          href="/#locales"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
        >
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
