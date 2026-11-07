# Implementation Plan: Votar desde la tarjeta, formulario de votación y botón de mapa

**Branch**: `feat/calificar-y-votar` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-vote-form-flow/spec.md`

## Summary

Cada tarjeta del catálogo tendrá dos botones: **Votar**, que lleva a `/calificar/[slug]`, y **Mapa**, que abre el `mapsUrl` que ya tienen las pollerías. El formulario sigue el diseño nuevo de Stitch (Desktop y Mobile): foto arriba, 4 criterios con escala segmentada del 1 al 10, nota general en vivo, barra de progreso y comentario opcional. El voto se guarda en `ratings`, que cambia de `stars (1–5)` a cuatro columnas `*_score` (1–10) con una migración nueva. Hay **un voto por usuario y pollería, sin edición**: un `INSERT … ON CONFLICT DO NOTHING` sobre el índice único que ya existe. Si la persona ya votó, ve "Ya calificaste" con sus notas.

Se reutiliza lo que ya hay en `src/`:
- el proxy y `access.ts`, que ya protegen `/calificar`;
- el patrón de puertos y casos de uso con `createX(deps)`, armados en `composition/container.ts`;
- `rateLimiters` de Upstash;
- `useActionState` con códigos de error;
- los tokens del tema.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict), Node ≥ 20.9

**Primary Dependencies**: Next.js 16.4 (App Router, `cacheComponents: true`, proxy), React 19.3, Auth.js 5 beta (JWT), Drizzle ORM 0.45 + `neon-http`, Zod 4, `@upstash/ratelimit`, Tailwind 4 + shadcn/ui, `lucide-react`. **No se agregan dependencias.**

**Storage**: PostgreSQL (Neon). Migración nueva `drizzle/0002_*` sobre la tabla `ratings`.

**Testing**: Vitest (dominio y casos de uso con fakes en memoria) y Playwright (e2e con la BD real y sesiones firmadas con `tests/e2e/helpers.ts`).

**Target Platform**: web responsive en Vercel. Diseño desde 360 px, verificado también a 1280 px.

**Project Type**: aplicación web Next.js de un solo proyecto, con capas en `src/`.

**Performance Goals**: el catálogo sigue prerenderizado y en caché, sin leer la sesión. En el formulario, la foto y el nombre van en el shell estático y solo el voto previo espera la petición. Votar toma menos de 60 s (SC-001).

**Constraints**: datos móviles limitados (`next/image`, sin librerías nuevas); zonas táctiles ≥ 44 px; colores solo de los tokens del tema; textos en español y código en inglés.

**Scale/Scope**: 19 pollerías precargadas, uso de entretenimiento local. Incluye:
- 1 migración;
- 3 casos de uso nuevos, 1 puerto nuevo y 1 método nuevo en un puerto existente;
- 1 página nueva y 1 server action;
- unos 7 componentes de UI;
- ajustes al flujo de login para volver al formulario.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|---|---|---|
| **I. Capas** | Reglas del voto en `domain/rating/`; casos de uso en `application/rating/` y `application/restaurant/`; Drizzle y Upstash en `infrastructure/`; `app/` solo valida y llama vía `composition/`; `components/` recibe props e importa `domain/` (ESLint lo permite). No se reorganiza nada existente. | ✅ |
| **II. TS estricto** | Tipos explícitos para `RatingScores`, `RatingRecord` y `RatingFormState`; sin `any`. | ✅ |
| **III. Datos y migraciones** | El esquema cambia solo con una migración nueva `0002`; no se tocan `0000` ni `0001`. La unicidad `(user_id, restaurant_id)` ya está en la BD y se agregan CHECK 1–10 por columna. | ✅ |
| **IV. Tests** | Vitest: `domain/rating`, `access` (callback y open redirect), `rateRestaurant`, `getMyRating` y `getRestaurantBySlug`. Playwright: el flujo "calificar una pollería", que la constitución exige. | ✅ |
| **V. Seguridad** | Zod en la server action; sesión y `username` verificados en el servidor (en el caso de uso, contra la BD); límite de 10 por hora por usuario en el servidor; `callbackUrl` validado contra open redirect; sin secretos nuevos. | ✅ |
| **VI. Simplicidad** | Sin dependencias; radios nativos en vez de un slider; sin edición de votos ni "Editar voto" en la tarjeta (decisiones del usuario); la nota general se calcula y no se guarda. | ✅ |
| **Producto: el SPEC es la fuente de verdad** | La feature contradice `docs/SPEC.md` en tres puntos: estrellas de 1 a 5, "categorías separadas" como no-objetivo y voto editable. **Mitigación obligatoria:** la primera tarea actualiza `docs/SPEC.md` con las decisiones del usuario (research R13) antes de tocar código. | ✅ con condición |

**Re-check después de la Fase 1**: el diseño de [data-model.md](./data-model.md) y [contracts/](./contracts/) no agrega capas, dependencias ni excepciones. Sigue en ✅ y no hace falta la tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-vote-form-flow/
├── plan.md                         # este archivo
├── research.md                     # Fase 0: decisiones R1–R13
├── data-model.md                   # Fase 1: tabla ratings, dominio, puertos, casos de uso
├── quickstart.md                   # Fase 1: guía de validación
├── contracts/
│   ├── submit-rating-action.md     # server action: entrada, salida, errores
│   └── routes-and-ui.md            # rutas, redirecciones, callbackUrl, componentes
├── checklists/requirements.md
└── tasks.md                        # lo crea /speckit-tasks
```

