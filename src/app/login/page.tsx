import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Utensils } from "lucide-react";
import { loginWithGoogleAction, loginWithPasswordAction } from "@/app/_actions/auth";
import { AuthCard, AuthDivider } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";

const TITLE = "Ingresa a ComiDeli";
const DESCRIPTION = "Inicia sesión con Google para calificar pollerías y sugerir nuevas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

type LoginPageProps = {
  // Auth.js y los callbacks de Google devuelven aquí el motivo del error.
  searchParams: Promise<{ error?: string }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <AuthCard
      icon={<Utensils className="size-6" aria-hidden="true" />}
      title={TITLE}
      subtitle={DESCRIPTION}
    >
      <GoogleSignInButton action={loginWithGoogleAction} label="Continuar con Google" />
      <AuthDivider label="o ingresa con tu correo" />
      <LoginForm action={loginWithPasswordAction} initialError={error ?? null} registerHref="/register" />

      <div className="mt-4 border-t border-neutral-100 pt-4 text-center">
        <Link
          href="/"
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-neutral-600 transition-colors hover:bg-orange-50/60 hover:text-auth-brand"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Seguir viendo el ranking
        </Link>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
        Al continuar aceptas los Términos y la Política de Privacidad.
      </p>
    </AuthCard>
  );
}
