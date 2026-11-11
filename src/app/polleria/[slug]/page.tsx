import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { HeaderAccount } from "@/app/_components/header-account";
import { getActiveRestaurants, getRestaurantDetail, type RestaurantDetailDto } from "@/app/_data/restaurants";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { MIN_VOTES_FOR_RANKING } from "@/domain/rating/ranking";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { DetailSkeleton } from "@/components/restaurant/detail-skeleton";
import { DETAIL_TEXT } from "@/components/restaurant/messages";
import { RestaurantDetailHero } from "@/components/restaurant/restaurant-detail-hero";
import { ScoreSummary, type SummaryCriterion } from "@/components/restaurant/score-summary";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
};

/** Prerenderiza el perfil de cada pollería conocida; las nuevas se generan en su primera visita. */
export async function generateStaticParams() {
  const { restaurants } = await getActiveRestaurants();
  return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

/** Vista previa al compartir (Open Graph). La imagen sale absoluta gracias a metadataBase del layout. */
export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getRestaurantDetail(slug);
  if (!detail) {
    return { title: `Pollería no encontrada · ComiDeli`, robots: { index: false, follow: false } };
  }

  const { restaurant, display, voteCount } = detail;
  const title = `${restaurant.name} · ComiDeli`;
  const description = display
    ? `${restaurant.zone} · nota ${display.text}/10 · ${DETAIL_TEXT.votes(voteCount)}`
    : `${restaurant.zone} · En votación en ComiDeli`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(restaurant.photoUrl ? { images: [restaurant.photoUrl] } : {}),
    },
  };
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
      <Suspense fallback={<DetailSkeleton />}>
        <RestaurantDetail params={params} />
      </Suspense>
    </div>
  );
}

function positionBadge(detail: RestaurantDetailDto): string {
  if (detail.status === "ranked" && detail.position !== null) {
    return DETAIL_TEXT.position(detail.position);
  }
  if (detail.status === "voting") {
    return DETAIL_TEXT.voting(detail.voteCount, MIN_VOTES_FOR_RANKING);
  }
  return DETAIL_TEXT.unrated;
}

async function RestaurantDetail({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const detail = await getRestaurantDetail(slug);
  if (!detail) {
    notFound();
  }

  const { restaurant, display, criteriaAverages } = detail;
  const criteria: SummaryCriterion[] = RATING_CRITERIA.map((criterion) => ({
    key: criterion.key,
    title: criterion.title,
    average: criteriaAverages ? criteriaAverages[criterion.key] : null,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-8 sm:pt-8">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-ink transition-colors hover:text-brand-dark"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {DETAIL_TEXT.backToRanking}
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-10">
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <RestaurantDetailHero
            name={restaurant.name}
            zone={restaurant.zone}
            address={restaurant.address}
            photoUrl={restaurant.photoUrl}
            mapsUrl={restaurant.mapsUrl}
            badge={positionBadge(detail)}
            ranked={detail.status === "ranked"}
          />
          <ScoreSummary
            display={display?.text ?? null}
            label={display?.label ?? null}
            voteCountText={DETAIL_TEXT.votes(detail.voteCount)}
            criteria={criteria}
          />
        </div>
      </div>
    </main>
  );
}
