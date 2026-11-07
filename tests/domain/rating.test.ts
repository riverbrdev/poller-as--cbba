import { describe, expect, it } from "vitest";
import {
  RATING_CRITERIA,
  isValidComment,
  isValidScore,
  normalizeComment,
  overallScore,
  scoreLabel,
  validateRatingScores,
} from "@/domain/rating/criteria";

describe("isValidScore", () => {
  it("acepta los extremos 1 y 10", () => {
    expect(isValidScore(1)).toBe(true);
    expect(isValidScore(10)).toBe(true);
  });

  it.each([0, 11, 7.5, Number.NaN, "8", null])("rechaza %s", (value) => {
    expect(isValidScore(value)).toBe(false);
  });
});

describe("validateRatingScores", () => {
  const complete = { flavor: 9, portion: 7, service: 8, place: 6 };

  it("acepta los cuatro criterios válidos", () => {
    expect(validateRatingScores(complete)).toEqual({ valid: true, scores: complete });
  });

  it("falla si falta un criterio", () => {
    expect(validateRatingScores({ flavor: 9, portion: 7, service: 8 })).toEqual({ valid: false });
  });

  it("falla si una nota está fuera de rango", () => {
    expect(validateRatingScores({ ...complete, place: 11 })).toEqual({ valid: false });
  });
});

describe("scoreLabel", () => {
  it.each([
    [1, "Malo"],
    [3, "Malo"],
    [4, "Regular"],
    [6, "Regular"],
    [7, "Bueno"],
    [8, "Muy bueno"],
    [9, "Excelente"],
    [10, "Excelente"],
  ])("%i es %s", (score, label) => {
    expect(scoreLabel(score)).toBe(label);
  });
});

describe("overallScore", () => {
  it("promedia solo los criterios calificados", () => {
    expect(overallScore({ flavor: 9, portion: 7, service: 8 })).toBe(8);
  });

  it("redondea a un decimal", () => {
    expect(overallScore({ flavor: 9, portion: 7, service: 8, place: 7 })).toBe(7.8);
  });

  it("devuelve null sin criterios", () => {
    expect(overallScore({})).toBeNull();
  });
});

describe("comentario", () => {
  it("un comentario solo con espacios cuenta como vacío", () => {
    expect(normalizeComment("   ")).toBeNull();
    expect(normalizeComment(undefined)).toBeNull();
  });

  it("recorta los espacios de los extremos", () => {
    expect(normalizeComment("  rico ")).toBe("rico");
  });

  it("acepta hasta 280 caracteres", () => {
    expect(isValidComment("a".repeat(280))).toBe(true);
    expect(isValidComment("a".repeat(281))).toBe(false);
    expect(isValidComment(null)).toBe(true);
  });
});

describe("RATING_CRITERIA", () => {
  it("son cuatro criterios en orden fijo", () => {
    expect(RATING_CRITERIA.map((criterion) => criterion.key)).toEqual(["flavor", "portion", "service", "place"]);
  });
});
