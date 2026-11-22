/** `admin` solo lo asignan los casos de uso de la spec 003; toda cuenta nace `user`. */
export type UserRole = "user" | "admin";

/** Usuario tal como lo devuelve el repositorio. `username` es null hasta que la cuenta de Google lo elige. */
export type UserRecord = {
  id: string;
  username: string | null;
  googleId: string | null;
  passwordHash: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
};

/** Sin `role`: ningún alta puede crear un admin directamente (default `user` de la base). */
export type NewUser = Omit<UserRecord, "id" | "role">;

/** Conflictos que la base de datos detecta: los devuelve la infraestructura, no el caso de uso. */
export type UserConflict = "username_taken" | "email_taken" | "google_id_taken";

export type CreateUserResult = { ok: true; user: UserRecord } | { ok: false; conflict: UserConflict };

export type SetUsernameResult = { ok: true; user: UserRecord } | { ok: false; conflict: "username_taken" };

/** Puerto: lo implementa infrastructure/. `username` se pasa ya normalizado (minúsculas). */
export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByGoogleId(googleId: string): Promise<UserRecord | null>;
  findByUsername(normalizedUsername: string): Promise<UserRecord | null>;
  create(user: NewUser): Promise<CreateUserResult>;
  setUsername(id: string, normalizedUsername: string): Promise<SetUsernameResult>;
  /** Un solo UPDATE; no toca otros campos (FR-006). Lanza error si la cuenta no existe. */
  setRole(id: string, role: UserRole): Promise<UserRecord>;
}
