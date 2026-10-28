# PolloRanking

Web app para votar y rankear las pollerías de Cochabamba. Contexto completo, modelo de datos y reglas de negocio en `docs/SPEC.md`. **Leerlo antes de implementar cualquier funcionalidad.**

@AGENTS.md

## Stack

- Next.js (App Router) + TypeScript estricto
- Tailwind CSS + shadcn/ui
- PostgreSQL (Neon) + Drizzle ORM
- Auth.js con Google
- Zod para validación
- Upstash Ratelimit
- Vitest (unitarios), Playwright (e2e)
- Deploy en Vercel

## Arquitectura

Capas como carpetas dentro de `src/`:

```
src/
  domain/          Reglas puras (ranking bayesiano, validaciones). Sin imports de Next, Drizzle ni Auth.
  application/     Casos de uso (rateRestaurant, suggestRestaurant, approveSuggestion...). Dependen de domain e interfaces.
  infrastructure/  Drizzle (schema, repositorios), Auth.js, Upstash. Implementan las interfaces de application.
  composition/     Raíz de composición: arma los casos de uso con sus implementaciones de infrastructure y reexporta auth/handlers de Auth.js.
  app/             Rutas, páginas y route handlers. Solo orquestan: validan entrada y llaman a casos de uso (vía composition/).
  components/      UI reutilizable. Recibe datos por props. `components/ui/` es de shadcn y `components/lib/` sus utilidades.
tests/
docs/
```

**Reglas que no se rompen:**

1. `app/` y `components/` **nunca** importan de `infrastructure/` ni acceden a la base de datos directamente. Todo pasa por un caso de uso en `application/`, que `app/` obtiene de `composition/`. `components/` tampoco importa de `composition/`. Se hace cumplir con ESLint (`no-restricted-imports`, ver `eslint.config.mjs`) y lo cubre `tests/architecture/import-boundaries.test.ts`.
2. `domain/` no importa nada externo al proyecto.
3. Las reglas de negocio viven en `domain/` o `application/`, nunca en componentes ni route handlers.
4. Toda entrada externa se valida con Zod en el borde (route handler / server action) antes de llegar a un caso de uso.
5. La autorización se verifica siempre en el servidor. Las rutas de admin comprueban el rol en el servidor, no solo ocultan botones.
6. Las restricciones críticas (ej. un voto por usuario por pollería) se respaldan con constraints en la base de datos, no solo con código.

## Comandos

```
pnpm dev            # servidor local
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest
pnpm test:e2e       # Playwright
pnpm db:generate    # generar migración Drizzle
pnpm db:migrate     # aplicar migraciones
pnpm db:seed        # cargar pollerías iniciales
```

Antes de dar una tarea por terminada, correr `pnpm lint`, `pnpm typecheck` y `pnpm test`. Si algo falla, arreglarlo antes de decir que está listo.

## UI y responsive

- **Mobile-first.** Diseñar y probar primero a 360px de ancho; ampliar con `md:` y `lg:`.
- Nada de anchos fijos en px para layout. Usar utilidades fluidas de Tailwind.
- Zonas táctiles de al menos 44x44px. Los botones principales (votar, calificar) deben quedar al alcance del pulgar.
- Usar componentes de shadcn/ui antes de crear uno propio.
- Paleta de 2 colores principales + neutros; tipografía única. Definidos en el tema de Tailwind, no hardcodeados en componentes.
- Imágenes siempre con `next/image`. Cuidar el peso: los usuarios pueden tener datos móviles limitados.
- Toda página pública debe tener metadata Open Graph (`generateMetadata`) para que se vea bien al compartir en WhatsApp/Facebook.

## Convenciones

- Código (variables, funciones, tablas, columnas) en **inglés**. Textos visibles al usuario y documentación en **español**.
- TypeScript sin `any`. Si hace falta, justificarlo con un comentario.
- Funciones pequeñas con una sola responsabilidad. Nombres descriptivos.
- Tests unitarios obligatorios para `domain/` y para los casos de uso con reglas de negocio importantes.
- Commits pequeños, uno por tarea, en formato `tipo: descripción` (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`).
- No agregar dependencias nuevas sin explicar por qué hacen falta.

## Cómo trabajar

- Una tarea pequeña por vez. No implementar funcionalidades que no se pidieron.
- Para tareas que tocan varias capas, proponer primero un plan corto y esperar confirmación.
- Si una decisión no está definida en `SPEC.md`, preguntar en vez de asumir.
- No tocar migraciones ya aplicadas; crear una nueva.
- Nunca escribir secretos en el código ni en archivos versionados. Las variables van en `.env.local` (ignorado por git) y se documentan en `.env.example`.
