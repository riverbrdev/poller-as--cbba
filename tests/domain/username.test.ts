import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername } from "@/domain/user/username";

describe("validateUsername", () => {
  it.each(["abc", "juan_perez", "Juan123", "a".repeat(20)])("acepta %s", (username) => {
    expect(validateUsername(username)).toEqual({ valid: true });
  });

  it("rechaza menos de 3 caracteres", () => {
    expect(validateUsername("ab")).toEqual({ valid: false, error: "too_short" });
  });

  it("rechaza más de 20 caracteres", () => {
    expect(validateUsername("a".repeat(21))).toEqual({ valid: false, error: "too_long" });
  });

  it.each(["juan perez", "juan-perez", "juan.perez", "ñandu", "@juan", "juan!"])(
    "rechaza caracteres no permitidos en %s",
    (username) => {
      expect(validateUsername(username)).toEqual({ valid: false, error: "invalid_characters" });
    },
  );

  it("rechaza la cadena vacía como demasiado corta", () => {
    expect(validateUsername("")).toEqual({ valid: false, error: "too_short" });
  });
});

describe("normalizeUsername", () => {
  it("pasa a minúsculas para que JuanPerez y juanperez sean la misma cuenta", () => {
    expect(normalizeUsername("JuanPerez")).toBe("juanperez");
  });
});
