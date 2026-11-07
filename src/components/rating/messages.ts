// Textos visibles de los errores del voto, en español. Los códigos vienen del caso de uso y de la acción.
const RATING_MESSAGES: Record<string, string> = {
  invalid_scores: "Elige una nota del 1 al 10 en los cuatro criterios.",
  comment_too_long: "El comentario puede tener hasta 280 caracteres.",
  restaurant_not_found: "Esta pollería ya no está disponible.",
  username_required: "Elige tu nombre de usuario antes de votar.",
  user_not_found: "No encontramos tu cuenta. Vuelve a ingresar.",
  already_rated: "Ya calificaste esta pollería.",
  rate_limited: "Enviaste muchos votos seguidos. Espera un rato y vuelve a intentar.",
};

export const DEFAULT_RATING_MESSAGE = "No pudimos guardar tu voto. Inténtalo de nuevo.";

export function ratingMessage(code: string): string {
  return RATING_MESSAGES[code] ?? DEFAULT_RATING_MESSAGE;
}
