/**
 * Reglas del nombre público de usuario (`@usuario`) de docs/SPEC.md §3.
 * 3 a 20 caracteres: letras, números y guion bajo. Se compara sin distinguir mayúsculas.
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export type UsernameError = "too_short" | "too_long" | "invalid_characters";

export type UsernameValidation = { valid: true } | { valid: false; error: UsernameError };

export function validateUsername(username: string): UsernameValidation {
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: "too_short" };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: "too_long" };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { valid: false, error: "invalid_characters" };
  }
  return { valid: true };
}

/** Forma en que se guarda y compara el username: sin distinguir mayúsculas. */
export function normalizeUsername(username: string): string {
  return username.toLowerCase();
}
