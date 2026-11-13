import { Suspense } from "react";
import { HeaderAccount } from "@/app/_components/header-account";
import { ViewerVersusStripAction } from "@/app/_components/versus-strip-action";
import { getCatalogRestaurants } from "@/app/_data/restaurants";
import { getVersusSummary } from "@/app/_data/versus";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { HERO_LOGO_COUNT, HomeHero, type HeroLogo } from "@/components/home/home-hero";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { MethodologySection } from "@/components/home/methodology-section";
import { RestaurantCatalog } from "@/components/home/restaurant-catalog";
import { VersusStrip, VersusStripAction } from "@/components/home/versus-strip";

export default async function Home() {
  const [{ restaurants, zones }, versus] = await Promise.all([getCatalogRestaurants(), getVersusSummary()]);

  // La casilla del duelo necesita los dos logos; si falta alguno, el hero vuelve a la casilla "¿Tu favorita?".
  const [left, right] = versus?.participants ?? [];
  const duel =
    left?.photoUrl && right?.photoUrl
      ? { left: { name: left.name, slug: left.slug, photoUrl: left.photoUrl }, right: { name: right.name, slug: right.slug, photoUrl: right.photoUrl } }
      : null;
  // Los logos del duelo ya están en su casilla: no se repiten en el mosaico.
  const duelSlugs = new Set<string>(duel ? [duel.left.slug, duel.right.slug] : []);
  const heroLogos = restaurants
    .filter((restaurant): restaurant is typeof restaurant & { photoUrl: string } => restaurant.photoUrl !== null)
    .filter((restaurant) => !duelSlugs.has(restaurant.slug))
    .slice(0, HERO_LOGO_COUNT)
    .map(({ name, slug, photoUrl }): HeroLogo => ({ name, slug, photoUrl }));

  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />

      <main>
        <HomeHero
          restaurantCount={restaurants.length}
          zoneCount={zones.length}
          criteriaCount={RATING_CRITERIA.length}
          logos={heroLogos}
          duel={duel}
        />
        {versus ? (
          <VersusStrip
            data={versus}
            action={<Suspense fallback={<VersusStripAction />}><ViewerVersusStripAction /></Suspense>}
          />
        ) : null}
        {/* El podio Top 3 vuelve cuando haya calificaciones suficientes para el ranking bayesiano (SPEC §4). */}
        <RestaurantCatalog restaurants={restaurants} zones={zones} />
        <MethodologySection />
      </main>
    </div>
  );
}
