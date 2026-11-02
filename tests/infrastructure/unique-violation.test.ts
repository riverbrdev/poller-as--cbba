import { describe, expect, it } from "vitest";
import { userConflictFromError } from "@/infrastructure/db/unique-violation";

// Drizzle envuelve el error de Postgres dentro de `cause`.
function wrapped(code: string, constraint: string) {
  return new Error("Failed query", { cause: { code, constraint } });
}

describe("userConflictFromError", () => {
  it.each([
    ["users_username_lower_unique", "username_taken"],
    ["users_email_unique", "email_taken"],
    ["users_google_id_unique", "google_id_taken"],
  ])("traduce la restricción %s a %s", (constraint, conflict) => {
    expect(userConflictFromError(wrapped("23505", constraint))).toBe(conflict);
  });

  it("reconoce el error cuando viene directo, sin envoltura", () => {
    expect(userConflictFromError({ code: "23505", constraint: "users_email_unique" })).toBe("email_taken");
  });

  it("no trata como conflicto una violación de otra restricción", () => {
    expect(userConflictFromError(wrapped("23514", "users_auth_method_check"))).toBeNull();
  });

  it("no trata como conflicto una restricción única desconocida", () => {
    expect(userConflictFromError(wrapped("23505", "ratings_user_restaurant_unique"))).toBeNull();
  });

  it("devuelve null para errores que no son de Postgres", () => {
    expect(userConflictFromError(new Error("timeout"))).toBeNull();
    expect(userConflictFromError(undefined)).toBeNull();
  });
});
