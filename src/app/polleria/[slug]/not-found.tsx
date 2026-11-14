import { BackHomeLink } from "@/components/ui/back-home-link";

import { UtensilsCrossed } from "lucide-react";
import { DETAIL_TEXT } from "@/components/restaurant/messages";

export default function RestaurantDetailNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-card">
        <UtensilsCrossed size={36} className="mx-auto text-brand" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-black tracking-tight">{DETAIL_TEXT.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-ink-muted">{DETAIL_TEXT.notFoundLead}</p>
        <BackHomeLink className="mt-6 w-full" />
      </div>
    </main>
  );
}
