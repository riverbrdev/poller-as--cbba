# Contrato: casos de uso de acceso admin

Capa: `application/`. Se registran en `composition/container.ts` con
`adminEmails = parseAdminAllowlist(process.env.ADMIN_EMAILS)`.

## `signInWithGoogle(profile)` (cambia)

Archivo: `application/user/sign-in-with-google.ts`.
Dependencias: `{ users: UserRepository; adminEmails: AdminAllowlist }`.

Comportamiento nuevo, después de encontrar o crear la cuenta:

| Correo guardado de la cuenta | `role` guardado | Acción |
|---|---|---|
| en la lista | `user` | `setRole(id, "admin")` |
| en la lista | `admin` | nada |
| fuera de la lista | `admin` | `setRole(id, "user")` |
| fuera de la lista | `user` | nada |

- Devuelve el `UserRecord` con el `role` ya actualizado.
- Los errores existentes (`email_registered_with_password`, `google_id_taken`) no cambian y no tocan
  el rol.
- Solo se llama `setRole` si el rol cambia (no escribe en cada ingreso).

## `getAdminAccess(userId)` (nuevo)

Archivo: `application/admin/get-admin-access.ts`.
Dependencias: `{ users: UserRepository; adminEmails: AdminAllowlist }`.
Devuelve: `AdminAccess` (ver [data-model.md](../data-model.md#resultado-de-acceso-dto-de-aplicación)).

Orden de comprobación (todo releído de la base en cada llamada):

1. La cuenta no existe → `not_admin`.
2. `qualifies = googleId !== null && isAllowlistedEmail(email, adminEmails)`.
3. `role === "admin"` y `!qualifies` → `setRole(id, "user")` y `not_admin`.
4. `role !== "admin"` → `not_admin` (no sube el rol: eso solo pasa al ingresar, FR-003).
5. `username === null` → `needs_username`.
6. Si no → `{ ok: true, admin: { username } }`.

## `postSignInDestination(userId, requested)` (nuevo)

Archivo: `application/admin/post-sign-in-destination.ts`.
Dependencias: `{ getAdminAccess }`.

- `requested` ya llega validado por `safeCallbackPath` (ruta interna).
- Devuelve `"/admin"` si `getAdminAccess(userId)` es `ok: true`; si no, `requested`.

## Página `/admin` (nueva)

Archivo: `src/app/admin/page.tsx` (Server Component, `connection()` antes de leer la sesión).

| Quién abre | Respuesta |
|---|---|
| Sin sesión | Redirección a `/login?callbackUrl=%2Fadmin` (primero el proxy, después la página) |
| Con sesión, `needs_username` | Redirección a `/onboarding/username?callbackUrl=%2Fadmin` |
| Con sesión, `not_admin` | `notFound()`: la página 404 de siempre, sin datos de admin |
| Con sesión, `ok` | Saludo "Hola, @usuario" y aviso de herramientas en camino |

- `metadata.robots = { index: false, follow: false }` además del `X-Robots-Tag` de `next.config.ts`.
- El texto visible vive en `components/admin/messages.ts`; el componente
  `components/admin/admin-welcome.tsx` recibe solo `{ username }` por props.
- Ningún componente del sitio (header, menú de cuenta, footer, perfil) enlaza a `/admin` (FR-009).
  Se agrega un test de arquitectura que busca `"/admin"` en `src/components/` y `src/app/` fuera de
  `src/app/admin/` y falla si aparece.

## Puntos de redirección después del login (cambian)

| Archivo | Hoy | Después |
|---|---|---|
| `src/app/onboarding/username/page.tsx` | con `username`: `redirect(callbackUrl ?? "/")` | `redirect(await postSignInDestination(id, callbackUrl ?? "/"))` |
| `src/app/_actions/auth.ts` → `chooseUsernameAction` | `redirect(destinationFrom(formData))` | `redirect(await postSignInDestination(id, destinationFrom(formData)))` |

`loginWithPasswordAction` y `registerAction` no cambian: una cuenta de contraseña nunca es admin.
