/** Textos visibles del área de administración (spec 003). */
export const ADMIN_TEXT = {
  title: "Panel de administración",
  breadcrumb: "ComiDeli / Administración",
  badge: "Solo admins",
  greeting: (username: string) => `Hola, @${username}`,
  comingSoonTitle: "Las herramientas llegan pronto",
  comingSoon:
    "Las herramientas de administración llegan en las próximas entregas: analíticas de votos, moderación de comentarios, sugerencias y reportes.",
  backToRanking: "Ir al ranking",
} as const;
