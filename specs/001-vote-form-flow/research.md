# Research: Votar desde la tarjeta, formulario de votación y botón de mapa

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Fecha**: 2026-11-06

No quedan `NEEDS CLARIFICATION`. Las tres decisiones que dependían del usuario se tomaron el 2026-11-06: reemplazar `stars` (R4), tarjeta siempre con "Votar" (R9) y votos sin edición (R3). El resto sale del código que ya existe en `src/` y de la guía de Next 16 incluida en `node_modules/next/dist/docs/`.

---

## R1. Ruta del formulario

- **Decision**: `/calificar/[slug]`, una página por pollería, identificada por el `slug` que ya existe (único en la BD).
- **Rationale**: `src/domain/user/access.ts` ya incluye `/calificar` en `LOGIN_REQUIRED_PREFIXES`, así que el proxy ya redirige a login u onboarding sin código nuevo. El `slug` ya viaja en `CatalogRestaurant` y produce URLs legibles para compartir (FR-006).
- **Alternatives considered**: modal sobre la home (rompe el diseño de Stitch, no se puede compartir y obliga a la home a leer la sesión); `/pollerias/[slug]/calificar` (requiere el perfil de pollería, que no existe todavía).

## R2. Volver al formulario después de ingresar (FR-008, SC-006)

