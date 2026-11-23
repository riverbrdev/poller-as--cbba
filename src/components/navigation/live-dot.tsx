import { cn } from "@/components/lib/utils";

/** Puntito "en vivo" del Versus: late suave y se queda quieto con "reducir movimiento". */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex size-full rounded-full bg-current opacity-75 motion-safe:animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-current" />
    </span>
  );
}
