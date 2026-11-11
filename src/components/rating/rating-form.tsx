"use client";

import { useActionState, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  COMMENT_MAX_LENGTH,
  RATING_CRITERIA,
  overallScore,
  scoreLabel,
  type RatingCriterionKey,
  type RatingScores,
} from "@/domain/rating/criteria";
import type { RatingFormState } from "./form-state";
import { ratingMessage } from "./messages";
import { ProgressBar } from "./progress-bar";
import { AfterVoteLinks } from "./after-vote-links";
import { AlreadyRated } from "./already-rated";
import { RatedScores } from "./rated-scores";
import { RatingLayout, type RatingHeroSlots } from "./rating-layout";
import type { RatingRestaurant } from "./rating-hero";
import { ScoreRing } from "./score-ring";
import { ScoreScale } from "./score-scale";

type RatingFormProps = {
  restaurant: RatingRestaurant;
  /** La foto llega ya renderizada desde la página (shell estático); el formulario solo la ubica. */
  hero: RatingHeroSlots;
  action: (state: RatingFormState, formData: FormData) => Promise<RatingFormState>;
  /**
   * El voto que ya tenía esta persona (o null). Lo resuelve el mismo componente, no la página:
   * así, cuando la página se vuelve a renderizar justo después de votar (updateTag), React conserva
   * este formulario y su estado "guardado", y no se pierde la pantalla de "¡Gracias!".
   */
  alreadyRated: { scores: RatingScores; comment: string | null } | null;
};

const TOTAL = RATING_CRITERIA.length;

function isComplete(scores: Partial<RatingScores>): scores is RatingScores {
  return RATING_CRITERIA.every((criterion) => typeof scores[criterion.key] === "number");
}

function ErrorAlert({ code }: { code: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-ink">
      <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      {ratingMessage(code)}
    </p>
  );
}

function SubmitButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-brand px-5 text-base font-bold text-white shadow-md shadow-brand/25 transition-colors hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand/40 disabled:shadow-none disabled:active:scale-100"
    >
      {pending ? "Enviando…" : "Enviar mi voto"}
    </button>
  );
}

export function RatingForm({ restaurant, hero, action, alreadyRated }: RatingFormProps) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [scores, setScores] = useState<Partial<RatingScores>>({});
  const [comment, setComment] = useState("");

  const done = RATING_CRITERIA.filter((criterion) => typeof scores[criterion.key] === "number").length;
  const overall = overallScore(scores);
  const complete = isComplete(scores);
  const errorCode = state.status === "error" ? state.error : null;

  const setScore = (key: RatingCriterionKey) => (score: number) => setScores((current) => ({ ...current, [key]: score }));

  if (state.status === "saved" && complete) {
    return (
      <RatingLayout hero={hero}>
        <div className="flex flex-col items-center text-center" role="status">
          <CircleCheck size={40} className="text-brand" aria-hidden="true" />
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">¡Gracias! Tu voto quedó guardado</h2>
          <p className="mt-2 text-sm text-ink-muted">Así calificaste {restaurant.name}:</p>
          <div className="mt-6 flex items-center gap-4">
            <ScoreRing value={state.overall} />
            <p className="text-left text-lg font-extrabold text-brand-ink">{scoreLabel(Math.round(state.overall))}</p>
          </div>
        </div>
        <div className="mt-6">
          <RatedScores scores={scores} />
        </div>
        <AfterVoteLinks slug={restaurant.slug} />
      </RatingLayout>
    );
  }

  if (alreadyRated) {
    return (
      <AlreadyRated
        slug={restaurant.slug}
        restaurantName={restaurant.name}
        hero={hero}
        scores={alreadyRated.scores}
        comment={alreadyRated.comment}
      />
    );
  }

  const summary = (
    <div className="flex items-center gap-4">
      <ScoreRing value={overall} />
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-ink-muted">Tu nota</p>
        <p className="text-xl font-black text-brand-ink">{overall === null ? "Sin calificar" : scoreLabel(Math.round(overall))}</p>
      </div>
    </div>
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={restaurant.slug} />
      <RatingLayout
        hero={hero}
        aside={
          <div className="flex flex-col gap-5">
            {summary}
            <ProgressBar done={done} total={TOTAL} />
            {errorCode ? <ErrorAlert code={errorCode} /> : null}
            <SubmitButton disabled={!complete || pending} pending={pending} />
            <p className="text-center text-xs text-ink-muted">Tu voto es definitivo: no se puede cambiar después.</p>
          </div>
        }
      >
        {/* Celular: resumen de la nota arriba de los criterios (en computadora va en la columna lateral). */}
        <div className="mb-6 flex items-center gap-4 border-b border-line pb-6 lg:hidden">
          <ScoreRing value={overall} size="sm" />
          <div>
            <p className="font-extrabold text-ink">
              Tu nota: <span className="text-brand-ink">{overall === null ? "sin calificar" : scoreLabel(Math.round(overall))}</span>
            </p>
            <p className="text-sm text-ink-muted">Califica del 1 al 10. 5 es que cumple, nada más.</p>
          </div>
        </div>

        <h2 className="hidden text-4xl font-black tracking-tight lg:block">¿Qué tal estuvo?</h2>
        <p className="mt-2 hidden text-ink-muted lg:block">Califica del 1 al 10. Piensa en tu última visita: 5 es que cumple, nada más.</p>
        <p className="mb-6 text-xs font-semibold text-ink-muted lg:mb-8 lg:mt-4">
          1–3 Malo · 4–6 Regular · 7 Bueno · 8 Muy bueno · 9–10 Excelente
        </p>

        <div className="divide-y divide-line">
          {RATING_CRITERIA.map((criterion) => (
            <ScoreScale
              key={criterion.key}
              criterion={criterion}
              value={scores[criterion.key] ?? null}
              onChange={setScore(criterion.key)}
              disabled={pending}
            />
          ))}
        </div>

        <div className="border-t border-line pt-7">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <label htmlFor="comment" className="font-extrabold text-ink">
              Comentario <span className="font-normal text-ink-muted">(opcional)</span>
            </label>
            <span className="text-xs tabular-nums text-ink-muted" aria-live="polite">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            rows={4}
            placeholder="Ej. Pide con llajua doble, las papas son caseras…"
            className="w-full resize-y rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 py-3 text-sm text-ink outline-none placeholder:text-ink-muted/70 focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
          />
        </div>

        {/* Espacio para que la barra fija del celular no tape el comentario. */}
        <div className="h-44 lg:hidden" aria-hidden="true" />

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(58,35,20,0.08)] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <ProgressBar done={done} total={TOTAL} />
            {errorCode ? <ErrorAlert code={errorCode} /> : null}
            <SubmitButton disabled={!complete || pending} pending={pending} />
          </div>
        </div>
      </RatingLayout>
    </form>
  );
}
