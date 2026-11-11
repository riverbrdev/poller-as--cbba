import { DUEL_CHOICES, duelResult, isDuelChoice } from "@/domain/versus/duel";
import type { VersusRepository } from "@/application/ports/versus-repository";
import type { RestaurantRepository } from "@/application/ports/restaurant-repository";
import type { UserRepository } from "@/application/ports/user-repository";

type Deps = { votes: VersusRepository; restaurants: RestaurantRepository; users: UserRepository };
export function createGetVersus({ votes, restaurants }: Deps) {
  return async (userId?: string) => {
    const [participants, counts, choice] = await Promise.all([
      Promise.all(DUEL_CHOICES.map((slug) => restaurants.findActiveBySlug(slug))),
      votes.counts(), userId ? votes.choiceFor(userId) : Promise.resolve(null),
    ]);
    if (participants.some((participant) => !participant)) return null;
    return { participants: participants.flatMap((p) => p ? [p] : []), counts, choice, ...duelResult(counts) };
  };
}
export type VersusData = NonNullable<Awaited<ReturnType<ReturnType<typeof createGetVersus>>>>;
export function createVoteVersus({ votes, restaurants, users }: Deps) {
  return async (userId: string, choice: string) => {
    if (!isDuelChoice(choice)) return { ok: false, error: "invalid_choice" } as const;
    const user = await users.findById(userId);
    if (!user) return { ok: false, error: "user_not_found" } as const;
    if (!user.username) return { ok: false, error: "username_required" } as const;
    const participants = await Promise.all(DUEL_CHOICES.map((slug) => restaurants.findActiveBySlug(slug)));
    if (participants.some((p) => !p)) return { ok: false, error: "unavailable" } as const;
    if (!await votes.createIfAbsent(userId, choice)) return { ok: false, error: "already_voted" } as const;
    return { ok: true } as const;
  };
}
