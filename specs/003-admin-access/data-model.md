# Data Model: Acceso de administradores

**Sin migraciones.** La columna `users.role` (`user_role` enum: `user` | `admin`, default `user`,
not null) ya existe en `src/infrastructure/db/schema.ts`. Esta funcionalidad solo la empieza a leer
y escribir.

## Cuenta de usuario (existente)

| Campo | Cambio | Notas |
|---|---|---|
| `id`, `username`, `googleId`, `passwordHash`, `name`, `email`, `avatarUrl` | sin cambio | `email` se guarda normalizado (trim + minúsculas) |
| `role` | **se expone en el puerto** | Hoy `toUserRecord` lo oculta. Pasa a ser parte de `UserRecord` como `UserRole = "user" \| "admin"` |

### Puerto `UserRepository` (`application/ports/user-repository.ts`)

- `UserRecord` agrega `role: UserRole`.
- `NewUser` = `Omit<UserRecord, "id" | "role">`: toda cuenta nace como `user` (default de la base).
  Ningún camino de alta puede crear un admin directamente.
- Método nuevo: `setRole(id: string, role: UserRole): Promise<UserRecord>`. Un `UPDATE … SET role`
  de una sola sentencia, sin tocar otros campos (FR-006). Error si la cuenta no existe.

### Reglas de validación y transiciones del rol

```text
            ingreso con Google, correo verificado y en la lista
   user  ─────────────────────────────────────────────────────▶  admin
     ▲                                                              │
     │  ingreso con Google y el correo ya no está en la lista       │
     │  ─ o ─ pedido a /admin y el correo ya no está en la lista    │
     └──────────────────────────────────────────────────────────────┘
```

- Solo `signInWithGoogle` puede subir a `admin`. Solo `signInWithGoogle` y `getAdminAccess` pueden
  bajar a `user`.
- Una cuenta sin `googleId` (correo y contraseña) nunca tiene acceso de admin, aunque su `role` diga
  `admin` por un cambio manual en la base (FR-005).
- Cambiar el rol no toca `username`, votos, comentarios ni marcas "Útil" (FR-006): son otras tablas
  y otros campos.

## Lista de correos autorizados (configuración, no tabla)

| Aspecto | Valor |
|---|---|
| Origen | Variable de entorno `ADMIN_EMAILS`, separada por comas |
| Forma en memoria | `AdminAllowlist = ReadonlySet<string>` de correos normalizados |
| Construcción | `parseAdminAllowlist(raw: string \| undefined)` en `domain/user/admin.ts` |
| Elementos inválidos | Vacíos o sin forma `local@dominio` (exactamente un `@`, texto a ambos lados): se ignoran |
| Ausente o vacía | Conjunto vacío: nadie es admin |
| Límite de tamaño | Ninguno (tres es el equipo actual, no un límite) |

Funciones de dominio (puras, sin imports externos):

- `parseAdminAllowlist(raw)` → `AdminAllowlist`
- `isAllowlistedEmail(email, allowlist)` → `boolean` (normaliza `email` antes de comparar)

## Resultado de acceso (DTO de aplicación)

`AdminAccess`, devuelto por `getAdminAccess(userId)`:

| Variante | Cuándo |
|---|---|
| `{ ok: true, admin: { username } }` | Cuenta existe, tiene `googleId`, `role = admin`, correo en la lista y `username` elegido |
| `{ ok: false, reason: "needs_username" }` | Como arriba, pero sin `username` |
| `{ ok: false, reason: "not_admin" }` | Cualquier otro caso. Si tenía `role = admin` pero no cumple (correo fuera de la lista o cuenta sin `googleId`), antes se baja a `user` |

Nunca incluye `email`, `name` ni el id de Google (FR-011).
