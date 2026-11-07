import { RATING_CRITERIA, scoreLabel, type RatingScores } from "@/domain/rating/criteria";
import { CriterionIcon } from "./criterion-icon";

/** Las cuatro notas de un voto, en solo lectura. */
export function RatedScores({ scores }: { scores: RatingScores }) {
  return (
    <ul className="divide-y divide-line">
      {RATING_CRITERIA.map((criterion) => (
        <li key={criterion.key} className="flex items-center gap-3 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
            <CriterionIcon criterion={criterion.key} size={18} />
          </span>
          <span className="min-w-0 flex-1 font-bold text-ink">{criterion.title}</span>
          <span className="text-right">
            <span className="text-2xl font-black text-brand">{scores[criterion.key]}</span>
            <span className="ml-2 text-xs font-extrabold uppercase tracking-wide text-brand-ink">
              {scoreLabel(scores[criterion.key])}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
