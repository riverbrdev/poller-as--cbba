import { describe, expect, it } from "vitest";
import { isEmailAllowed, normalizeEmail } from "@/domain/user/email";

describe("normalizeEmail", () => {
  it("quita espacios y pasa a minúsculas", () => {
    expect(normalizeEmail("  Juan@Gmail.COM ")).toBe("juan@gmail.com");
  });
});

describe("isEmailAllowed", () => {
  it("sin lista no restringe a nadie", () => {
    expect(isEmailAllowed("cualquiera@gmail.com", [])).toBe(true);
  });

  it("deja pasar a un correo de la lista, sin distinguir mayúsculas ni espacios", () => {
    expect(isEmailAllowed(" YO@Gmail.com ", ["yo@gmail.com"])).toBe(true);
  });

  it("tolera mayúsculas y espacios en la lista", () => {
    expect(isEmailAllowed("yo@gmail.com", [" Yo@Gmail.com "])).toBe(true);
  });

  it("rechaza un correo que no está en la lista", () => {
    expect(isEmailAllowed("otro@gmail.com", ["yo@gmail.com"])).toBe(false);
  });

  it("no acepta coincidencias parciales", () => {
    expect(isEmailAllowed("yo@gmail.com.evil.com", ["yo@gmail.com"])).toBe(false);
    expect(isEmailAllowed("xyo@gmail.com", ["yo@gmail.com"])).toBe(false);
  });
});
