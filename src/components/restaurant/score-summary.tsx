import { Info } from "lucide-react";
import type { RatingCriterionKey } from "@/domain/rating/criteria";
import { CriterionIcon } from "@/components/rating/criterion-icon";
import { DETAIL_TEXT } from "./messages";

export type SummaryCriterion = { key: RatingCriterionKey; title: string; average: number | null };

type ScoreSummaryProps = {
  /** Nota bayesiana ya formateada ("8.7"); null si no tiene votos. */
  display: string | null;
  /** Palabra de la nota ("Excelente"); null si no tiene votos. */
  label: string | null;
  voteCountText: string;
  criteria: SummaryCriterion[];
};

const oneDecimal = (value: number) => (Math.round(value * 10) / 10).toFixed(1);

/** Nota general (bayesiana), votos y el promedio de cada criterio con su barra. Todo llega calculado por props. */
export function ScoreSummary({ display, label, voteCountText, criteria }: ScoreSummaryProps) {
  return (
    <section aria-labelledby="score-title" className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <h2 id="score-title" className="sr-only">
        {DETAIL_TEXT.scoreLabel}
      </h2>

      <div className="flex flex-wrap items-end justify-between gap-3">
        {display ? (
          <p className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black leading-none tracking-tight text-brand-ink">{display}</span>
            <span className="text-base font-bold text-ink-muted">{DETAIL_TEXT.outOf}</span>
            {label ? <span className="ml-1 text-base font-extrabold text-ink">{label}</span> : null}
          </p>
        ) : (
          <div>
            <p className="text-xl font-extrabold text-ink">{DETAIL_TEXT.noScore}</p>
            <p className="mt-1 text-sm text-ink-muted">{DETAIL_TEXT.noScoreHelp}</p>
          </div>
        )}
        <p className="rounded-full bg-surface-soft px-3 py-1 text-sm font-bold text-ink-muted">{voteCountText}</p>
      </div>

      {display ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {DETAIL_TEXT.bayesHelp}
        </p>
      ) : null}

      <h3 className="mt-5 text-sm font-extrabold uppercase tracking-wide text-ink-muted">{DETAIL_TEXT.criteriaTitle}</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {criteria.map((criterion) => (
          <li key={criterion.key}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink">
                <span className="text-brand">
                  <CriterionIcon criterion={criterion.key} size={16} />
                </span>
                <span className="truncate">{criterion.title}</span>
              </span>
              <span className="shrink-0 text-sm font-extrabold text-brand-ink">
                {criterion.average === null ? "—" : oneDecimal(criterion.average)}
                <span className="font-semibold text-ink-muted"> {DETAIL_TEXT.outOf}</span>
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-surface-soft"
              role="meter"
              aria-label={criterion.title}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={criterion.average ?? 0}
            >
              <div className="h-full rounded-full bg-brand" style={{ width: `${(criterion.average ?? 0) * 10}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