- **Decision**: propagar un parámetro `callbackUrl` por todo el flujo de acceso:
  1. `redirectFor` (dominio) agrega `?callbackUrl=<ruta original>` cuando manda a `/login` o a `/onboarding/username`.
  2. La página de login lo lee y lo pasa como campo oculto al formulario de contraseña y a la acción de Google. El enlace "Crear cuenta" lo conserva.
  3. `loginWithPasswordAction`, `registerAction`, `loginWithGoogleAction` (vía onboarding) y `chooseUsernameAction` redirigen a esa ruta en vez de `/`.
  4. Una función pura nueva del dominio, `safeCallbackPath(value)`, solo acepta rutas internas: empiezan con `/`, no con `//` ni `/\`, y no tienen esquema. Cualquier otro valor cae en `/`.
- **Rationale**: es lo mínimo para cumplir SC-006 reutilizando todo el flujo actual. Validar en el dominio evita un open redirect (Principio V) y se puede probar sin Next.
- **Alternatives considered**: cookie de "ruta pendiente" (más estado oculto y difícil de probar); el `callbackUrl` nativo de Auth.js (solo cubre `signIn` con redirect; el login con contraseña usa `redirect: false` y el onboarding es propio).

## R3. Guardado atómico, un voto por usuario y pollería (FR-019, SC-003)

- **Decision** (los votos no se editan, decisión del usuario del 2026-11-06): el repositorio hace `INSERT … ON CONFLICT (user_id, restaurant_id) DO NOTHING RETURNING …` sobre el índice único que ya existe (`ratings_user_restaurant_unique`). Si no devuelve fila, ya había un voto y el caso de uso responde `already_rated`.
- **Rationale**: el driver actual (`drizzle-orm/neon-http`) no tiene transacciones interactivas, pero una sentencia es atómica. Así el doble clic o dos pestañas terminan en una sola fila (la primera) sin carrera entre "buscar" e "insertar", y sin lanzar excepciones que haya que traducir.
- **Alternatives considered**: upsert con `DO UPDATE` (permitiría editar, y eso se descartó); buscar y luego insertar (carrera entre pestañas); capturar el `unique_violation` como en `unique-violation.ts` (funciona, pero `DO NOTHING` es más simple).

## R4. Esquema de `ratings` (decisión del usuario: reemplazar `stars`)

- **Decision**: una migración nueva (`0002_…`, generada con `pnpm db:generate`) que:
  - elimina el CHECK `ratings_stars_range` y la columna `stars`;
  - agrega `flavor_score`, `portion_score`, `service_score` y `place_score` como `smallint NOT NULL`, cada una con su CHECK `between 1 and 10`.
- **Rationale**: la tabla está vacía (el catálogo muestra "Sin calificaciones aún"), así que no se pierde ni convierte nada. La nota general es un promedio que se calcula al leer, así que guardarla duplicaría información (Principio VI). Los CHECK cumplen FR-020 y el Principio III.
- **Alternatives considered**: mantener `stars` como nota general guardada (lo descartó el usuario: duplica un valor calculable).
- **Riesgo**: si alguna base local tiene filas de prueba en `ratings`, `ADD COLUMN … NOT NULL` falla. Mitigación: el quickstart indica vaciar `ratings` en la base local antes de migrar. Producción no tiene votos.

## R5. Reglas del voto en `domain/rating/`

- **Decision**: un módulo puro con:
  - `RATING_CRITERIA`: lista fija de los 4 criterios (clave, título, pregunta guía, texto del 1 y del 10);
  - `SCORE_MIN = 1`, `SCORE_MAX = 10`, `COMMENT_MAX_LENGTH = 280`;
  - `scoreLabel(n)`: 1–3 Malo, 4–6 Regular, 7 Bueno, 8 Muy bueno, 9–10 Excelente;
  - `overallScore(scores)`: promedio de los criterios calificados, con un decimal, o `null` si no hay ninguno;
  - `normalizeComment(text)`: recorta espacios; vacío pasa a `null`;
  - `validateRatingScores(scores)`: enteros dentro de rango para los 4 criterios.
- **Rationale**: lo usan el caso de uso (validación de negocio), el borde Zod (límites) y el formulario cliente (etiquetas y nota en vivo). ESLint permite que `components/` importe de `domain/`, así que no se duplican reglas. Además lleva tests obligatorios (Principio IV).
- **Alternatives considered**: definir los criterios en el componente (rompe la regla 3 de CLAUDE.md) o guardarlos en la BD como tabla (no hace falta: son fijos en v1).

## R6. Casos de uso y puertos (reutilizando el patrón actual)

- **Decision**:
  - `RestaurantRepository` suma `findActiveBySlug(slug)`.
  - Puerto nuevo `RatingRepository` con `findByUserAndRestaurant(userId, restaurantId)` y `createIfAbsent(input)` (devuelve el voto creado o `null` si ya existía).
  - Caso de uso `getRestaurantBySlug(slug)`: pollería activa o `null`. Es público y se puede cachear.
  - Caso de uso `getMyRating(userId, restaurantId)`: el voto previo del usuario o `null`, para mostrar "Ya calificaste" (FR-019a). Depende de la sesión y no se cachea en el servidor.
  - Caso de uso `rateRestaurant(input)`: valida con el dominio, comprueba en la BD que el usuario existe y tiene `username` (sin confiar solo en el token) y que la pollería está activa, y crea el voto si no existe. Devuelve `{ ok: true, rating }` o un código de error (`invalid_scores`, `comment_too_long`, `restaurant_not_found`, `username_required`, `already_rated`).
  - Ambos se arman en `composition/container.ts` como los existentes (`createX(deps)`), con fakes en memoria en `tests/application/fakes.ts`.
- **Rationale**: es el mismo patrón que `chooseUsername` y `listActiveRestaurants`. Se puede probar sin BD y respeta las capas.
- **Alternatives considered**: un único `getRatingForm(userId, slug)` que devuelva pollería y voto juntos (no permite cachear la parte pública por separado, que es lo que pide Cache Components); un solo caso de uso con lectura y escritura juntas (mezcla responsabilidades).

## R7. Límite de 10 votos por hora (FR-021)

- **Decision**: una regla nueva `RATE_LIMIT_RULES.rating = { name: "rating", limit: 10, window: "1 h" }`, expuesta como `rateLimiters.rating` en `composition/` y aplicada en la server action con la clave `user:<id>`, antes de llamar al caso de uso. Cuenta todos los intentos de envío.
- **Rationale**: es el patrón actual (login y registro se limitan en la acción con `rateLimiters`). `createIpRateLimiter` acepta cualquier identificador, así que no hace falta otra fábrica.
- **Alternatives considered**: un puerto `RateLimiter` dentro del caso de uso (más limpio en teoría, pero distinto de lo existente; se puede hacer después para todos a la vez).

## R8. Server action y validación en el borde

- **Decision**: `src/app/_actions/rating.ts` → `submitRatingAction(state, formData)`, usada con `useActionState`. Pasos: `auth()` (sin sesión → `redirect` a login con `callbackUrl`), parseo Zod (`src/app/_lib/rating-schemas.ts`, con `z.coerce.number().int().min(1).max(10)` por criterio, `slug` y comentario `≤ 280`), límite por usuario, caso de uso. Devuelve `{ status: "idle" | "saved" | "error", error?: code }`. No redirige al guardar: la confirmación se muestra en el mismo formulario (FR-023 ajustado).
- **Rationale**: es el mismo patrón que `auth.ts` (`FormState` con códigos y mensajes en `components/`). Con JS desactivado el formulario sigue funcionando (progressive enhancement). No hay que revalidar nada: la home no muestra votos (FR-025).
- **Alternatives considered**: route handler `POST /api/ratings` (más código, sin ventaja para un formulario propio); redirigir a `/?voto=ok` (la home tendría que leer `searchParams` y dejaría de estar en caché).

## R9. Botones de la tarjeta (decisión del usuario: siempre "Votar")

- **Decision**: `RestaurantCard` recibe `slug` y muestra una fila de dos botones: **Votar** (`<Link href="/calificar/[slug]">`, primario, con `flex-1`) y **Mapa** (`<a target="_blank" rel="noopener noreferrer">`, secundario con borde, icono `MapPin`). Sin `mapsUrl`, "Mapa" no se muestra y "Votar" ocupa todo el ancho. Reemplaza "Ver en Maps". El texto "Pronto podrás calificar sabor, precio…" pasa a nombrar los criterios reales.
- **Rationale**: la tarjeta sigue siendo un Server/Client component sin sesión, así que el catálogo sigue en caché (`"use cache"` en `getActiveRestaurants`). Los dos botones de ≥ 44 px caben en 360 px (FR-005).
- **Alternatives considered**: el botón cambia a "Editar voto" (lo pospuso el usuario: obligaría a leer la sesión en la home).

## R10. Página `/calificar/[slug]` con Cache Components

- **Decision**:
  - `generateMetadata` y la parte visual de la pollería usan una función de datos con `"use cache"` (`cacheLife("minutes")`) que llama al caso de uso `getRestaurantBySlug`. Se puede cachear porque no depende del usuario.
  - El voto previo del usuario se lee dentro de un `<Suspense>`, con `connection()` y `auth()`, igual que en `onboarding/username/page.tsx`.
  - `params` es `Promise<{ slug: string }>` (Next 16). Si el slug no existe u la pollería está oculta → `notFound()`.
  - Metadata: título "Califica {nombre} · ComiDeli", Open Graph con la foto de la pollería, `robots: noindex` (requiere sesión).
- **Rationale**: la guía *Authentication with Cache Components* exige que toda lectura de sesión quede detrás de Suspense. Así la foto y el nombre llegan en el shell estático y solo las notas previas esperan la petición.
- **Alternatives considered**: renderizar toda la página por petición (más lento en datos móviles).

## R11. Componentes de UI (diseño de Stitch, sin dependencias nuevas)

- **Decision**: en `src/components/rating/`:
  - `rating-form.tsx` (cliente): estado de las 4 notas y del comentario, `useActionState`, layout de dos columnas en `lg:` y barra fija abajo en móvil.
  - `score-scale.tsx`: grupo de 10 `input type="radio"` nativos con estilo de barra segmentada. Se rellena desde el 1 hasta el valor elegido y responde a flechas del teclado y a lectores de pantalla (FR-017), sin librería.
  - `score-ring.tsx`: anillo SVG con la nota general.
  - `progress-bar.tsx`: "N de 4 criterios · %".
  - `rating-hero.tsx`: foto (`next/image`), nombre y zona; usa el mismo marcador sin foto que la tarjeta.
  - `messages.ts`: textos de error en español.
  - Iconos de `lucide-react` (ya instalado). Colores: tokens existentes del tema (`brand`, `brand-dark`, `brand-soft`, `ink`, `line`, `cream`…). No se agregan colores en componentes.
- **Rationale**: radios nativos dan accesibilidad y funcionan sin JS. No hace falta un slider ni un paquete nuevo (Principio VI).
- **Alternatives considered**: el componente `Slider` de shadcn (no está instalado y un slider continuo es peor en táctil para 10 valores discretos); botones con `aria-pressed` (hay que reimplementar la navegación por teclado).

## R12. Estrategia de pruebas

- **Decision**:
  - **Vitest (dominio)**: `tests/domain/rating.test.ts` (rangos, etiquetas, promedio, comentario) y casos nuevos en `tests/domain/access.test.ts` (`callbackUrl` y `safeCallbackPath`, incluidos intentos de open redirect).
  - **Vitest (aplicación)**: `tests/application/rate-restaurant.test.ts`, `get-restaurant-by-slug.test.ts` y `get-my-rating.test.ts`, con un `createFakeRatingRepository` que respeta la unicidad `(user, restaurant)`.
  - **Playwright**: `tests/e2e/rating.spec.ts`: botones de la tarjeta y `href` del mapa; visitante → login → vuelve al formulario; usuario vota los 4 criterios → recarga y ve "Ya calificaste" con sus notas; un segundo envío forzado se rechaza y sigue habiendo 1 fila (consulta directa a la BD); envío inválido rechazado. Los votos de prueba se borran solos por la cascada al borrar usuarios `e2e-`.
- **Rationale**: Principio IV, y "calificar una pollería" es uno de los flujos e2e obligatorios.
- **Alternatives considered**: ninguna; es lo que pide la constitución.

## R13. Documentación que debe cambiar con la feature

- **Decision**: actualizar `docs/SPEC.md` en el mismo cambio: regla 1 (un voto por pollería, **sin edición en v1**), modelo `ratings` (4 notas 1–10 en vez de `stars`), sección 1 (las 4 categorías dejan de ser un no-objetivo), regla 6 (R = promedio de los 4 criterios, escala 1–10), regla 8 (decía "calificación en estrellas") y pantalla "Calificar" (escala segmentada en vez de estrellas).
- **Rationale**: la constitución hace del SPEC la fuente de verdad; implementar en contra de él sería una violación.
