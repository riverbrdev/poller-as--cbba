<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.1 (PATCH: corrección de contexto, sin principios nuevos ni quitados)
- Principios modificados (mismos títulos):
  - I. Arquitectura por capas: sin lista de carpetas ni archivos; remite a CLAUDE.md
  - II. TypeScript estricto: sin nombres de flags ni comandos; rationale de equipo
  - III. Integridad de datos y migraciones: sin rutas ni comandos
  - IV. Cada funcionalidad trae sus tests: sin rutas de archivos
  - VI. Simplicidad: nuevo motivo (equipo chico de cuatro personas)
- Secciones modificadas: preámbulo (proyecto de equipo, posible recomendador de comidas);
  Restricciones de producto y UI (stack enmendable por acuerdo del equipo, detalles a CLAUDE.md);
  Flujo de desarrollo (sin comandos); Governance (enmiendas por acuerdo del equipo)
- Secciones agregadas / eliminadas: ninguna
- Templates: no se modifican (los leen en tiempo de ejecución)
- TODOs diferidos: ninguno
-->

# PolloRanking (ComiDeli) Constitution

Web para votar y rankear las pollerías de Cochabamba, hecha por un equipo de cuatro personas.
Empieza como un proyecto de entretenimiento; si funciona, la idea es ampliarlo a un recomendador
de comidas. El contexto del producto, el modelo de datos y las reglas de negocio están en
`docs/SPEC.md`; los detalles operativos (comandos, estructura de carpetas, stack) en `CLAUDE.md`.

## Core Principles

### I. Arquitectura por capas (no se reorganiza)

- El código respeta la arquitectura por capas descrita en `CLAUDE.md`. Esa estructura y sus
  convenciones MUST NOT reorganizarse ni renombrarse sin una enmienda o una tarea pedida
  explícitamente.
- El dominio MUST NOT depender de nada externo al proyecto (framework, ORM, autenticación).
- La interfaz (páginas, rutas y componentes) MUST NOT acceder a la base de datos ni a la
  infraestructura directamente; todo pasa por un caso de uso.
- Las reglas de negocio MUST vivir en el dominio o en los casos de uso, nunca en componentes ni
  en route handlers.
- Los límites entre capas se hacen cumplir con lint y tests automáticos, y esos controles MUST NOT
  debilitarse para que pase un cambio.

**Por qué:** las capas permiten probar las reglas sin base de datos y cambiar infraestructura sin
tocar la lógica. También dejan espacio para crecer (por ejemplo, hacia un recomendador) sin
reescribir lo que ya funciona.

### II. TypeScript estricto

- El modo estricto de TypeScript MUST quedar activado.
- El código MUST NOT usar `any`. Si un caso excepcional lo exige, va con un comentario que
  explique por qué y con el alcance más chico posible.
- El chequeo de tipos MUST pasar sin errores.
- Identificadores, tablas y columnas en inglés; textos visibles al usuario y documentación en
  español.

**Por qué:** los tipos son la red de seguridad del equipo: permiten entender y cambiar código que
escribió otra persona sin romperlo.

### III. Integridad de datos y migraciones

- Todo cambio de esquema MUST pasar por una migración de Drizzle. No se cambia la base a mano.
- Las migraciones ya aplicadas MUST NOT editarse; cada corrección es una migración nueva.
- Las restricciones críticas (un voto por usuario por pollería, unicidad de nombre de usuario y
  correo, método de acceso obligatorio) MUST estar respaldadas por constraints en la base de
  datos, no solo por código.

**Por qué:** las migraciones dejan registro y se pueden reproducir en cualquier entorno y en la
máquina de cada integrante; los constraints protegen los datos aunque el código tenga un bug.

### IV. Cada funcionalidad trae sus tests

- Toda funcionalidad nueva o cambio de comportamiento MUST traer sus tests en la misma tarea o
  PR. No se exige escribirlos antes (no es TDD estricto), pero no se da por terminada sin ellos.
