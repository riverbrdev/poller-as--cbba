import type { DuelChoice } from "@/domain/versus/duel";
export interface VersusRepository {
  counts(): Promise<Record<DuelChoice, number>>;
  choiceFor(userId: string): Promise<DuelChoice | null>;
  createIfAbsent(userId: string, choice: DuelChoice): Promise<boolean>;
}
