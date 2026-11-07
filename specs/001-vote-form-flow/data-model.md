# Data Model: Votar desde la tarjeta, formulario de votación y botón de mapa

**Feature**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

## 1. Tabla `ratings` (cambia, con una migración nueva)

Estado actual (`drizzle/0000_init.sql`): `id, user_id, restaurant_id, stars (1–5), comment, status, created_at, updated_at`.

Estado nuevo (migración `0002`, generada desde `src/infrastructure/db/schema.ts`):

| Columna | Tipo | Nulo | Regla |
|---|---|---|---|
| `id` | uuid PK | no | sin cambios |
| `user_id` | uuid FK → `users.id` (cascade) | no | sin cambios |
| `restaurant_id` | uuid FK → `restaurants.id` (cascade) | no | sin cambios |
| ~~`stars`~~ | ~~smallint~~ | | **se elimina**, junto con el CHECK `ratings_stars_range` |
| `flavor_score` | smallint | no | **nueva**. CHECK `ratings_flavor_score_range`: `between 1 and 10` |
| `portion_score` | smallint | no | **nueva**. CHECK `ratings_portion_score_range`: `between 1 and 10` |
| `service_score` | smallint | no | **nueva**. CHECK `ratings_service_score_range`: `between 1 and 10` |
| `place_score` | smallint | no | **nueva**. CHECK `ratings_place_score_range`: `between 1 and 10` |
| `comment` | varchar(280) | sí | sin cambios. Se guarda recortado y nunca vacío (vacío → NULL) |
| `status` | `rating_status` (`visible` \| `hidden`) | no | sin cambios, default `visible` |
| `created_at` | timestamptz | no | sin cambios |
| `updated_at` | timestamptz | no | sin cambios. Queda sin uso porque los votos no se editan |

**Índices y constraints que se conservan**

- `ratings_user_restaurant_unique` UNIQUE `(user_id, restaurant_id)`: garantiza un voto por usuario y pollería (FR-019, Principio III). Es el destino del `ON CONFLICT … DO NOTHING`.
- `ratings_restaurant_idx` sobre `restaurant_id`.

**Precondición de la migración**: `ratings` debe estar vacía (`ADD COLUMN … NOT NULL` sin default). En producción lo está. En bases locales con datos de prueba se vacía antes (ver [quickstart.md](./quickstart.md)).

## 2. Tipos de dominio — `src/domain/rating/`

```text
RatingCriterionKey = "flavor" | "portion" | "service" | "place"

RatingCriterion {
  key: RatingCriterionKey
  title: string        // "Sabor y crocancia"
  question: string     // "¿Qué tan rico y crocante estaba?"
  lowLabel: string     // "Insípido o aceitoso"   (texto del 1)
  highLabel: string    // "Crocante y jugoso"     (texto del 10)
}

RatingScores = Record<RatingCriterionKey, number>   // enteros 1..10

Constantes: SCORE_MIN = 1 · SCORE_MAX = 10 · COMMENT_MAX_LENGTH = 280
RATING_CRITERIA: RatingCriterion[]   // orden fijo: flavor, portion, service, place
```

Los textos exactos de los cuatro criterios están en el FR-010 de la spec.

**Funciones puras**

| Función | Entrada | Salida | Regla |
|---|---|---|---|
| `isValidScore(n)` | unknown | boolean | entero y `1 ≤ n ≤ 10` |
| `validateRatingScores(s)` | `Partial<RatingScores>` | `{ valid: true, scores } \| { valid: false }` | los 4 criterios presentes y válidos |
| `scoreLabel(n)` | 1..10 | `"Malo" \| "Regular" \| "Bueno" \| "Muy bueno" \| "Excelente"` | 1–3 Malo · 4–6 Regular · 7 Bueno · 8 Muy bueno · 9–10 Excelente |
| `overallScore(s)` | `Partial<RatingScores>` | `number \| null` | promedio de los criterios presentes, redondeado a 1 decimal; `null` si no hay ninguno |
| `normalizeComment(t)` | `string \| null \| undefined` | `string \| null` | `trim()`; vacío → `null` |
| `isValidComment(t)` | `string \| null` | boolean | `null` o largo `≤ 280` (tras normalizar) |

`overallScore` con los 4 criterios es la **R por voto** que usará el ranking bayesiano (SPEC §4, regla 6). El ranking en sí queda fuera de esta feature.

## 3. Puertos — `src/application/ports/`

```text
// restaurant-repository.ts (se extiende)
RestaurantRepository {
  listActive(): Promise<RestaurantRecord[]>                    // existe
  findActiveBySlug(slug: string): Promise<RestaurantRecord | null>   // NUEVO
}

// rating-repository.ts (NUEVO)
RatingRecord {
  id: string
  userId: string
  restaurantId: string
  scores: RatingScores
  comment: string | null
  createdAt: Date
}

NewRating = { userId, restaurantId, scores: RatingScores, comment: string | null }

RatingRepository {
  findByUserAndRestaurant(userId: string, restaurantId: string): Promise<RatingRecord | null>
  /** INSERT … ON CONFLICT DO NOTHING. Devuelve null si el usuario ya había votado. */
  createIfAbsent(rating: NewRating): Promise<RatingRecord | null>
}
```

## 4. Casos de uso — `src/application/`

| Caso de uso | Entrada | Resultado |
|---|---|---|
| `getRestaurantBySlug` (`restaurant/`) | `slug` | `RestaurantRecord \| null` (solo activas) |
| `getMyRating` (`rating/`) | `userId, restaurantId` | `RatingRecord \| null` |
| `rateRestaurant` (`rating/`) | `{ userId, slug, scores, comment }` | `{ ok: true, rating }` \| `{ ok: false, error }` |

**`rateRestaurant`: orden de verificación**

1. `validateRatingScores` → si falla, `invalid_scores`.
2. `normalizeComment` + `isValidComment` → si falla, `comment_too_long`.
3. `users.findById(userId)` → si no existe, `user_not_found`; si `username === null`, `username_required`.
4. `restaurants.findActiveBySlug(slug)` → si es `null`, `restaurant_not_found`.
5. `ratings.createIfAbsent(...)` → si devuelve `null`, `already_rated`; si no, `{ ok: true, rating }`.

## 5. Ciclo de vida del voto

```text
(no existe) ──enviar válido──▶ visible ──(moderación, fuera de alcance)──▶ hidden
     │
     └─ enviar cuando ya existe ──▶ rechazado: already_rated (el voto original no cambia)
```

No hay transición de edición ni de borrado por parte del usuario. El borrado solo ocurre en cascada si se borra el usuario o la pollería.

## 6. Entidades existentes que solo se leen

- **Restaurant**: `id, name, slug, zone, address, mapsUrl?, photoUrl?, status`. Solo las `active` aceptan votos.
- **User**: `id, username?`. Solo puede votar con `username` no nulo.
