"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  /** Muestra el medidor de fortaleza (solo al crear la contraseña). */
  showStrength?: boolean;
};

const STRENGTH_LABELS = ["Débil", "Débil", "Regular", "Buena", "Fuerte"] as const;

/** Puntaje de 0 a 4 solo para la vista: la política real está en domain/user/password.ts. */
function strengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function StrengthMeter({ password }: { password: string }) {
  const score = strengthScore(password);
  const barColor = score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-400" : "bg-emerald-500";
  const textColor = score <= 1 ? "text-red-600" : score === 2 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500">Mínimo 8 caracteres.</span>
        <span className={`font-semibold ${textColor}`}>Fortaleza: {STRENGTH_LABELS[score]}</span>
      </div>
      <div className="grid h-1.5 grid-cols-4 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => (
          <div key={bar} className={`h-full rounded-full ${bar <= score ? barColor : "bg-neutral-200"}`} />
        ))}
      </div>
    </div>
  );
}

export function PasswordField({ id, label, autoComplete, showStrength = false }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-neutral-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={showStrength ? "Crea una contraseña segura" : undefined}
          className="h-12 rounded-xl border-[1.5px] border-neutral-300 bg-white pr-12 pl-3.5 text-sm text-neutral-800 shadow-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-neutral-500 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {showStrength ? <StrengthMeter password={password} /> : null}
    </div>
  );
}
