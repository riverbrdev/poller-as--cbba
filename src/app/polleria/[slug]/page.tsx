import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { HeaderAccount } from "@/app/_components/header-account";
import {
  getActiveRestaurants,
  getRestaurantDetail,
  listRestaurantReviews,
  type RestaurantDetailDto,
} from "@/app/_data/restaurants";
import { setHelpfulAction } from "@/app/_actions/helpful";
import { reviewsQuerySchema } from "@/app/_lib/review-schemas";
import { REVIEWS_PAGE_SIZE } from "@/application/rating/list-restaurant-reviews";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { MIN_VOTES_FOR_RANKING } from "@/domain/rating/ranking";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { DetailActions } from "@/components/restaurant/detail-actions";
import { DetailSkeleton } from "@/components/restaurant/detail-skeleton";
import { HelpfulButton } from "@/components/restaurant/helpful-button";
import { DETAIL_TEXT } from "@/components/restaurant/messages";
import { RestaurantDetailHero } from "@/components/restaurant/restaurant-detail-hero";
import { ReviewsSection } from "@/components/restaurant/reviews-section";
import { ScoreSummary, type SummaryCriterion } from "@/components/restaurant/score-summary";
import { ViewerStateProvider } from "@/components/restaurant/viewer-state";
import { ANONYMOUS_VIEWER, type ViewerState } from "@/components/restaurant/viewer-state-types";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Prerenderiza el perfil de cada pollería conocida; las nuevas se generan en su primera visita. */
export async function generateStaticParams() {
  const { restaurants } = await getActiveRestaurants();
  return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

/** Vista previa al compartir (Open Graph). La imagen sale absoluta gracias a metadataBase del layout. */
export async function generateMetadata({ params }: Pick<RestaurantPageProps, "params">): Promise<Metadata> {
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

export default function RestaurantPage({ params, searchParams }: RestaurantPageProps) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
      <Suspense fallback={<DetailSkeleton />}>
        <RestaurantDetail params={params} searchParams={searchParams} />
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

async function RestaurantDetail({ params, searchParams }: RestaurantPageProps) {
  const { slug } = await params;
  const query = reviewsQuerySchema.parse(await searchParams);
  const detail = await getRestaurantDetail(slug);
  if (!detail) {
    notFound();
  }

  const { restaurant, display, criteriaAverages } = detail;
  const restaurantId = detail.id;
  const reviews = await listRestaurantReviews({ restaurantId, filter: query.resenas, limit: query.ver });
  // Sin await: la lista se dibuja ya desde la caché y solo "Tu reseña" / "Útil" esperan a la sesión.
  const viewerState = loadViewerState(restaurantId, reviews.reviews.map((review) => review.id));
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
        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24">
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
          <DetailActions slug={restaurant.slug} name={restaurant.name} />
        </div>

        <ViewerStateProvider value={viewerState}>
          <ReviewsSection
            slug={restaurant.slug}
            filter={query.resenas}
            visible={query.ver}
            pageSize={REVIEWS_PAGE_SIZE}
            reviews={reviews.reviews}
            counts={reviews.counts}
            hasMore={reviews.hasMore}
            helpfulSlot={(review) => (
              <HelpfulButton ratingId={review.id} slug={restaurant.slug} initialCount={review.helpfulCount} action={setHelpfulAction} />
            )}
          />
        </ViewerStateProvider>
      </div>
    </main>
  );
}

/** Estado de quien mira: es por persona y no se cachea. La autorización real la vuelve a verificar cada acción. */
async function loadViewerState(restaurantId: string, ratingIds: string[]): Promise<ViewerState> {
  await connection();
  const session = await auth();
  if (!session?.user.id) {
    return ANONYMOUS_VIEWER;
  }
  const state = await useCases.getViewerReviewState({ userId: session.user.id, restaurantId, ratingIds });
  return { ...state, signedIn: true };
}
