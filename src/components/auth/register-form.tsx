"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAlert } from "./auth-card";
import type { FormState } from "./form-state";
import { authMessage } from "./messages";
import { PasswordField } from "./password-field";
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
      {errorMessage ? <AuthAlert message={errorMessage} /> : null}

      <UsernameField checkAvailability={checkAvailability} />

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
          className="h-12 rounded-xl border-[1.5px] border-neutral-300 bg-white px-3.5 text-sm text-neutral-800 shadow-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      <PasswordField id="password" label="Contraseña" autoComplete="new-password" showStrength />

      <Button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 w-full rounded-xl bg-brand text-sm font-bold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
      >
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
