import { describe, expect, it } from "vitest";
import { validatePassword } from "@/domain/user/password";

describe("validatePassword", () => {
  it("acepta una contraseña de exactamente 8 caracteres", () => {
    expect(validatePassword("12345678")).toEqual({ valid: true });
  });

  it("rechaza menos de 8 caracteres", () => {
    expect(validatePassword("1234567")).toEqual({ valid: false, error: "too_short" });
  });

  it("acepta exactamente 72 bytes", () => {
    expect(validatePassword("a".repeat(72))).toEqual({ valid: true });
  });

  it("rechaza más de 72 bytes aunque tenga pocos caracteres", () => {
    // Cada "ñ" ocupa 2 bytes en UTF-8: 37 caracteres = 74 bytes.
    expect(validatePassword("ñ".repeat(37))).toEqual({ valid: false, error: "too_long" });
  });
});
