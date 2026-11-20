import { describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/application/ports/user-repository";
import { createSignInWithGoogle } from "@/application/user/sign-in-with-google";
import { parseAdminAllowlist } from "@/domain/user/admin";
import { createFakeUserRepository } from "./fakes";

const profile = {
  googleId: "google-123",
  email: "Juan@Gmail.com",
  name: "Juan Pérez",
  avatarUrl: "https://example.com/juan.png",
};

const noAdmins = parseAdminAllowlist(undefined);
const juanIsAdmin = parseAdminAllowlist("juan@gmail.com");

function googleAccount(overrides: { email?: string; role?: UserRole; username?: string | null } = {}) {
  return {
    id: "g1",
    username: "juan",
    googleId: "google-123",
    passwordHash: null,
    name: "Juan",
    email: "juan@gmail.com",
    avatarUrl: null,
    ...overrides,
  };
}

describe("signInWithGoogle", () => {
  it("crea una cuenta nueva sin username para que la elija después", async () => {
    const users = createFakeUserRepository();
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: noAdmins });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, isNewUser: true, user: { username: null, googleId: "google-123" } });
    expect(users.all()[0]).toMatchObject({ email: "juan@gmail.com", passwordHash: null, role: "user" });
  });

  it("reconoce a una cuenta existente por google_id, aunque el correo haya cambiado", async () => {
    const users = createFakeUserRepository([googleAccount({ email: "viejo@gmail.com" })]);
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: noAdmins });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, isNewUser: false, user: { id: "g1", username: "juan" } });
    expect(users.all()).toHaveLength(1);
  });

  it("rechaza si el correo ya es una cuenta con contraseña, sin unirlas ni tocar su rol", async () => {
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
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: juanIsAdmin });

    const result = await signInWithGoogle(profile);

    expect(result).toEqual({ ok: false, error: "email_registered_with_password" });
    expect(users.all()[0]).toMatchObject({ googleId: null, role: "user" });
  });
});

describe("signInWithGoogle: rol de admin por la lista autorizada", () => {
  it("una cuenta nueva con correo en la lista nace admin y todavía sin username (US1-1)", async () => {
    const users = createFakeUserRepository();
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: juanIsAdmin });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, isNewUser: true, user: { role: "admin", username: null } });
    expect(users.all()[0]?.role).toBe("admin");
  });

  it("una cuenta existente cuyo correo se agregó después pasa a admin y conserva su username (US1-2, FR-006)", async () => {
    const users = createFakeUserRepository([googleAccount()]);
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: juanIsAdmin });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, user: { id: "g1", role: "admin", username: "juan" } });
    expect(users.all()[0]).toMatchObject({ role: "admin", username: "juan", name: "Juan", email: "juan@gmail.com" });
  });

  it("un correo fuera de la lista queda como usuario normal (US1-3)", async () => {
    const users = createFakeUserRepository();
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: parseAdminAllowlist("ana@gmail.com") });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, user: { role: "user" } });
  });

  it("reconoce el correo de la lista escrito con otras mayúsculas o espacios (US1-4)", async () => {
    const users = createFakeUserRepository();
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: parseAdminAllowlist("  JUAN@Gmail.com  ") });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, user: { role: "admin" } });
  });

  it("una cuenta admin cuyo correo ya no está en la lista vuelve a ser usuario (FR-004)", async () => {
    const users = createFakeUserRepository([googleAccount({ role: "admin" })]);
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: noAdmins });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, user: { role: "user", username: "juan" } });
    expect(users.all()[0]?.role).toBe("user");
  });

  it("compara con el correo guardado de la cuenta, no con el que informa Google ahora", async () => {
    const users = createFakeUserRepository([googleAccount({ email: "viejo@gmail.com" })]);
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: juanIsAdmin });

    const result = await signInWithGoogle(profile);

    expect(result).toMatchObject({ ok: true, user: { role: "user" } });
  });

  it("no escribe en la base si el rol no cambia", async () => {
    const users = createFakeUserRepository([googleAccount({ role: "admin" })]);
    const setRole = vi.spyOn(users, "setRole");
    const signInWithGoogle = createSignInWithGoogle({ users, adminEmails: juanIsAdmin });

    await signInWithGoogle(profile);

    expect(setRole).not.toHaveBeenCalled();
  });
});
