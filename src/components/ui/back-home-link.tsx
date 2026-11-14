import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "./button";

/** Regreso común al inicio o al catálogo, con el mismo aspecto en todas las pantallas. */
export function BackHomeLink({ href = "/", label = "Volver al inicio", className }: {
  href?: "/" | "/#locales";
  label?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(
      buttonVariants({ variant: "brand-outline", size: "touch" }),
      "group min-h-12 gap-3 rounded-xl border-brand/25 bg-brand-soft px-4 font-bold text-brand-ink shadow-soft hover:border-brand hover:bg-white motion-reduce:transform-none motion-reduce:transition-none",
      className,
    )}>
      <span className="flex size-7 items-center justify-center rounded-full bg-white text-brand-ink">
        <ArrowLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
      </span>
      {label}
    </Link>
  );
}