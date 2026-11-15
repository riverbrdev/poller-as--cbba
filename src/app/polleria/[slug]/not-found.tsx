import { BackHomeLink } from "@/components/ui/back-home-link";

import { BrandArt } from "@/components/brand/brand-logo";
import { DETAIL_TEXT } from "@/components/restaurant/messages";

export default function RestaurantDetailNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-card">
        <BrandArt art="icon" sizes="56px" className="mx-auto size-14 rounded-2xl" />
        <h1 className="mt-4 text-2xl font-black tracking-tight">{DETAIL_TEXT.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-ink-muted">{DETAIL_TEXT.notFoundLead}</p>
        <BackHomeLink className="mt-6 w-full" />
      </div>
    </main>
  );
}
