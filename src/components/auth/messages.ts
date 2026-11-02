// Textos visibles de los errores de auth, en español. Los códigos vienen de los casos de uso y de Auth.js.
const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  invalid_email: "Escribe un correo válido.",
  invalid_username: "Usa de 3 a 20 letras, números o guion bajo.",
  invalid_password: "La contraseña debe tener entre 8 y 72 caracteres.",
  username_taken: "Ese nombre de usuario ya está en uso.",
  username_already_set: "Ya elegiste tu nombre de usuario.",
  email_registered_with_password:
    "Ese correo ya está registrado con contraseña. Ingresa con tu correo y contraseña.",
  email_registered_with_google: "Ese correo ya está registrado con Google. Ingresa con Google.",
  google_id_taken: "Esa cuenta de Google ya está registrada. Intenta de nuevo.",
  email_not_allowed: "Este correo todavía no tiene acceso. DeliCocha está en pruebas.",
  rate_limited: "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentar.",
  user_not_found: "No encontramos tu cuenta. Vuelve a ingresar.",
};

export const DEFAULT_AUTH_MESSAGE = "No pudimos completar la acción. Inténtalo de nuevo.";

export function authMessage(code: string | null): string | null {
  if (!code) {
    return null;
  }
  return AUTH_MESSAGES[code] ?? DEFAULT_AUTH_MESSAGE;
}
