import { describe, expect, it } from "vitest";
import { createCheckUsernameAvailability } from "@/application/user/check-username-availability";
import { createFakeUserRepository } from "./fakes";

describe("checkUsernameAvailability", () => {
  it("informa que está disponible si nadie lo usa", async () => {
    const checkUsernameAvailability = createCheckUsernameAvailability({ users: createFakeUserRepository() });

    expect(await checkUsernameAvailability("juanperez")).toEqual({ ok: true, available: true });
  });

  it("informa que no está disponible sin distinguir mayúsculas", async () => {
    const users = createFakeUserRepository([
      {
        id: "p1",
        username: "juanperez",
        googleId: null,
        passwordHash: "hashed:secreto123",
        name: "juanperez",
        email: "juan@a.com",
        avatarUrl: null,
      },
    ]);
    const checkUsernameAvailability = createCheckUsernameAvailability({ users });

    expect(await checkUsernameAvailability("JuanPerez")).toEqual({ ok: true, available: false });
  });

  it("no consulta la base si el formato es inválido", async () => {
    const checkUsernameAvailability = createCheckUsernameAvailability({ users: createFakeUserRepository() });

    expect(await checkUsernameAvailability("juan perez")).toEqual({ ok: false, error: "invalid_username" });
  });
});
