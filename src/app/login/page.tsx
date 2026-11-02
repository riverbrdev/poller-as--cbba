import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { loginWithGoogleAction, loginWithPasswordAction } from "@/app/_actions/auth";
import { AuthCard, AuthDivider } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";

const TITLE = "Ingresa a DeliCocha";
const DESCRIPTION = "Inicia sesión para calificar pollerías y sugerir nuevas.";

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
    <AuthCard title={TITLE} subtitle={DESCRIPTION}>
      <GoogleSignInButton action={loginWithGoogleAction} label="Continuar con Google" />
      <AuthDivider label="o ingresa con tu correo" />
      <LoginForm action={loginWithPasswordAction} initialError={error ?? null} registerHref="/register" />
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        Seguir viendo el ranking
      </Link>
    </AuthCard>
  );
}
