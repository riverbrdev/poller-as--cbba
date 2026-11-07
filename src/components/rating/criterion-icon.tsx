import { Drumstick, HandPlatter, Store, UtensilsCrossed } from "lucide-react";
import type { RatingCriterionKey } from "@/domain/rating/criteria";

const ICONS = {
  flavor: Drumstick,
  portion: UtensilsCrossed,
  service: HandPlatter,
  place: Store,
} as const satisfies Record<RatingCriterionKey, unknown>;

/** Icono lineal de cada criterio (diseño Stitch). Es decorativo: el título del criterio da el significado. */
export function CriterionIcon({ criterion, size = 20 }: { criterion: RatingCriterionKey; size?: number }) {
  const Icon = ICONS[criterion];
  return <Icon size={size} aria-hidden="true" />;
}
