import { describe, expect, it } from "vitest";
import { cn } from "@/components/lib/utils";

describe("smoke", () => {
  it("resuelve el alias @/ y combina clases de Tailwind", () => {
    expect(cn("p-2", "p-4", false && "hidden")).toBe("p-4");
  });
});
