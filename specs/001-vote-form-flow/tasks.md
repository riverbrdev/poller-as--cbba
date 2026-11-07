---

description: "Lista de tareas: votar desde la tarjeta, formulario de votación y botón de mapa"
---

# Tasks: Votar desde la tarjeta, formulario de votación y botón de mapa

**Input**: Documentos de diseño en `specs/001-vote-form-flow/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: SÍ se incluyen. La constitución (Principio IV) exige tests en la misma tarea o PR: Vitest para dominio y casos de uso, y Playwright para el flujo "calificar una pollería". No es TDD estricto, pero ninguna historia se da por terminada sin sus tests.

**Organization**: las tareas se agrupan por historia de usuario para implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin depender de tareas incompletas)
- **[Story]**: historia a la que pertenece (US1, US2, US3, US4)
- Rutas relativas a la raíz del repo (proyecto único: `src/`, `tests/`, `drizzle/`, `docs/`)

## Reglas para quien implemente (leer antes de empezar)

- Leer `CLAUDE.md`, `docs/SPEC.md` y `AGENTS.md`. Next 16 trae cambios: consultar `node_modules/next/dist/docs/` antes de escribir páginas o server actions (`params` es una `Promise`, `cacheComponents: true`, las lecturas de sesión van dentro de `<Suspense>`; ver `01-app/02-guides/authentication-with-cache-components.md`).
- Capas: `app/` y `components/` nunca importan de `infrastructure/`; `components/` tampoco importa de `composition/`. `components/` sí puede importar de `domain/`.
- Código en inglés, textos visibles en español, sin `any`, colores solo con los tokens del tema de `src/app/globals.css` (`brand`, `brand-dark`, `brand-soft`, `brand-ink`, `ink`, `ink-muted`, `line`, `line-strong`, `cream`, `surface-soft`, `photo-placeholder`).
- Un commit por tarea o grupo lógico, con el formato `tipo: descripción`. **En este repo los commits NO llevan trailers `Co-Authored-By`.**

---

## Phase 1: Setup (documentación fuente de verdad)

**Purpose**: alinear `docs/SPEC.md` con las decisiones del usuario antes de tocar código. Es la condición del Constitution Check del plan.

- [X] T001 Actualizar `docs/SPEC.md` según research R13: (a) §1 "No es objetivo (v1)": quitar "categorías separadas (presa, ají, precio)" y dejar claro que se califican 4 criterios fijos; (b) §3 `ratings`: reemplazar `stars (1–5)` por `flavor_score, portion_score, service_score, place_score (1–10 cada una)` y anotar que `updated_at` queda sin uso; (c) §4 regla 1: "Un usuario puede tener **una sola calificación por pollería** y **no puede editarla en v1**"; (d) regla 6: `R` = promedio de los promedios por voto, donde el promedio de un voto es la media simple de sus 4 criterios, en escala 1–10; (e) regla 8: cambiar "calificación en estrellas" por "calificación"; (f) §5 pantalla "Calificar": "4 criterios (Sabor y crocancia, Cantidad y porción, Atención y rapidez, Local) con escala segmentada del 1 al 10 + comentario opcional; diseño en Stitch"; (g) §5 "Perfil de pollería" y "Home": el botón de la tarjeta es "Votar" + "Mapa". Commit `docs: SPEC con 4 criterios 1-10 y votos sin edición`

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: dominio del voto, esquema de la base y búsqueda de pollería por slug, que usan US1 y US4.

**⚠️ CRITICAL**: ninguna historia de usuario empieza antes de terminar esta fase.

- [X] T002 [P] Crear `src/domain/rating/criteria.ts` (sin imports externos), según data-model.md §2: tipo `RatingCriterionKey = "flavor" | "portion" | "service" | "place"`; tipo `RatingCriterion { key, title, question, lowLabel, highLabel }`; `RatingScores = Record<RatingCriterionKey, number>`; constantes `SCORE_MIN = 1`, `SCORE_MAX = 10`, `COMMENT_MAX_LENGTH = 280`; `RATING_CRITERIA` en este orden y con estos textos exactos: flavor "Sabor y crocancia" / "¿Qué tan rico y crocante estaba?" / "Insípido o aceitoso" / "Crocante y jugoso"; portion "Cantidad y porción" / "¿La porción valió lo que pagaste?" / "Muy poco" / "Plato rebalsando"; service "Atención y rapidez" / "¿Cómo te atendieron y cuánto tardó?" / "Lento o mal trato" / "Rápido y amable"; place "Local" / "Limpieza, mesas y comodidad" / "Sucio o incómodo" / "Impecable". Funciones: `isValidScore(n: unknown)` (entero con `1 ≤ n ≤ 10`); `validateRatingScores(s: Partial<RatingScores>)` → `{ valid: true, scores } | { valid: false }` (los 4 presentes y válidos); `scoreLabel(n)` → 1–3 "Malo", 4–6 "Regular", 7 "Bueno", 8 "Muy bueno", 9–10 "Excelente"; `overallScore(s: Partial<RatingScores>)` → promedio de los presentes redondeado a 1 decimal, o `null` si no hay ninguno; `normalizeComment(t: string | null | undefined)` → `trim()`, vacío → `null`; `isValidComment(t: string | null)` → `null` o largo `≤ 280`
- [X] T003 [P] Crear `tests/domain/rating.test.ts` (Vitest) para T002: `isValidScore` rechaza 0, 11, 7.5, "8" y NaN, y acepta 1 y 10; `validateRatingScores` falla si falta un criterio o uno está fuera de rango; `scoreLabel` en las fronteras 1, 3, 4, 6, 7, 8, 9 y 10; `overallScore({flavor:9, portion:7, service:8})` = 8, `overallScore({flavor:9,portion:7,service:8,place:7})` = 7.8, `overallScore({})` = null; `normalizeComment("   ")` = null y `normalizeComment("  rico ")` = "rico"; `isValidComment` con 280 caracteres pasa y con 281 falla; `RATING_CRITERIA` tiene 4 claves en el orden flavor, portion, service, place
- [X] T004 Modificar la tabla `ratings` en `src/infrastructure/db/schema.ts` según data-model.md §1: eliminar `stars` y el check `ratings_stars_range`; agregar `flavorScore: smallint("flavor_score").notNull()`, `portionScore: smallint("portion_score").notNull()`, `serviceScore: smallint("service_score").notNull()` y `placeScore: smallint("place_score").notNull()`, cada una con su check `ratings_<col>_range`: `` sql`${table.<col>} between 1 and 10` ``. Conservar `comment varchar(280)` (nullable), `status`, `created_at`, `updated_at`, el índice único `ratings_user_restaurant_unique (user_id, restaurant_id)` y `ratings_restaurant_idx`. Comentario en español que remita a SPEC §3
- [X] T005 Generar la migración con `pnpm db:generate` → nuevo `drizzle/0002_*.sql` (más `drizzle/meta/`). Nota de implementación: se generó en dos pasos (`0002_ratings_criteria_scores` agrega las 4 columnas y `0003_ratings_drop_stars` borra `stars`) para evitar la pregunta interactiva de drizzle-kit sobre renombres. Verificar que solo contiene el `DROP CONSTRAINT ratings_stars_range`, el `DROP COLUMN "stars"`, cuatro `ADD COLUMN … smallint NOT NULL` y cuatro `ADD CONSTRAINT … CHECK (… between 1 and 10)`. **No editar `0000_init.sql` ni `0001_users_auth_username.sql`.** Si la base local tiene filas en `ratings`, vaciarlas (`DELETE FROM ratings;`) y luego correr `pnpm db:migrate`. Depende de T004
- [X] T006 [P] Extender el puerto en `src/application/ports/restaurant-repository.ts` con `findActiveBySlug(slug: string): Promise<RestaurantRecord | null>` (solo `status = 'active'`), documentado en español
- [X] T007 Implementar `findActiveBySlug` en `src/infrastructure/db/restaurant-repository.ts` con los mismos campos que `listActive` y `where(and(eq(restaurants.slug, slug), eq(restaurants.status, "active")))`, `limit(1)`, devolviendo `null` si no hay fila. Depende de T006
- [X] T008 Actualizar el fake `repositoryWith` de `tests/application/list-active-restaurants.test.ts` para que también implemente `findActiveBySlug` (busca por `slug` en `records`), así el test compila con el puerto nuevo. Depende de T006
- [X] T009 [P] Crear el caso de uso `src/application/restaurant/get-restaurant-by-slug.ts`: `createGetRestaurantBySlug(deps: { restaurants: RestaurantRepository })` → `getRestaurantBySlug(slug: string): Promise<RestaurantRecord | null>`; recorta el slug y devuelve `null` si queda vacío sin consultar el repo. Depende de T006
- [X] T010 [P] Crear `tests/application/get-restaurant-by-slug.test.ts`: devuelve la pollería activa por slug; `null` para un slug inexistente; `null` para un slug vacío o con solo espacios (sin llamar al repo). Depende de T009
- [X] T011 Registrar `getRestaurantBySlug` en `useCases` de `src/composition/container.ts` (import + `createGetRestaurantBySlug({ restaurants })`). Depende de T007, T009
- [X] T012 [P] Crear `getRestaurantBySlug(slug)` en `src/app/_data/restaurants.ts`, igual que `getActiveRestaurants`: `"use cache"`, `cacheLife("minutes")`, llama a `useCases.getRestaurantBySlug(slug)`. Depende de T011

**Checkpoint**: `pnpm lint && pnpm typecheck && pnpm test` en verde; base migrada con las 4 columnas. Las historias pueden empezar.

---

## Phase 3: User Story 1 - Calificar una pollería y que el voto quede guardado (Priority: P1) 🎯 MVP

**Goal**: desde "Votar" en la tarjeta se llega a `/calificar/[slug]`, se califican los 4 criterios del 1 al 10 con el diseño de Stitch y el voto queda guardado (un único voto por usuario y pollería).

**Independent Test**: con un usuario de prueba con sesión y username, pulsar "Votar" en una pollería, calificar los 4 criterios y enviar: aparece "¡Gracias! Tu voto quedó guardado" y en la BD hay exactamente 1 fila de `ratings` con esas notas.

### Puerto y tests for User Story 1

- [X] T013 [P] [US1] Crear el puerto `src/application/ports/rating-repository.ts` según data-model.md §3: `RatingRecord { id; userId; restaurantId; scores: RatingScores; comment: string | null; createdAt: Date }`, `NewRating = { userId; restaurantId; scores: RatingScores; comment: string | null }`, e interfaz `RatingRepository { findByUserAndRestaurant(userId, restaurantId): Promise<RatingRecord | null>; createIfAbsent(rating: NewRating): Promise<RatingRecord | null> }`. Comentario: "createIfAbsent hace INSERT … ON CONFLICT DO NOTHING: devuelve null si el usuario ya había votado (los votos no se editan)"
- [X] T014 [US1] Agregar `createFakeRatingRepository(initial?: RatingRecord[])` en `tests/application/fakes.ts`: guarda en memoria, respeta la unicidad `(userId, restaurantId)`, `createIfAbsent` devuelve `null` si ya existe y `findByUserAndRestaurant` busca por ambos ids; expone `all()`. Agregar también `createFakeRestaurantRepository(records: RestaurantRecord[])` con `listActive` y `findActiveBySlug`. Depende de T013
- [X] T015 [US1] Crear `tests/application/rate-restaurant.test.ts` con fakes (T014) y `createFakeUserRepository`: guarda un voto válido con el comentario normalizado; `invalid_scores` si falta un criterio o hay un 11; `comment_too_long` con 281 caracteres; un comentario con solo espacios se guarda como `null`; `user_not_found`; `username_required` si `username` es `null`; `restaurant_not_found` para un slug inexistente; `already_rated` en el segundo envío del mismo usuario, y el voto original no cambia (`all()` tiene 1 fila con las notas originales). Depende de T014 (se escribe antes de T016 y falla hasta que exista)

### Implementation for User Story 1

- [X] T016 [US1] Crear el caso de uso `src/application/rating/rate-restaurant.ts`: `createRateRestaurant(deps: { users: UserRepository; restaurants: RestaurantRepository; ratings: RatingRepository })` → `rateRestaurant(input: { userId: string; slug: string; scores: Partial<RatingScores>; comment?: string | null })` → `{ ok: true; rating: RatingRecord } | { ok: false; error: "invalid_scores" | "comment_too_long" | "user_not_found" | "username_required" | "restaurant_not_found" | "already_rated" }`. Orden exacto (data-model.md §4): 1) `validateRatingScores`; 2) `normalizeComment` + `isValidComment`; 3) `users.findById` (no existe → `user_not_found`; `username === null` → `username_required`); 4) `restaurants.findActiveBySlug`; 5) `ratings.createIfAbsent` (`null` → `already_rated`). Depende de T002, T006, T013
- [X] T017 [P] [US1] Crear `src/infrastructure/db/rating-repository.ts` → `createDrizzleRatingRepository(db: Db): RatingRepository`. `createIfAbsent`: `db.insert(ratings).values({ userId, restaurantId, flavorScore, portionScore, serviceScore, placeScore, comment }).onConflictDoNothing({ target: [ratings.userId, ratings.restaurantId] }).returning(...)`; sin fila → `null`. Mapear columnas `*_score` ↔ `scores.{flavor,portion,service,place}`. `findByUserAndRestaurant`: select por ambos ids, `limit(1)`. Depende de T004, T013
- [X] T018 [P] [US1] Agregar `rating: { name: "rating", limit: 10, window: "1 h" }` a `RATE_LIMIT_RULES` en `src/infrastructure/ratelimit/upstash.ts`, con el comentario "SPEC §4 regla 7: 10 calificaciones por usuario por hora (clave user:<id>)"
- [X] T019 [US1] En `src/composition/container.ts`: crear `const ratings = createDrizzleRatingRepository(db)`, agregar `rateRestaurant: createRateRestaurant({ users, restaurants, ratings })` a `useCases` y `rating: createIpRateLimiter(RATE_LIMIT_RULES.rating)` a `rateLimiters`. Depende de T016, T017, T018
- [X] T020 [P] [US1] Crear `src/app/_lib/rating-schemas.ts` (Zod, importando `SCORE_MIN`, `SCORE_MAX` y `COMMENT_MAX_LENGTH` de `@/domain/rating/criteria`): `ratingSchema = z.object({ slug: z.string().trim().min(1, { message: "restaurant_not_found" }), flavor/portion/service/place: z.coerce.number().int().min(SCORE_MIN).max(SCORE_MAX) con message "invalid_scores", comment: z.string().trim().max(COMMENT_MAX_LENGTH, { message: "comment_too_long" }).optional() })`. Depende de T002
- [X] T021 [P] [US1] Crear `src/components/rating/form-state.ts` con `RatingErrorCode` y `RatingFormState = { status: "idle" } | { status: "saved"; overall: number } | { status: "error"; error: RatingErrorCode }` (contracts/submit-rating-action.md), y `src/components/rating/messages.ts` con `ratingMessage(code)` y estos textos exactos: invalid_scores "Elige una nota del 1 al 10 en los cuatro criterios."; comment_too_long "El comentario puede tener hasta 280 caracteres."; restaurant_not_found "Esta pollería ya no está disponible."; username_required "Elige tu nombre de usuario antes de votar."; user_not_found "No encontramos tu cuenta. Vuelve a ingresar."; already_rated "Ya calificaste esta pollería."; rate_limited "Enviaste muchos votos seguidos. Espera un rato y vuelve a intentar."; por defecto "No pudimos guardar tu voto. Inténtalo de nuevo."
- [X] T022 [US1] Crear `src/app/_actions/rating.ts` (`"use server"`) → `submitRatingAction(_state: RatingFormState, formData: FormData): Promise<RatingFormState>` según contracts/submit-rating-action.md: 1) `auth()`; sin `session.user.id` → `redirect("/login?callbackUrl=" + encodeURIComponent("/calificar/" + slug))`; 2) `ratingSchema.safeParse(Object.fromEntries(formData))`; si falla → `{ status: "error", error: <primer message> }`; 3) `rateLimiters.rating.limit("user:" + id)`; si falla → `rate_limited`; 4) `useCases.rateRestaurant({ userId, slug, scores: { flavor, portion, service, place }, comment })`; error → `{ status: "error", error }`; 5) éxito → `{ status: "saved", overall: overallScore(rating.scores) }`. Sin `redirect` ni revalidación al guardar. Depende de T019, T020, T021
- [X] T023 [P] [US1] Crear `src/components/rating/score-scale.tsx` (cliente): props `{ criterion: RatingCriterion; value: number | null; onChange(n: number): void; disabled?: boolean }`. Un `<fieldset>` con `<legend>` (título + pregunta), 10 `<input type="radio" name={criterion.key} value={n}>` nativos ocultos visualmente con sus `<label>` como segmentos de la barra (mínimo 44 px de alto, ancho igual con `flex-1`, sin anchos fijos en px). Los segmentos de 1 a `value` van rellenos con el degradado `from-brand to-brand-dark` y texto blanco; el elegido, un poco elevado con sombra; el resto `bg-surface-soft` con texto `ink-muted`. A la derecha, el número elegido grande en `brand` con `scoreLabel(value)` debajo, o "Sin calificar" en `ink-muted`. Debajo, en los extremos, "1: {lowLabel}" y "10: {highLabel}". Cada radio con `aria-label="{title}, {n}"`. Funciona con Tab y las flechas (comportamiento nativo del grupo de radios) y muestra un anillo de foco visible. Depende de T002
- [X] T024 [P] [US1] Crear `src/components/rating/score-ring.tsx`: props `{ value: number | null; size?: "sm" | "lg" }`. Anillo SVG (`circle` con `stroke-dasharray`) relleno en proporción `value/10` con `stroke` del token `brand` sobre `line`; en el centro, `value.toFixed(1)` o "–"; `aria-label="Tu nota: {value} de 10"`
- [X] T025 [P] [US1] Crear `src/components/rating/progress-bar.tsx`: props `{ done: number; total: number }`. Texto "{done} de {total} criterios" a la izquierda y "{pct}%" en `brand` a la derecha; barra redondeada gruesa con relleno degradado `from-brand to-brand-dark` al `pct`; `role="progressbar"` con `aria-valuenow`, `aria-valuemin=0` y `aria-valuemax={total}`
- [X] T026 [P] [US1] Crear `src/components/rating/rating-hero.tsx` (sin estado ni hooks; se renderiza desde `page.tsx`, fuera del `<Suspense>`, para que llegue en el shell estático; research R10): props `{ restaurant: { name; zone; address; photoUrl } ; variant: "banner" | "card" }`. `banner` (móvil): foto a todo el ancho con `next/image` `fill` `priority` `sizes="100vw"`, aspecto ~4:3, degradado oscuro abajo, etiqueta "ESTÁS CALIFICANDO", nombre y "{address} · {zone}" con icono `MapPin`. `card` (desktop): foto 4:5 con `rounded-3xl` y los textos debajo. Sin `photoUrl` usa el mismo marcador que `restaurant-card.tsx` (`bg-photo-placeholder` + icono `UtensilsCrossed`). `alt="Plato de {name}"`
- [X] T027 [US1] Crear `src/components/rating/rating-form.tsx` (cliente): props `{ restaurant: { slug; name; zone; address; photoUrl }; hero: { banner: React.ReactNode; card: React.ReactNode }; action: (s: RatingFormState, f: FormData) => Promise<RatingFormState> }`. **No importa `RatingHero`**: coloca `hero.card` en la columna lateral (`lg:`) y `hero.banner` arriba en móvil. Usa `useActionState(action, { status: "idle" })` y guarda en estado las notas (`Partial<RatingScores>`) y el comentario. Layout según Stitch: en `lg:` dos columnas `lg:grid-cols-[2fr_3fr]`, con la izquierda `lg:sticky lg:top-6` (`hero.card` + ScoreRing `lg` con `scoreLabel` + ProgressBar + botón enviar + "Tu voto es definitivo: no se puede cambiar después"); en móvil, `hero.banner` arriba, hoja blanca con ScoreRing `sm` y "Tu nota: {label}", y barra inferior `fixed bottom-0 inset-x-0` (con `lg:hidden`) con ProgressBar y el botón. Columna principal: título "¿Qué tal estuvo?", subtítulo "Califica del 1 al 10. Piensa en tu última visita: 5 es que cumple, nada más.", leyenda en una línea "1–3 Malo · 4–6 Regular · 7 Bueno · 8 Muy bueno · 9–10 Excelente" (misma escala que `scoreLabel`), cuatro `ScoreScale` separadas por `border-line` (sin tarjetas con borde) y el comentario (`<textarea name="comment" maxLength={280}>`, label "Comentario (opcional)", contador "{n}/280"). `<input type="hidden" name="slug">`. Botón "Enviar mi voto" (≥ 44 px, ancho completo) deshabilitado hasta tener los 4 criterios o mientras `pending` ("Enviando…"). Errores en un alert con `ratingMessage` y `aria-live`, sin perder las notas. Con `status === "saved"`, reemplazar el formulario por la confirmación "¡Gracias! Tu voto quedó guardado", el ScoreRing con `state.overall`, las 4 notas enviadas en solo lectura (título del criterio + número + `scoreLabel`, tomadas del estado del formulario; FR-023) y un `<Link href="/#locales">Volver al catálogo</Link>` primario. Dejar espacio inferior en móvil para que la barra fija no tape el comentario (`pb-40 lg:pb-0`). Depende de T021, T023, T024, T025
- [X] T028 [P] [US1] Crear `src/app/calificar/[slug]/not-found.tsx`: "No encontramos esta pollería" con el texto "Puede que ya no esté disponible." y un enlace `min-h-11` "Volver al catálogo" a `/#locales`
- [X] T029 [US1] Crear `src/app/calificar/[slug]/page.tsx` (Next 16): `type Props = { params: Promise<{ slug: string }> }`. `generateMetadata`: con `getRestaurantBySlug` de `@/app/_data/restaurants`, `title` "Califica {name} · ComiDeli", `description` "Califica sabor, porción, atención y local de {name} en Cochabamba.", `openGraph` con `images: [photoUrl]` si existe, `robots: { index: false, follow: false }`; si no existe, metadata genérica. Página: `await params` → `getRestaurantBySlug(slug)` → `notFound()` si es `null`. Construye `<RatingHero variant="banner">` y `<RatingHero variant="card">` **fuera** del `<Suspense>` (shell estático) y renderiza dentro de `<Suspense fallback={esqueleto de las 4 escalas}>` un componente async que hace `await connection()`, luego `auth()` (sin sesión → `redirect("/login?callbackUrl=" + encodeURIComponent("/calificar/" + slug))`; sin username → `redirect("/onboarding/username?callbackUrl=…")`; es la segunda verificación, el proxy solo redirige) y muestra `<RatingForm restaurant={…} hero={{ banner, card }} action={submitRatingAction} />`. Fondo `bg-cream`, contenedor `mx-auto max-w-6xl` con un enlace "← Volver" (`min-h-11`) a `/#locales`. Depende de T012, T022, T026, T027, T028
- [X] T030 [US1] En `src/components/home/restaurant-card.tsx`: agregar `slug: string` a `RestaurantCardData` y, en lugar del bloque "Ver en Maps", una fila `flex gap-2` con el botón primario **Votar** (`<Link href={`/calificar/${slug}`}>`, `flex-1 min-h-11 rounded-xl bg-brand text-white`, `aria-label="Votar por {name}"`). Por ahora el enlace "Ver en Maps" actual queda debajo sin cambios (US2 lo reemplaza). `restaurant-catalog.tsx` ya pasa `slug` (`CatalogRestaurant`); verificar que el tipo coincida
- [X] T031 [US1] Crear `tests/e2e/rating.spec.ts` (Playwright) con `useOwnClientIp`, `createPasswordUser` y `signInAsGoogleUser` de `tests/e2e/helpers.ts`, y `deleteE2eUsers()` en `afterAll` (los votos se borran por cascada). Casos US1: (1) usuario con username abre `/`, pulsa "Votar por {primera pollería}" y llega a `/calificar/{slug}` con el nombre visible; (2) elige notas en 3 criterios → ve "3 de 4 criterios" y el botón "Enviar mi voto" deshabilitado; (3) elige el 4.º y envía → ve "¡Gracias! Tu voto quedó guardado"; (4) en la BD (`createDb()` + `ratings` filtrado por `user_id`) hay 1 fila con las notas elegidas; (5) `/calificar/no-existe` muestra "No encontramos esta pollería". Depende de T029, T030

