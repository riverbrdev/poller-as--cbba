"use server";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/composition/auth";
import { useCases, rateLimiters } from "@/composition/container";
import { DUEL_CHOICES } from "@/domain/versus/duel";
import { VERSUS_CACHE_TAG } from "@/app/_data/versus";
export type VersusState = { error?: string; saved?: boolean };
export async function voteVersusAction(_state: VersusState, form: FormData): Promise<VersusState> {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=%2Fversus");
  const parsed = z.enum(DUEL_CHOICES).safeParse(form.get("choice"));
  if (!parsed.success) return { error: "Elige una de las dos pollerías." };
  try {
    const limit = await rateLimiters.versus.limit(`user:${session.user.id}`);
    if (!limit.success) return { error: "Espera un momento antes de intentarlo de nuevo." };
    const result = await useCases.voteVersus(session.user.id, parsed.data);
    if (!result.ok) {
      const messages = {
        invalid_choice: "Elige una de las dos pollerías.",
        user_not_found: "Vuelve a iniciar sesión para votar.",
        username_required: "Completa tu nombre de usuario antes de votar.",
        unavailable: "Este duelo no está disponible por el momento.",
        already_voted: "Ya registraste tu voto en este duelo.",
      };
      revalidatePath("/versus");
      return { error: messages[result.error] };
    }
  } catch {
    return { error: "No pudimos confirmar tu voto. Actualiza la página antes de intentarlo de nuevo." };
  }
  // La franja del duelo en la home está cacheada: updateTag para que quien votó la vea al día.
  updateTag(VERSUS_CACHE_TAG);
  revalidatePath("/versus");
  return { saved: true };
}
