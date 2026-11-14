import { BackHomeLink } from "@/components/ui/back-home-link";
import type { Metadata } from "next";



import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";
import { HeaderAccount } from "@/app/_components/header-account";
import { voteVersusAction } from "@/app/_actions/versus";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { VersusBoard } from "@/components/versus/versus-board";

export const metadata: Metadata = {
  title: "Lolo Chicken vs. Ricono · ComiDeli",
  description: "Elige tu favorito en el Versus de ComiDeli. Un duelo, dos pollerías y un voto por persona.",
  openGraph: { title: "Lolo Chicken vs. Ricono", description: "¿Quién se lleva tu voto? Participa en el Versus de ComiDeli.", url: "/versus" },
};
export default function VersusPage() {
  return <div className="min-h-screen bg-cream text-ink">
    <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8">
      <div className="mb-6">
        <BackHomeLink />
      </div>
      <Suspense fallback={<p role="status" className="py-16 text-center text-ink-muted">Cargando el duelo…</p>}><Duel /></Suspense>
    </main>
  </div>;
}
async function Duel() {
  await connection();
  const session = await auth();
  const data = await useCases.getVersus(session?.user.id);
  if (!data) return <p className="rounded-2xl border border-line bg-white p-8 text-center">Este duelo no está disponible por el momento.</p>;
  return <VersusBoard data={data} access={!session?.user.id ? "guest" : !session.user.username ? "onboarding" : "ready"} action={voteVersusAction} />;
}
