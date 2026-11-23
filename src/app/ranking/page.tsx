import { Suspense } from "react";
import { AppTabBar } from "@/app/_components/app-tab-bar";
import { HeaderAccount } from "@/app/_components/header-account";
import { getCatalogRestaurants } from "@/app/_data/restaurants";
import { RANKING_METADATA } from "@/app/_lib/seo";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { RestaurantCatalog } from "@/components/home/restaurant-catalog";

export const metadata = RANKING_METADATA;

/** El ranking en su propia página: quien busca su pollería entra y tiene el buscador arriba de todo. */
export default async function RankingPage() {
  const { restaurants, zones } = await getCatalogRestaurants();

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
      <main className="flex-1">
        <RestaurantCatalog restaurants={restaurants} zones={zones} />
      </main>
      <SiteFooter />
      <AppTabBar />
    </div>
  );
}
