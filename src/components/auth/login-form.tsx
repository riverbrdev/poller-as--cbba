"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="grid gap-1.5">
        <Label htmlFor="email" className="text-sm font-semibold">
          Correo electrónico
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 text-base"
        />
      </div>

      <PasswordField id="password" label="Contraseña" autoComplete="current-password" />

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="h-12 w-full text-base font-semibold">
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href={registerHref} className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-2 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
