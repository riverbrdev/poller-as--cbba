import { describe, expect, it } from "vitest";
import {
  MIN_VOTES_FOR_RANKING,
  compareScores,
  formatScore,
  rankRestaurants,
  scoreDisplay,
  scoreToNumber,
  type RestaurantRatingStats,
  type RestaurantScore,
  type ScoreFraction,
} from "@/domain/rating/ranking";

// Los valores esperados se calculan a mano en cada caso, nunca reutilizando la función.

/** Pollería donde todos sus votos tienen la misma nota en los 4 criterios. */
function uniform(restaurantId: string, voteCount: number, note: number): RestaurantRatingStats {
  const total = voteCount * note;
  return { restaurantId, voteCount, criteriaTotals: { flavor: total, portion: total, service: total, place: total } };
}

const frac = (numerator: number, denominator: number): ScoreFraction => ({
  numerator: BigInt(numerator),
  denominator: BigInt(denominator),
});

/** Único resultado de un ranking de una sola pollería. */
function only(result: RestaurantScore[]): RestaurantScore {
  expect(result).toHaveLength(1);
  return result[0] as RestaurantScore;
}

function byId(result: RestaurantScore[], id: string): RestaurantScore {
  const found = result.find((item) => item.restaurantId === id);
  if (!found) throw new Error(`no está ${id}`);
  return found;
}

function expectScore(score: ScoreFraction | null, numerator: number, denominator: number) {
  expect(score).not.toBeNull();
  expect(compareScores(score as ScoreFraction, frac(numerator, denominator))).toBe(0);
}

