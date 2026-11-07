import { describe, expect, it } from "vitest";
import { redirectFor, safeCallbackPath } from "@/domain/user/access";

describe("redirectFor", () => {
  it("deja ver el ranking y los perfiles sin sesión", () => {
    expect(redirectFor({ pathname: "/", hasSession: false, hasUsername: false })).toBeNull();
    expect(redirectFor({ pathname: "/pollerias/lolo", hasSession: false, hasUsername: false })).toBeNull();
  });

  it("manda a iniciar sesión para calificar sin cuenta, recordando a dónde volver", () => {
    expect(redirectFor({ pathname: "/calificar/lolo", hasSession: false, hasUsername: false })).toBe(
      "/login?callbackUrl=%2Fcalificar%2Flolo",
    );
  });

  it("manda a elegir username a quien entró con Google y todavía no tiene uno, recordando a dónde volver", () => {
    expect(redirectFor({ pathname: "/sugerir", hasSession: true, hasUsername: false })).toBe(
      "/onboarding/username?callbackUrl=%2Fsugerir",
    );
  });

  it("deja pasar a quien ya tiene sesión y username", () => {
    expect(redirectFor({ pathname: "/mi-perfil", hasSession: true, hasUsername: true })).toBeNull();
  });

  it("no confunde una ruta que solo empieza igual", () => {
    expect(redirectFor({ pathname: "/calificarlo", hasSession: false, hasUsername: false })).toBeNull();
  });

  it("el onboarding exige sesión", () => {
    expect(redirectFor({ pathname: "/onboarding/username", hasSession: false, hasUsername: false })).toBe("/login");
    expect(redirectFor({ pathname: "/onboarding/username", hasSession: true, hasUsername: false })).toBeNull();
  });
});

describe("safeCallbackPath", () => {
  it("acepta rutas internas", () => {
    expect(safeCallbackPath("/calificar/pollos-kingdom")).toBe("/calificar/pollos-kingdom");
    expect(safeCallbackPath("/")).toBe("/");
  });

  it.each([null, undefined, ""])("sin valor (%s) vuelve al inicio", (value) => {
    expect(safeCallbackPath(value)).toBe("/");
  });

  it.each(["https://malo.com", "//malo.com", "/\\malo.com", "javascript:alert(1)", "calificar/x", "/a\nb"])(
    "no permite salir del sitio ni rutas raras: %s",
    (value) => {
      expect(safeCallbackPath(value)).toBe("/");
    },
  );
});
