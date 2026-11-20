# Quickstart: validar el acceso de administradores

## Requisitos

- `.env.local` con lo de siempre (`DATABASE_URL`, `AUTH_SECRET`, Google OAuth, Upstash) más:
  ```bash
  ADMIN_EMAILS=tu-correo@gmail.com, OTRO@Gmail.com
  ```
  (los espacios y las mayúsculas se ignoran a propósito, para probar FR-003).
- No hay migración nueva: `users.role` ya existe.

## 1. Pruebas automáticas

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm test:e2e tests/e2e/admin.spec.ts
```

Deben pasar, entre otras:

| Prueba | Qué demuestra |
|---|---|
| `tests/domain/admin.test.ts` | Lista con espacios, mayúsculas, vacíos y correos mal escritos (FR-003, edge cases) |
| `tests/application/sign-in-with-google.test.ts` | Sube y baja el rol al ingresar; no toca `username` (US1, US3, FR-004, FR-006) |
| `tests/application/get-admin-access.test.ts` | Cuenta de contraseña nunca entra; correo quitado → baja a `user` en el mismo pedido (FR-005, FR-007) |
| `tests/application/post-sign-in-destination.test.ts` | Admin → `/admin` aunque pida otra ruta; usuario → su destino (FR-009) |
| `tests/domain/access.test.ts` | `/admin` sin sesión → login con `callbackUrl` |
| `tests/architecture/no-admin-links.test.ts` | Ningún componente enlaza a `/admin` (FR-009) |
| `tests/e2e/admin.spec.ts` | Visitante → login; usuario normal → 404; admin → saludo con `@usuario` |

## 2. Prueba manual con Google real

1. `pnpm dev` y abrir `http://localhost:3000/login`.
2. **Admin**: ingresar con Google con un correo de `ADMIN_EMAILS`.
   - Cuenta nueva: elegir `@usuario` → la app abre `/admin` sola.
   - Cuenta con `@usuario`: la app abre `/admin` sin pasar por el formulario.
   - Se ve "Hola, @usuario" y el aviso de herramientas en camino.
3. **Sin botón**: desde `/admin` volver al inicio; revisar el header y el menú de la cuenta: no hay
   ningún acceso a administración. Votar una pollería funciona igual (FR-012).
4. **Usuario normal**: cerrar sesión, ingresar con otra cuenta de Google o con correo y contraseña →
   flujo normal. Escribir `/admin` a mano → página "no encontrada".
5. **Visitante**: en una ventana privada abrir `/admin` → pantalla de login.
6. **Corte inmediato**: con el admin todavía con sesión, quitar su correo de `ADMIN_EMAILS` y
   reiniciar `pnpm dev`. Recargar `/admin` → "no encontrada". En la base, su `role` ya es `user`
   y sus votos siguen ahí (US3).
7. **No indexable**: `curl -sI http://localhost:3000/admin | grep -i x-robots-tag` →
   `noindex, nofollow`.

## Resultado esperado

Todos los pasos dan lo indicado y `pnpm lint`, `pnpm typecheck` y `pnpm test` terminan sin errores.
