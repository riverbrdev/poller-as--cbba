import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { UserRound } from "lucide-react";
import { checkUsernameAction, chooseUsernameAction, signOutAction } from "@/app/_actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { UsernameForm } from "@/components/auth/username-form";
import { auth } from "@/composition/auth";

const TITLE = "Elige tu nombre";
const DESCRIPTION =
  "Este nombre se mostrará públicamente en tus calificaciones y comentarios. No usaremos tu nombre de Google.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function UsernameOnboardingPage() {
  return (
    <Suspense>
      <UsernameOnboardingContent />
    </Suspense>
  );
}

// Iniciales del nombre de Google para el avatar (por ejemplo "Juan Pérez" → "JP").
function initialsFrom(name: string | null | undefined, email: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

async function UsernameOnboardingContent() {
  // La sesión vive en cookies: la página se renderiza en cada petición.
  await connection();
  // Segunda verificación en el servidor: el proxy solo redirige, no autoriza.
  const session = await auth();
  if (!session?.user.id) {
    redirect("/login");
  }
  if (session.user.username) {
    redirect("/");
  }

  return (
    <AuthCard
      icon={<UserRound className="size-7" aria-hidden="true" />}
      title={TITLE}
      subtitle={DESCRIPTION}
      topSlot={
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[#FCE6DC] bg-[#FFF6F2] p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFE5D9] text-sm font-bold text-auth-brand ring-1 ring-auth-brand/20">
              {initialsFrom(session.user.name, session.user.email)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-wider text-[#9A3412] uppercase">Conectado con Google</p>
              <p className="truncate text-xs font-medium text-gray-700">{session.user.email}</p>
            </div>
          </div>
          <form action={signOutAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-white/80 hover:text-auth-brand"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      }
    >
      <UsernameForm action={chooseUsernameAction} checkAvailability={checkUsernameAction} />

      <div className="mt-6 border-t border-auth-line pt-5 text-center">
        <p className="text-xs leading-relaxed text-neutral-500">
          Podrás empezar a calificar tus <span className="font-semibold text-gray-700">pollerías</span> favoritas de
          Cochabamba de inmediato.
        </p>
      </div>
    </AuthCard>
  );
}
