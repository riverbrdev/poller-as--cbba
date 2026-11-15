import { BackHomeLink } from "@/components/ui/back-home-link";

import { BrandArt } from "@/components/brand/brand-logo";

export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-[0_8px_25px_rgba(58,35,20,0.06)]">
        <BrandArt art="icon" sizes="56px" className="mx-auto size-14 rounded-2xl" />
        <h1 className="mt-4 text-2xl font-black tracking-tight">No encontramos esta pollería</h1>
        <p className="mt-2 text-sm text-ink-muted">Puede que ya no esté disponible.</p>
        <BackHomeLink className="mt-6 w-full" />
      </div>
    </main>
  );
}
