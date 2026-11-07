import Image from "next/image";
import { MapPin, UtensilsCrossed } from "lucide-react";

export type RatingRestaurant = {
  slug: string;
  name: string;
  zone: string;
  address: string;
  photoUrl: string | null;
};

type RatingHeroProps = {
  restaurant: RatingRestaurant;
  /** `banner`: foto a todo el ancho en celular. `card`: tarjeta de la columna lateral en computadora. */
  variant: "banner" | "card";
};

function Photo({ restaurant, sizes }: { restaurant: RatingRestaurant; sizes: string }) {
  if (!restaurant.photoUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-photo-placeholder text-brand/50" role="img" aria-label={`${restaurant.name} sin foto`}>
        <UtensilsCrossed size={44} aria-hidden="true" />
      </div>
    );
  }
  return <Image src={restaurant.photoUrl} alt={`Plato de ${restaurant.name}`} fill priority sizes={sizes} className="object-cover" />;
}

/** Foto, nombre y zona de la pollería que se califica. No tiene estado: se renderiza en el shell estático. */
export function RatingHero({ restaurant, variant }: RatingHeroProps) {
  const location = `${restaurant.address} · ${restaurant.zone}`;

  if (variant === "banner") {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-photo-placeholder">
        <Photo restaurant={restaurant} sizes="100vw" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 text-white">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/80">Estás calificando</p>
          <h1 className="mt-1 text-3xl font-black leading-tight">{restaurant.name}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin size={15} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-photo-placeholder">
        <Photo restaurant={restaurant} sizes="(min-width: 1024px) 400px, 100vw" />
      </div>
      <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">Estás calificando</p>
      <h1 className="mt-1 text-4xl font-black leading-tight tracking-tight text-ink">{restaurant.name}</h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
        <MapPin size={15} className="shrink-0" aria-hidden="true" />
        {location}
      </p>
    </div>
  );
}
