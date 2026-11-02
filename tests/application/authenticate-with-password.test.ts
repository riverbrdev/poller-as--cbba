import { describe, expect, it } from "vitest";
import { createAuthenticateWithPassword } from "@/application/user/authenticate-with-password";
import { createFakeUserRepository, fakeHasher } from "./fakes";

const passwordUser = {
  id: "u1",
  username: "juanperez",
  googleId: null,
  passwordHash: "hashed:secreto123",
  name: "juanperez",
  email: "juan@a.com",
  avatarUrl: null,
};

const googleUser = {
  id: "g1",
  username: "maria",
  googleId: "google-456",
  passwordHash: null,
  name: "María",
  email: "maria@gmail.com",
  avatarUrl: null,
};

function setup() {
  const users = createFakeUserRepository([passwordUser, googleUser]);
  return createAuthenticateWithPassword({ users, hasher: fakeHasher });
}

describe("authenticateWithPassword", () => {
  it("entra con correo y contraseña correctos, sin importar mayúsculas del correo", async () => {
    const authenticateWithPassword = setup();

    const result = await authenticateWithPassword("JUAN@a.com", "secreto123");

    expect(result).toEqual({ ok: true, user: passwordUser });
  });

  it("rechaza una contraseña incorrecta con un error genérico", async () => {
    const authenticateWithPassword = setup();

    expect(await authenticateWithPassword("juan@a.com", "otra-clave")).toEqual({
      ok: false,
      error: "invalid_credentials",
    });
  });

  it("rechaza un correo que no existe con el mismo error genérico", async () => {
    const authenticateWithPassword = setup();

    expect(await authenticateWithPassword("nadie@a.com", "secreto123")).toEqual({
      ok: false,
      error: "invalid_credentials",
    });
  });

  it("no deja entrar con contraseña a una cuenta creada con Google", async () => {
    const authenticateWithPassword = setup();

    expect(await authenticateWithPassword("maria@gmail.com", "secreto123")).toEqual({
      ok: false,
      error: "invalid_credentials",
    });
  });
});
