/** Evita datos de desarrollo/previews y rechaza IDs que no sean de GA4. */
export function getAnalyticsId(
  measurementId: string | undefined,
  nodeEnv: string | undefined,
  vercelEnv: string | undefined,
): string | null {
  const id = measurementId?.trim();
  if (nodeEnv !== "production" || (vercelEnv && vercelEnv !== "production")) return null;
  return id && /^G-[A-Z0-9]+$/.test(id) ? id : null;
}
