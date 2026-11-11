import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitRule = { name: string; limit: number; window: Duration };

// Valores iniciales para el registro y el login por IP (SPEC §4, regla 7: ajustables).
export const RATE_LIMIT_RULES = {
  login: { name: "login", limit: 10, window: "10 m" },
  register: { name: "register", limit: 5, window: "1 h" },
  // SPEC §4 regla 7: 10 calificaciones por usuario por hora (clave user:<id>).
  rating: { name: "rating", limit: 10, window: "1 h" },
  // SPEC regla 9: 60 marcas "Útil" por usuario por hora (clave user:<id>).
  helpful: { name: "helpful", limit: 60, window: "1 h" },
} as const satisfies Record<string, RateLimitRule>;

/** Límite por IP con ventana deslizante. Lee UPSTASH_REDIS_REST_URL y _TOKEN del entorno. */
export function createIpRateLimiter(rule: RateLimitRule): Ratelimit {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
    prefix: `delicocha:ratelimit:${rule.name}`,
  });
}
