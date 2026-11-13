"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, Trophy, UtensilsCrossed } from "lucide-react";
import { cn } from "@/components/lib/utils";
import type { VersusParticipantDto, VersusSummaryDto } from "@/app/_data/versus";
import type { DuelChoice } from "@/domain/versus/duel";
import { VERSUS_TEXT } from "./messages";

/** idle: sin JS o movimiento reducido · armed: listo para entrar · in: entrada · live: en vivo, ya sin la entrada. */
type Phase = "idle" | "armed" | "in" | "live";
type Shares = Record<DuelChoice, number>;

const ENTRY_COUNT_DELAY_MS = 700;
const COUNT_DURATION_MS = 900;
const ENTRY_TOTAL_MS = 2200;
/** Cada cuánto se consulta el resultado mientras la pestaña está a la vista. */
export const VERSUS_POLL_MS = 30_000;
const VERSUS_ENDPOINT = "/api/versus";

/**
 * Duelo de la home: logos cara a cara, "VS", la barra partida y quién va ganando.
 * El servidor la dibuja con los valores finales. Con movimiento permitido, la primera vez que aparece
 * en pantalla los logos chocan y la barra pelea hasta el resultado. Después se consulta el resultado
 * cada 30 s y, si cambió, la barra se mueve y los porcentajes cuentan hasta el valor nuevo.
 */
export function DuelClash({ data: initial }: { data: VersusSummaryDto }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const motion = useRef(false);
  const [data, setData] = useState(initial);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  /** Último resultado conocido: la entrada cuenta hasta él aunque haya cambiado antes de verse. */
  const latest = useRef(initial);
  const [shown, setShown] = useState<Shares>(initial.percentages);
  const shownRef = useRef<Shares>(initial.percentages);
  /** Bando cuyo porcentaje acaba de cambiar: se resalta un momento. */
  const [bumped, setBumped] = useState<DuelChoice[]>([]);
  const [left, right] = data.participants;

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const show = useCallback((next: Shares) => {
    shownRef.current = next;
    setShown(next);
  }, []);

  /** Cuenta de los porcentajes actuales a los nuevos (sin movimiento: salta directo). */
  const countTo = useCallback(
    (target: Shares, delay: number) => {
      cancelAnimationFrame(frame.current);
      if (!motion.current) return show(target);
      const from = shownRef.current;
      const start = performance.now() + delay;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / COUNT_DURATION_MS));
        const eased = 1 - (1 - t) ** 3;
        show({
          "lolo-chicken": Math.round(from["lolo-chicken"] + (target["lolo-chicken"] - from["lolo-chicken"]) * eased),
          ricono: Math.round(from.ricono + (target.ricono - from.ricono) * eased),
        });
        if (t < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [show],
  );

  // Entrada: una sola vez, cuando la franja aparece en pantalla.
  useEffect(() => {
    const node = ref.current;
    motion.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!node || !motion.current) return;
    let settle = 0;
    setPhase("armed");
    show({ "lolo-chicken": 0, ricono: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setPhase("in");
        countTo(latest.current.percentages, ENTRY_COUNT_DELAY_MS);
        settle = window.setTimeout(() => setPhase("live"), ENTRY_TOTAL_MS);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
      cancelAnimationFrame(frame.current);
    };
  }, [countTo, show, setPhase]);

  // En vivo: cada 30 s (solo con la pestaña a la vista) y al volver a ella.
  useEffect(() => {
    let current = initial;
    let unbump = 0;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(VERSUS_ENDPOINT, { cache: "no-store" });
        if (!response.ok) return;
        const next = (await response.json()) as VersusSummaryDto;
        if (!next?.counts || (next.counts["lolo-chicken"] === current.counts["lolo-chicken"] && next.counts.ricono === current.counts.ricono)) return;
        const changed = (["lolo-chicken", "ricono"] as const).filter((slug) => next.counts[slug] !== current.counts[slug]);
        current = next;
        latest.current = next;
        setData(next);
        // Si la franja todavía no entró, su entrada ya contará hasta este resultado.
        if (phaseRef.current === "armed") return;
        if (phaseRef.current === "in") setPhase("live");
        countTo(next.percentages, 0);
        setBumped(changed);
        window.clearTimeout(unbump);
        unbump = window.setTimeout(() => setBumped([]), 1200);
      } catch {
        // Sin red: se deja el último resultado y se reintenta en la próxima vuelta.
      }
    };
    const timer = window.setInterval(refresh, VERSUS_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(unbump);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initial, countTo, setPhase]);

  const empty = data.total === 0;
  const leftShare = empty || phase === "armed" ? 50 : data.percentages[left.slug];
  const leader = data.participants.find((participant) => participant.slug === data.leader)?.name ?? null;

  return (
    <div ref={ref} data-duel={phase}>
      <div className="duel-row grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-8">
        <Side participant={left} side="left" percent={shown[left.slug]} votes={data.counts[left.slug]} leading={data.leader === left.slug} bumped={bumped.includes(left.slug)} />
        <span aria-hidden="true" className="duel-vs self-center pt-2 text-[clamp(2.75rem,10vw,7rem)] font-black italic leading-none tracking-tighter text-brand">
          VS
        </span>
        <Side participant={right} side="right" percent={shown[right.slug]} votes={data.counts[right.slug]} leading={data.leader === right.slug} bumped={bumped.includes(right.slug)} />
      </div>

      <div className="relative mt-8 sm:mt-10">
        <div className="duel-bar flex h-3 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <span className={cn("duel-bar-left h-full", empty ? "bg-white/20" : "bg-brand")} style={{ width: `${leftShare}%` }} />
          <span className={cn("duel-bar-right h-full flex-1", empty ? "bg-white/10" : "bg-cream")} />
        </div>
        {/* Chispa en el punto donde chocan los dos colores. */}
        <span aria-hidden="true" className="duel-spark pointer-events-none absolute top-1/2 size-3 rounded-full bg-white" style={{ left: `${leftShare}%` }} />
      </div>

      {/* aria-live: quien usa lector de pantalla se entera si cambia el líder. */}
      <p aria-live="polite" className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm sm:mt-10">
        <span className="inline-flex items-center gap-2 font-bold">
          <Trophy size={18} className="text-brand" aria-hidden="true" />
          {VERSUS_TEXT.status(leader, data.total)}
        </span>
        <span className="text-white/70">{VERSUS_TEXT.totalVotes(data.total)}</span>
      </p>
    </div>
  );
}

