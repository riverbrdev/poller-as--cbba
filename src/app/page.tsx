import { Suspense } from "react";
import { HeaderAccount } from "@/app/_components/header-account";
import { getActiveRestaurants } from "@/app/_data/restaurants";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { HERO_LOGO_COUNT, HomeHero, type HeroLogo } from "@/components/home/home-hero";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { MethodologySection } from "@/components/home/methodology-section";
import { RestaurantCatalog } from "@/components/home/restaurant-catalog";

export default async function Home() {
  const { restaurants, zones } = await getActiveRestaurants();
  const heroLogos = restaurants
    .filter((restaurant): restaurant is typeof restaurant & { photoUrl: string } => restaurant.photoUrl !== null)
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
        />
        {/* El podio Top 3 vuelve cuando haya calificaciones suficientes para el ranking bayesiano (SPEC §4). */}
        <RestaurantCatalog restaurants={restaurants} zones={zones} />
        <MethodologySection />
      </main>
    </div>
  );
}
