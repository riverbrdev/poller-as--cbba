"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateUsername } from "@/domain/user/username";

type Availability = { username: string; available: boolean | null };

type UsernameFieldProps = {
  checkAvailability: (username: string) => Promise<{ available: boolean | null }>;
};

const DEBOUNCE_MS = 400;
const FORMAT_HINT = "3 a 20 caracteres: letras, números y guion bajo.";

export function UsernameField({ checkAvailability }: UsernameFieldProps) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<Availability | null>(null);

  const trimmed = value.trim();
  const isValidFormat = trimmed !== "" && validateUsername(trimmed).valid;

  // Solo se consulta la base si el formato es válido, y con una pausa para no preguntar en cada tecla.
  useEffect(() => {
    if (!isValidFormat) {
      return;
    }
    const timer = setTimeout(async () => {
      const result = await checkAvailability(trimmed);
      setChecked({ username: trimmed, available: result.available });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, isValidFormat, checkAvailability]);

  const current = checked?.username === trimmed ? checked.available : undefined;
  const isAvailable = current === true;
  const isTaken = current === false;

  const borderClass = isAvailable
    ? "border-emerald-500 focus-within:ring-emerald-500/20"
    : isTaken
      ? "border-red-400 focus-within:ring-red-400/20"
      : "border-neutral-300 focus-within:border-auth-brand focus-within:ring-auth-brand";

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="username" className="text-xs font-semibold text-neutral-700">
          Nombre de usuario
        </Label>
        {isAvailable ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <Check className="size-3.5" aria-hidden="true" />
            Disponible
          </span>
        ) : null}
      </div>

      <div className={`flex h-12 items-center overflow-hidden rounded-xl border-[1.5px] bg-white transition-colors focus-within:ring-2 ${borderClass}`}>
        <span aria-hidden="true" className="pl-3.5 text-sm font-bold text-neutral-400">
          @
        </span>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="tu_usuario"
          aria-describedby="username-status"
          className="h-full border-0 bg-transparent px-1.5 text-sm font-medium text-neutral-800 shadow-none focus-visible:ring-0"
        />
      </div>

      <p id="username-status" aria-live="polite" className="text-xs">
        {isTaken ? (
          <span className="text-red-700">Ese nombre de usuario ya está en uso.</span>
        ) : isAvailable ? (
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <Check className="size-3.5 shrink-0" aria-hidden="true" />
            @{trimmed} está disponible
          </span>
        ) : (
          <span className="text-neutral-500">
            {trimmed !== "" && !isValidFormat ? FORMAT_HINT : trimmed !== "" ? "Revisando disponibilidad..." : FORMAT_HINT}
          </span>
        )}
      </p>
    </div>
  );
}