- Vitest cubre la lógica: el dominio siempre, y los casos de uso con reglas de negocio.
- Playwright cubre los flujos importantes: ver el ranking público, login y registro, calificar
  una pollería, sugerir una pollería y aprobar sugerencias en el admin. Un cambio que toca uno de
  esos flujos MUST agregar o actualizar su test e2e.
- Un bug corregido SHOULD traer un test que falle sin la corrección.

**Por qué:** sin tests no hay forma segura de cambiar el ranking o el voto más adelante, ni de
tocar el código de otra persona con confianza.

### V. Seguridad en el servidor

- Toda entrada externa MUST validarse con Zod en el borde (route handler o server action) antes
  de llegar a un caso de uso.
- La autorización MUST verificarse en el servidor. Las rutas de admin comprueban el rol en el
  servidor; ocultar botones no cuenta como control.
- Los secretos MUST NOT estar en el código ni en archivos versionados.
- Los límites de uso que pide `docs/SPEC.md` (registro, login, calificaciones, sugerencias) MUST
  aplicarse en el servidor.

**Por qué:** es una app pública con votos; si el cliente decide, cualquiera puede inflar el
ranking.

### VI. Simplicidad

- No se agregan dependencias sin explicar qué problema resuelven y por qué no alcanza con lo que
  ya está. La justificación queda en el PR o en el plan de la feature.
- Se implementa solo lo que se pidió: una tarea pequeña por vez, sin funcionalidades
  "por si acaso".
- Ante dos soluciones válidas, se elige la que tiene menos piezas.

**Por qué:** el equipo es chico. Cada dependencia o abstracción extra la tienen que mantener y
entender los cuatro, y además pesa para usuarios con datos móviles limitados.

## Restricciones de producto y UI

- **Stack fijo:** se usa el stack definido en `CLAUDE.md`. Cambiar o agregar una pieza requiere
  una enmienda, que el equipo puede aprobar de común acuerdo si el producto crece (por ejemplo,
  al pasar a un recomendador de comidas).
- **Mobile-first y accesible:** la app se diseña primero para el celular, con zonas táctiles
  cómodas, contraste suficiente, navegación por teclado y texto alternativo en imágenes. Los
  criterios concretos están en `CLAUDE.md` y `docs/SPEC.md`.
- **Liviana y compartible:** las páginas cuidan el peso para datos móviles limitados, y toda
  página pública se ve bien al compartirla (preview Open Graph).
- **Producto:** las reglas de negocio de `docs/SPEC.md` son la fuente de verdad. Si algo no está
  definido ahí, se pregunta en vez de asumir.

## Flujo de desarrollo

- Una tarea pequeña por vez. Para tareas que tocan varias capas se propone primero un plan corto
  y se espera confirmación.
- Antes de dar algo por terminado MUST pasar lint, chequeo de tipos y tests unitarios, y los e2e
  cuando el cambio toca un flujo importante (Principio IV). Los comandos están en `CLAUDE.md`.
- Commits pequeños, uno por tarea, con el formato de `CLAUDE.md`.
- Los cambios entran a `main` por PR desde una rama.
- `CLAUDE.md` es la guía operativa del día a día y MUST mantenerse coherente con esta
  constitución.

## Governance

- Esta constitución está por encima de cualquier otra práctica del proyecto. Si `CLAUDE.md`,
  `AGENTS.md` o un plan la contradicen, manda la constitución y se corrige el otro documento.
- **Enmiendas:** se aprueban por acuerdo del equipo. Se proponen con `/speckit-constitution` (o
  editando este archivo) en un PR con commit `docs:` que explique qué cambió y por qué. Si la
  enmienda afecta a `CLAUDE.md`, se actualiza en el mismo cambio.
- **Versionado semántico:** MAJOR cuando se quita o redefine un principio de forma incompatible;
  MINOR cuando se agrega un principio o sección o se amplía una regla; PATCH para aclaraciones y
  redacción.
- **Cumplimiento:** cada plan (`/speckit-plan`) pasa por el "Constitution Check" antes de
  implementar, y cada PR se revisa contra estos principios. Una excepción se justifica por
  escrito en el plan (tabla de complejidad) o en el PR; si no hay justificación, no entra.

**Version**: 1.0.1 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06
