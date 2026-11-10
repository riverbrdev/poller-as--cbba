import { ArrowUp } from "lucide-react";
import { RATING_CRITERIA } from "@/domain/rating/criteria";
import { CriterionIcon } from "@/components/rating/criterion-icon";
import { METHODOLOGY_TEXT } from "./messages";

/** Cómo se califica: los criterios salen de domain/, así la home siempre muestra los mismos que el formulario. */
export function MethodologySection() {
  return (
    <section id="metodologia" aria-labelledby="metodologia-title" className="scroll-mt-20 border-t border-line bg-white py-16 sm:scroll-mt-24 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-ink">{METHODOLOGY_TEXT.eyebrow}</p>
        <h2 id="metodologia-title" className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
          {METHODOLOGY_TEXT.title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">{METHODOLOGY_TEXT.lead}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {RATING_CRITERIA.map((criterion) => (
            <li key={criterion.key} className="flex flex-col rounded-2xl border border-line bg-cream p-5 sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <CriterionIcon criterion={criterion.key} size={22} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{criterion.title}</h3>
              <p className="mb-5 mt-2 text-base leading-6 text-ink-muted">{criterion.question}</p>
              <p className="mt-auto flex flex-col gap-1 border-t border-line pt-4 text-sm font-semibold">
                <span className="text-ink-muted">{METHODOLOGY_TEXT.scaleLow(criterion.lowLabel)}</span>
                <span className="text-brand-ink">{METHODOLOGY_TEXT.scaleHigh(criterion.highLabel)}</span>
              </p>
            </li>
          ))}
        </ul>

        <h3 className="mt-14 text-xl font-extrabold sm:text-2xl">{METHODOLOGY_TEXT.stepsTitle}</h3>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {METHODOLOGY_TEXT.steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4 rounded-2xl border border-line p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-dark text-base font-extrabold text-white" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className="text-base font-extrabold">{step.title}</p>
                <p className="mt-1 text-base leading-6 text-ink-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col gap-5 rounded-2xl bg-brand-ink p-6 text-white sm:p-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">{METHODOLOGY_TEXT.suggestTitle}</h3>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/90">{METHODOLOGY_TEXT.suggestLead}</p>
          </div>
          <a
            href="#locales"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-bold text-brand-ink transition-[background-color,translate,scale] hover:-translate-y-px hover:bg-brand-soft active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {METHODOLOGY_TEXT.suggestAction}
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
