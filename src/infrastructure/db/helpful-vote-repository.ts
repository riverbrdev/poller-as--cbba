import { and, eq, inArray, sql } from "drizzle-orm";
import type { HelpfulVoteRepository } from "@/application/ports/helpful-vote-repository";
import type { Db } from "./client";
import { ratingHelpfulVotes } from "./schema";

/** Marcas "Útil". Cada operación es una sola sentencia atómica (el driver HTTP de Neon no tiene transacciones). */
export function createDrizzleHelpfulVoteRepository(db: Db): HelpfulVoteRepository {
  return {
    async add(ratingId, userId) {
      // La PK (rating_id, user_id) garantiza una marca por persona: marcar dos veces no suma dos.
      await db
        .insert(ratingHelpfulVotes)
        .values({ ratingId, userId })
        .onConflictDoNothing({ target: [ratingHelpfulVotes.ratingId, ratingHelpfulVotes.userId] });
    },

    async remove(ratingId, userId) {
      await db
        .delete(ratingHelpfulVotes)
        .where(and(eq(ratingHelpfulVotes.ratingId, ratingId), eq(ratingHelpfulVotes.userId, userId)));
    },

    async count(ratingId) {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ratingHelpfulVotes)
        .where(eq(ratingHelpfulVotes.ratingId, ratingId));
      return Number(row?.count ?? 0);
    },

    async markedBy(userId, ratingIds) {
      if (ratingIds.length === 0) {
        return [];
      }
      const rows = await db
        .select({ ratingId: ratingHelpfulVotes.ratingId })
        .from(ratingHelpfulVotes)
        .where(and(eq(ratingHelpfulVotes.userId, userId), inArray(ratingHelpfulVotes.ratingId, ratingIds)));
      return rows.map((row) => row.ratingId);
    },
  };
}
