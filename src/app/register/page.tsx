import type { Metadata } from "next";
import Link from "next/link";
import { checkUsernameAction, loginWithGoogleAction, registerAction } from "@/app/_actions/auth";
import { AuthCard, AuthDivider } from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { RegisterForm } from "@/components/auth/register-form";

const TITLE = "Crea tu cuenta";
const DESCRIPTION = "Elige tu nombre y empieza a calificar pollerías.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

export default function RegisterPage() {
  return (
    <AuthCard title={TITLE} subtitle={DESCRIPTION}>
      <GoogleSignInButton action={loginWithGoogleAction} label="Registrarse con Google" />
      <AuthDivider label="o regístrate con tu correo" />
      <RegisterForm action={registerAction} checkAvailability={checkUsernameAction} />
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-2 hover:underline"
        >
          Ingresar
        </Link>
      </p>
    </AuthCard>
  );
}
