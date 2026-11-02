"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authMessage } from "./messages";
import type { FormState } from "./form-state";
import { UsernameField } from "./username-field";

type UsernameFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  checkAvailability: (username: string) => Promise<{ available: boolean | null }>;
};

export function UsernameForm({ action, checkAvailability }: UsernameFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const errorMessage = authMessage(state.error);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <UsernameField checkAvailability={checkAvailability} />

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={pending} className="h-12 w-full text-base font-semibold">
        {pending ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  );
}
