import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Modelo de datos de docs/SPEC.md §3.

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const restaurantStatus = pgEnum("restaurant_status", ["active", "hidden"]);
export const ratingStatus = pgEnum("rating_status", ["visible", "hidden"]);
export const suggestionStatus = pgEnum("suggestion_status", ["pending", "approved", "rejected"]);
export const reportStatus = pgEnum("report_status", ["open", "resolved"]);

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nombre público (@usuario). Null hasta que la cuenta de Google lo elija en el onboarding.
    username: varchar("username", { length: 20 }),
    // Toda cuenta entra por Google, por contraseña, o por ambos. Varios NULL no chocan
    // en un índice único, así que las cuentas de contraseña no se pisan entre sí.
    googleId: text("google_id").unique(),
    passwordHash: text("password_hash"),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    avatarUrl: text("avatar_url"),
    role: userRole("role").notNull().default("user"),
    createdAt,
  },
  (table) => [
    // SPEC §3: el username es único sin distinguir mayúsculas.
    uniqueIndex("users_username_lower_unique").on(sql`lower(${table.username})`),
    // SPEC §3: toda cuenta entra por al menos un método.
    check(
      "users_auth_method_check",
      sql`${table.googleId} is not null or ${table.passwordHash} is not null`,
    ),
    // Mismas reglas que src/domain/user/username.ts, respaldadas en la base.
    check(
      "users_username_format_check",
      sql`${table.username} is null or ${table.username} ~ '^[a-zA-Z0-9_]{3,20}$'`,
    ),
  ],
);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    zone: text("zone").notNull(),
    address: text("address").notNull(),
    // Opcionales: una pollería aprobada desde una sugerencia puede no traer link ni foto.
    mapsUrl: text("maps_url"),
    photoUrl: text("photo_url"),
    status: restaurantStatus("status").notNull().default("active"),
    createdAt,
  },
  (table) => [index("restaurants_zone_idx").on(table.zone)],
);

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    // SPEC §3: cuatro criterios fijos, cada uno del 1 al 10 (ver src/domain/rating/criteria.ts).
    flavorScore: smallint("flavor_score").notNull(),
    portionScore: smallint("portion_score").notNull(),
    serviceScore: smallint("service_score").notNull(),
    placeScore: smallint("place_score").notNull(),
    comment: varchar("comment", { length: 280 }),
    status: ratingStatus("status").notNull().default("visible"),
    // SPEC §4 regla 8: oculta solo el comentario; la nota sigue contando.
    commentStatus: ratingStatus("comment_status").notNull().default("visible"),
    createdAt,
    // Sin uso en v1: los votos no se editan (SPEC regla 1).
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // SPEC regla 1: una sola calificación por usuario y pollería, garantizado por la base.
    uniqueIndex("ratings_user_restaurant_unique").on(table.userId, table.restaurantId),
    index("ratings_restaurant_idx").on(table.restaurantId),
    // Lista de reseñas de una pollería, de la más reciente a la más antigua, sin ordenar en memoria.
    index("ratings_restaurant_feed_idx").on(
      table.restaurantId,
      table.status,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    check("ratings_flavor_score_range", sql`${table.flavorScore} between 1 and 10`),
    check("ratings_portion_score_range", sql`${table.portionScore} between 1 and 10`),
    check("ratings_service_score_range", sql`${table.serviceScore} between 1 and 10`),
    check("ratings_place_score_range", sql`${table.placeScore} between 1 and 10`),
  ],
);

export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    zone: text("zone").notNull(),
    address: text("address").notNull(),
    mapsUrl: text("maps_url"),
    status: suggestionStatus("status").notNull().default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt,
  },
  (table) => [index("suggestions_status_idx").on(table.status)],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ratingId: uuid("rating_id")
      .notNull()
      .references(() => ratings.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: reportStatus("status").notNull().default("open"),
    createdAt,
  },
  (table) => [index("reports_status_idx").on(table.status)],
);

export const ratingHelpfulVotes = pgTable(
  "rating_helpful_votes",
  {
    ratingId: uuid("rating_id")
      .notNull()
      .references(() => ratings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt,
  },
  // Una marca "Útil" por persona y reseña, garantizado por la base (SPEC regla 9).
  (table) => [primaryKey({ columns: [table.ratingId, table.userId] })],
);
