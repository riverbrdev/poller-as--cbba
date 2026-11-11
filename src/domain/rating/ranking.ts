import { RATING_CRITERIA, scoreLabel, type RatingCriterionKey, type ScoreLabel } from "./criteria";

/**
 * Ranking bayesiano (SPEC §4, reglas 5 y 6). Es la ÚNICA fuente de la nota pública:
 * la usan el perfil de pollería y el ranking, así nunca dan notas distintas.
 *
 *   score = (v / (v + m)) · R + (m / (v + m)) · C
 *
 * - v: votos visibles de la pollería.
 * - R: su promedio = P / (4·v), con P = suma de los 4 criterios de todos sus votos.
 * - m: MIN_VOTES_FOR_RANKING (también es el umbral para entrar al ranking).
 * - C: promedio de los promedios (R) de las pollerías con al menos un voto.
 *
 * Todo se calcula con fracciones exactas de BigInt: no se redondea nada hasta mostrar.
 */

/** m: mínimo de votos para entrar al ranking y peso del promedio de las pollerías. */
export const MIN_VOTES_FOR_RANKING = 10;

// Constantes BigInt sin literales `ZERO` (el tsconfig apunta a una versión anterior a ES2020).
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);
const TWENTY = BigInt(20);
const MINUS_ONE = BigInt(-1);

const CRITERIA_COUNT = BigInt(RATING_CRITERIA.length);
const MAX_SCORE = 10;

export type RestaurantRatingStats = {
  restaurantId: string;
  /** v: cantidad de votos visibles. Entero ≥ 0. */
  voteCount: number;
  /** Suma de cada criterio sobre todos los votos visibles. Enteros ≥ 0. */
  criteriaTotals: Record<RatingCriterionKey, number>;
};

/** Fracción exacta: denominador siempre positivo y simplificada. */
export type ScoreFraction = { numerator: bigint; denominator: bigint };

export type RankingStatus = "ranked" | "voting" | "unrated";

export type RestaurantScore = {
  restaurantId: string;
  voteCount: number;
  /** null si la pollería no tiene votos. */
  score: ScoreFraction | null;
  /** Promedio simple de cada criterio; null si no tiene votos. */
  criteriaAverages: Record<RatingCriterionKey, number> | null;
  status: RankingStatus;
  /** Solo para `ranked`. Ranking de competencia: empates exactos comparten posición (1, 2, 2, 4). */
  position: number | null;
};

export type ScoreDisplay = { text: string; value: number; label: ScoreLabel };

// ---------- Fracciones exactas ----------

const abs = (value: bigint) => (value < ZERO ? -value : value);

function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y !== ZERO) {
    [x, y] = [y, x % y];
  }
  return x === ZERO ? ONE : x;
}

function fraction(numerator: bigint, denominator: bigint): ScoreFraction {
  if (denominator === ZERO) {
    throw new Error("Fracción con denominador cero");
  }
  const sign = denominator < ZERO ? MINUS_ONE : ONE;
  const divisor = gcd(numerator, denominator);
  return { numerator: (sign * numerator) / divisor, denominator: (sign * denominator) / divisor };
}

const add = (a: ScoreFraction, b: ScoreFraction) =>
  fraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator);

const scale = (a: ScoreFraction, factor: bigint) => fraction(a.numerator * factor, a.denominator);

const divideBy = (a: ScoreFraction, divisor: bigint) => fraction(a.numerator, a.denominator * divisor);

// ---------- Validación de entrada ----------

function assertValidStats(stats: RestaurantRatingStats): void {
  const { restaurantId, voteCount, criteriaTotals } = stats;
  if (!Number.isSafeInteger(voteCount) || voteCount < 0) {
    throw new Error(`Cantidad de votos inválida para ${restaurantId}: ${voteCount}`);
  }
  for (const { key } of RATING_CRITERIA) {
    const total = criteriaTotals[key];
    // Cada voto aporta entre 1 y 10 por criterio: la suma debe caer entre v y 10·v.
    if (!Number.isSafeInteger(total) || total < voteCount || total > voteCount * MAX_SCORE) {
      throw new Error(`Suma del criterio ${key} inválida para ${restaurantId}: ${total} con ${voteCount} votos`);
    }
  }
}

function pointsOf(stats: RestaurantRatingStats): bigint {
  return RATING_CRITERIA.reduce((sum, { key }) => sum + BigInt(stats.criteriaTotals[key]), ZERO);
}

/** R = P / (4·v). Solo para pollerías con votos. */
function restaurantMean(stats: RestaurantRatingStats): ScoreFraction {
  return fraction(pointsOf(stats), CRITERIA_COUNT * BigInt(stats.voteCount));
}

