import type { UserConflict } from "@/application/ports/user-repository";

// Código de Postgres para "unique_violation".
const UNIQUE_VIOLATION = "23505";

const CONSTRAINT_TO_CONFLICT: Record<string, UserConflict> = {
  users_username_lower_unique: "username_taken",
  users_email_unique: "email_taken",
  users_google_id_unique: "google_id_taken",
};

type PostgresError = { code?: unknown; constraint?: unknown };

/** Drizzle envuelve el error de Postgres en `cause`, así que buscamos en toda la cadena. */
function findPostgresError(error: unknown): PostgresError | null {
  let current: unknown = error;
  while (current && typeof current === "object") {
    if ("code" in current || "constraint" in current) {
      return current as PostgresError;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

/** Devuelve qué regla de unicidad se rompió, o null si el error no es un conflicto conocido. */
export function userConflictFromError(error: unknown): UserConflict | null {
  const dbError = findPostgresError(error);
  if (dbError?.code !== UNIQUE_VIOLATION || typeof dbError.constraint !== "string") {
    return null;
  }
  return CONSTRAINT_TO_CONFLICT[dbError.constraint] ?? null;
}
