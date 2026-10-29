import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// En local las variables vienen de .env.local; en Vercel/CI ya están en el entorno.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
