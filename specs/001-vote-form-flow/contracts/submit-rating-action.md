# Contrato: `submitRatingAction` (server action)

**Archivo**: `src/app/_actions/rating.ts` · **Lo usa**: `src/components/rating/rating-form.tsx` vía `useActionState`

Es la única forma de crear un voto. El formulario funciona también sin JavaScript (envío nativo de `<form action>`).

## Firma

```ts
submitRatingAction(state: RatingFormState, formData: FormData): Promise<RatingFormState>
```

## Entrada (`FormData`), validada con Zod en `src/app/_lib/rating-schemas.ts`

| Campo | Tipo | Regla Zod | Error |
|---|---|---|---|
| `slug` | string | `trim().min(1)` | `restaurant_not_found` |
| `flavor` | string → número | `z.coerce.number().int().min(1).max(10)` | `invalid_scores` |
| `portion` | string → número | igual | `invalid_scores` |
| `service` | string → número | igual | `invalid_scores` |
| `place` | string → número | igual | `invalid_scores` |
| `comment` | string opcional | `trim().max(280)`; vacío se trata como ausente | `comment_too_long` |

Los límites (1, 10, 280) se importan de `src/domain/rating/`, no se repiten.

## Salida (`RatingFormState`)

```ts
type RatingFormState =
  | { status: "idle" }
  | { status: "saved"; overall: number }          // muestra la confirmación (FR-023)
  | { status: "error"; error: RatingErrorCode };  // muestra el mensaje y conserva las notas (FR-024)

type RatingErrorCode =
  | "invalid_scores"
  | "comment_too_long"
  | "restaurant_not_found"
  | "username_required"
  | "user_not_found"
  | "already_rated"
  | "rate_limited";
```

Los textos visibles de cada código viven en `src/components/rating/messages.ts`, igual que en `components/auth/messages.ts`:

| Código | Mensaje |
|---|---|
| `invalid_scores` | "Elige una nota del 1 al 10 en los cuatro criterios." |
| `comment_too_long` | "El comentario puede tener hasta 280 caracteres." |
| `restaurant_not_found` | "Esta pollería ya no está disponible." |
| `username_required` | "Elige tu nombre de usuario antes de votar." |
| `user_not_found` | "No encontramos tu cuenta. Vuelve a ingresar." |
| `already_rated` | "Ya calificaste esta pollería." |
| `rate_limited` | "Enviaste muchos votos seguidos. Espera un rato y vuelve a intentar." |
| *(otro)* | "No pudimos guardar tu voto. Inténtalo de nuevo." |

## Comportamiento en orden

1. `auth()`. Sin sesión → `redirect("/login?callbackUrl=/calificar/<slug>")` (no devuelve estado).
2. Parseo Zod → si falla, `{ status: "error", error }` con el primer código.
3. `rateLimiters.rating.limit("user:<id>")` → si se superó, `rate_limited`.
4. `useCases.rateRestaurant({ userId, slug, scores, comment })` → mapea `{ ok: false, error }` al estado de error.
5. Éxito → `{ status: "saved", overall }`. No hace `redirect` ni revalida: la home no muestra votos (FR-025).

## Garantías

- La autorización y todas las validaciones ocurren en el servidor (Principio V). El botón desactivado del cliente es solo comodidad.
- Dos envíos simultáneos dejan una sola fila. El segundo recibe `already_rated` (ver research R3).
