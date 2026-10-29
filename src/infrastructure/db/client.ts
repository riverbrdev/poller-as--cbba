import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";

export function createDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL. Configúrala en .env.local (ver .env.example).");
  }
  return drizzle(neon(databaseUrl), { schema });
}

export type Db = ReturnType<typeof createDb>;