type SideProps = { participant: VersusParticipantDto; side: "left" | "right"; percent: number; votes: number; leading: boolean; bumped: boolean };

function Side({ participant, side, percent, votes, leading, bumped }: SideProps) {
  return (
    <div className={cn("group flex min-w-0 flex-col items-center text-center", side === "left" ? "duel-left" : "duel-right")}>
      <Link
        href={`/polleria/${participant.slug}`}
        aria-label={VERSUS_TEXT.seeRestaurant(participant.name)}
        className="relative block w-full max-w-24 transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:transform-none sm:max-w-40"
      >
        <span className="relative block aspect-square overflow-hidden rounded-2xl border-2 border-white/15 bg-white shadow-card-hover">
          {participant.photoUrl ? (
            <Image src={participant.photoUrl} alt="" fill sizes="(min-width: 640px) 10rem, 6rem" className="object-cover transition-[scale] duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
          ) : (
            <UtensilsCrossed className="m-auto h-full text-brand-ink" size={40} aria-hidden="true" />
          )}
        </span>
        {leading ? (
          // La key hace que la corona vuelva a caer cuando cambia de lado.
          <span key={participant.slug} className="duel-crown absolute -top-3 left-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-card sm:-top-4 sm:px-3 sm:py-1 sm:text-xs">
            <Crown size={12} aria-hidden="true" />
            {VERSUS_TEXT.leading}
          </span>
        ) : null}
      </Link>
      <p className="mt-3 w-full truncate text-base font-extrabold tracking-tight sm:mt-4 sm:text-2xl">{participant.name}</p>
      <p
        data-testid={`duel-percent-${participant.slug}`}
        className={cn("duel-percent mt-1 text-[2rem] font-black leading-none tabular-nums transition-colors group-hover:text-brand sm:text-5xl", bumped && "duel-bump text-brand")}
      >
        {percent}
        <span className="text-base sm:text-2xl">%</span>
      </p>
      <p className="mt-1 text-xs text-white/70 sm:text-sm">{VERSUS_TEXT.votes(votes)}</p>
    </div>
  );
}
