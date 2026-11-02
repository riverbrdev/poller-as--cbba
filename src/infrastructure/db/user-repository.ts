import { eq, type SQL, sql } from "drizzle-orm";
import type {
  CreateUserResult,
  NewUser,
  SetUsernameResult,
  UserRecord,
  UserRepository,
} from "@/application/ports/user-repository";
import type { Db } from "./client";
import { users } from "./schema";
import { userConflictFromError } from "./unique-violation";

type UserRow = typeof users.$inferSelect;

// Devuelve solo los campos del puerto: no filtra createdAt ni role a los casos de uso.
function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    googleId: row.googleId,
    passwordHash: row.passwordHash,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
  };
}

export function createDrizzleUserRepository(db: Db): UserRepository {
  async function findOne(condition: SQL | undefined): Promise<UserRecord | null> {
    const [row] = await db.select().from(users).where(condition).limit(1);
    return row ? toUserRecord(row) : null;
  }

  return {
    findById: (id) => findOne(eq(users.id, id)),
    findByEmail: (email) => findOne(eq(users.email, email)),
    findByGoogleId: (googleId) => findOne(eq(users.googleId, googleId)),
    // El índice único es sobre lower(username), así que la consulta también compara en minúsculas.
    findByUsername: (normalizedUsername) =>
      findOne(sql`lower(${users.username}) = ${normalizedUsername}`),

    async create(newUser: NewUser): Promise<CreateUserResult> {
      try {
        const [row] = await db.insert(users).values(newUser).returning();
        if (!row) {
          throw new Error("Postgres no devolvió la fila insertada en users");
        }
        return { ok: true, user: toUserRecord(row) };
      } catch (error) {
        const conflict = userConflictFromError(error);
        if (conflict) {
          return { ok: false, conflict };
        }
        throw error;
      }
    },

    async setUsername(id: string, normalizedUsername: string): Promise<SetUsernameResult> {
      try {
        const [row] = await db
          .update(users)
          .set({ username: normalizedUsername })
          .where(eq(users.id, id))
          .returning();
        if (!row) {
          throw new Error(`Postgres no encontró el usuario ${id} para actualizar username`);
        }
        return { ok: true, user: toUserRecord(row) };
      } catch (error) {
        if (userConflictFromError(error) === "username_taken") {
          return { ok: false, conflict: "username_taken" };
        }
        throw error;
      }
    },
  };
}