**Checkpoint**: US1 funciona sola. `pnpm test` y `pnpm test:e2e -- rating` en verde.

---

## Phase 4: User Story 2 - Ir a la ubicación de la pollería desde la tarjeta (Priority: P2)

**Goal**: botón **Mapa** al lado de **Votar** en cada tarjeta, que abre el `mapsUrl` existente en una pestaña nueva.

**Independent Test**: sin sesión, en `/`, cada tarjeta con `mapsUrl` muestra "Mapa" con `href` igual a su `maps_url` de la BD y `target="_blank"`; las tarjetas sin `mapsUrl` muestran solo "Votar" a todo el ancho.

- [X] T032 [US2] En `src/components/home/restaurant-card.tsx`: eliminar el enlace "Ver en Maps" y agregar en la fila de T030, a la derecha de Votar, el botón secundario **Mapa**: `<a href={mapsUrl} target="_blank" rel="noopener noreferrer">` con icono `MapPin` y texto "Mapa", `min-h-11 shrink-0 rounded-xl border border-line-strong bg-white px-4 text-ink hover:border-brand hover:text-brand-ink`, `aria-label="Ver ubicación de {name} en el mapa"`. Si `mapsUrl` es `null`, no se renderiza y Votar queda con `flex-1` a todo el ancho. Comprobar a 360 px que ambos botones caben en una fila. En el recuadro de calificaciones, mantener el título "Sin calificaciones aún" (FR-025) y cambiar **solo** la línea de abajo "Pronto podrás calificar sabor, precio, cantidad y atención." por "Califica sabor, porción, atención y local." Depende de T030
- [X] T033 [P] [US2] En `src/app/page.tsx`, cambiar el párrafo del hero "Pronto podrás calificar sabor, precio, cantidad y atención…" por "Califica sabor, porción, atención y local para construir un ranking hecho por la comunidad." (sin "precio", research R13)
- [X] T034 [US2] Agregar a `tests/e2e/rating.spec.ts` (o a `tests/e2e/home.spec.ts`, en un `describe` "botones de la tarjeta") un test que, con `listActiveRestaurants` de la BD como en `home.spec.ts`, compruebe en cada tarjeta con `mapsUrl` un enlace "Ver ubicación de {name} en el mapa" con `href === mapsUrl`, `target="_blank"` y `rel` con `noopener`, y el enlace "Votar por {name}" con `href="/calificar/{slug}"`. Depende de T032

