import Image from "next/image";
import { ArrowRight, MapPin, Star, UtensilsCrossed } from "lucide-react";

/** Lo que la tarjeta necesita de una pollería. `photoUrl` y `mapsUrl` son opcionales en la BD. */
export type RestaurantCardData = {
  name: string;
  zone: string;
  address: string;
  photoUrl: string | null;
  mapsUrl: string | null;
};

type RestaurantCardProps = {
  restaurant: RestaurantCardData;
  /** Solo para las primeras tarjetas visibles: carga la foto con prioridad. */
  priority?: boolean;
};

export function RestaurantCard({ restaurant, priority = false }: RestaurantCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_5px_18px_rgba(58,35,20,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_26px_rgba(58,35,20,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-photo-placeholder">
        {restaurant.photoUrl ? (
          <Image
            src={restaurant.photoUrl}
            alt={`Plato de ${restaurant.name}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand/50" role="img" aria-label={`${restaurant.name} sin foto`}>
            <UtensilsCrossed size={40} aria-hidden="true" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute right-3 top-3 inline-flex max-w-[70%] items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          <MapPin size={12} className="shrink-0 text-brand-soft" aria-hidden="true" />
          <span className="truncate">{restaurant.zone}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-black leading-snug transition-colors group-hover:text-brand-ink">{restaurant.name}</h3>
        <p className="flex items-start gap-1.5 text-xs leading-5 text-ink-muted">
          <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {restaurant.address}
        </p>

        {/* Aún no hay votos: no se inventan datos (SPEC §4, ranking con mínimo de calificaciones). */}
        <div className="rounded-xl border border-line bg-surface-soft p-3">
          <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
            <Star size={14} className="text-brand" aria-hidden="true" />
            Sin calificaciones aún
          </p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">Pronto podrás calificar sabor, precio, cantidad y atención.</p>
        </div>

        {restaurant.mapsUrl ? (
          <a
            href={restaurant.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
          >
            Ver en Maps <ArrowRight size={15} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
