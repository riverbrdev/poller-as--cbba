import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FOOTER_TEXT } from "./messages";

/** Pie común de las páginas públicas: el logo cierra la página, sin más ruido. */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <Link href="/" aria-label="ComiDeli, ir al inicio" className="inline-flex min-h-11 items-center rounded-lg">
          <BrandLogo alt="" className="h-8" />
        </Link>
        <p className="max-w-sm text-sm text-ink-muted">{FOOTER_TEXT.tagline}</p>
        <p className="text-xs text-ink-muted">{FOOTER_TEXT.copyright}</p>
      </div>
    </footer>
  );
}
