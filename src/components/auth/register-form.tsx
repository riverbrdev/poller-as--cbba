"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authMessage } from "./messages";
import { PasswordField } from "./password-field";
import type { FormState } from "./form-state";
import { UsernameField } from "./username-field";

type RegisterFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  checkAvailability: (username: string) => Promise<{ available: boolean | null }>;
};

export function RegisterForm({ action, checkAvailability }: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const errorMessage = authMessage(state.error);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <UsernameField checkAvailability={checkAvailability} />

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

      <PasswordField
        id="password"
        label="Contraseña"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
      />

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="h-12 w-full text-base font-semibold">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
