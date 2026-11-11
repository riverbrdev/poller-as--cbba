"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, SquarePen } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SHARE_TEXT } from "./messages";

type DetailActionsProps = {
  slug: string;
  name: string;
};

type ShareStatus = "idle" | "copied" | "failed";

/**
 * Acciones principales del perfil: calificar (al alcance del pulgar) y compartir.
 * Compartir usa el menú del sistema si existe; si no, copia el enlace.
 */
export function DetailActions({ slug, name }: DetailActionsProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  const share = async () => {
    const url = window.location.href.split("#")[0] ?? window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: SHARE_TEXT.title(name), url });
        return;
      } catch (error) {
        // La persona cerró el menú de compartir: no es un error.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Link href={`/calificar/${slug}`} className={cn(buttonVariants({ variant: "brand", size: "touch-lg" }), "min-w-0 flex-1 px-4")}>
          <SquarePen aria-hidden="true" />
          {SHARE_TEXT.rate}
        </Link>
        {/* En pantallas angostas solo el ícono, para que "Calificar" quepa entero; el nombre sigue para lectores de pantalla. */}
        <button
          type="button"
          onClick={share}
          aria-label={SHARE_TEXT.share}
          className={cn(buttonVariants({ variant: "brand-outline", size: "touch-lg" }), "w-12 shrink-0 px-0 min-[420px]:w-auto min-[420px]:px-4")}
        >
          <Share2 aria-hidden="true" />
          <span className="hidden min-[420px]:inline">{SHARE_TEXT.share}</span>
        </button>
      </div>
      <p role="status" className="min-h-5 text-center text-sm font-semibold text-brand-ink">
        {status === "copied" ? SHARE_TEXT.copied : status === "failed" ? SHARE_TEXT.failed : ""}
      </p>
    </div>
  );
}