**Checkpoint**: US1 y US2 funcionan cada una por su lado.

---

## Phase 5: User Story 3 - Visitante sin sesión que quiere votar (Priority: P2)

**Goal**: quien pulsa "Votar" sin sesión ingresa (y elige username si le falta) y vuelve al formulario de la pollería elegida.

**Independent Test**: sin sesión, pulsar "Votar" en una pollería → `/login?callbackUrl=%2Fcalificar%2F{slug}` → ingresar con correo y contraseña → la URL final es `/calificar/{slug}`.

### Tests for User Story 3

- [X] T035 [P] [US3] Actualizar `tests/domain/access.test.ts`: los casos que hoy esperan `"/login"` o `"/onboarding/username"` para rutas protegidas ahora esperan `"/login?callbackUrl=%2Fcalificar%2Flolo"` y `"/onboarding/username?callbackUrl=%2Fsugerir"`; el onboarding sin sesión sigue devolviendo `"/login"`. Agregar un `describe("safeCallbackPath")` con la tabla de contracts/routes-and-ui.md: `"/calificar/pollos-kingdom"` se mantiene; `null`, `""`, `"https://malo.com"`, `"//malo.com"`, `"/\\malo.com"`, `"javascript:alert(1)"` y `"calificar/x"` → `"/"`

