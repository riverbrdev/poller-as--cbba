import { connection } from "next/server";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";
import { VersusStripAction } from "@/components/home/versus-strip";

/**
 * Botón de la franja del duelo según quien mira: depende de la sesión (cookies), así que va dentro
 * de un Suspense y el resto de la home sigue prerenderizada.
 */
export async function ViewerVersusStripAction() {
  await connection();
  const session = await auth();
  if (!session?.user.id) {
    return <VersusStripAction />;
  }
  const data = await useCases.getVersus(session.user.id);
  const votedFor = data?.participants.find((participant) => participant.slug === data.choice)?.name ?? null;
  return <VersusStripAction votedFor={votedFor} />;
}
