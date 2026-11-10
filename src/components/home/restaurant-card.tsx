import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, UtensilsCrossed } from "lucide-react";

export type RestaurantCardData = {
  name: string;
  slug: string;
  zone: string;
  address: string;
  photoUrl: string | null;
  mapsUrl: string | null;
};

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-white transition-[border-color,transform] hover:border-line-strong motion-safe:hover:-translate-y-0.5">
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-3">
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-soft">
            {restaurant.photoUrl ? (
              <Image
                src={restaurant.photoUrl}
                alt=""
                fill
                sizes="64px"
                className="object-contain motion-safe:transition-transform motion-safe:group-hover:scale-[1.025]"
                data-source="supplier"
                data-subject={restaurant.name}
              />
            ) : (
              <UtensilsCrossed size={22} className="text-brand-ink" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold tracking-wide text-brand-ink uppercase">{restaurant.zone}</p>
            <h3 className="mt-0.5 text-base leading-tight font-extrabold wrap-break-word">{restaurant.name}</h3>
            <p className="mt-1 flex items-start gap-1 text-xs leading-5 text-ink-muted">
              <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {restaurant.address}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link href={`/calificar/${restaurant.slug}`} aria-label={`Votar por ${restaurant.name}`} className="comideli-button flex-1">
            Votar <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          {restaurant.mapsUrl && (
            <a
              href={restaurant.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver ubicación de ${restaurant.name} en el mapa`}
              className="comideli-secondary-button"
            >
              Mapa
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
