import { describe, expect, it } from "vitest";
import { createAuthenticateWithPassword } from "@/application/user/authenticate-with-password";
import { createRegisterWithPassword } from "@/application/user/register-with-password";
import { createSignInWithGoogle } from "@/application/user/sign-in-with-google";
import { createFakeUserRepository, fakeHasher } from "./fakes";

const allowedEmails = ["yo@gmail.com"];

const googleProfile = (email: string) => ({
  googleId: `google-${email}`,
  email,
  name: "Alguien",
  avatarUrl: null,
});

describe("lista de correos permitidos", () => {
  describe("registro con contraseña", () => {
    it("deja registrarse a un correo de la lista", async () => {
      const users = createFakeUserRepository();
      const register = createRegisterWithPassword({ users, hasher: fakeHasher, allowedEmails });

      const result = await register({ username: "yo_mismo", email: "YO@gmail.com", password: "secreto123" });

      expect(result.ok).toBe(true);
    });

    it("rechaza un correo fuera de la lista sin crear la cuenta", async () => {
      const users = createFakeUserRepository();
      const register = createRegisterWithPassword({ users, hasher: fakeHasher, allowedEmails });

      const result = await register({ username: "intruso", email: "otro@gmail.com", password: "secreto123" });

      expect(result).toEqual({ ok: false, error: "email_not_allowed" });
      expect(users.all()).toHaveLength(0);
    });

    it("sin lista permite cualquier correo", async () => {
      const register = createRegisterWithPassword({ users: createFakeUserRepository(), hasher: fakeHasher });

      const result = await register({ username: "cualquiera", email: "otro@gmail.com", password: "secreto123" });

      expect(result.ok).toBe(true);
    });
  });

  describe("login con Google", () => {
    it("deja entrar a un correo de la lista", async () => {
      const signIn = createSignInWithGoogle({ users: createFakeUserRepository(), allowedEmails });

      expect((await signIn(googleProfile("yo@gmail.com"))).ok).toBe(true);
    });

    it("rechaza un correo fuera de la lista sin crear la cuenta", async () => {
      const users = createFakeUserRepository();
      const signIn = createSignInWithGoogle({ users, allowedEmails });

      const result = await signIn(googleProfile("otro@gmail.com"));

      expect(result).toEqual({ ok: false, error: "email_not_allowed" });
      expect(users.all()).toHaveLength(0);
    });

    it("bloquea también a una cuenta que ya existía si su correo ya no está en la lista", async () => {
      const users = createFakeUserRepository([
        {
          id: "g1",
          username: "viejo",
          googleId: "google-otro@gmail.com",
          passwordHash: null,
          name: "Viejo",
          email: "otro@gmail.com",
          avatarUrl: null,
        },
      ]);
      const signIn = createSignInWithGoogle({ users, allowedEmails });

      expect(await signIn(googleProfile("otro@gmail.com"))).toEqual({ ok: false, error: "email_not_allowed" });
    });
  });

  describe("login con contraseña", () => {
    const existing = {
      id: "p1",
      username: "intruso",
      googleId: null,
      passwordHash: "hashed:secreto123",
      name: "intruso",
      email: "otro@gmail.com",
      avatarUrl: null,
    };

    it("rechaza con el error genérico a un correo fuera de la lista, aunque la contraseña sea correcta", async () => {
      const authenticate = createAuthenticateWithPassword({
        users: createFakeUserRepository([existing]),
        hasher: fakeHasher,
        allowedEmails,
      });

      expect(await authenticate("otro@gmail.com", "secreto123")).toEqual({
        ok: false,
        error: "invalid_credentials",
      });
    });

    it("deja entrar a un correo de la lista", async () => {
      const authenticate = createAuthenticateWithPassword({
        users: createFakeUserRepository([{ ...existing, id: "p2", email: "yo@gmail.com", username: "yo_mismo" }]),
        hasher: fakeHasher,
        allowedEmails,
      });

      expect((await authenticate("yo@gmail.com", "secreto123")).ok).toBe(true);
    });
  });
});
