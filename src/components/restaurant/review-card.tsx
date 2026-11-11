import type { ReactNode } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Review } from "@/application/rating/list-restaurant-reviews";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { initialsFrom } from "@/components/account/initials";
import { REVIEW_TEXT, SHORT_CRITERIA } from "./messages";
import { RelativeTime } from "./relative-time";
import { MyReviewBadge } from "./viewer-state";

type ReviewCardProps = {
  review: Review;
  /** Botón "Útil" (solo reseñas con comentario visible). */
  helpfulSlot?: ReactNode;
};

/** Una reseña: @usuario, fecha, nota del voto, las 4 notas y el comentario. Nunca nombre ni correo. */
export function ReviewCard({ review, helpfulSlot }: ReviewCardProps) {
  const { username, avatarUrl } = review.author;
  const overall = review.overall.toFixed(1);

  return (
    <article id={`resena-${review.id}`} className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-extrabold text-brand-ink">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={REVIEW_TEXT.avatarAlt(username)} fill sizes="2.5rem" className="object-cover" />
            ) : (
              <span aria-hidden="true">{initialsFrom(username)}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ink">@{username}</p>
            <p className="text-xs text-ink-muted">
              <RelativeTime iso={review.createdAt} />
            </p>
          </div>
        </div>
        <p
          className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-base font-extrabold text-brand-ink"
          aria-label={REVIEW_TEXT.overallLabel(overall)}
        >
          <Star size={15} className="fill-current" aria-hidden="true" />
          {overall}
        </p>
      </header>

      <Suspense fallback={null}>
        <div className="mt-2 empty:hidden">
          <MyReviewBadge ratingId={review.id} />
        </div>
      </Suspense>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {RATING_CRITERIA.map((criterion) => (
          <li key={criterion.key} className="rounded-md bg-surface-soft px-2 py-0.5 text-xs text-ink-muted">
            {SHORT_CRITERIA[criterion.key]}: <strong className="font-extrabold text-ink">{review.scores[criterion.key]}/10</strong>
          </li>
        ))}
      </ul>

      {review.comment ? (
        <p className="mt-3 text-sm leading-6 text-ink break-words [overflow-wrap:anywhere]">{review.comment}</p>
      ) : null}

      {helpfulSlot ? <div className="mt-3 border-t border-line pt-3">{helpfulSlot}</div> : null}
    </article>
  );
}
