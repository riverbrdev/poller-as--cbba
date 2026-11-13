import { connection } from "next/server";
import { getVersusLive } from "@/app/_data/versus";

/**
 * Resultado público del duelo para la franja de la home, que lo consulta cada 30 s.
 * Sale de una caché corta (15 s) con la etiqueta del duelo: muchas visitas no golpean la base y un voto la refresca.
 */
export async function GET() {
  await connection();
  const summary = await getVersusLive();
  if (!summary) {
    return Response.json({ error: "unavailable" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(summary, { headers: { "Cache-Control": "no-store" } });
}
