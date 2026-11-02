"use client";

import { useEffect, useState } from "react";
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

  const statusText = (() => {
    if (trimmed === "" || !isValidFormat) return FORMAT_HINT;
    if (checked?.username !== trimmed) return "Revisando disponibilidad...";
    if (checked.available === null) return FORMAT_HINT;
    return checked.available ? "Disponible." : "Ese nombre de usuario ya está en uso.";
  })();
  const isAvailable = checked?.username === trimmed && checked.available === true;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="username" className="text-sm font-semibold">
        Nombre de usuario
      </Label>
      <div className="flex h-12 items-center rounded-lg border border-input bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <span aria-hidden="true" className="pl-3 text-base text-muted-foreground">
          @
        </span>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-describedby="username-status"
          className="h-full border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0"
        />
      </div>
      <p
        id="username-status"
        aria-live="polite"
        className={isAvailable ? "text-xs text-emerald-700" : "text-xs text-muted-foreground"}
      >
        {statusText}
      </p>
    </div>
  );
}
