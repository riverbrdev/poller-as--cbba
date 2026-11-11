export const DUEL_ID = "lolo-vs-ricono";
export const DUEL_CHOICES = ["lolo-chicken", "ricono"] as const;
export type DuelChoice = typeof DUEL_CHOICES[number];
export function isDuelChoice(value: string): value is DuelChoice {
  return DUEL_CHOICES.some((choice) => choice === value);
}
export function duelResult(counts: Record<DuelChoice, number>) {
  const total = counts["lolo-chicken"] + counts.ricono;
  const leader: DuelChoice | null = counts["lolo-chicken"] === counts.ricono ? null
    : counts["lolo-chicken"] > counts.ricono ? "lolo-chicken" : "ricono";
  return { total, leader, percentages: {
    "lolo-chicken": total ? Math.round(counts["lolo-chicken"] / total * 100) : 0,
    ricono: total ? 100 - Math.round(counts["lolo-chicken"] / total * 100) : 0,
  } };
}
