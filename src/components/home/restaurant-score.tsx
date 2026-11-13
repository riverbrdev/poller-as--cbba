import { Trophy } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { MIN_VOTES_FOR_RANKING, type RankingStatus, type ScoreDisplay } from "@/domain/rating/ranking";
import { SCORE_TEXT } from "./messages";

/** Nota de la pollería tal como llega del servidor (ya calculada y formateada). */
export type CardRating = {
  status: RankingStatus;
  voteCount: number;
  position: number | null;
  display: ScoreDisplay | null;
};

function accessibleLabel(rating: CardRating): string {
  const { display, status, voteCount, position } = rating;
  if (!display) {
    return SCORE_TEXT.unratedLabel;
  }
  if (status === "ranked" && position !== null) {
    return SCORE_TEXT.ranked(display.text, display.label, voteCount, position);
  }
  return SCORE_TEXT.votingLabel(display.text, display.label, voteCount, MIN_VOTES_FOR_RANKING);
}

/**
 * Nota y votos juntos: un 9.5 con 2 votos no pesa lo mismo que un 8.7 con 40.
 * Naranja si ya está en el ranking, neutro si está en votación, sin número si no tiene votos.
 */
export function RestaurantScore({ rating }: { rating: CardRating }) {
  const { display, status, voteCount } = rating;
  const ranked = status === "ranked";

  return (
    <div className="mt-3 flex items-center gap-2.5" data-testid="restaurant-score">
      <p className="sr-only">{accessibleLabel(rating)}</p>
      <span
        aria-hidden="true"
        className={cn(
          "grid h-12 min-w-12 shrink-0 place-items-center rounded-xl px-1.5 text-xl font-black tabular-nums leading-none",
          ranked && "bg-brand text-white shadow-soft",
          !ranked && display && "border border-line-strong bg-surface-soft text-ink",
          !display && "border border-dashed border-line-strong text-ink-muted",
        )}
      >
        {display ? display.text : "–"}
      </span>
      <span aria-hidden="true" className="flex min-w-0 flex-col gap-0.5 leading-tight">
        <span className="text-sm font-extrabold text-ink">{display ? display.label : SCORE_TEXT.noVotes}</span>
        <span className="text-xs font-semibold text-ink-muted">
          {!display
            ? SCORE_TEXT.beFirst
            : ranked
              ? SCORE_TEXT.votes(voteCount)
              : SCORE_TEXT.voting(voteCount, MIN_VOTES_FOR_RANKING)}
        </span>
      </span>
    </div>
  );
}

/** Puesto del ranking sobre el logo. Decorativo: el puesto ya está en la frase de RestaurantScore. */
export function RankingPositionBadge({ position }: { position: number }) {
  return (
    <span
      aria-hidden="true"
      data-testid="ranking-position"
      className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-brand-dark px-2 py-0.5 text-xs font-extrabold text-white shadow-soft"
    >
      <Trophy size={12} className="shrink-0" />
      {SCORE_TEXT.position(position)}
    </span>
  );
}
