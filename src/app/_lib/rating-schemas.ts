// Validación en el borde (CLAUDE.md, regla 4). Los límites salen de domain/ para no duplicarlos.
import { z } from "zod";
import { COMMENT_MAX_LENGTH, SCORE_MAX, SCORE_MIN } from "@/domain/rating/criteria";

// `error` en el constructor cubre el campo ausente (NaN tras la coerción); min/max cubren el rango.
const scoreSchema = z.coerce
  .number({ error: "invalid_scores" })
  .int({ message: "invalid_scores" })
  .min(SCORE_MIN, { message: "invalid_scores" })
  .max(SCORE_MAX, { message: "invalid_scores" });

export const ratingSchema = z.object({
  slug: z.string().trim().min(1, { message: "restaurant_not_found" }),
  flavor: scoreSchema,
  portion: scoreSchema,
  service: scoreSchema,
  place: scoreSchema,
  comment: z.string().trim().max(COMMENT_MAX_LENGTH, { message: "comment_too_long" }).optional(),
});
