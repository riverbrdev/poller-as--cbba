import { describe, expect, it } from "vitest";
import type { AdminAccess } from "@/application/admin/get-admin-access";
import { createPostSignInDestination } from "@/application/admin/post-sign-in-destination";

const destinationFor = (access: AdminAccess) =>
  createPostSignInDestination({ getAdminAccess: async () => access });

describe("postSignInDestination", () => {
  it("lleva a un admin a /admin aunque haya pedido otra página (edge case de origen)", async () => {
    const postSignInDestination = destinationFor({ ok: true, admin: { username: "juan" } });

    expect(await postSignInDestination("u1", "/polleria/lolo")).toBe("/admin");
  });

  it("deja a un usuario normal en el destino que pidió (US2-3)", async () => {
    const postSignInDestination = destinationFor({ ok: false, reason: "not_admin" });

    expect(await postSignInDestination("u1", "/polleria/lolo")).toBe("/polleria/lolo");
  });

  it("si al admin le falta el username, respeta el destino (el onboarding lo pide antes)", async () => {
    const postSignInDestination = destinationFor({ ok: false, reason: "needs_username" });

    expect(await postSignInDestination("u1", "/")).toBe("/");
  });
});
