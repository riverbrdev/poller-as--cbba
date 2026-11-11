import { describe, expect, it, vi } from "vitest";
import type { UserRecord } from "@/application/ports/user-repository";
import { createGetMyProfile } from "@/application/user/get-my-profile";
import { createFakeUserRepository } from "./fakes";

const googleUser: UserRecord = {
  id: "u-google",
  username: "berni",
  googleId: "google-123",
  passwordHash: null,
  name: "Bernardo Ríos",
  email: "berni@example.com",
  avatarUrl: "https://lh3.googleusercontent.com/a/foto",
};

const passwordUser: UserRecord = {
  id: "u-password",
  username: "pollero",
  googleId: null,
  passwordHash: "hashed:secreto123",
  name: "pollero",
  email: "pollero@example.com",
  avatarUrl: null,
};

describe("getMyProfile", () => {
  const users = createFakeUserRepository([googleUser, passwordUser]);
  const getMyProfile = createGetMyProfile({ users, reviews: { listByAuthor: async () => [] } });

  it("devuelve los datos visibles de una cuenta de Google", async () => {
    expect(await getMyProfile("u-google")).toEqual({
      name: "Bernardo Ríos",
      username: "berni",
      email: "berni@example.com",
      avatarUrl: "https://lh3.googleusercontent.com/a/foto",
      signInMethod: "google",
      reviews: [],
    });
  });

  it("marca como 'password' una cuenta de correo y contraseña", async () => {
    expect((await getMyProfile("u-password"))?.signInMethod).toBe("password");
  });

  it("no expone el hash de la contraseña ni el id de Google", async () => {
    const profile = await getMyProfile("u-password");
    expect(profile).not.toHaveProperty("passwordHash");
    expect(profile).not.toHaveProperty("googleId");
    expect(profile).not.toHaveProperty("id");
  });

  it("pide solo el historial del usuario y conserva los comentarios opcionales", async () => {
    const createdAt = new Date("2026-01-01T12:00:00.000Z");
    const scores = { flavor: 10, portion: 9, service: 8, place: 6 };
    const listByAuthor = vi.fn().mockResolvedValue([
      { id: "r1", restaurantName: "Pollería A", scores, comment: "Muy crocante", createdAt },
      { id: "r2", restaurantName: "Pollería B", scores, comment: null, createdAt },
    ]);
    const getProfileWithReviews = createGetMyProfile({ users, reviews: { listByAuthor } });

    expect((await getProfileWithReviews(googleUser.id))?.reviews).toEqual([
      { id: "r1", restaurantName: "Pollería A", overall: 8.3, comment: "Muy crocante", createdAt: createdAt.toISOString() },
      { id: "r2", restaurantName: "Pollería B", overall: 8.3, comment: null, createdAt: createdAt.toISOString() },
    ]);
    expect(listByAuthor).toHaveBeenCalledExactlyOnceWith(googleUser.id);
  });

  it("devuelve null y no consulta reseñas si la cuenta no existe", async () => {
    const listByAuthor = vi.fn();
    const getProfileWithReviews = createGetMyProfile({ users, reviews: { listByAuthor } });

    expect(await getProfileWithReviews("no-existe")).toBeNull();
    expect(listByAuthor).not.toHaveBeenCalled();
  });
});
