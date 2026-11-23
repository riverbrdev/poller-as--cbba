import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";
import { AppTabBar } from "@/app/_components/app-tab-bar";
import { HeaderAccount } from "@/app/_components/header-account";
import { AdminWelcome } from "@/components/admin/admin-welcome";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";

// Ruta bloqueante a propósito: la autorización corre ANTES de que empiece el streaming, así
// notFound() devuelve un 404 real y redirect() un 307 real (FR-013). Dentro de un <Suspense>
// la respuesta ya habría salido con 200. Ver node_modules/next/dist/docs/01-app/02-guides/streaming.md.
export const instant = false;

const ADMIN_CALLBACK = encodeURIComponent("/admin");

/**
 * Autorización en el servidor en cada pedido (spec 003, FR-007). El proxy solo redirige.
 * `cache` la comparte entre generateMetadata y la página: una sola consulta por pedido.
 */
const requireAdmin = cache(async (): Promise<{ username: string }> => {
  await connection();
  const session = await auth();
  if (!session?.user.id) {
    redirect(`/login?callbackUrl=${ADMIN_CALLBACK}`);
  }

  const access = await useCases.getAdminAccess(session.user.id);
  if (access.ok) {
    return access.admin;
  }
  if (access.reason === "needs_username") {
    redirect(`/onboarding/username?callbackUrl=${ADMIN_CALLBACK}`);
  }
  // Para quien no es admin, la misma respuesta que una página que no existe.
  notFound();
});

/**
 * El metadata también pasa por la autorización: si quien mira no es admin, notFound() corta acá y
 * Next.js usa el título de la página 404, así la pestaña tampoco revela que el área existe (FR-013).
 */
export async function generateMetadata(): Promise<Metadata> {
  await requireAdmin();
  // Área privada: no se indexa (además del X-Robots-Tag de next.config.ts). FR-010.
  return { title: "Administración · ComiDeli", robots: { index: false, follow: false } };
}

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <AdminWelcome username={admin.username} />
      </main>
      <AppTabBar />
    </div>
  );
}
