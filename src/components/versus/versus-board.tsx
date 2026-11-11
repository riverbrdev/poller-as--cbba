"use client";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, MapPin, Swords, Trophy, UtensilsCrossed } from "lucide-react";
import type { VersusData } from "@/application/versus/versus";
import type { VersusState } from "@/app/_actions/versus";
import type { DuelChoice } from "@/domain/versus/duel";

export function VersusBoard({ data, access, action }: {
  data: VersusData; access: "guest" | "onboarding" | "ready";
  action: (state: VersusState, form: FormData) => Promise<VersusState>;
}) {
  const [state, submit, pending] = useActionState(action, {});
  const leader = data.participants.find((p) => p.slug === data.leader);
  return (
    <div>
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-ink"><Swords size={14} aria-hidden="true" /> Duelo de Cochabamba</span>
        <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Dos pollerías.<br /><span className="text-brand-ink">Una elección.</span></h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink-muted">Lolo Chicken vs. Ricono. Elige tu favorito y dale la ventaja con tu voto.</p>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-bold"><Trophy size={18} className="text-brand-ink" aria-hidden="true" />{data.total === 0 ? "El primer voto puede ser tuyo" : leader ? `${leader.name} va ganando` : "El duelo está empatado"}</p>
        <span className="text-sm text-ink-muted">{data.total} {data.total === 1 ? "voto" : "votos"} en el duelo</span>
      </div>
      <form action={submit}>
        <div className="grid gap-5 sm:grid-cols-2">
          {data.participants.map((restaurant) => {
            const choice = restaurant.slug as DuelChoice;
            const selected = data.choice === choice;
            return <article key={choice} className="overflow-hidden rounded-2xl border border-brand/20 bg-white shadow-card">
              <div className="relative flex justify-center border-b border-line bg-brand-soft p-8">
                <div className="relative aspect-square w-32 overflow-hidden rounded-2xl border border-line bg-white sm:w-40">
                  {restaurant.photoUrl ? <Image src={restaurant.photoUrl} alt={restaurant.name} fill sizes="(min-width: 640px) 10rem, 8rem" loading="eager" className="object-cover" /> : <UtensilsCrossed className="m-auto h-full text-brand-ink" size={48} aria-hidden="true" />}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-2 flex items-center gap-1 text-xs text-ink-muted"><MapPin size={13} aria-hidden="true" />{restaurant.zone}</p>
                <h2 className="text-2xl font-extrabold tracking-tight">{restaurant.name}</h2>
                <div className="mt-6 flex items-end justify-between gap-2">
                  <p className="text-4xl font-black text-brand-ink tabular-nums">{data.percentages[choice]}<span className="text-lg">%</span></p>
                  <p className="pb-1 text-sm text-ink-muted">{data.counts[choice]} votos</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-soft" aria-hidden="true"><div className="h-full rounded-full bg-brand" style={{ width: `${data.percentages[choice]}%` }} /></div>
                {access !== "ready" ? (
                  <Link href={access === "guest" ? "/login?callbackUrl=%2Fversus" : "/onboarding/username?callbackUrl=%2Fversus"} className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-brand-ink px-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark">{access === "guest" ? "Ingresa para votar" : "Completa tu perfil para votar"}</Link>
                ) : (
                  <button type="submit" name="choice" value={choice} disabled={pending || Boolean(data.choice) || state.saved} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-default disabled:opacity-70">
                    {selected && <Check size={18} aria-hidden="true" />}
                    {selected ? "Tu voto está aquí" : data.choice ? "Ya elegiste a tu favorito" : pending ? "Guardando voto…" : state.saved ? "Voto registrado" : `Votar por ${restaurant.name}`}
                  </button>
                )}
                <Link href={`/polleria/${choice}`} className="mt-2 flex min-h-11 items-center justify-center text-xs font-semibold text-ink-muted underline-offset-4 hover:underline">Ver pollería</Link>
              </div>
            </article>;
          })}
        </div>
        <div aria-live="polite" className="mt-4 text-center text-sm">
          {state.error && <p role="alert" className="text-brand-ink">{state.error}</p>}
          {state.saved && <p className="font-semibold text-brand-ink">¡Tu voto ya cuenta en el duelo!</p>}
        </div>
      </form>
      <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-6 text-ink-muted">Un voto por persona en este duelo. Una vez elegido, no se puede cambiar. Esta votación es independiente de las calificaciones. Votación abierta: quien tiene más votos va ganando.</p>
    </div>
  );
}
