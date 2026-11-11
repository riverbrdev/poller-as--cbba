import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, MessageSquareText } from "lucide-react";
import type { ReviewCounts, ReviewFilter } from "@/application/ports/review-repository";
import type { Review } from "@/application/rating/list-restaurant-reviews";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { REVIEW_TEXT } from "./messages";
import { ReviewCard } from "./review-card";
import { ReviewFilters } from "./review-filters";
import { reviewsHref } from "./review-query";

type ReviewsSectionProps = {
  slug: string;
  filter: ReviewFilter;
  visible: number;
  pageSize: number;
  reviews: Review[];
  counts: ReviewCounts;
  hasMore: boolean;
  /** Botón "Útil" de cada reseña con comentario (lo arma la página). */
  helpfulSlot?: (review: Review) => ReactNode;
};

const totalFor = (filter: ReviewFilter, counts: ReviewCounts) =>
  filter === "featured" ? counts.featured : filter === "with-comment" ? counts.withComment : counts.all;

/** Lista de reseñas con filtros, "Cargar más" (tandas) y estado vacío. Todo llega por props. */
export function ReviewsSection({ slug, filter, visible, pageSize, reviews, counts, hasMore, helpfulSlot }: ReviewsSectionProps) {
  const remaining = Math.max(0, totalFor(filter, counts) - reviews.length);

  return (
    <section aria-labelledby="reviews-title" className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 id="reviews-title" className="text-xl font-extrabold tracking-tight sm:text-2xl">
          {REVIEW_TEXT.title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{REVIEW_TEXT.lead}</p>
      </div>

      {counts.all === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-white p-6 text-center">
          <MessageSquareText className="mx-auto text-brand" size={28} aria-hidden="true" />
          <p className="mt-3 text-lg font-extrabold">{REVIEW_TEXT.emptyTitle}</p>
          <p className="mt-1 text-sm text-ink-muted">{REVIEW_TEXT.emptyLead}</p>
          <Link href={`/calificar/${slug}`} className={cn(buttonVariants({ variant: "brand", size: "touch" }), "mt-4")}>
            {REVIEW_TEXT.emptyAction}
          </Link>
        </div>
      ) : (
        <>
          <ReviewFilters slug={slug} active={filter} counts={counts} pageSize={pageSize} />
          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong bg-white p-6 text-center text-sm text-ink-muted">
              {REVIEW_TEXT.emptyFilter}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} helpfulSlot={review.comment && helpfulSlot ? helpfulSlot(review) : undefined} />
                </li>
              ))}
            </ul>
          )}
          {hasMore ? (
            <Link
              href={reviewsHref(slug, filter, visible + pageSize, pageSize)}
              scroll={false}
              className={cn(buttonVariants({ variant: "brand-outline", size: "touch" }), "w-full")}
            >
              {REVIEW_TEXT.loadMore(remaining)}
              <ChevronDown aria-hidden="true" />
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
