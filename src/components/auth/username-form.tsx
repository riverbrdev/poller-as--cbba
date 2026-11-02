"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthAlert } from "./auth-card";
import type { FormState } from "./form-state";
import { authMessage } from "./messages";
import { UsernameField } from "./username-field";

type UsernameFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  checkAvailability: (username: string) => Promise<{ available: boolean | null }>;
};

export function UsernameForm({ action, checkAvailability }: UsernameFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const errorMessage = authMessage(state.error);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {errorMessage ? <AuthAlert message={errorMessage} /> : null}

      <UsernameField checkAvailability={checkAvailability} />

      <Button
        type="submit"
        disabled={pending}
        className="group h-12 w-full gap-2 rounded-xl bg-brand text-base font-bold text-white shadow-md shadow-brand/25 hover:bg-brand-dark"
      >
        {pending ? "Guardando..." : "Continuar"}
        {pending ? null : <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
      </Button>
    </form>
  );
}
