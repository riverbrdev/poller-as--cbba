import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@/application/ports/password-hasher";

// Costo 10 es el valor por defecto de bcrypt. Sube el costo solo si las funciones de Vercel lo aguantan.
const COST_FACTOR = 10;

export const bcryptPasswordHasher: PasswordHasher = {
  hash: (password) => bcrypt.hash(password, COST_FACTOR),
  verify: (password, hash) => bcrypt.compare(password, hash),
};
