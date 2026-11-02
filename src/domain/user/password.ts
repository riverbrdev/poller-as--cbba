/**
 * Política de contraseñas para el registro con correo (docs/SPEC.md §4, regla 2c).
 * Mínimo 8 caracteres. Máximo 72 bytes: bcrypt ignora todo lo que pase de ese límite,
 * así que una contraseña más larga daría la falsa idea de ser más segura.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

export type PasswordError = "too_short" | "too_long";

export type PasswordValidation = { valid: true } | { valid: false; error: PasswordError };

export function validatePassword(password: string): PasswordValidation {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: "too_short" };
  }
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
    return { valid: false, error: "too_long" };
  }
  return { valid: true };
}
