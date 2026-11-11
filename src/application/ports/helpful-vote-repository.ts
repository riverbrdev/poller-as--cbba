/**
 * Marcas "Útil" (SPEC regla 9). Puerto: lo implementa infrastructure/.
 * La base garantiza una marca por persona y reseña con la clave primaria (rating_id, user_id).
 */
export interface HelpfulVoteRepository {
  /** INSERT … ON CONFLICT DO NOTHING sobre la PK: marcar dos veces no suma dos (idempotente). */
  add(ratingId: string, userId: string): Promise<void>;
  /** Quita la marca si existe; si no, no hace nada (idempotente). */
  remove(ratingId: string, userId: string): Promise<void>;
  /** Cantidad de personas distintas que marcaron la reseña. Se cuenta siempre, no hay contador guardado. */
  count(ratingId: string): Promise<number>;
  /** De `ratingIds`, cuáles marcó esta persona. Con lista vacía devuelve [] sin consultar. */
  markedBy(userId: string, ratingIds: string[]): Promise<string[]>;
}
