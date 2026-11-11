import { describe, expect, it } from "vitest";
import { reviewsQuerySchema } from "@/app/_lib/review-schemas";

describe("reviewsQuerySchema", () => {
  it("sin parámetros: todas y una tanda", () => {
    expect(reviewsQuerySchema.parse({})).toEqual({ resenas: "all", ver: 10 });
  });

  it("traduce el filtro de la URL", () => {
    expect(reviewsQuerySchema.parse({ resenas: "destacadas" }).resenas).toBe("featured");
    expect(reviewsQuerySchema.parse({ resenas: "con-comentario" }).resenas).toBe("with-comment");
  });

  it("valores inválidos caen al valor por defecto sin error", () => {
    expect(reviewsQuerySchema.parse({ resenas: "hackeo", ver: "999999" })).toEqual({ resenas: "all", ver: 10 });
    expect(reviewsQuerySchema.parse({ ver: "15" }).ver).toBe(10);
    expect(reviewsQuerySchema.parse({ ver: "-10" }).ver).toBe(10);
  });

  it("acepta múltiplos de 10 hasta 200 y toma el primer valor repetido", () => {
    expect(reviewsQuerySchema.parse({ ver: "30" }).ver).toBe(30);
    expect(reviewsQuerySchema.parse({ ver: ["20", "40"] }).ver).toBe(20);
  });
});
