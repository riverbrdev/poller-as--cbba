"use client";

import { createContext, use, useEffect, type ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import { REVIEW_TEXT } from "./messages";
import { ANONYMOUS_VIEWER, type ViewerState } from "./viewer-state-types";

// El estado de quien mira llega como promesa: la lista cacheada no espera a la sesión.
const ViewerStateContext = createContext<Promise<ViewerState>>(Promise.resolve(ANONYMOUS_VIEWER));

export function ViewerStateProvider({ value, children }: { value: Promise<ViewerState>; children: ReactNode }) {
  return <ViewerStateContext value={value}>{children}</ViewerStateContext>;
}

/** Lee el estado de quien mira. Suspende hasta que llega: usar dentro de su propio <Suspense>. */
export function useViewerState(): ViewerState {
  return use(use(ViewerStateContext));
}

export const MY_REVIEW_ANCHOR = "mi-resena";

/**
 * Sello "Tu reseña" y ancla #mi-resena en la reseña propia. Como aparece después de cargar la página,
 * hace el scroll al ancla por su cuenta cuando se llega con "Ver tu reseña".
 */
export function MyReviewBadge({ ratingId }: { ratingId: string }) {
  const { myRatingId } = useViewerState();
  const isMine = myRatingId === ratingId;

  useEffect(() => {
    if (isMine && window.location.hash === `#${MY_REVIEW_ANCHOR}`) {
      document.getElementById(MY_REVIEW_ANCHOR)?.scrollIntoView({ block: "center" });
    }
  }, [isMine]);

  if (!isMine) {
    return null;
  }
  return (
    <span id={MY_REVIEW_ANCHOR} className="inline-flex scroll-mt-24 items-center gap-1 rounded-full bg-brand-dark px-2.5 py-1 text-xs font-bold text-white">
      <BadgeCheck size={13} aria-hidden="true" />
      {REVIEW_TEXT.mine}
    </span>
  );
}
