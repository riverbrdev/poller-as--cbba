"use client";

import { SCORE_MAX, SCORE_MIN, scoreLabel, type RatingCriterion } from "@/domain/rating/criteria";
import { CriterionIcon } from "./criterion-icon";

type ScoreScaleProps = {
  criterion: RatingCriterion;
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
};

const SCORES = Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, index) => SCORE_MIN + index);

/**
 * Escala del 1 al 10 como barra segmentada (diseño Stitch). Son radios nativos: funcionan con Tab y flechas,
 * los anuncian los lectores de pantalla y el formulario se envía aunque no haya JavaScript.
 * En pantallas angostas va en 2 filas de 5 para respetar zonas táctiles de 44 px.
 */
export function ScoreScale({ criterion, value, onChange, disabled = false }: ScoreScaleProps) {
  const headingId = `criterion-${criterion.key}`;

  return (
    <div
      role="radiogroup"
      aria-labelledby={headingId}
      aria-describedby={`${headingId}-anchors`}
      aria-required="true"
      className="py-7 first:pt-0"
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand" aria-hidden="true">
          <CriterionIcon criterion={criterion.key} />
        </span>
        <div id={headingId} className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold leading-tight text-ink">{criterion.title}</span>
          <span className="mt-1 block text-sm text-ink-muted">{criterion.question}</span>
        </div>
        <p className="shrink-0 text-right" aria-live="polite">
          {value === null ? (
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">Sin calificar</span>
          ) : (
            <>
              <span className="block text-4xl font-black leading-none text-brand">{value}</span>
              <span className="mt-1 block text-xs font-extrabold uppercase tracking-wide text-brand-ink">
                {scoreLabel(value)}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-1">
        {SCORES.map((score) => {
          const filled = value !== null && score <= value;
          const selected = value === score;
          return (
            <label
              key={score}
              className={`relative flex min-h-12 cursor-pointer select-none items-center justify-center rounded-lg text-sm font-bold transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:focus-visible]:ring-offset-2 motion-reduce:transition-none ${
                filled
                  ? "bg-gradient-to-br from-brand to-brand-dark text-white"
                  : "bg-surface-soft text-ink-muted hover:bg-brand-soft hover:text-brand-ink"
              } ${selected ? "z-10 -translate-y-0.5 shadow-lg shadow-brand-dark/35 ring-2 ring-white" : ""}`}
            >
              <input
                type="radio"
                name={criterion.key}
                value={score}
                checked={selected}
                onChange={() => onChange(score)}
                required
                disabled={disabled}
                aria-label={`${criterion.title}, ${score}`}
                className="sr-only"
              />
              {score}
            </label>
          );
        })}
      </div>

      <div id={`${headingId}-anchors`} className="mt-2.5 flex justify-between gap-4 text-xs text-ink-muted">
        <span>1: {criterion.lowLabel}</span>
        <span className="text-right">10: {criterion.highLabel}</span>
      </div>
    </div>
  );
}
