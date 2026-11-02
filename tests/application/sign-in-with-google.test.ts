import { describe, expect, it } from "vitest";
import { createSignInWithGoogle } from "@/application/user/sign-in-with-google";
import { createFakeUserRepository } from "./fakes";

const profile = {
  googleId: "google-123",
  email: "Juan@Gmail.com",
  name: "Juan Pérez",
  avatarUrl: "https://example.com/juan.png",
};

describe("signInWithGoogle", () => {
  it("crea una cuenta nueva sin username para que la elija después", async () => {
    const users = createFakeUserRepository();
    const signInWithGoogle = createSignInWithGoogle({ users });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, isNewUser: true, user: { username: null, googleId: "google-123" } });
    expect(users.all()[0]).toMatchObject({ email: "juan@gmail.com", passwordHash: null });
  });

  it("reconoce a una cuenta existente por google_id, aunque el correo haya cambiado", async () => {
    const users = createFakeUserRepository([
      {
        id: "g1",
        username: "juan",
        googleId: "google-123",
        passwordHash: null,
        name: "Juan",
        email: "viejo@gmail.com",
        avatarUrl: null,
      },
    ]);
    const signInWithGoogle = createSignInWithGoogle({ users });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, isNewUser: false, user: { id: "g1", username: "juan" } });
    expect(users.all()).toHaveLength(1);
  });

  it("rechaza si el correo ya es una cuenta con contraseña, sin unirlas", async () => {
    const users = createFakeUserRepository([
      {
        id: "p1",
        username: "juanperez",
        googleId: null,
        passwordHash: "hashed:secreto123",
        name: "juanperez",
        email: "juan@gmail.com",
        avatarUrl: null,
      },
    ]);
    const signInWithGoogle = createSignInWithGoogle({ users });

    const result = await signInWithGoogle(profile);

    expect(result).toEqual({ ok: false, error: "email_registered_with_password" });
    expect(users.all()[0]?.googleId).toBeNull();
  });
});
