import Image from "next/image";
import Link from "next/link";
import { MapPin, UtensilsCrossed, Vote } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CARD_TEXT } from "./messages";
import { RankingPositionBadge, RestaurantScore, type CardRating } from "./restaurant-score";

/** Lo que la tarjeta necesita de una pollería. `photoUrl` y `mapsUrl` son opcionales en la BD. */
export type RestaurantCardData = {
  name: string;
  slug: string;
  zone: string;
  address: string;
  photoUrl: string | null;
  mapsUrl: string | null;
  rating: CardRating;
};

type RestaurantCardProps = {
  restaurant: RestaurantCardData;
};

/**
 * Tarjeta horizontal: el logo (cuadrado, la marca que la gente reconoce) va grande a la izquierda
 * y a su lado zona, nombre, dirección, la nota con sus votos y las acciones. Mapa es solo ícono para que Votar quepa ancho.
 */
export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const detailHref = `/polleria/${restaurant.slug}`;
  return (
    <article className="group flex h-full gap-3 rounded-2xl border border-line bg-white p-3 shadow-card transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:gap-4 sm:p-4">
      {/* La foto también lleva al detalle; fuera del orden de tabulación porque el nombre ya es el enlace accesible. */}
      <Link
        href={detailHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-square w-24 shrink-0 self-start min-[360px]:w-32 overflow-hidden rounded-xl border border-line bg-photo-placeholder sm:w-40 xl:w-44"
      >
        {restaurant.photoUrl ? (
          <Image
            src={restaurant.photoUrl}
            alt={CARD_TEXT.photoAlt(restaurant.name)}
            fill
            sizes="(min-width: 1280px) 11rem, (min-width: 640px) 10rem, (min-width: 360px) 8rem, 6rem"
            className="object-cover transition-[scale] duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand/60" role="img" aria-label={CARD_TEXT.noPhoto(restaurant.name)}>
            <UtensilsCrossed size={36} aria-hidden="true" />
          </div>
        )}
        {restaurant.rating.status === "ranked" && restaurant.rating.position !== null ? (
          <RankingPositionBadge position={restaurant.rating.position} />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="inline-flex max-w-full items-center gap-1 self-start rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-ink">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{restaurant.zone}</span>
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-snug transition-colors group-hover:text-brand-ink sm:text-lg">
          <Link
            href={detailHref}
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {restaurant.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink-muted">{restaurant.address}</p>
        <RestaurantScore rating={restaurant.rating} />

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`/calificar/${restaurant.slug}`}
            aria-label={CARD_TEXT.voteLabel(restaurant.name)}
            className={cn(buttonVariants({ variant: "brand-soft", size: "touch" }), "flex-1 px-3")}
          >
            <Vote aria-hidden="true" className="hidden min-[360px]:block" />
            {CARD_TEXT.vote}
          </Link>
          {restaurant.mapsUrl ? (
            <a
              href={restaurant.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={CARD_TEXT.mapLabel(restaurant.name)}
              title={CARD_TEXT.map}
              className={cn(buttonVariants({ variant: "brand-outline", size: "touch" }), "w-11 shrink-0 px-0")}
            >
              <MapPin aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
