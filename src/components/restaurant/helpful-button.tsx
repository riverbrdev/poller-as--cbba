"use client";

import { Suspense, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { HELPFUL_TEXT, helpfulErrorMessage } from "./messages";
import { useViewerState } from "./viewer-state";

export type HelpfulActionResult = { ok: true; helpful: boolean; helpfulCount: number } | { ok: false; error: string };

type HelpfulButtonProps = {
  ratingId: string;
  slug: string;
  /** Contador que vino de la lista (cacheada). */
  initialCount: number;
  action: (formData: FormData) => Promise<HelpfulActionResult>;
};

const pillClass = (marked: boolean) =>
  cn(
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-bold transition-colors",
    marked
      ? "border-brand-dark bg-brand-dark text-white"
      : "border-line bg-surface-soft text-ink hover:border-brand-ink hover:text-brand-ink",
  );

function Label({ count }: { count: number }) {
  return (
    <>
      <ThumbsUp size={16} aria-hidden="true" />
      {HELPFUL_TEXT.label(count)}
    </>
  );
}

/** "Útil (N)" mientras se sabe quién mira: muestra el contador sin acciones. */
function StaticHelpful({ count }: { count: number }) {
  return (
    <span className={cn(pillClass(false), "cursor-default")}>
      <Label count={count} />
    </span>
  );
}

function InteractiveHelpful({ ratingId, slug, initialCount, action }: HelpfulButtonProps) {
  const viewer = useViewerState();
  const callbackUrl = encodeURIComponent(`/polleria/${slug}`);

  const [confirmed, setConfirmed] = useState({ count: initialCount, marked: viewer.helpfulRatingIds.includes(ratingId) });
  const [optimistic, setOptimistic] = useOptimistic(confirmed, (_current, next: typeof confirmed) => next);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!viewer.signedIn) {
    return (
      <Link href={`/login?callbackUrl=${callbackUrl}`} className={pillClass(false)}>
        <Label count={initialCount} />
      </Link>
    );
  }
  if (!viewer.canMarkHelpful) {
    return (
      <Link href={`/onboarding/username?callbackUrl=${callbackUrl}`} className={pillClass(false)}>
        <Label count={initialCount} />
      </Link>
    );
  }
  if (viewer.myRatingId === ratingId) {
    return (
      <button type="button" disabled title={HELPFUL_TEXT.ownReview} className={cn(pillClass(false), "cursor-not-allowed opacity-60")}>
        <Label count={confirmed.count} />
      </button>
    );
  }

  const toggle = () => {
    // Se manda el estado deseado, no un "toggle": tocar dos veces no suma dos.
    const desired = !optimistic.marked;
    setError(null);
    startTransition(async () => {
      setOptimistic({ marked: desired, count: Math.max(0, optimistic.count + (desired ? 1 : -1)) });
      const formData = new FormData();
      formData.set("ratingId", ratingId);
      formData.set("helpful", String(desired));
      formData.set("slug", slug);
      const result = await action(formData);
      startTransition(() => {
        if (result.ok) {
          // El contador real que devolvió el servidor corrige el optimista.
          setConfirmed({ marked: result.helpful, count: result.helpfulCount });
        } else {
          setError(helpfulErrorMessage(result.error));
        }
      });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={toggle} aria-pressed={optimistic.marked} aria-busy={pending} className={pillClass(optimistic.marked)}>
        <Label count={optimistic.count} />
      </button>
      {error ? (
        <p role="status" className="text-xs font-semibold text-brand-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Botón "Útil" de una reseña con comentario. Lee de quien mira si puede marcar, si ya marcó y si es su reseña. */
export function HelpfulButton(props: HelpfulButtonProps) {
  return (
    <Suspense fallback={<StaticHelpful count={props.initialCount} />}>
      <InteractiveHelpful {...props} />
    </Suspense>
  );
}
