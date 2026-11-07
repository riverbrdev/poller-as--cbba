# Quickstart: validar la feature

Guía para comprobar de punta a punta que la feature funciona. Los detalles están en [data-model.md](./data-model.md) y [contracts/](./contracts/).

## Requisitos previos

- `.env.local` con `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `UPSTASH_REDIS_REST_URL/TOKEN` (ver `.env.example`).
- Pollerías cargadas (`pnpm db:seed`).

## 1. Migrar la base

```bash
# Solo en bases locales que tengan votos de prueba (producción está vacía):
#   DELETE FROM ratings;
pnpm db:generate   # debe crear drizzle/0002_*.sql: borra stars y agrega las 4 columnas con sus CHECK
pnpm db:migrate
```

**Esperado**: `drizzle/0002_*.sql` contiene `DROP COLUMN "stars"`, cuatro `ADD COLUMN … smallint NOT NULL` y cuatro `CHECK (… between 1 and 10)`. `0000` y `0001` no cambian.

## 2. Chequeos automáticos

```bash
pnpm lint        # incluye los límites entre capas
pnpm typecheck
pnpm test        # dominio (rating, access), casos de uso (rate-restaurant, get-my-rating, get-restaurant-by-slug)
pnpm test:e2e    # incluye tests/e2e/rating.spec.ts
```

**Esperado**: todo en verde.

## 3. Recorrido manual (celular de 360 px y computadora de 1280 px)

| # | Paso | Resultado esperado |
|---|---|---|
| 1 | `pnpm dev`, abrir `/` | Cada tarjeta muestra **Votar** y **Mapa** en una fila |
| 2 | Pulsar **Mapa** | Se abre la ubicación en pestaña nueva; el catálogo sigue abierto |
| 3 | Sin sesión, pulsar **Votar** en una pollería | Lleva a `/login?callbackUrl=/calificar/<slug>` |
| 4 | Ingresar con correo y contraseña | Llega a `/calificar/<slug>` de esa pollería |
| 5 | Calificar 3 criterios | "3 de 4 criterios · 75%", nota general en vivo, botón desactivado |
| 6 | Calificar el 4.º y enviar | Confirmación "¡Gracias! Tu voto quedó guardado" + "Volver al catálogo" |
| 7 | Volver a pulsar **Votar** en la misma pollería | Aviso "Ya calificaste esta pollería" con las mismas notas, sin formulario |
| 8 | Abrir `/calificar/no-existe` | Página de no encontrada con enlace al catálogo |
| 9 | Cuenta de Google sin username → **Votar** | Pasa por elegir nombre y termina en el formulario |
| 10 | Navegar la escala solo con teclado (Tab + flechas) | Se puede elegir cada nota y se anuncia "Sabor y crocancia, 8" |

## 4. Verificar en la base

```sql
SELECT user_id, restaurant_id, flavor_score, portion_score, service_score, place_score, comment
FROM ratings ORDER BY created_at DESC LIMIT 5;
```

**Esperado**: una sola fila por (usuario, pollería), con las notas enviadas. Intentar a mano `INSERT … flavor_score = 11` falla por el CHECK.