describe("rankRestaurants", () => {
  it("1. sin votos en ninguna pollería: todas sin nota ni posición", () => {
    const result = rankRestaurants([uniform("a", 0, 0), uniform("b", 0, 0)]);
    for (const item of result) {
      expect(item).toMatchObject({ status: "unrated", score: null, position: null, criteriaAverages: null });
    }
  });

  it("2. única pollería con 1 voto de 8: C = 8 y su nota es 8, en votación", () => {
    const item = only(rankRestaurants([uniform("a", 1, 8)]));
    expectScore(item.score, 8, 1);
    expect(item).toMatchObject({ status: "voting", position: null });
  });

  it("3. A (1 voto de 10) supera en nota a B (20 votos de 9) pero no tiene posición", () => {
    // C = (10 + 9) / 2 = 9.5 · A = (1·10 + 10·9.5) / 11 = 105/11 · B = (20·9 + 10·9.5) / 30 = 55/6
    const result = rankRestaurants([uniform("a", 1, 10), uniform("b", 20, 9)]);
    expectScore(byId(result, "a").score, 105, 11);
    expectScore(byId(result, "b").score, 55, 6);
    expect(byId(result, "a")).toMatchObject({ status: "voting", position: null });
    expect(byId(result, "b")).toMatchObject({ status: "ranked", position: 1 });
  });

  it("4. v=10, R=9, C=7, m=10 → nota 8.0 exacta", () => {
    // C = (9 + 5) / 2 = 7 · score = (10·9 + 10·7) / 20 = 8
    const result = rankRestaurants([uniform("a", 10, 9), uniform("b", 1, 5)]);
    expectScore(byId(result, "a").score, 8, 1);
  });

  it("4b. C es promedio de promedios, no ponderado por votos", () => {
    // C = (4 + 10) / 2 = 7. Ponderado por votos sería (4 + 3000) / 301 ≈ 9.98.
    // A: v=1, R=4 → (4 + 70) / 11 = 74/11
    const result = rankRestaurants([uniform("a", 1, 4), uniform("b", 300, 10)]);
    expectScore(byId(result, "a").score, 74, 11);
  });

  it("5. con exactamente m votos entra al ranking (umbral inclusivo)", () => {
    const item = only(rankRestaurants([uniform("a", MIN_VOTES_FOR_RANKING, 7)]));
    expect(item).toMatchObject({ status: "ranked", position: 1 });
  });

  it("6. con m − 1 votos sigue en votación", () => {
    const item = only(rankRestaurants([uniform("a", MIN_VOTES_FOR_RANKING - 1, 7)]));
    expect(item).toMatchObject({ status: "voting", position: null });
  });

  it("7. empates exactos comparten posición y la siguiente salta (1, 2, 2, 4)", () => {
    const result = rankRestaurants([
      uniform("a", 10, 10),
      uniform("b", 10, 8),
      uniform("c", 10, 8),
      uniform("d", 10, 5),
    ]);
    expect(result.map((item) => [item.restaurantId, item.position])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 2],
      ["d", 4],
    ]);
  });

  it("10. promedio de cada criterio = suma / votos", () => {
    const stats: RestaurantRatingStats = {
      restaurantId: "a",
      voteCount: 4,
      criteriaTotals: { flavor: 36, portion: 30, service: 22, place: 17 },
    };
    const item = only(rankRestaurants([stats]));
    expect(item.criteriaAverages).toEqual({ flavor: 9, portion: 7.5, service: 5.5, place: 4.25 });
  });

  it("11. propiedad: la nota siempre queda entre R y C", () => {
    let seed = 42;
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let run = 0; run < 200; run += 1) {
      const stats = Array.from({ length: 1 + Math.floor(next() * 6) }, (_, index) => {
        const voteCount = Math.floor(next() * 30);
        const total = () => voteCount + Math.floor(next() * (9 * voteCount + 1));
        return {
          restaurantId: `r${index}`,
          voteCount,
          criteriaTotals: { flavor: total(), portion: total(), service: total(), place: total() },
        };
      });
      const means = stats
        .filter((item) => item.voteCount > 0)
        .map((item) => Object.values(item.criteriaTotals).reduce((a, b) => a + b, 0) / (4 * item.voteCount));
      const globalMean = means.reduce((a, b) => a + b, 0) / means.length;
      for (const item of rankRestaurants(stats)) {
        const source = stats.find((s) => s.restaurantId === item.restaurantId)!;
        if (source.voteCount === 0) {
          expect(item.score).toBeNull();
          continue;
        }
        const ownMean = Object.values(source.criteriaTotals).reduce((a, b) => a + b, 0) / (4 * source.voteCount);
        const value = scoreToNumber(item.score!);
        expect(value).toBeGreaterThanOrEqual(Math.min(ownMean, globalMean) - 1e-9);
        expect(value).toBeLessThanOrEqual(Math.max(ownMean, globalMean) + 1e-9);
      }
    }
  });

  it("12. una pollería sin votos no cambia C ni ninguna nota", () => {
    const base = [uniform("a", 10, 9), uniform("b", 3, 6)];
    const before = rankRestaurants(base);
    const after = rankRestaurants([...base, uniform("z", 0, 0)]);
    for (const id of ["a", "b"]) {
      expect(compareScores(byId(before, id).score!, byId(after, id).score!)).toBe(0);
    }
  });

  it("orden: ranked por posición, luego voting, luego unrated", () => {
    const result = rankRestaurants([uniform("u", 0, 0), uniform("v", 2, 9), uniform("r", 12, 6)]);
    expect(result.map((item) => item.status)).toEqual(["ranked", "voting", "unrated"]);
  });

  it("rechaza estadísticas imposibles", () => {
    expect(() => rankRestaurants([{ ...uniform("a", 2, 5), voteCount: -1 }])).toThrow();
    // Con 2 votos, cada criterio suma entre 2 y 20.
    expect(() =>
      rankRestaurants([{ restaurantId: "a", voteCount: 2, criteriaTotals: { flavor: 21, portion: 10, service: 10, place: 10 } }]),
    ).toThrow();
    expect(() => rankRestaurants([uniform("a", 1, 5)], 0)).toThrow();
  });
});

describe("compareScores y formatScore", () => {
  it("8. distingue scores que se ven iguales con un decimal", () => {
    const a = frac(8500001, 1000000);
    const b = frac(8500000, 1000000);
    expect(formatScore(a)).toBe(formatScore(b));
    expect(compareScores(a, b)).toBe(1);
    expect(compareScores(b, a)).toBe(-1);
  });

  it("9. redondea mitad hacia arriba sobre la fracción exacta", () => {
    expect(formatScore(frac(875, 100))).toBe("8.8");
    expect(formatScore(frac(8749999, 1000000))).toBe("8.7");
    expect(formatScore(frac(10, 1))).toBe("10.0");
    expect(formatScore(frac(105, 11))).toBe("9.5");
  });

  it("13. scoreDisplay: la palabra sale del número mostrado", () => {
    expect(scoreDisplay(frac(846, 100))).toEqual({ text: "8.5", value: 8.5, label: "Excelente" });
    expect(scoreDisplay(frac(844, 100))).toEqual({ text: "8.4", value: 8.4, label: "Muy bueno" });
  });
});
