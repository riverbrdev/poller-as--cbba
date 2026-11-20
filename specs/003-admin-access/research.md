# Research: Acceso de administradores

Fecha: 2026-11-20. Se revisó el código actual (`src/composition/auth.ts`, `src/app/_actions/auth.ts`,
`src/app/onboarding/username/page.tsx`, `src/proxy.ts`, `src/domain/user/access.ts`,
`src/infrastructure/db/schema.ts`, `next.config.ts`) y la guía de Next.js en
`node_modules/next/dist/docs/`.

## R1. Dónde vive la lista de correos autorizados

- **Decisión**: variable de entorno `ADMIN_EMAILS`, separada por comas. La lee solo
  `composition/container.ts` y la entrega ya convertida (un `ReadonlySet<string>` de correos
  normalizados) a los casos de uso. Se documenta en `.env.example`.
- **Por qué**: FR-002 pide que esté en la configuración del servidor y fuera del código versionado.
  `composition/` ya es el único lugar que conecta el mundo externo con `application/`
  (hoy solo `DATABASE_URL` se lee desde `infrastructure/db/client.ts`).
- **Descartado**: tabla `admin_emails` (otra migración y otra pantalla para mantenerla; la spec dice
  "dato de configuración, no una tabla"); constante en el código (queda versionada).
- **Consecuencia**: en Vercel, cambiar la lista requiere editar la variable y volver a desplegar
  (ya anotado en Assumptions de la spec). SC-003 ("menos de 5 minutos") se cumple con un redeploy.

## R2. Cómo se interpreta la lista

- **Decisión**: función pura `parseAdminAllowlist(raw)` en `domain/user/admin.ts`: separa por coma,
  aplica `normalizeEmail` (trim + minúsculas, ya existe en `domain/user/email.ts`), descarta vacíos
  y lo que no tenga forma `algo@algo` (un solo `@`, con texto a ambos lados). Lista vacía o variable
  ausente → conjunto vacío → nadie es admin.
- **Por qué**: cubre FR-003 (sin distinguir mayúsculas ni espacios) y los edge cases "correo mal
  escrito" y "lista vacía". Al ser dominio puro se prueba sin nada externo.
- **Descartado**: validar con Zod dentro de `domain/` (rompe "dominio sin imports externos").

## R3. Cuándo se asigna el rol

- **Decisión**: en `signInWithGoogle` (application). Después de encontrar o crear la cuenta, compara
  su correo con la lista y, si el rol guardado no coincide, lo actualiza con `users.setRole`.
  Google ya exige `email_verified: true` en `composition/auth.ts` (`googleProfileSchema`), así que
  solo entran correos verificados.
- **Por qué**: FR-003/FR-004. `signInWithGoogle` es el único camino de ingreso con Google y ya corre
  en el callback `signIn` y en `jwt`. Se compara con el correo **guardado en la cuenta**: para una
  cuenta existente, `findByGoogleId` la encuentra aunque Google informe otro correo; usar el correo
  guardado evita que un cambio de correo en Google otorgue el rol sin que la cuenta lo tenga.
- **Las cuentas de contraseña**: `authenticateWithPassword` y `registerWithPassword` no se tocan;
  nunca llaman a `setRole` (FR-005). Además el chequeo de R4 exige `googleId !== null`.

## R4. Comprobación en cada pedido (corte inmediato)

- **Decisión**: caso de uso `getAdminAccess(userId)` en `application/admin/`. Relee la cuenta desde la
  base y devuelve acceso solo si: existe, tiene `googleId`, `role === "admin"` y su correo está hoy
  en la lista. Si tiene rol admin pero el correo ya no está, la baja a `user` (FR-007) y rechaza.
  Si cumple todo pero no tiene `username`, devuelve `needs_username`.
- **Por qué**: aclaración 3 (corte inmediato) y constitución v1.1.0, principio III. Releer la base en
  cada pedido cuesta una consulta por id (índice de PK) y solo ocurre en `/admin`.
- **Descartado**: guardar el rol en el JWT (queda viejo hasta que la sesión se renueva; es lo que la
  aclaración 3 quiso evitar). El rol **no** se agrega a la sesión ni al token: ningún componente lo
  necesita, porque no hay botones de admin (FR-009).