function criteriaAveragesOf(stats: RestaurantRatingStats): Record<RatingCriterionKey, number> | null {
  if (stats.voteCount === 0) {
    return null;
  }
  const averages = {} as Record<RatingCriterionKey, number>;
  for (const { key } of RATING_CRITERIA) {
    averages[key] = stats.criteriaTotals[key] / stats.voteCount;
  }
  return averages;
}

// ---------- API pública ----------

/** Compara dos scores exactos por multiplicación cruzada (sin coma flotante). */
export function compareScores(a: ScoreFraction, b: ScoreFraction): -1 | 0 | 1 {
  const left = a.numerator * b.denominator;
  const right = b.numerator * a.denominator;
  if (left === right) {
    return 0;
  }
  return left > right ? 1 : -1;
}

export function scoreToNumber(score: ScoreFraction): number {
  return Number(score.numerator) / Number(score.denominator);
}

/** Un decimal, mitad hacia arriba, calculado sobre la fracción exacta: "8.7". */
export function formatScore(score: ScoreFraction): string {
  // floor(x·10 + 1/2) = floor((n·20 + d) / (2·d)). Los scores son positivos (1 a 10).
  const tenths = (score.numerator * TWENTY + score.denominator) / (TWO * score.denominator);
  return `${tenths / TEN}.${tenths % TEN}`;
}

/** Texto, valor y palabra de la nota. La palabra sale del número MOSTRADO: "8.5" nunca dice "Muy bueno". */
export function scoreDisplay(score: ScoreFraction): ScoreDisplay {
  const text = formatScore(score);
  const value = Number(text);
  return { text, value, label: scoreLabel(Math.round(value)) };
}

/**
 * Calcula la nota bayesiana, el estado y la posición de cada pollería.
 * Recibe estadísticas ya filtradas (solo votos visibles de pollerías activas).
 * Orden del resultado: ranked por posición, luego voting por score, luego unrated.
 */
export function rankRestaurants(stats: RestaurantRatingStats[], m: number = MIN_VOTES_FOR_RANKING): RestaurantScore[] {
  if (!Number.isSafeInteger(m) || m < 1) {
    throw new Error(`Mínimo de votos inválido: ${m}`);
  }
  stats.forEach(assertValidStats);

  const rated = stats.filter((item) => item.voteCount > 0);
  // C = promedio de los promedios de cada pollería con votos. Si nadie tiene votos, no hay C ni notas.
  const globalMean =
    rated.length === 0
      ? null
      : divideBy(rated.map(restaurantMean).reduce(add), BigInt(rated.length));
  const prior = BigInt(m);

  const scored = stats.map((item): Omit<RestaurantScore, "position"> => {
    const voteCount = item.voteCount;
    const status: RankingStatus = voteCount === 0 ? "unrated" : voteCount >= m ? "ranked" : "voting";
    if (voteCount === 0 || globalMean === null) {
      return { restaurantId: item.restaurantId, voteCount, score: null, criteriaAverages: null, status };
    }
    // score = (v·R + m·C) / (v + m), con v·R = P / 4.
    const weighted = add(fraction(pointsOf(item), CRITERIA_COUNT), scale(globalMean, prior));
    const score = divideBy(weighted, BigInt(voteCount) + prior);
    return { restaurantId: item.restaurantId, voteCount, score, criteriaAverages: criteriaAveragesOf(item), status };
  });

  const byScoreDesc = (a: Omit<RestaurantScore, "position">, b: Omit<RestaurantScore, "position">) => {
    const byScore = a.score && b.score ? compareScores(b.score, a.score) : 0;
    if (byScore !== 0) return byScore;
    if (a.voteCount !== b.voteCount) return b.voteCount - a.voteCount;
    return a.restaurantId.localeCompare(b.restaurantId);
  };

  const ranked = scored.filter((item) => item.status === "ranked").sort(byScoreDesc);
  const voting = scored.filter((item) => item.status === "voting").sort(byScoreDesc);
  const unrated = scored
    .filter((item) => item.status === "unrated")
    .sort((a, b) => a.restaurantId.localeCompare(b.restaurantId));

  const withPositions = ranked.map((item): RestaurantScore => {
    // Posición = 1 + cuántas tienen un score estrictamente mayor (empates exactos comparten lugar).
    const higher = ranked.filter((other) => other.score && item.score && compareScores(other.score, item.score) > 0);
    return { ...item, position: higher.length + 1 };
  });

  return [
    ...withPositions,
    ...voting.map((item): RestaurantScore => ({ ...item, position: null })),
    ...unrated.map((item): RestaurantScore => ({ ...item, position: null })),
  ];
}