### Source Code (repository root)

`+` nuevo · `~` cambia · el resto se reutiliza tal cual.

```text
docs/SPEC.md                                    ~ regla 1, modelo ratings, §1, reglas 6 y 8, pantalla Calificar

drizzle/0002_<generado>.sql                     + borra stars, agrega 4 *_score con CHECK 1–10

src/
├── domain/
│   ├── rating/criteria.ts                      + criterios, rangos, scoreLabel, overallScore, normalizeComment
│   └── user/access.ts                          ~ redirectFor agrega callbackUrl; + safeCallbackPath
├── application/
│   ├── ports/restaurant-repository.ts          ~ + findActiveBySlug
│   ├── ports/rating-repository.ts              + RatingRepository, RatingRecord, NewRating
│   ├── restaurant/get-restaurant-by-slug.ts    +
│   └── rating/
│       ├── get-my-rating.ts                    +
│       └── rate-restaurant.ts                  +
├── infrastructure/
│   ├── db/schema.ts                            ~ ratings: 4 columnas *_score + CHECK; sin stars
│   ├── db/restaurant-repository.ts             ~ + findActiveBySlug
│   ├── db/rating-repository.ts                 + findByUserAndRestaurant, createIfAbsent (ON CONFLICT DO NOTHING)
│   └── ratelimit/upstash.ts                    ~ + regla rating (10 / 1 h)
├── composition/container.ts                    ~ arma ratings y los 3 casos de uso; + rateLimiters.rating
├── app/
│   ├── calificar/[slug]/page.tsx               + generateMetadata, hero en caché, voto previo en Suspense
│   ├── calificar/[slug]/not-found.tsx          + "Pollería no encontrada" + enlace al catálogo
│   ├── _actions/rating.ts                      + submitRatingAction
│   ├── _actions/auth.ts                        ~ las acciones respetan callbackUrl (safeCallbackPath)
│   ├── _lib/rating-schemas.ts                  + esquema Zod del voto
│   ├── _data/restaurants.ts                    ~ + getRestaurantBySlug con "use cache"
│   ├── login/page.tsx                          ~ lee callbackUrl y lo pasa a formularios y enlaces
│   ├── register/page.tsx                       ~ idem
│   ├── onboarding/username/page.tsx            ~ redirige a callbackUrl si ya tiene username
│   └── page.tsx                                ~ texto con los criterios reales (sin "precio")
└── components/
    ├── home/restaurant-card.tsx                ~ botones Votar + Mapa; recibe slug; texto de criterios
    ├── home/restaurant-catalog.tsx             ~ pasa slug a la tarjeta
    ├── auth/login-form.tsx, register-form.tsx, username-form.tsx, google-sign-in-button.tsx
    │                                           ~ campo oculto callbackUrl
    └── rating/                                 + rating-form, score-scale, score-ring, progress-bar,
                                                  rating-hero, already-rated, messages

tests/
├── domain/rating.test.ts                       +
├── domain/access.test.ts                       ~ callbackUrl y safeCallbackPath
├── application/fakes.ts                        ~ + createFakeRatingRepository y repositorio de pollerías falso
├── application/rate-restaurant.test.ts         +
├── application/get-my-rating.test.ts           +
├── application/get-restaurant-by-slug.test.ts  +
└── e2e/
    ├── rating.spec.ts                          + tarjeta, login con retorno, votar, "ya calificaste", inválidos
    └── home.spec.ts                            ~ "Ver en Maps" pasa a "Mapa" si lo comprobaba
```

**Structure Decision**: se mantiene la estructura por capas de `CLAUDE.md` sin reorganizar nada. Lo nuevo va en carpetas por agregado (`domain/rating`, `application/rating`, `components/rating`), igual que los existentes `user/` y `restaurant/`.

## Orden de implementación sugerido (lo detalla `/speckit-tasks`)

1. `docs/SPEC.md` con las decisiones (condición del Constitution Check).
2. Dominio `rating` y sus tests; después el esquema y la migración `0002`.
3. Puertos, repositorios y casos de uso, con fakes y tests; después `composition`.
4. **US2 (Mapa) y el botón Votar en la tarjeta.** Es independiente y se puede entregar primero.
5. Página `/calificar/[slug]`, server action y componentes de `rating/` (**US1**), incluido "Ya calificaste" (**US4**).
6. `callbackUrl` en `access.ts`, login, registro y onboarding (**US3**).
7. e2e `rating.spec.ts`; después `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`.

## Complexity Tracking

No hay violaciones que justificar.