## R5. Redirección automática al iniciar sesión

- **Hallazgo**: `loginWithGoogleAction` siempre manda a
  `/onboarding/username?callbackUrl=<destino>`. Esa página redirige a `callbackUrl` si la cuenta ya
  tiene `username`; si no, muestra el formulario, y `chooseUsernameAction` redirige al destino al
  terminar.
- **Decisión**: un caso de uso `postSignInDestination(userId, requested)` en `application/admin/`
  que devuelve `/admin` si `getAdminAccess` da acceso y, si no, el destino pedido. Se usa en esos dos
  puntos: la página de onboarding (cuenta con `username`) y `chooseUsernameAction` (cuenta nueva).
  El destino pedido se ignora para un admin (edge case "admin que ingresó desde otra página").
- **Por qué**: cubre US2 escenarios 1 a 3 sin tocar Auth.js ni el proxy. El login con contraseña
  (`loginWithPasswordAction`, `registerAction`) no pasa por ahí y nunca da admin, así que no cambia.
- **Descartado**: redirigir en el callback `redirect` de Auth.js (no sabe qué usuario ingresó y corre
  en cada redirección); redirigir en el proxy (correría en cada navegación, y el admin no podría
  usar el sitio público, contra la aclaración 2).

## R6. Respuesta de `/admin` según quién la abre

- **Decisión**: `src/app/admin/page.tsx`, renderizado en cada petición (`connection()`), con
  verificación en el servidor:
  - sin sesión → `redirect("/login?callbackUrl=/admin")` (US2 escenario 5). Se agrega `/admin` a
    `LOGIN_REQUIRED_PREFIXES` en `domain/user/access.ts` para que el proxy redirija antes.
  - `needs_username` → `redirect("/onboarding/username?callbackUrl=/admin")`.
  - sin acceso → `notFound()`: la misma página 404 que cualquier ruta inexistente (FR-013).
  - con acceso → saludo con `@usuario` y aviso de "próximamente" (FR-008).
- **Descartado**: `forbidden()` de Next.js (devuelve 403, que confirma que la página existe; además es
  experimental y requiere `authInterrupts`).
- **Nota**: para visitantes sin sesión `/admin` redirige al login, a diferencia de una ruta
  inexistente. Es lo que pide la spec; no expone datos y no confirma quién es admin.

## R7. Indexación y vista previa al compartir (FR-010)

- **Hallazgo**: `next.config.ts` ya envía `X-Robots-Tag: noindex, nofollow` para `/admin/:path*`.
- **Decisión**: además, `metadata.robots = { index: false, follow: false }` en la página, igual que
  `/mi-perfil`. No se agrega a `sitemap.ts`.
- **Vista previa**: los bots de WhatsApp o Facebook no tienen sesión, así que reciben la redirección
  al login y nunca ven contenido de admin. No hace falta quitar la imagen Open Graph raíz.

## R8. Cuenta de contraseña con el correo de un desarrollador

- **Hallazgo**: `signInWithGoogle` rechaza el ingreso con Google si ya existe una cuenta de contraseña
  con ese correo (`email_registered_with_password`, SPEC §4 regla 2b: no se unen cuentas).
- **Consecuencia**: el edge case de la spec "debe ingresar con Google con el mismo correo" **no
  funciona hoy** para un desarrollador que ya se registró con contraseña usando ese correo.
- **Decisión**: no unir cuentas en esta entrega (sería cambiar la regla 2b). Si pasa, el desarrollador
  usa otra cuenta de Google en la lista, o se borra a mano la cuenta de contraseña (sin votos reales
  todavía). Se corrige el edge case de la spec para que diga esto.

## R9. Pruebas sin Google real

- **Decisión**: unitarias con los fakes de `tests/application/fakes.ts` (se agrega `role` y `setRole`).
  En e2e se reutiliza `signInAsGoogleUser` de `tests/e2e/helpers.ts`, que firma el JWT de Auth.js sin
  pasar por Google, con una cuenta creada con `role: "admin"` y un correo de prueba en `ADMIN_EMAILS`
  del entorno de pruebas.
- **Limitación**: el e2e no cubre el callback real de Google; esa parte queda cubierta por los tests
  unitarios de `signInWithGoogle` y `postSignInDestination`.
