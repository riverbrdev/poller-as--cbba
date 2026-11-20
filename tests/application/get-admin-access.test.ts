import { describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/application/ports/user-repository";
import { createGetAdminAccess } from "@/application/admin/get-admin-access";
import { parseAdminAllowlist } from "@/domain/user/admin";
import { createFakeUserRepository } from "./fakes";

const juanIsAdmin = parseAdminAllowlist("juan@gmail.com");

function account(
  overrides: { googleId?: string | null; role?: UserRole; username?: string | null; email?: string } = {},
) {
  return {
    id: "u1",
    username: "juan",
    googleId: "google-1",
    passwordHash: null,
    name: "Juan Pérez",
    email: "juan@gmail.com",
    avatarUrl: null,
    role: "admin" as UserRole,
    ...overrides,
  };
}

describe("getAdminAccess", () => {
  it("rechaza una cuenta que no existe", async () => {
    const getAdminAccess = createGetAdminAccess({ users: createFakeUserRepository(), adminEmails: juanIsAdmin });

    expect(await getAdminAccess("nadie")).toEqual({ ok: false, reason: "not_admin" });
  });

  it("deja pasar a una cuenta de Google admin con correo en la lista, sin exponer correo ni nombre (FR-011)", async () => {
    const getAdminAccess = createGetAdminAccess({
      users: createFakeUserRepository([account()]),
      adminEmails: juanIsAdmin,
    });

    const result = await getAdminAccess("u1");

    expect(result).toEqual({ ok: true, admin: { username: "juan" } });
    expect(JSON.stringify(result)).not.toMatch(/gmail|Pérez/);
  });

  it("pide elegir username a un admin que todavía no lo tiene", async () => {
    const getAdminAccess = createGetAdminAccess({
      users: createFakeUserRepository([account({ username: null })]),
      adminEmails: juanIsAdmin,
    });

    expect(await getAdminAccess("u1")).toEqual({ ok: false, reason: "needs_username" });
  });

  it("no sube el rol: una cuenta user con correo en la lista sigue sin acceso hasta que ingrese con Google", async () => {
    const users = createFakeUserRepository([account({ role: "user" })]);
    const setRole = vi.spyOn(users, "setRole");
    const getAdminAccess = createGetAdminAccess({ users, adminEmails: juanIsAdmin });

    expect(await getAdminAccess("u1")).toEqual({ ok: false, reason: "not_admin" });
    expect(setRole).not.toHaveBeenCalled();
  });

  it("un admin con sesión cuyo correo se quitó de la lista pierde el acceso en ese mismo pedido (US3-1, FR-007)", async () => {
    const users = createFakeUserRepository([account()]);
    const getAdminAccess = createGetAdminAccess({ users, adminEmails: parseAdminAllowlist("ana@gmail.com") });

    expect(await getAdminAccess("u1")).toEqual({ ok: false, reason: "not_admin" });
    // Baja a usuario sin tocar nada más (FR-006).
    expect(users.all()[0]).toMatchObject({
      role: "user",
      username: "juan",
      email: "juan@gmail.com",
      name: "Juan Pérez",
      googleId: "google-1",
    });
  });

  it("con la lista vacía o sin configurar nadie entra (edge case)", async () => {
    const users = createFakeUserRepository([account()]);
    const getAdminAccess = createGetAdminAccess({ users, adminEmails: parseAdminAllowlist(undefined) });

    expect(await getAdminAccess("u1")).toEqual({ ok: false, reason: "not_admin" });
    expect(users.all()[0]?.role).toBe("user");
  });

  it("una cuenta de contraseña nunca entra, aunque su rol diga admin y su correo esté en la lista (FR-005)", async () => {
    const users = createFakeUserRepository([account({ googleId: null })]);
    const getAdminAccess = createGetAdminAccess({ users, adminEmails: juanIsAdmin });

    expect(await getAdminAccess("u1")).toEqual({ ok: false, reason: "not_admin" });
    expect(users.all()[0]?.role).toBe("user");
  });
});
