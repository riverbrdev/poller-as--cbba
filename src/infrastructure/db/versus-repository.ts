import { and, eq, sql } from "drizzle-orm";
import { DUEL_ID, type DuelChoice } from "@/domain/versus/duel";
import type { VersusRepository } from "@/application/ports/versus-repository";
import type { Db } from "./client";
import { versusVotes } from "./schema";
export function createDrizzleVersusRepository(db: Db): VersusRepository {
  return {
    async counts() {
      const rows = await db.select({ choice: versusVotes.choice, count: sql<number>`count(*)::int` })
        .from(versusVotes).where(eq(versusVotes.duelId, DUEL_ID)).groupBy(versusVotes.choice);
      const counts: Record<DuelChoice, number> = { "lolo-chicken": 0, ricono: 0 };
      for (const row of rows) counts[row.choice] = Number(row.count);
      return counts;
    },
    async choiceFor(userId) {
      const [row] = await db.select({ choice: versusVotes.choice }).from(versusVotes)
        .where(and(eq(versusVotes.duelId, DUEL_ID), eq(versusVotes.userId, userId))).limit(1);
      return row?.choice ?? null;
    },
    async createIfAbsent(userId, choice) {
      const rows = await db.insert(versusVotes).values({ duelId: DUEL_ID, userId, choice })
        .onConflictDoNothing({ target: [versusVotes.duelId, versusVotes.userId] }).returning({ userId: versusVotes.userId });
      return rows.length === 1;
    },
  };
}
