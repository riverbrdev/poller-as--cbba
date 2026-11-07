/**
 * Reglas del voto (SPEC §3 y §4): 4 criterios fijos, cada uno del 1 al 10, y comentario opcional.
 * Lo usan el caso de uso (validación), el borde Zod (límites) y el formulario (etiquetas y nota en vivo).
 */

export type RatingCriterionKey = "flavor" | "portion" | "service" | "place";

export type RatingCriterion = {
  key: RatingCriterionKey;
  title: string;
  question: string;
  /** Qué significa un 1. */
  lowLabel: string;
  /** Qué significa un 10. */
  highLabel: string;
};

export type RatingScores = Record<RatingCriterionKey, number>;

export type ScoreLabel = "Malo" | "Regular" | "Bueno" | "Muy bueno" | "Excelente";

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;
export const COMMENT_MAX_LENGTH = 280;

export const RATING_CRITERIA: readonly RatingCriterion[] = [
  {
    key: "flavor",
    title: "Sabor y crocancia",
    question: "¿Qué tan rico y crocante estaba?",
    lowLabel: "Insípido o aceitoso",
    highLabel: "Crocante y jugoso",
  },
  {
    key: "portion",
    title: "Cantidad y porción",
    question: "¿La porción valió lo que pagaste?",
    lowLabel: "Muy poco",
    highLabel: "Plato rebalsando",
  },
  {
    key: "service",
    title: "Atención y rapidez",
    question: "¿Cómo te atendieron y cuánto tardó?",
    lowLabel: "Lento o mal trato",
    highLabel: "Rápido y amable",
  },
  {
    key: "place",
    title: "Local",
    question: "Limpieza, mesas y comodidad",
    lowLabel: "Sucio o incómodo",
    highLabel: "Impecable",
  },
];

export function isValidScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= SCORE_MIN && value <= SCORE_MAX;
}

export type ScoresValidation = { valid: true; scores: RatingScores } | { valid: false };

/** Los cuatro criterios son obligatorios y cada nota es un entero del 1 al 10. */
export function validateRatingScores(scores: Partial<Record<RatingCriterionKey, unknown>>): ScoresValidation {
  const { flavor, portion, service, place } = scores;
  if (isValidScore(flavor) && isValidScore(portion) && isValidScore(service) && isValidScore(place)) {
    return { valid: true, scores: { flavor, portion, service, place } };
  }
  return { valid: false };
}

/** Palabra que acompaña a cada nota: 1–3 Malo · 4–6 Regular · 7 Bueno · 8 Muy bueno · 9–10 Excelente. */
export function scoreLabel(score: number): ScoreLabel {
  if (score <= 3) return "Malo";
  if (score <= 6) return "Regular";
  if (score === 7) return "Bueno";
  if (score === 8) return "Muy bueno";
  return "Excelente";
}

/** Promedio de los criterios ya calificados, con un decimal. `null` si todavía no hay ninguno. */
export function overallScore(scores: Partial<RatingScores>): number | null {
  const values = Object.values(scores).filter((value): value is number => typeof value === "number");
  if (values.length === 0) {
    return null;
  }
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average * 10) / 10;
}

/** Recorta espacios. Un comentario vacío o solo con espacios cuenta como "sin comentario". */
export function normalizeComment(comment: string | null | undefined): string | null {
  const trimmed = (comment ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

export function isValidComment(comment: string | null): boolean {
  return comment === null || comment.length <= COMMENT_MAX_LENGTH;
}
