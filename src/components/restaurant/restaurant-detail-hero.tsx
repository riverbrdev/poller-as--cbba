import Image from "next/image";
import { MapPin, Navigation, Trophy, UtensilsCrossed } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DETAIL_TEXT } from "./messages";

type RestaurantDetailHeroProps = {
  name: string;
  zone: string;
  address: string;
  photoUrl: string | null;
  mapsUrl: string | null;
  /** Posición en el ranking, "En votación…" o "Sin votos todavía". */
  badge: string;
  /** Resalta el chip cuando la pollería ya está en el ranking. */
  ranked: boolean;
};

/**
 * Logo, nombre, zona, dirección y mapa. Las fotos de las pollerías son logos cuadrados:
 * se muestran enteros en un cuadrado, no recortados en un banner.
 */
export function RestaurantDetailHero({ name, zone, address, photoUrl, mapsUrl, badge, ranked }: RestaurantDetailHeroProps) {
  return (
    <section aria-labelledby="restaurant-name" className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-photo-placeholder shadow-card min-[360px]:w-28 sm:w-36">
          {photoUrl ? (
            <Image src={photoUrl} alt={DETAIL_TEXT.photoAlt(name)} fill priority sizes="(min-width: 640px) 9rem, 7rem" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-brand/60" role="img" aria-label={DETAIL_TEXT.noPhoto(name)}>
              <UtensilsCrossed size={36} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                ranked ? "bg-brand-dark text-white" : "bg-surface-soft text-ink-muted",
              )}
            >
              {ranked ? <Trophy size={12} className="shrink-0" aria-hidden="true" /> : null}
              <span className="truncate">{badge}</span>
            </span>
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-ink">
              <MapPin size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{zone}</span>
            </span>
          </div>
          <h1 id="restaurant-name" className="text-2xl font-extrabold leading-tight tracking-tight text-balance break-words sm:text-3xl">
            {name}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-1.5 text-sm leading-5 text-ink-muted">
          <MapPin size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <span>{address}</span>
        </p>
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={DETAIL_TEXT.mapLabel(name)}
            className={cn(buttonVariants({ variant: "brand-outline", size: "touch" }), "shrink-0 self-start sm:self-auto")}
          >
            <Navigation aria-hidden="true" />
            {DETAIL_TEXT.map}
          </a>
        ) : null}
      </div>
    </section>
  );
}
