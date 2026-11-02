import Image from "next/image";
import { ArrowRight, Crown, MapPin, Medal } from "lucide-react";

export type RestaurantPreview = {
  name: string;
  zone: string;
  address: string;
  image: string;
  maps: string;
};

const podium = {
  1: { label: "1.º puesto · Oro", color: "bg-brand text-white", order: "order-1 lg:order-2" },
  2: { label: "2.º puesto · Plata", color: "bg-ink text-white", order: "order-2 lg:order-1" },
  3: { label: "3.º puesto · Bronce", color: "bg-stone-600 text-white", order: "order-3 lg:order-3" },
} as const;

export function RestaurantCard({ restaurant, rank }: { restaurant: RestaurantPreview; rank?: 1 | 2 | 3 }) {
  const place = rank ? podium[rank] : null;
  return (
    <div className={`relative pt-4 ${place?.order ?? ""} ${rank === 1 ? "lg:-translate-y-3" : ""}`}>
      {place && (
        <div className={`absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black uppercase shadow-md ${place.color}`}>
          {rank === 1 ? <Crown size={14} aria-hidden="true" /> : <Medal size={14} aria-hidden="true" />}
          {place.label}
        </div>
      )}
      <article className={`h-full overflow-hidden rounded-2xl border bg-white shadow-[0_5px_18px_rgba(58,35,20,0.06)] transition-transform hover:-translate-y-1 ${rank === 1 ? "border-2 border-brand shadow-[0_8px_24px_rgba(233,77,12,0.18)]" : "border-line"}`}>
      <div className="relative aspect-[1.55] overflow-hidden bg-photo-placeholder">
        <Image src={restaurant.image} alt={`Plato de ${restaurant.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        <span className="absolute bottom-3 left-3 rounded-md bg-ink/85 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">{restaurant.zone}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-black">{restaurant.name}</h3>
          <span className="shrink-0 rounded-full bg-brand-soft px-2 py-1 text-[10px] font-bold text-brand-ink">En el roster</span>
        </div>
        <p className="mt-2 flex items-start gap-1 text-xs text-ink-muted"><MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{restaurant.address}</p>
        <p className="mt-3 text-xs leading-5 text-ink-muted">La calificación aparecerá cuando se habilite la votación.</p>
        <a href={restaurant.maps} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark">Ver en Maps <ArrowRight size={15} aria-hidden="true" /></a>
      </div>
      </article>
    </div>
  );
}
