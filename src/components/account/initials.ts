/** Iniciales para el avatar sin foto (por ejemplo "Juan Pérez" → "JP"). Si no hay nombre, la inicial del correo. */
export function initialsFrom(name: string | null | undefined, email?: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}
