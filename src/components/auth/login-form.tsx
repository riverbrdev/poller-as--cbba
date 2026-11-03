"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAlert } from "./auth-card";
import { authMessage } from "./messages";
import { PasswordField } from "./password-field";
import type { FormState } from "./form-state";

type LoginFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialError: string | null;
  registerHref: string;
};

export function LoginForm({ action, initialError, registerHref }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: initialError });
  const errorMessage = authMessage(state.error);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {errorMessage ? <AuthAlert message={errorMessage} /> : null}

      <div className="grid gap-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-neutral-700">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ejemplo@correo.com"
          required
          className="h-12 rounded-xl border-[1.5px] border-neutral-300 bg-white px-3.5 text-sm text-neutral-800 shadow-none focus-visible:border-auth-brand focus-visible:ring-2 focus-visible:ring-auth-brand"
        />
      </div>

      <PasswordField id="password" label="Contraseña" autoComplete="current-password" />

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-12 w-full rounded-xl bg-auth-brand text-base font-bold text-white shadow-md hover:bg-auth-brand-dark"
      >
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href={registerHref}
          className="inline-flex min-h-11 items-center font-bold text-auth-brand underline-offset-2 hover:text-auth-brand-dark hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
