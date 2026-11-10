import { Clock3, Drumstick, Store, UtensilsCrossed } from "lucide-react";
import { RATING_CRITERIA, SCORE_MAX, SCORE_MIN } from "@/domain/rating/criteria";

const icons = {
  flavor: Drumstick,
  portion: UtensilsCrossed,
  service: Clock3,
  place: Store,
};

export function MethodologySection() {
  return (
    <section id="metodologia" aria-labelledby="metodologia-title" className="scroll-mt-24 border-t border-line bg-white py-16 sm:py-24">
      <div className="comideli-wrap">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <p className="comideli-kicker">El voto</p>
            <h2 id="metodologia-title" className="comideli-section-title mt-3">Cómo calificamos el broaster</h2>
            <p className="mt-5 max-w-[42ch] text-base leading-7 text-ink-muted">
              Pon una nota del {SCORE_MIN} al {SCORE_MAX} en cada criterio. El promedio de las cuatro notas es tu calificación para esa pollería.
            </p>
          </div>
          <ol className="border-y border-line divide-y divide-line">
            {RATING_CRITERIA.map(({ key, title, question }) => {
              const Icon = icons[key];
              return (
                <li key={key} className="flex items-start gap-4 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-ink">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{question}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-12 rounded-2xl bg-brand-soft p-6 sm:mt-16 sm:p-10">
          <p className="comideli-statement max-w-[27ch] text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl" data-moment="word-highlight">
            Si ya probaste una pollería, <strong>tu voto</strong> cuenta para el ranking de Cochabamba.
          </p>
        </div>
      </div>
    </section>
  );
}
