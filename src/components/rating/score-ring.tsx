import { SCORE_MAX } from "@/domain/rating/criteria";

type ScoreRingProps = {
  value: number | null;
  size?: "sm" | "lg";
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anillo con la nota general: se llena en proporción a la nota sobre 10. */
export function ScoreRing({ value, size = "lg" }: ScoreRingProps) {
  const progress = value === null ? 0 : value / SCORE_MAX;
  const dimension = size === "lg" ? "size-28" : "size-16";
  const text = size === "lg" ? "text-3xl" : "text-lg";

  return (
    <div
      className={`relative shrink-0 ${dimension}`}
      role="img"
      aria-label={value === null ? "Tu nota: todavía sin calificar" : `Tu nota: ${value.toFixed(1)} de 10`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="9" className="stroke-line" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="stroke-brand transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-black text-ink ${text}`} aria-hidden="true">
        {value === null ? "–" : value.toFixed(1)}
      </span>
    </div>
  );
}
