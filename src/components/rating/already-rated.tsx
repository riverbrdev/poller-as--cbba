import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { overallScore, scoreLabel, type RatingScores } from "@/domain/rating/criteria";
import { RatedScores } from "./rated-scores";
import { CATALOG_HREF, RatingLayout, type RatingHeroSlots } from "./rating-layout";
import { ScoreRing } from "./score-ring";

type AlreadyRatedProps = {
  restaurantName: string;
  hero: RatingHeroSlots;
  scores: RatingScores;
  comment: string | null;
};

/** Quien ya votó ve sus notas en solo lectura: los votos son definitivos (SPEC regla 1). */
export function AlreadyRated({ restaurantName, hero, scores, comment }: AlreadyRatedProps) {
  const overall = overallScore(scores) ?? 0;

  return (
    <RatingLayout hero={hero}>
      <div className="flex flex-col items-center text-center">
        <CircleCheck size={40} className="text-brand" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Ya calificaste esta pollería</h2>
        <p className="mt-2 text-sm text-ink-muted">Así calificaste {restaurantName}:</p>
        <div className="mt-6 flex items-center gap-4">
          <ScoreRing value={overall} />
          <p className="text-left text-lg font-extrabold text-brand-ink">{scoreLabel(Math.round(overall))}</p>
        </div>
      </div>

      <div className="mt-6">
        <RatedScores scores={scores} />
      </div>

      {comment ? (
        <blockquote className="mt-4 rounded-xl bg-surface-soft px-4 py-3 text-sm italic text-ink">“{comment}”</blockquote>
      ) : null}

      <p className="mt-6 text-center text-xs text-ink-muted">Los votos son definitivos y no se pueden cambiar.</p>
      <Link
        href={CATALOG_HREF}
        className="mt-4 inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-brand px-5 text-base font-bold text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
      >
        Volver al catálogo
      </Link>
    </RatingLayout>
  );
}
