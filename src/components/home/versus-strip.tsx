import type { ReactNode } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import type { VersusSummaryDto } from "@/app/_data/versus";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DuelClash } from "./duel-clash";
import { VERSUS_TEXT } from "./messages";

type VersusStripProps = {
  data: VersusSummaryDto;
  /** Botón del duelo: depende de la sesión, así que llega desde la página dentro de un Suspense. */
  action: ReactNode;
};

/** Franja del duelo en la home: el Versus a la vista, entre el hero y el catálogo. */
export function VersusStrip({ data, action }: VersusStripProps) {
  const [left, right] = data.participants;

  return (
    <section id="duelo" aria-labelledby="duelo-title" className="overflow-hidden bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-soft">
            <Swords size={14} aria-hidden="true" />
            {VERSUS_TEXT.eyebrow}
          </p>
          <h2 id="duelo-title" className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {VERSUS_TEXT.title(left.name, right.name)}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">{VERSUS_TEXT.lead}</p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl sm:mt-14">
          <DuelClash data={data} />
        </div>

        <div className="mt-6 flex justify-center">{action}</div>
      </div>
    </section>
  );
}

/** Botón del duelo. Sin sesión (o mientras se verifica) invita a elegir bando; si ya votó, lo recuerda. */
export function VersusStripAction({ votedFor }: { votedFor?: string | null }) {
  return (
    <Link
      href="/versus"
      className={cn(
        buttonVariants({ variant: "brand", size: "touch-lg" }),
        "w-full max-w-sm whitespace-normal transition-[translate,background-color,scale] hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0 sm:w-auto",
      )}
    >
      <Swords aria-hidden="true" />
      {votedFor ? VERSUS_TEXT.votedAction(votedFor) : VERSUS_TEXT.action}
    </Link>
  );
}
