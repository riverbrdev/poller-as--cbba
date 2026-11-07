import { RatingLayout, type RatingHeroSlots } from "./rating-layout";

const HERO_PLACEHOLDER: RatingHeroSlots = {
  banner: <div className="aspect-[4/3] w-full bg-photo-placeholder" />,
  card: <div className="aspect-[4/5] rounded-3xl bg-photo-placeholder" />,
};

/**
 * Placeholder de la pantalla de calificar. Sin `hero`, es el esqueleto instantáneo de la navegación;
 * con `hero`, la foto ya se ve mientras se verifica la sesión.
 */
export function RatingFormSkeleton({ hero = HERO_PLACEHOLDER }: { hero?: RatingHeroSlots }) {
  return (
    <RatingLayout hero={hero}>
      <div className="animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Cargando el formulario">
        <div className="h-9 w-2/3 rounded-lg bg-surface-soft" />
        <div className="mt-3 h-4 w-full rounded bg-surface-soft" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="mt-10">
            <div className="h-5 w-1/2 rounded bg-surface-soft" />
            <div className="mt-4 grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-1">
              {Array.from({ length: 10 }, (_, cell) => (
                <div key={cell} className="h-12 rounded-lg bg-surface-soft" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </RatingLayout>
  );
}
