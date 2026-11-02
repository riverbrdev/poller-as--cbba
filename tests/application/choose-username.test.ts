import { describe, expect, it } from "vitest";
import { createChooseUsername } from "@/application/user/choose-username";
import { createFakeUserRepository } from "./fakes";

const newGoogleUser = {
  id: "g1",
  username: null,
  googleId: "google-123",
  passwordHash: null,
  name: "Juan",
  email: "juan@gmail.com",
  avatarUrl: null,
};

const takenUser = {
  id: "p1",
  username: "juanperez",
  googleId: null,
  passwordHash: "hashed:secreto123",
  name: "juanperez",
  email: "otro@a.com",
  avatarUrl: null,
};

describe("chooseUsername", () => {
  it("guarda el username normalizado en la cuenta de Google nueva", async () => {
    const users = createFakeUserRepository([newGoogleUser]);
    const chooseUsername = createChooseUsername({ users });

    const result = await chooseUsername("g1", "JuanCBBA");

    expect(result).toMatchObject({ ok: true, user: { username: "juancbba" } });
  });

  it("no deja cambiar el username una vez elegido", async () => {
    const users = createFakeUserRepository([{ ...newGoogleUser, username: "juancbba" }]);
    const chooseUsername = createChooseUsername({ users });

    expect(await chooseUsername("g1", "otro_nombre")).toEqual({ ok: false, error: "username_already_set" });
  });

  it("rechaza un username que ya tiene otra cuenta", async () => {
    const users = createFakeUserRepository([newGoogleUser, takenUser]);
    const chooseUsername = createChooseUsername({ users });

    expect(await chooseUsername("g1", "JUANPEREZ")).toEqual({ ok: false, error: "username_taken" });
  });

  it("rechaza un username con formato inválido", async () => {
    const users = createFakeUserRepository([newGoogleUser]);
    const chooseUsername = createChooseUsername({ users });

    expect(await chooseUsername("g1", "ab")).toEqual({ ok: false, error: "invalid_username" });
  });

  it("responde user_not_found si la cuenta no existe", async () => {
    const users = createFakeUserRepository([]);
    const chooseUsername = createChooseUsername({ users });

    expect(await chooseUsername("nadie", "juancbba")).toEqual({ ok: false, error: "user_not_found" });
  });
});
