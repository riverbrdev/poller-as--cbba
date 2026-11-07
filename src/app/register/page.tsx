import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { checkUsernameAction, loginWithGoogleAction, registerAction } from "@/app/_actions/auth";
import { AuthCard, AuthDivider } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { RegisterForm } from "@/components/auth/register-form";
import { safeCallbackPath } from "@/domain/user/access";

const TITLE = "Crea tu cuenta";
const DESCRIPTION = "Elige tu nombre y empieza a calificar pollerías.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

type RegisterPageProps = {
  // Viene de "Crear cuenta" en el login cuando la persona quería votar una pollería.
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <Suspense>
      <RegisterContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterContent({ searchParams }: RegisterPageProps) {
  const { callbackUrl: rawCallbackUrl } = await searchParams;
  // Solo rutas internas (evita redirecciones abiertas). Sin destino, se mantiene el flujo de siempre.
  const callbackUrl = rawCallbackUrl ? safeCallbackPath(rawCallbackUrl) : undefined;
  const loginHref = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";

  return (
    <AuthCard icon={<UserPlus className="size-6" aria-hidden="true" />} title={TITLE} subtitle={DESCRIPTION}>
      <GoogleSignInButton action={loginWithGoogleAction} label="Registrarse con Google" callbackUrl={callbackUrl} />
      <AuthDivider label="o" />
      <RegisterForm action={registerAction} checkAvailability={checkUsernameAction} callbackUrl={callbackUrl} />

      <p className="mt-5 text-center text-sm text-auth-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={loginHref}
          className="inline-flex min-h-11 items-center font-bold text-auth-brand underline-offset-2 hover:text-auth-brand-dark hover:underline"
        >
          Ingresar
        </Link>
      </p>

      <div className="mt-3 border-t border-neutral-100 pt-3 text-center">
        <Link
          href="/"
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-neutral-600 transition-colors hover:bg-orange-50/60 hover:text-auth-brand"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Seguir viendo el ranking
        </Link>
      </div>

      <p className="mt-4 border-t border-neutral-100 pt-3 text-center text-xs leading-relaxed text-neutral-500">
        Al crear tu cuenta aceptas los Términos y la Política de Privacidad.
      </p>
    </AuthCard>
  );
}
