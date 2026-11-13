import { cacheLife, cacheTag } from "next/cache";
import type { DuelChoice } from "@/domain/versus/duel";
import { useCases } from "@/composition/container";

/** Etiqueta de caché del duelo: un voto en /versus la invalida y la franja de la home se refresca. */
export const VERSUS_CACHE_TAG = "versus";

export type VersusParticipantDto = { slug: DuelChoice; name: string; zone: string; photoUrl: string | null };

/** Lo público del duelo (sin el voto de quien mira). Serializable: lo recibe un componente de cliente. */
export type VersusSummaryDto = {
  participants: [VersusParticipantDto, VersusParticipantDto];
  counts: Record<DuelChoice, number>;
  percentages: Record<DuelChoice, number>;
  total: number;
  leader: DuelChoice | null;
};

/** Resumen del duelo para la home. Se cachea como el catálogo, así la home sigue prerenderizada. */
export async function getVersusSummary(): Promise<VersusSummaryDto | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(VERSUS_CACHE_TAG);
  return loadSummary();
}

/** Lo mismo con una caché corta (15 s): lo consulta la franja cada 30 s para mostrar el duelo en vivo. */
export async function getVersusLive(): Promise<VersusSummaryDto | null> {
  "use cache";
  cacheLife({ stale: 0, revalidate: 15, expire: 60 });
  cacheTag(VERSUS_CACHE_TAG);
  return loadSummary();
}

async function loadSummary(): Promise<VersusSummaryDto | null> {
  const data = await useCases.getVersus();
  if (!data) return null;
  const [left, right] = data.participants.map(({ slug, name, zone, photoUrl }) => ({
    slug: slug as DuelChoice,
    name,
    zone,
    photoUrl,
  }));
  if (!left || !right) return null;
  return { participants: [left, right], counts: data.counts, percentages: data.percentages, total: data.total, leader: data.leader };
}
