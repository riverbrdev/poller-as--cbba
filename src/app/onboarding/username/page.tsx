import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { checkUsernameAction, chooseUsernameAction, signOutAction } from "@/app/_actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { UsernameForm } from "@/components/auth/username-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/composition/auth";

const TITLE = "Elige tu nombre";
const DESCRIPTION =
  "Este nombre se mostrará públicamente en tus calificaciones. No usaremos tu nombre de Google.";

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
    <AuthCard title={TITLE} subtitle={DESCRIPTION}>
      <p className="text-center text-sm text-muted-foreground">
        Conectada como <span className="font-semibold text-foreground">{session.user.email}</span>
      </p>
      <UsernameForm action={chooseUsernameAction} checkAvailability={checkUsernameAction} />
      <form action={signOutAction} className="text-center">
        <Button type="submit" variant="link" className="min-h-11 text-sm">
          Cerrar sesión
        </Button>
      </form>
    </AuthCard>
  );
}
