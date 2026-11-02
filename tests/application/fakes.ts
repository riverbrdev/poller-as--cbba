import type { PasswordHasher } from "@/application/ports/password-hasher";
import type {
  CreateUserResult,
  NewUser,
  SetUsernameResult,
  UserRecord,
  UserRepository,
} from "@/application/ports/user-repository";

/**
 * Repositorio en memoria que respeta los mismos índices únicos que la base:
 * username sin distinguir mayúsculas, email y google_id.
 */
export function createFakeUserRepository(initial: UserRecord[] = []): UserRepository & {
  all(): UserRecord[];
} {
  const users = new Map<string, UserRecord>(initial.map((user) => [user.id, { ...user }]));
  let nextId = 1;

  const findWhere = (predicate: (user: UserRecord) => boolean) =>
    [...users.values()].find(predicate) ?? null;

  return {
    all: () => [...users.values()],
    findById: async (id) => findWhere((user) => user.id === id),
    findByEmail: async (email) => findWhere((user) => user.email === email),
    findByGoogleId: async (googleId) => findWhere((user) => user.googleId === googleId),
    findByUsername: async (username) =>
      findWhere((user) => user.username?.toLowerCase() === username),
    async create(newUser: NewUser): Promise<CreateUserResult> {
      if (newUser.username && findWhere((u) => u.username?.toLowerCase() === newUser.username)) {
        return { ok: false, conflict: "username_taken" };
      }
      if (findWhere((u) => u.email === newUser.email)) {
        return { ok: false, conflict: "email_taken" };
      }
      if (newUser.googleId && findWhere((u) => u.googleId === newUser.googleId)) {
        return { ok: false, conflict: "google_id_taken" };
      }
      const user: UserRecord = { ...newUser, id: `user-${nextId++}` };
      users.set(user.id, user);
      return { ok: true, user };
    },
    async setUsername(id, username): Promise<SetUsernameResult> {
      const current = users.get(id);
      if (!current) {
        throw new Error(`usuario ${id} no existe en el fake`);
      }
      if (findWhere((u) => u.id !== id && u.username?.toLowerCase() === username)) {
        return { ok: false, conflict: "username_taken" };
      }
      const updated = { ...current, username };
      users.set(id, updated);
      return { ok: true, user: updated };
    },
  };
}

/** Hash falso y reversible: solo para probar la lógica, nunca bcrypt real. */
export const fakeHasher: PasswordHasher = {
  hash: async (password) => `hashed:${password}`,
  verify: async (password, hash) => hash === `hashed:${password}`,
};
