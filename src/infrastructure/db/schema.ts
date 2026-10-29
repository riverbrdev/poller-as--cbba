import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: text("google_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  role: userRole("role").notNull().default("user"),
  createdAt,
});

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
    stars: smallint("stars").notNull(),
    comment: varchar("comment", { length: 280 }),
    status: ratingStatus("status").notNull().default("visible"),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // SPEC regla 1: una sola calificación por usuario y pollería, garantizado por la base.
    uniqueIndex("ratings_user_restaurant_unique").on(table.userId, table.restaurantId),
    index("ratings_restaurant_idx").on(table.restaurantId),
    check("ratings_stars_range", sql`${table.stars} between 1 and 5`),
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
