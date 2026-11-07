import { describe, expect, it } from "vitest";
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
  const getMyProfile = createGetMyProfile({ users: createFakeUserRepository([googleUser, passwordUser]) });

  it("devuelve los datos visibles de una cuenta de Google", async () => {
    expect(await getMyProfile("u-google")).toEqual({
      name: "Bernardo Ríos",
      username: "berni",
      email: "berni@example.com",
      avatarUrl: "https://lh3.googleusercontent.com/a/foto",
      signInMethod: "google",
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

  it("devuelve null si la cuenta no existe", async () => {
    expect(await getMyProfile("no-existe")).toBeNull();
  });
});
