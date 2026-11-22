# Implementation Plan: Acceso de administradores

**Branch**: `003-admin-access` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-admin-access/spec.md`

## Summary

Los desarrolladores cuyo correo está en `ADMIN_EMAILS` reciben el rol admin al ingresar con Google
(correo verificado). No hay botón: después del login, la app manda a un admin directo a `/admin`.
`/admin` vuelve a comprobar en cada pedido el rol **y** que el correo siga en la lista; si no, baja la
cuenta a usuario y responde 404. En esta entrega `/admin` solo muestra un saludo con `@usuario` y un
aviso de "próximamente".

Sin migraciones (la columna `users.role` ya existe), sin dependencias nuevas y sin cambios en
Auth.js: el rol no viaja en el token.

## Technical Context

**Language/Version**: TypeScript estricto (sin `any`), Node 20

**Primary Dependencies**: Next.js 16.4 (App Router, `cacheComponents: true`), Auth.js 5 beta
(Google + Credentials, sesiones JWT), Drizzle ORM 0.45 con `neon-http`, Zod 4, Tailwind 4 + shadcn/ui

**Storage**: PostgreSQL en Neon. Se usa la columna existente `users.role` (`user_role` enum)

**Testing**: Vitest (unitarios con fakes en memoria), Playwright (e2e con sesión firmada por
`signInAsGoogleUser`)

**Target Platform**: web en Vercel, mobile-first desde 360px

**Project Type**: aplicación web Next.js de un solo proyecto, en capas

**Performance Goals**: `/admin` agrega una sola consulta por PK por pedido; el login de un admin no
suma más de una escritura (solo cuando su rol cambia)

**Constraints**: sin transacciones interactivas (driver HTTP de Neon): `setRole` es un único
`UPDATE`. La lista se lee del entorno: cambiarla en Vercel requiere un redeploy

**Scale/Scope**: 3 admins hoy, sin límite en el sistema; 1 página nueva, 2 casos de uso nuevos,
1 caso de uso modificado

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Compuerta: `.specify/memory/constitution.md` v1.1.0.

| Principio | Cómo lo cumple el diseño | Estado |
|---|---|---|
| I. Capas | `app/admin/page.tsx` usa `useCases` de `composition/`; `components/admin/` recibe `{ username }` por props; `ADMIN_EMAILS` se lee solo en `composition/container.ts` | ✅ |
| II. Dominio puro | `domain/user/admin.ts` solo usa `normalizeEmail` de `domain/user/email.ts`. La regla "quién es admin" tiene una sola fuente: `getAdminAccess` (y `signInWithGoogle` para asignar) | ✅ |
| III. Validación y autorización en el servidor | `callbackUrl` sigue pasando por `safeCallbackPath`. `/admin` relee la cuenta y la lista en cada pedido, exige Google verificado, responde 404 a no admins y no tiene enlaces visibles; `noindex` por header y metadata | ✅ |
| III. No exponer `name` ni `email` | `AdminAccess` solo lleva `username`; el rol no se agrega a la sesión | ✅ |
| IV. Integridad en la base | `role` es enum not null con default `user`; `setRole` es una sola sentencia; sin migraciones nuevas | ✅ |
| V. Tests obligatorios | 1 test de dominio nuevo, 2 de casos de uso nuevos, 1 ampliado, 1 de arquitectura y 1 e2e | ✅ |
| VI. Mobile-first y accesible | Pantalla simple a 360px con tema de Tailwind (`brand`, `ink`, `cream`); `h1` y textos desde `messages.ts` | ✅ |
| VII. Simplicidad | Sin dependencias ni tablas nuevas; analíticas y moderación quedan para 004 y 005 | ✅ |
| Restricción: secretos fuera del repo | `ADMIN_EMAILS` en `.env.local` / Vercel y documentada en `.env.example` | ✅ |

**Re-check post-diseño**: ✅ sin violaciones. Complexity Tracking queda vacío.

## Diseño por capas

| Capa | Archivo | Cambio |
|---|---|---|
| domain | `src/domain/user/admin.ts` | **Nuevo**: `AdminAllowlist`, `parseAdminAllowlist`, `isAllowlistedEmail` |
| domain | `src/domain/user/access.ts` | Agrega `"/admin"` a `LOGIN_REQUIRED_PREFIXES` |
| application | `src/application/ports/user-repository.ts` | `UserRole`, `role` en `UserRecord`, `NewUser` sin `role`, `setRole` |
| application | `src/application/user/sign-in-with-google.ts` | Sincroniza el rol con la lista ([contrato](./contracts/admin-access.md#signinwithgoogleprofile-cambia)) |
| application | `src/application/admin/get-admin-access.ts` | **Nuevo** ([contrato](./contracts/admin-access.md#getadminaccessuserid-nuevo)) |
| application | `src/application/admin/post-sign-in-destination.ts` | **Nuevo** ([contrato](./contracts/admin-access.md#postsignindestinationuserid-requested-nuevo)) |
| infrastructure | `src/infrastructure/db/user-repository.ts` | `toUserRecord` incluye `role`; implementa `setRole` |
| composition | `src/composition/container.ts` | Lee `ADMIN_EMAILS`, registra los casos de uso nuevos |
| app | `src/app/admin/page.tsx` | **Nueva** página protegida |
| app | `src/app/onboarding/username/page.tsx`, `src/app/_actions/auth.ts` | Usan `postSignInDestination` |
| components | `src/components/admin/admin-welcome.tsx`, `messages.ts` | **Nuevos**: saludo y aviso |
| config | `.env.example` | Documenta `ADMIN_EMAILS` |
| tests | `tests/application/fakes.ts`, `tests/e2e/helpers.ts` | `role` y `setRole` en el fake; helper para crear un admin de prueba |

Decisiones y alternativas descartadas: [research.md](./research.md). Entidades y transiciones del rol:
[data-model.md](./data-model.md). Validación: [quickstart.md](./quickstart.md).

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-access/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   └── admin-access.md  # Fase 1: casos de uso y página /admin
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
src/
├── domain/user/
│   ├── admin.ts                         # nuevo
│   └── access.ts                        # cambia
├── application/
│   ├── ports/user-repository.ts         # cambia
│   ├── user/sign-in-with-google.ts      # cambia
│   └── admin/
│       ├── get-admin-access.ts          # nuevo
│       └── post-sign-in-destination.ts  # nuevo
├── infrastructure/db/user-repository.ts # cambia
├── composition/container.ts             # cambia
├── app/
│   ├── admin/page.tsx                   # nuevo
│   ├── onboarding/username/page.tsx     # cambia
│   └── _actions/auth.ts                 # cambia
└── components/admin/
    ├── admin-welcome.tsx                # nuevo
    └── messages.ts                      # nuevo

tests/
├── domain/admin.test.ts                 # nuevo
├── domain/access.test.ts                # cambia
├── application/
│   ├── fakes.ts                         # cambia
│   ├── sign-in-with-google.test.ts      # cambia
│   ├── get-admin-access.test.ts         # nuevo
│   └── post-sign-in-destination.test.ts # nuevo
├── architecture/no-admin-links.test.ts  # nuevo
└── e2e/
    ├── helpers.ts                       # cambia
    └── admin.spec.ts                    # nuevo
```

**Structure Decision**: se mantiene la estructura en capas existente de `src/` y `tests/`. Lo nuevo
de administración se agrupa en `application/admin/` y `components/admin/`, para que las specs 004 y
005 sumen sus casos de uso y pantallas al lado sin tocar el resto.

## Riesgos y notas

- **Cuenta de contraseña con el correo de un desarrollador**: hoy no puede ingresar con Google
  (no se unen cuentas). Ver [research.md R8](./research.md#r8-cuenta-de-contraseña-con-el-correo-de-un-desarrollador);
  la spec ya lo refleja en Edge Cases.
- **`UserRecord` gana un campo**: los tests que construyen `UserRecord` a mano necesitan `role`.
  Es un cambio mecánico que el typecheck detecta.
- **E2E**: `ADMIN_EMAILS` del entorno de pruebas debe incluir el correo del admin de prueba
  (`e2e-admin@example.com`).

## Complexity Tracking

Sin violaciones de la constitución.
