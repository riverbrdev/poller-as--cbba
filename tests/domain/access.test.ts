import { describe, expect, it } from "vitest";
import { redirectFor } from "@/domain/user/access";

describe("redirectFor", () => {
  it("deja ver el ranking y los perfiles sin sesión", () => {
    expect(redirectFor({ pathname: "/", hasSession: false, hasUsername: false })).toBeNull();
    expect(redirectFor({ pathname: "/pollerias/lolo", hasSession: false, hasUsername: false })).toBeNull();
  });

  it("manda a iniciar sesión para calificar sin cuenta", () => {
    expect(redirectFor({ pathname: "/calificar/lolo", hasSession: false, hasUsername: false })).toBe("/login");
  });

  it("manda a elegir username a quien entró con Google y todavía no tiene uno", () => {
    expect(redirectFor({ pathname: "/sugerir", hasSession: true, hasUsername: false })).toBe(
      "/onboarding/username",
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
