/** Códigos de error del voto. El texto visible vive en messages.ts. */
export type RatingErrorCode =
  | "invalid_scores"
  | "comment_too_long"
  | "restaurant_not_found"
  | "username_required"
  | "user_not_found"
  | "already_rated"
  | "rate_limited";

export type RatingFormState =
  | { status: "idle" }
  | { status: "saved"; overall: number }
  | { status: "error"; error: RatingErrorCode | string };
