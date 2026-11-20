---

description: "Lista de tareas: acceso de administradores"
---

# Tasks: Acceso de administradores

**Input**: Documentos de diseño en `specs/003-admin-access/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/admin-access.md](./contracts/admin-access.md), [quickstart.md](./quickstart.md)

**Tests**: SÍ se incluyen. La constitución (principio V) exige tests unitarios para `domain/` y para los casos de uso con reglas de negocio importantes, y un e2e para los flujos principales. Ninguna historia se da por terminada sin sus tests.

**Organization**: las tareas se agrupan por historia de usuario para implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin depender de tareas incompletas).
- **[Story]**: historia a la que pertenece (US1, US2, US3, según [spec.md](./spec.md)).
- Rutas relativas a la raíz del repo (proyecto único: `src/`, `tests/`).

## Reglas para quien implemente (leer antes de empezar)

- Leer `CLAUDE.md`, `docs/SPEC.md`, `AGENTS.md` y `.specify/memory/constitution.md` (v1.1.0, principio III: reglas del rol admin). Next 16 trae cambios: consultar `node_modules/next/dist/docs/` antes de escribir páginas o server actions.
  - `params` y `searchParams` son `Promise`.
  - `cacheComponents: true`: la sesión se lee dentro de `<Suspense>` después de `await connection()`, igual que `MyProfile` en `src/app/mi-perfil/page.tsx`.
  - `notFound()` (`01-app/03-api-reference/04-functions/not-found.md`). **No** usar `forbidden()` (research R6).
- Capas: `app/` y `components/` nunca importan de `infrastructure/`; `components/` tampoco importa de `composition/`. `process.env.ADMIN_EMAILS` se lee **solo** en `src/composition/container.ts`.
- El rol **no** se agrega al JWT ni a `Session` (research R4). No tocar `src/composition/auth.ts` salvo que el typecheck lo pida.
- **Sin migraciones**: `users.role` ya existe (`user_role` enum `user` | `admin`, not null, default `user`).
- **Ningún enlace ni botón hacia `/admin`** en `src/components/` ni en `src/app/` fuera de `src/app/admin/` (FR-009).
- Código en inglés, textos visibles en español, sin `any`. Colores solo con tokens del tema de `src/app/globals.css` (`brand`, `brand-soft`, `brand-ink`, `ink`, `ink-muted`, `line`, `cream`).
- **Usuarios de prueba**: los usuarios `e2e-…` **se mantienen** en la base. Los e2e nuevos no llaman a `deleteE2eUsers()`.
- Un commit por tarea o grupo lógico, con el formato `tipo: descripción`. **En este repo los commits NO llevan trailers `Co-Authored-By`.**
- Antes de dar cada fase por terminada: `pnpm lint`, `pnpm typecheck`, `pnpm test`.

---

## Phase 1: Setup

**Purpose**: configuración de la lista de admins.

- [ ] T001 Documentar `ADMIN_EMAILS` en `.env.example`: comentario en español ("Correos de Google de los administradores, separados por comas. Solo cuentas de Google con correo verificado reciben el rol. Mayúsculas y espacios se ignoran.") y la línea `ADMIN_EMAILS=` vacía. Agregar el correo propio a `.env.local` para probar (no versionado).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la lista de correos en dominio y el rol en el puerto de usuarios. Bloquea todas las historias.

- [ ] T002 [P] Tests de la lista autorizada en `tests/domain/admin.test.ts`: `parseAdminAllowlist` con `undefined` y `""` → conjunto vacío; `" Juan@Gmail.com , ana@gmail.com"` → `{"juan@gmail.com", "ana@gmail.com"}`; ignora elementos vacíos (`"a@b.com,,"`), sin `@` (`"juan"`), con más de un `@` (`"a@b@c"`) y con `@` al borde (`"@b.com"`, `"a@"`); acepta más de tres correos. `isAllowlistedEmail("  JUAN@gmail.com ", allowlist)` → `true`; correo ausente → `false`; lista vacía → `false`. Deben fallar antes de T003.
- [ ] T003 [P] Crear `src/domain/user/admin.ts`: `export type AdminAllowlist = ReadonlySet<string>`; `parseAdminAllowlist(raw: string | undefined): AdminAllowlist` (separa por `,`, aplica `normalizeEmail` de `src/domain/user/email.ts`, descarta vacíos y lo que no tenga forma `local@dominio`: "exactamente un `@`, texto a ambos lados"); `isAllowlistedEmail(email: string, allowlist: AdminAllowlist): boolean` (normaliza antes de comparar). Sin imports fuera de `domain/`. Hace pasar T002.
- [ ] T004 Cambiar el puerto en `src/application/ports/user-repository.ts`: `export type UserRole = "user" | "admin"`; agregar `role: UserRole` a `UserRecord`; `NewUser = Omit<UserRecord, "id" | "role">` (toda cuenta nace `user` por el default de la base); agregar `setRole(id: string, role: UserRole): Promise<UserRecord>` a `UserRepository` con el comentario "Un solo UPDATE; no toca otros campos (FR-006). Lanza error si la cuenta no existe."
- [ ] T005 Implementar en `src/infrastructure/db/user-repository.ts`: `toUserRecord` incluye `role: row.role` (quitar "ni role" del comentario); `setRole` con `db.update(users).set({ role }).where(eq(users.id, id)).returning()`, lanza `Error` si no devuelve fila. Depende de T004.
- [ ] T006 Actualizar el fake en `tests/application/fakes.ts`: `create` guarda `role: "user"`; implementar `setRole` (lanza si el id no existe, devuelve la copia actualizada). Depende de T004.
- [ ] T007 Agregar `role: "user"` a cada `UserRecord` escrito a mano en los tests existentes hasta que `pnpm typecheck` pase: `tests/application/authenticate-with-password.test.ts`, `get-viewer-review-state.test.ts`, `check-username-availability.test.ts`, `versus.test.ts`, `rate-restaurant.test.ts`, `get-my-profile.test.ts`, `sign-in-with-google.test.ts`, `set-review-helpful.test.ts`, `choose-username.test.ts`, `register-with-password.test.ts`. Revisar también `src/application/user/register-with-password.ts` y `src/application/user/sign-in-with-google.ts` (no deben pasar `role` a `create`). Depende de T004 y T006.
- [ ] T008 En `src/composition/container.ts`: `const adminEmails = parseAdminAllowlist(process.env.ADMIN_EMAILS);` junto a los repositorios, con el comentario "Lista de admins (FR-002): configuración del servidor, nunca del código." Depende de T003.

**Checkpoint**: `pnpm typecheck` y `pnpm test` pasan; el comportamiento visible no cambió.

---

## Phase 3: User Story 1 - Un desarrollador obtiene el rol de admin al ingresar con Google (Priority: P1) 🎯 MVP

**Goal**: al ingresar con Google, la cuenta queda `admin` si su correo está en la lista, y `user` si no.

**Independent Test**: con un correo en `ADMIN_EMAILS`, ingresar con Google y ver en la base `users.role = 'admin'`; con un correo fuera de la lista, `role = 'user'`.

### Tests for User Story 1

- [ ] T009 [US1] Ampliar `tests/application/sign-in-with-google.test.ts` (crear el caso de uso con `{ users, adminEmails: parseAdminAllowlist("juan@gmail.com") }`): cuenta nueva con correo en la lista → `user.role === "admin"` y `username === null` (US1-1); cuenta existente `user` con correo agregado → pasa a `admin` y conserva `username` (US1-2, FR-006); correo fuera de la lista → `user` (US1-3); lista `" JUAN@Gmail.com "` reconoce `juan@gmail.com` (US1-4); cuenta `admin` cuyo correo ya no está → vuelve a `user` (FR-004); rol que no cambia → `setRole` no se llama (espiar el fake); `email_registered_with_password` no toca roles. Deben fallar antes de T010.

### Implementation for User Story 1

- [ ] T010 [US1] Cambiar `src/application/user/sign-in-with-google.ts` según [contrato](./contracts/admin-access.md#signinwithgoogleprofile-cambia): dependencias `{ users: UserRepository; adminEmails: AdminAllowlist }`; después de encontrar o crear la cuenta, calcular `expected = isAllowlistedEmail(user.email, adminEmails) ? "admin" : "user"` con el **correo guardado** de la cuenta (research R3); si `user.role !== expected`, `user = await users.setRole(user.id, expected)`. Devolver el registro actualizado. Actualizar el JSDoc. Hace pasar T009.
- [ ] T011 [US1] Pasar `adminEmails` a `createSignInWithGoogle` en `src/composition/container.ts`. Depende de T008 y T010.

**Checkpoint**: US1 completa. Un desarrollador ya tiene rol admin en la base, aunque todavía no hay pantalla.

---

## Phase 4: User Story 2 - Al iniciar sesión, un admin entra directo a la pantalla de administración (Priority: P1)

**Goal**: sin botones; tras el login con Google un admin llega solo a `/admin`; `/admin` solo responde al admin.

**Independent Test**: admin con `@usuario` → tras el login aterriza en `/admin` con "Hola, @usuario"; usuario normal → flujo normal y `/admin` a mano da 404; visitante → login.

### Tests for User Story 2

- [ ] T012 [P] [US2] Tests en `tests/application/get-admin-access.test.ts` (fake de usuarios + `parseAdminAllowlist("juan@gmail.com")`): cuenta inexistente → `not_admin`; Google + `admin` + en lista + `username` → `{ ok: true, admin: { username } }` y el resultado no tiene `email` ni `name` (FR-011); igual pero `username: null` → `needs_username`; `role: "user"` con correo en la lista → `not_admin` y el rol **no** sube; cuenta de contraseña (`googleId: null`) con `role: "admin"` y correo en la lista → `not_admin` y queda `user` (FR-005). Deben fallar antes de T014.
- [ ] T013 [P] [US2] Tests en `tests/application/post-sign-in-destination.test.ts` (con un `getAdminAccess` falso): acceso `ok` → `"/admin"` aunque se pida `"/polleria/x"` (edge case de origen); `not_admin` → devuelve lo pedido; `needs_username` → devuelve lo pedido. Deben fallar antes de T015.
- [ ] T014 [P] [US2] En `tests/domain/access.test.ts`: `redirectFor({ pathname: "/admin", hasSession: false, hasUsername: false })` → `"/login?callbackUrl=%2Fadmin"`; con sesión y sin username → onboarding con `callbackUrl=%2Fadmin`; con sesión y username → `null`.
- [ ] T015 [P] [US2] Test de arquitectura en `tests/architecture/no-admin-links.test.ts`: recorre con `node:fs` todos los `.ts`/`.tsx` de `src/components/` y de `src/app/` excepto `src/app/admin/`, y falla si alguno contiene un enlace o una redirección hacia el área de administración: la expresión `/(href|redirect|push|replace)\s*[=(:]\s*\{?\s*["'\`]\/admin\b/` (FR-009). No debe saltar con comentarios que mencionan `/admin`. Mensaje de error con la lista de archivos.

### Implementation for User Story 2

- [ ] T016 [US2] Crear `src/application/admin/get-admin-access.ts` según [contrato](./contracts/admin-access.md#getadminaccessuserid-nuevo): `export type AdminAccess = { ok: true; admin: { username: string } } | { ok: false; reason: "not_admin" | "needs_username" }`; `createGetAdminAccess(deps: { users: UserRepository; adminEmails: AdminAllowlist })`; orden: (1) cuenta inexistente → `not_admin`; (2) `qualifies = googleId !== null && isAllowlistedEmail(email, adminEmails)`; (3) `role === "admin" && !qualifies` → `setRole(id, "user")` y `not_admin`; (4) `role !== "admin"` → `not_admin`; (5) `username === null` → `needs_username`; (6) `ok`. Hace pasar T012.
- [ ] T017 [US2] Crear `src/application/admin/post-sign-in-destination.ts`: `createPostSignInDestination(deps: { getAdminAccess: (userId: string) => Promise<AdminAccess> })` → `(userId: string, requested: string) => Promise<string>`; `"/admin"` si el acceso es `ok`, si no `requested`. JSDoc: "`requested` ya viene validado por `safeCallbackPath`." Hace pasar T013.
- [ ] T018 [US2] Registrar en `src/composition/container.ts`: `const getAdminAccess = createGetAdminAccess({ users, adminEmails })`; agregar `getAdminAccess` y `postSignInDestination: createPostSignInDestination({ getAdminAccess })` a `useCases`. Depende de T016 y T017.
- [ ] T019 [P] [US2] Agregar `"/admin"` a `LOGIN_REQUIRED_PREFIXES` en `src/domain/user/access.ts` y actualizar su comentario ("/admin además se autoriza en la página"). Hace pasar T014.
- [ ] T020 [P] [US2] Crear `src/components/admin/messages.ts` con `ADMIN_TEXT`: `title` ("Panel de administración"), `greeting` (función `(username) => \`Hola, @${username}\``), `comingSoon` ("Las herramientas de administración llegan en las próximas entregas: analíticas de votos, moderación de comentarios, sugerencias y reportes."), `backToRanking` ("Ir al ranking").
- [ ] T021 [US2] Crear `src/components/admin/admin-welcome.tsx` (Server Component, props `{ username: string }`): `h1` con `ADMIN_TEXT.title`, saludo, aviso en tarjeta (`bg-white border-line rounded-2xl`), enlace a `/` con `ADMIN_TEXT.backToRanking` (mín. 44px de alto). Mobile-first a 360px, solo tokens del tema. Depende de T020.
- [ ] T022 [US2] Crear `src/app/admin/page.tsx` según [contrato](./contracts/admin-access.md#página-admin-nueva): `metadata` con `title: "Administración · ComiDeli"` y `robots: { index: false, follow: false }`; layout con `SiteHeader` igual que `src/app/mi-perfil/page.tsx`; contenido en `<Suspense>` que hace `await connection()`, `auth()`; sin sesión → `redirect("/login?callbackUrl=%2Fadmin")`; `useCases.getAdminAccess(session.user.id)`: `needs_username` → `redirect("/onboarding/username?callbackUrl=%2Fadmin")`, `not_admin` → `notFound()`, `ok` → `<AdminWelcome username={...} />`. Depende de T018 y T021.
- [ ] T023 [US2] En `src/app/onboarding/username/page.tsx`, cuando la cuenta ya tiene `username`: reemplazar `redirect(callbackUrl ?? "/")` por `redirect(await useCases.postSignInDestination(session.user.id, callbackUrl ?? "/"))` (importar `useCases` de `@/composition/container`). Depende de T018.
- [ ] T024 [US2] En `chooseUsernameAction` de `src/app/_actions/auth.ts`: después de `unstable_update({})`, `redirect(await useCases.postSignInDestination(session.user.id, destinationFrom(formData)))`. No tocar `loginWithPasswordAction` ni `registerAction` (FR-005). Depende de T018.
- [ ] T025 [US2] E2E en `tests/e2e/admin.spec.ts` + helper `getOrCreateGoogleAdmin()` en `tests/e2e/helpers.ts`.
  - **Correo fijo**: `export const E2E_ADMIN_EMAIL = "e2e-admin@example.com"`. El helper busca la cuenta con `findByEmail`; si no existe, la crea como cuenta de Google (`googleId: "e2e-google-admin"`, `username: "e2e_admin"`, sin contraseña). En ambos casos llama `setRole(id, "admin")` y devuelve el usuario. No usar sufijos aleatorios: el correo debe coincidir con `ADMIN_EMAILS`.
  - **Configuración**: Playwright carga `.env.local` (ver `playwright.config.ts`), así que `ADMIN_EMAILS` de `.env.local` debe incluir `e2e-admin@example.com`. Al inicio del archivo, `test.beforeAll` falla con el mensaje "Agrega e2e-admin@example.com a ADMIN_EMAILS en .env.local y reinicia pnpm dev" si `parseAdminAllowlist(process.env.ADMIN_EMAILS)` no lo incluye. Tener en cuenta `reuseExistingServer`: un `pnpm dev` ya abierto no relee `.env.local`.
  - **Casos**:
    1. Visitante abre `/admin` → termina en `/login?callbackUrl=%2Fadmin`.
    2. Usuario Google normal abre `/admin` → `response.status() === 404` y el título y el `h1` son los mismos que en `/no-existe-e2e` (FR-013); el texto de `ADMIN_TEXT.title` no aparece.
    3. Admin abre `/admin` → status 200 y ve "Hola, @e2e_admin".
    4. Admin abre `/onboarding/username` → termina en `/admin` (US2-1).
    5. Admin abre `/` → se queda en `/`; abre `/calificar/<slug de una pollería activa>` → ve el formulario de calificar, no `/admin` (FR-012).
    6. En la home con sesión de admin, ni el header ni el menú de la cuenta abierto tienen un enlace cuyo `href` contenga `/admin` (FR-009).
  - Depende de T022–T024.

**Checkpoint**: US1 + US2 forman el MVP: el admin entra solo a su pantalla y nadie más la ve.

---

## Phase 5: User Story 3 - Quitar el rol a un desarrollador que deja el proyecto (Priority: P2)

**Goal**: quitar un correo de la lista corta el acceso en el siguiente pedido, sin cerrar sesión y sin tocar sus datos.

**Independent Test**: admin con sesión → quitar su correo de `ADMIN_EMAILS` → recargar `/admin` → 404; en la base `role = 'user'` y sus votos siguen.

### Tests for User Story 3

- [ ] T026 [US3] Agregar a `tests/application/get-admin-access.test.ts`: cuenta Google `admin` con sesión cuyo correo **no** está en la lista → `not_admin` y el fake queda con `role: "user"` (US3-1, FR-007); `username`, `email` y `name` no cambian (FR-006); lista vacía (`parseAdminAllowlist(undefined)`) → todos `not_admin` (edge case).

### Implementation for User Story 3

- [ ] T027 [US3] Verificar que `src/application/admin/get-admin-access.ts` (T016) cumple T026 sin cambios; si falla, corregir el paso (3) del orden. Agregar a `tests/e2e/admin.spec.ts` un caso con una cuenta Google `role: "admin"` cuyo correo **no** está en `ADMIN_EMAILS`: `/admin` → 404 y después, leyendo la base con el repositorio de `tests/e2e/helpers.ts`, `role === "user"`.

**Checkpoint**: las tres historias funcionan y se prueban por separado.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Revisar `src/app/sitemap.ts`: `/admin` no debe aparecer. Confirmar con `curl -sI http://localhost:3000/admin` que llega `X-Robots-Tag: noindex, nofollow` (ya configurado en `next.config.ts`, FR-010).
- [ ] T029 [P] Revisar que `src/components/account/user-menu.tsx`, `src/app/_components/header-account.tsx` y `src/components/home/site-header.tsx` no reciban ni muestren el rol (FR-009, FR-011).
- [ ] T030 Correr `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm test:e2e`; luego la prueba manual de [quickstart.md](./quickstart.md) §2 con Google real (pasos 1 a 7).
- [ ] T031 Agregar `ADMIN_EMAILS` a las variables de entorno del proyecto en Vercel (Production y Preview) con los correos de Google de los desarrolladores (`bernizuto@gmail.com`, `adrianpaolovalverde@gmail.com` y el tercero cuando se confirme), y volver a desplegar. **No** incluir `e2e-admin@example.com`: es solo para pruebas locales.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias. Orden interno: T002/T003 en paralelo con T004 → T005, T006 → T007; T008 después de T003.
- **US1 (Phase 3)**: depende de Phase 2.
- **US2 (Phase 4)**: depende de Phase 2. Para probarla de punta a punta necesita US1 (sin US1 nadie recibe el rol al ingresar), pero sus tests unitarios y el e2e crean admins directo en la base.
- **US3 (Phase 5)**: depende de US2 (usa `getAdminAccess` y `/admin`).
- **Polish (Phase 6)**: depende de las historias que se entreguen.

### Within Each User Story

- Tests primero; deben fallar antes de implementar.
- Dominio → casos de uso → `container.ts` → páginas y acciones → e2e.
- Commit al cerrar cada tarea o grupo lógico.

### Parallel Opportunities

- Phase 2: T002 + T003 (dominio) en paralelo con T004 (puerto).
- Phase 4: T012, T013, T014, T015 (tests, archivos distintos) en paralelo; luego T019 y T020 en paralelo con T016/T017.
- Phase 6: T028 y T029 en paralelo.

---

## Parallel Example: User Story 2

```bash
# Tests de US2 a la vez:
Task: "T012 Tests de getAdminAccess en tests/application/get-admin-access.test.ts"
Task: "T013 Tests de postSignInDestination en tests/application/post-sign-in-destination.test.ts"
Task: "T014 Tests de /admin en tests/domain/access.test.ts"
Task: "T015 Test de arquitectura en tests/architecture/no-admin-links.test.ts"

# Piezas independientes de US2:
Task: "T019 /admin en LOGIN_REQUIRED_PREFIXES de src/domain/user/access.ts"
Task: "T020 Textos en src/components/admin/messages.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

Las dos historias son P1 y solo tienen sentido juntas: US1 da el rol y US2 lo usa.

1. Phase 1 + Phase 2.
2. Phase 3 (US1) → validar en la base que el rol se asigna.
3. Phase 4 (US2) → validar la entrada directa y el 404.
4. **Parar y validar** con quickstart §2 pasos 1 a 5. Se puede desplegar.

### Incremental Delivery

1. MVP (US1 + US2) → deploy.
2. US3 (corte inmediato) → deploy. Con el diseño de T016 el corte ya funciona desde US2; esta fase lo prueba de forma explícita.
3. Polish → deploy con `ADMIN_EMAILS` en Vercel.

---

## Notes

- Total: 31 tareas. Setup 1, Foundational 7, US1 3, US2 14, US3 2, Polish 4.
- Las specs 004 (analíticas) y 005 (moderación de comentarios) se apoyan en `getAdminAccess`: cada acción de admin nueva debe llamarlo en el servidor.
