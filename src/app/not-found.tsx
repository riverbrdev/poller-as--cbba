import type { Metadata } from "next";
import { BrandArt } from "@/components/brand/brand-logo";
import { BackHomeLink } from "@/components/ui/back-home-link";
import { NOT_FOUND_TEXT } from "@/components/ui/not-found-text";

// Una sola página 404 para rutas inexistentes y para /admin sin permiso (spec 003, FR-013):
// mismo título y mismo contenido, para no revelar que existe un área oculta.
export const metadata: Metadata = {
  title: NOT_FOUND_TEXT.metaTitle,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-card">
        <BrandArt art="icon" sizes="56px" className="mx-auto size-14 rounded-2xl" />
        <h1 className="mt-4 text-2xl font-black tracking-tight">{NOT_FOUND_TEXT.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{NOT_FOUND_TEXT.lead}</p>
        <BackHomeLink className="mt-6 w-full" />
      </div>
    </main>
  );
}