### Implementation for User Story 3

- [X] T036 [US3] En `src/domain/user/access.ts`: agregar `export function safeCallbackPath(value: string | null | undefined): string` (acepta solo strings que empiezan con `/`, no con `//` ni `/\`, sin `:` antes de la primera `/`; si no, `"/"`), y hacer que `redirectFor` devuelva `` `/login?callbackUrl=${encodeURIComponent(pathname)}` `` y `` `/onboarding/username?callbackUrl=${encodeURIComponent(pathname)}` `` para las rutas de `LOGIN_REQUIRED_PREFIXES`. La rama del onboarding sin sesión sigue devolviendo `"/login"`. `src/proxy.ts` no cambia. Depende de T035
- [X] T037 [US3] En `src/components/auth/google-sign-in-button.tsx`: agregar la prop opcional `callbackUrl?: string`, renderizada como `<input type="hidden" name="callbackUrl">`, y cambiar el tipo de `action` a `(formData: FormData) => Promise<void>`. En `src/components/auth/login-form.tsx`, `register-form.tsx` y `username-form.tsx`: agregar la prop opcional `callbackUrl?: string` como `<input type="hidden" name="callbackUrl">`; en `login-form.tsx`, `registerHref` debe conservar `?callbackUrl=` si viene
- [X] T038 [US3] En `src/app/_actions/auth.ts`, leer `callbackUrl` del `formData` y pasarlo por `safeCallbackPath` (de `@/domain/user/access`) en todas las acciones: `loginWithPasswordAction` → `redirect(dest)`; `loginWithGoogleAction(formData)` → `signIn("google", { redirectTo: "/onboarding/username?callbackUrl=" + encodeURIComponent(dest) })`; `registerAction` → `signIn("credentials", { …, redirectTo: dest })`; `chooseUsernameAction` → `redirect(dest)`. Los esquemas Zod de `src/app/_lib/auth-schemas.ts` ignoran el campo extra (verificar que `z.object` no lo rechace). Depende de T036, T037
- [X] T039 [US3] En `src/app/login/page.tsx`: ampliar `searchParams` a `{ error?: string; callbackUrl?: string }`, calcular `safeCallbackPath(callbackUrl)` y pasarlo a `GoogleSignInButton`, a `LoginForm` y al `registerHref` (`/register?callbackUrl=…`). Si viene `callbackUrl` hacia `/calificar/…`, mostrar sobre el formulario el aviso "Necesitas una cuenta para votar." En `src/app/register/page.tsx`: leer `searchParams.callbackUrl` (envolviendo en `<Suspense>` igual que login, por `cacheComponents`), pasarlo a `GoogleSignInButton` y `RegisterForm`, y conservarlo en el enlace a `/login`. Depende de T037, T038
- [X] T040 [US3] En `src/app/onboarding/username/page.tsx`: recibir `searchParams: Promise<{ callbackUrl?: string }>`; si la sesión ya tiene username → `redirect(safeCallbackPath(callbackUrl))` en lugar de `"/"`; pasar `callbackUrl` a `UsernameForm`. Depende de T038
- [X] T041 [US3] Agregar a `tests/e2e/rating.spec.ts`: (1) sin sesión, pulsar "Votar por {pollería}" → la URL contiene `/login?callbackUrl=` y se ve "Necesitas una cuenta para votar."; ingresar con un `createPasswordUser` → la URL final es `/calificar/{slug}`; (2) una cuenta de Google sin username (`createGoogleUserWithoutUsername` + `signInAsGoogleUser`) que abre `/calificar/{slug}` → va a `/onboarding/username?callbackUrl=…` → elige username → termina en `/calificar/{slug}`; (3) `/login?callbackUrl=https://malo.com` → tras ingresar termina en `/`; (4) desde `/register?callbackUrl=%2Fcalificar%2F{slug}`, crear una cuenta nueva con `e2eUsername()`, `e2eEmail()` y `E2E_PASSWORD` → la URL final es `/calificar/{slug}` (Principio IV: el registro cambió, necesita su e2e). Depende de T039, T040

**Checkpoint**: US1, US2 y US3 funcionan cada una por su lado. Los tests de `tests/e2e/auth.spec.ts` siguen en verde (sin `callbackUrl`, todo va a `/` como antes).

---

## Phase 6: User Story 4 - Ya voté esta pollería (Priority: P3)

**Goal**: quien ya votó ve "Ya calificaste esta pollería" con sus notas, sin formulario. Un segundo envío se rechaza sin cambiar el voto original.

**Independent Test**: votar una pollería y volver a `/calificar/{slug}`: aparece el aviso con las mismas 4 notas y no hay botón "Enviar mi voto"; en la BD sigue habiendo 1 fila.

### Tests for User Story 4

- [X] T042 [P] [US4] Crear `tests/application/get-my-rating.test.ts` con `createFakeRatingRepository`: devuelve el voto del usuario para esa pollería; `null` si votó otra pollería; `null` si otro usuario votó esa pollería

### Implementation for User Story 4

- [X] T043 [P] [US4] Crear el caso de uso `src/application/rating/get-my-rating.ts`: `createGetMyRating(deps: { ratings: RatingRepository })` → `getMyRating(userId: string, restaurantId: string): Promise<RatingRecord | null>`; registrarlo en `useCases` de `src/composition/container.ts` como `getMyRating: createGetMyRating({ ratings })`. Depende de T017, T019
- [X] T044 [P] [US4] Crear `src/components/rating/already-rated.tsx` (servidor): props `{ restaurant: { name; zone; address; photoUrl }; scores: RatingScores; comment: string | null }`. Muestra RatingHero, el título "Ya calificaste esta pollería", el ScoreRing `lg` con `overallScore(scores)` y `scoreLabel`, las 4 notas en solo lectura (título del criterio + número + etiqueta, en filas separadas por `border-line`), el comentario si existe, el texto "Los votos son definitivos y no se pueden cambiar." y el botón primario `<Link href="/#locales">Volver al catálogo</Link>`. Sin escalas ni botón de enviar. Depende de T024, T026
- [X] T045 [US4] En `src/app/calificar/[slug]/page.tsx`, dentro del componente bajo `<Suspense>` y después de las verificaciones de sesión: `const mine = await useCases.getMyRating(session.user.id, restaurant.id)`; si existe, renderizar `<AlreadyRated …/>` en lugar de `<RatingForm/>`. Depende de T029, T043, T044
- [X] T046 [US4] Agregar a `tests/e2e/rating.spec.ts`: tras votar (caso US1), recargar `/calificar/{slug}` → se ve "Ya calificaste esta pollería", aparecen las notas enviadas y no existe el botón "Enviar mi voto"; luego reenviar el mismo formulario desde una segunda pestaña abierta antes del primer envío → ve "Ya calificaste esta pollería." y la BD sigue con 1 fila y las notas originales. Depende de T045

**Checkpoint**: las 4 historias funcionan cada una por su lado.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T047 [P] Revisar a 360 px y a 1280 px `/` y `/calificar/{slug}` (formulario, confirmación, "Ya calificaste" y no encontrada): sin scroll horizontal, zonas táctiles ≥ 44 px, la barra fija móvil no tapa el comentario ni el botón, contraste suficiente y foco visible con teclado (FR-005, FR-016, FR-017, SC-007)
- [X] T048 [P] Buscar en `src/` restos del modelo anterior (`stars`, "estrellas", "precio" en textos de criterios, "Ver en Maps") y corregirlos; confirmar que no queda ningún color hex nuevo en `src/components/rating/` ni en `restaurant-card.tsx` (solo tokens del tema)
- [X] T049 Correr `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm test:e2e`; arreglar cualquier falla antes de dar la feature por terminada (CLAUDE.md, Principio IV). El test de arquitectura `tests/architecture/import-boundaries.test.ts` debe seguir en verde
- [X] T050 Recorrer a mano la tabla del paso 3 y la consulta del paso 4 de [quickstart.md](./quickstart.md), y anotar el resultado en el PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1, T001)**: sin dependencias. Va primero porque es la condición del Constitution Check.
- **Foundational (Phase 2, T002–T012)**: depende de T001. **Bloquea todas las historias.**
- **US1 (Phase 3)**: depende de la fase 2.
- **US2 (Phase 4)**: depende de la fase 2 y de **T030** (la fila de botones que crea US1 en `restaurant-card.tsx`). Si se quiere US2 antes que US1, hacer T030 primero; T030 no depende de nada más que la fase 2.
- **US3 (Phase 5)**: depende de la fase 2. Para su e2e (T041) necesita que existan la página de US1 (T029) y el botón Votar (T030).
- **US4 (Phase 6)**: depende de US1 (T017, T019, T024, T026, T029).
- **Polish (Phase 7)**: depende de las historias que se vayan a entregar.

