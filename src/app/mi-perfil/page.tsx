import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { signOutAction } from "@/app/_actions/auth";
import { HeaderAccount } from "@/app/_components/header-account";
import { ACCOUNT_TEXT } from "@/components/account/messages";
import { ProfileCard } from "@/components/account/profile-card";
import { PROFILE_HREF } from "@/components/account/routes";
import { ParticipateLink, SiteHeader } from "@/components/home/site-header";
import { auth } from "@/composition/auth";
import { useCases } from "@/composition/container";

export const metadata: Metadata = {
  title: "Mi perfil · ComiDeli",
  description: "Los datos de tu cuenta en ComiDeli.",
  // Página privada: no se indexa.
  robots: { index: false, follow: false },
};

export default function MyProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <SiteHeader account={<Suspense fallback={<ParticipateLink />}><HeaderAccount /></Suspense>} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs text-ink-muted">ComiDeli / Mi perfil</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">{ACCOUNT_TEXT.myProfile}</h1>
              <span className="rounded-full border border-brand/15 bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand-ink">Panel personal</span>
            </div>
          </div>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand/20 bg-white px-4 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand-soft">
            <ChevronLeft size={16} aria-hidden="true" />
            {ACCOUNT_TEXT.backToRanking}
          </Link>
        </div>
        <Suspense fallback={<ProfileSkeleton />}>
          <MyProfile />
        </Suspense>
      </main>
    </div>
  );
}

/** Segunda verificación en el servidor: el proxy solo redirige, no autoriza. */
async function MyProfile() {
  await connection();
  const session = await auth();
  const callbackUrl = encodeURIComponent(PROFILE_HREF);
  if (!session?.user.id) {
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }
  if (!session.user.username) {
    redirect(`/onboarding/username?callbackUrl=${callbackUrl}`);
  }

  const profile = await useCases.getMyProfile(session.user.id);
  if (!profile) {
    // La cuenta ya no existe (por ejemplo, se borró): la sesión no sirve.
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }
  return <ProfileCard profile={profile} signOut={signOutAction} />;
}

function ProfileSkeleton() {
  return <div aria-hidden="true" className="h-96 animate-pulse rounded-2xl border border-line bg-white" />;
}
