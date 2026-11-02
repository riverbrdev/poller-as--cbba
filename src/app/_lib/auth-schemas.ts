// Validación en el borde (CLAUDE.md, regla 4). Reusa las reglas de domain/ para no duplicarlas.
import { z } from "zod";
import { validatePassword } from "@/domain/user/password";
import { validateUsername } from "@/domain/user/username";

export const usernameSchema = z
  .string()
  .trim()
  .refine((value) => validateUsername(value).valid, { message: "invalid_username" });

export const passwordSchema = z
  .string()
  .refine((value) => validatePassword(value).valid, { message: "invalid_password" });

export const loginSchema = z.object({
  email: z.email({ message: "invalid_email" }),
  password: z.string().min(1, { message: "invalid_credentials" }),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.email({ message: "invalid_email" }),
  password: passwordSchema,
});

export const chooseUsernameSchema = z.object({
  username: usernameSchema,
});
