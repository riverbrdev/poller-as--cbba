// Textos visibles de la home (hero, catálogo y metodología).

export const HERO_TEXT = {
  eyebrow: "Cochabamba · Ranking 2026",
  titleStart: "¿Dónde se come el mejor pollo broaster en la",
  titleHighlight: "llajta",
  titleEnd: "?",
  lead: "Califica sabor, porción, atención y local. Cada voto suma para armar un ranking hecho por quienes comen ahí.",
  primaryAction: "Elegir una pollería",
  secondaryAction: "Cómo se califica",
  restaurants: (count: number) => (count === 1 ? "pollería" : "pollerías"),
  zones: (count: number) => (count === 1 ? "zona" : "zonas"),
  criteria: "criterios",
  rateLogo: (name: string) => `Calificar ${name}`,
  favoriteTitle: "¿Tu favorita?",
  favoriteAction: "Califícala",
} as const;

export const CATALOG_TEXT = {
  eyebrow: "Catálogo",
  title: "Elige una pollería y califícala",
  lead: "Busca por nombre, zona o dirección. Cada pollería entra al ranking cuando junta 10 votos.",
  count: (count: number) => `${count} ${count === 1 ? "local" : "locales"}`,
  searchLabel: "Buscar pollería, zona o dirección",
  searchPlaceholder: "Buscar pollería, zona o dirección…",
  sortLabel: "Ordenar pollerías",
  sortTop: "Top del ranking",
  sortName: "Nombre A–Z",
  zonesLabel: "Filtrar por zona",
  allZones: "Todas",
  empty: "Aún no hay pollerías en el catálogo. Vuelve pronto.",
  noResults: "No encontramos pollerías con esos filtros. Prueba con otro nombre o zona.",
  clearFilters: "Limpiar filtros",
} as const;

export const HEADER_TEXT = {
  restaurants: "Pollerías",
} as const;

export const CARD_TEXT = {
  photoAlt: (name: string) => `Logo de ${name}`,
  noPhoto: (name: string) => `${name} sin foto`,
  vote: "Votar",
  voteLabel: (name: string) => `Votar por ${name}`,
  map: "Mapa",
  mapLabel: (name: string) => `Ver ubicación de ${name} en el mapa`,
} as const;

export const SCORE_TEXT = {
  votes: (count: number) => (count === 1 ? "1 voto" : `${count} votos`),
  voting: (votes: number, minimum: number) => `En votación · ${votes} de ${minimum} votos`,
  noVotes: "Sin votos",
  beFirst: "Vota primero",
  position: (position: number) => `#${position}`,
  /** Frase completa para lectores de pantalla: la fila visual se oculta. */
  ranked: (score: string, label: string, votes: number, position: number) =>
    `Puesto ${position} del ranking. Nota ${score} de 10, ${label}, ${votes} votos.`,
  votingLabel: (score: string, label: string, votes: number, minimum: number) =>
    `En votación. Nota ${score} de 10, ${label}, ${votes} de ${minimum} votos.`,
  unratedLabel: "Sin votos todavía.",
} as const;

export const METHODOLOGY_TEXT = {
  eyebrow: "Cómo se califica",
  title: "Cuatro criterios, una nota del 1 al 10",
  lead: "Cada persona califica una vez por pollería. La nota de su voto es el promedio de los cuatro criterios.",
  scaleLow: (label: string) => `1 · ${label}`,
  scaleHigh: (label: string) => `10 · ${label}`,
  stepsTitle: "Cómo entra una pollería al ranking",
  steps: [
    { title: "Elige", description: "Busca la pollería donde comiste." },
    { title: "Califica", description: "Pon una nota del 1 al 10 a cada criterio." },
    { title: "Rankea", description: "Con 10 votos, la pollería entra al ranking." },
  ],
  suggestTitle: "¿Falta tu pollería favorita?",
  suggestLead: "Pronto podrás sugerirla para que se sume al catálogo después de una revisión.",
  suggestAction: "Calificar una pollería",
} as const;
