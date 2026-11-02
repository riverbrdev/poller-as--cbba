/** IP del cliente según el proxy de Vercel. Sin cabecera, todos caen en el mismo bucket. */
export function clientIpFromHeaders(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