### Dependencias clave dentro de las fases

```text
T004 → T005 (migración)          T006 → T007, T008, T009 → T011 → T012
T002 → T016, T020, T023          T013 → T014, T016, T017 → T019 → T022 → T029 → T031
T021, T023–T025 → T027 → T029 ← T026    T030 → T032 → T034
T035 → T036 → T038 → T039, T040 → T041
T043 + T044 → T045 → T046
```

### Parallel Opportunities

- Fase 2: T002 ‖ T003 ‖ T004 ‖ T006; después T009 ‖ T010 una vez listo T006.
- US1: T013 ‖ T017 ‖ T018 ‖ T020 ‖ T021 ‖ T023 ‖ T024 ‖ T025 ‖ T026 ‖ T028 (todos en archivos distintos).
- US3: T035 en paralelo con cualquier tarea de US1; T037 en paralelo con T036.
- US4: T042 ‖ T043 ‖ T044.
- Con el equipo de 4: tras la fase 2, una persona en el backend de US1 (T013–T022), otra en la UI de US1 (T023–T028), otra en US3 (T035–T040) y otra en US2 (T030, T032, T033).

---

## Parallel Example: User Story 1

```bash
# Backend del voto, en paralelo:
Task: "Crear el puerto RatingRepository en src/application/ports/rating-repository.ts"   # T013
Task: "Agregar la regla rating (10 / 1 h) en src/infrastructure/ratelimit/upstash.ts"      # T018
Task: "Crear el esquema Zod en src/app/_lib/rating-schemas.ts"                             # T020

# Componentes de UI, en paralelo:
Task: "Crear src/components/rating/score-scale.tsx"    # T023
Task: "Crear src/components/rating/score-ring.tsx"     # T024
Task: "Crear src/components/rating/progress-bar.tsx"   # T025
Task: "Crear src/components/rating/rating-hero.tsx"    # T026
```

---

## Implementation Strategy

### MVP primero (solo US1)

1. T001 (SPEC) → fase 2 (T002–T012).
2. Fase 3 completa (T013–T031).
3. **Parar y validar**: votar de punta a punta con un usuario con sesión; 1 fila en la BD.
4. Demo o deploy si está listo.

### Entrega incremental

1. Setup + Foundational → base lista.
2. US1 → probar → demo (MVP: ya se puede votar).
3. US2 → probar → demo (botón Mapa).
4. US3 → probar → demo (los usuarios nuevos vuelven al formulario).
5. US4 → probar → demo (aviso "Ya calificaste").
6. Polish → PR a `main`.

---

## Notes

- `[P]` = otro archivo, sin depender de tareas incompletas.
- Las rutas, nombres de columnas, textos y códigos de error de las tareas salen de [data-model.md](./data-model.md) y [contracts/](./contracts/); ante una duda, mandan esos documentos y `docs/SPEC.md`.
- No se agrega ninguna dependencia nueva (Principio VI). Si alguna tarea parece necesitarla, preguntar antes.
- No editar migraciones ya aplicadas (`0000`, `0001`).
- Commits pequeños `tipo: descripción`, sin `Co-Authored-By`.
