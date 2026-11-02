import { describe, expect, it } from "vitest";
import { bcryptPasswordHasher } from "@/infrastructure/auth/bcrypt-password-hasher";

describe("bcryptPasswordHasher", () => {
  it("nunca guarda la contraseña en claro", async () => {
    const hash = await bcryptPasswordHasher.hash("secreto123");

    expect(hash).not.toContain("secreto123");
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it("verifica la contraseña correcta", async () => {
    const hash = await bcryptPasswordHasher.hash("secreto123");

    expect(await bcryptPasswordHasher.verify("secreto123", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await bcryptPasswordHasher.hash("secreto123");

    expect(await bcryptPasswordHasher.verify("otra-clave", hash)).toBe(false);
  });
});
