// Textos visibles del perfil de pollería (detalle y reseñas).
import type { RatingCriterionKey } from "@/domain/rating/criteria";

export const DETAIL_TEXT = {
  backToRanking: "Volver al ranking",
  position: (position: number) => `#${position} en Cochabamba`,
  voting: (votes: number, minimum: number) => `En votación · ${votes} de ${minimum} votos`,
  unrated: "Sin votos todavía",
  votes: (count: number) => (count === 1 ? "1 voto" : `${count} votos`),
  outOf: "/ 10",
  noScore: "Todavía no tiene nota",
  noScoreHelp: "Su nota aparece con el primer voto.",
  bayesHelp: "La nota general pondera la cantidad de votos para que el ranking sea justo.",
  criteriaTitle: "Así la calificaron",
  map: "Ver en el mapa",
  mapLabel: (name: string) => `Ver ${name} en el mapa (se abre en otra pestaña)`,
  photoAlt: (name: string) => `Logo de ${name}`,
  noPhoto: (name: string) => `${name} sin foto`,
  scoreLabel: "Nota general",
  notFoundTitle: "No encontramos esta pollería",
  notFoundLead: "Puede que ya no esté disponible.",
} as const;

/** Nombres cortos de los criterios para las mini-notas de cada reseña. */
export const SHORT_CRITERIA: Record<RatingCriterionKey, string> = {
  flavor: "Sabor",
  portion: "Porción",
  service: "Atención",
  place: "Local",
};
