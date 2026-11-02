import { describe, expect, it } from "vitest";
import { createRegisterWithPassword } from "@/application/user/register-with-password";
import { createFakeUserRepository, fakeHasher } from "./fakes";

function setup(seed: Parameters<typeof createFakeUserRepository>[0] = []) {
  const users = createFakeUserRepository(seed);
  return { users, registerWithPassword: createRegisterWithPassword({ users, hasher: fakeHasher }) };
}

describe("registerWithPassword", () => {
  it("crea la cuenta con contraseña hasheada y el correo y username normalizados", async () => {
    const { users, registerWithPassword } = setup();

    const result = await registerWithPassword({
      username: "JuanPerez",
      email: "  Juan@Gmail.com ",
      password: "secreto123",
    });

    expect(result.ok).toBe(true);
    const [stored] = users.all();
    expect(stored).toMatchObject({
      username: "juanperez",
      email: "juan@gmail.com",
      googleId: null,
      passwordHash: "hashed:secreto123",
    });
  });

  it("rechaza un username inválido sin tocar la base", async () => {
    const { users, registerWithPassword } = setup();

    const result = await registerWithPassword({ username: "a b", email: "a@a.com", password: "secreto123" });

    expect(result).toEqual({ ok: false, error: "invalid_username" });
    expect(users.all()).toHaveLength(0);
  });

  it("rechaza una contraseña corta", async () => {
    const { registerWithPassword } = setup();

    const result = await registerWithPassword({ username: "juan", email: "a@a.com", password: "corta" });

    expect(result).toEqual({ ok: false, error: "invalid_password" });
  });

  it("rechaza un username ya usado, aunque cambie de mayúsculas", async () => {
    const { registerWithPassword } = setup();
    await registerWithPassword({ username: "juanperez", email: "uno@a.com", password: "secreto123" });

    const result = await registerWithPassword({
      username: "JUANPEREZ",
      email: "dos@a.com",
      password: "secreto123",
    });

    expect(result).toEqual({ ok: false, error: "username_taken" });
  });

  it("informa que el correo ya tiene cuenta con contraseña", async () => {
    const { registerWithPassword } = setup();
    await registerWithPassword({ username: "juanperez", email: "juan@a.com", password: "secreto123" });

    const result = await registerWithPassword({ username: "otro", email: "JUAN@a.com", password: "secreto123" });

    expect(result).toEqual({ ok: false, error: "email_registered_with_password" });
  });

  it("no une cuentas: si el correo es de Google, lo dice en vez de crear otra cuenta", async () => {
    const { users, registerWithPassword } = setup([
      {
        id: "g1",
        username: null,
        googleId: "google-123",
        passwordHash: null,
        name: "Juan",
        email: "juan@gmail.com",
        avatarUrl: null,
      },
    ]);

    const result = await registerWithPassword({ username: "juan", email: "juan@gmail.com", password: "secreto123" });

    expect(result).toEqual({ ok: false, error: "email_registered_with_google" });
    expect(users.all()).toHaveLength(1);
  });
});
