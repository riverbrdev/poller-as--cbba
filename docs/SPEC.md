# SPEC — Ranking de Pollos de Cochabamba

> Nombre de marca: **ComiDeli** (en toda la app y en Stitch). El nombre del proyecto en código/repo sigue siendo PolloRanking hasta decidir el dominio.

## 1. Qué es

Web app de entretenimiento donde la gente de Cochabamba califica pollerías y se arma un ranking público del mejor pollo de la ciudad. Hay que registrarse para votar. Las personas pueden sugerir pollerías nuevas, que entran a una cola de aprobación manual.

**Objetivo principal:** que sea fácil de compartir (links con preview en WhatsApp/Facebook/Instagram) y que se use desde el celular.

**No es objetivo (v1):** monetización, reseñas largas, criterios configurables (los 4 criterios de calificación son fijos: sabor y crocancia, cantidad y porción, atención y rapidez, local), app nativa, multi-ciudad.

## 2. Usuarios y roles

| Rol | Puede |
|---|---|
| Visitante | Ver ranking, ver perfil de cada pollería |
| Usuario (logueado con Google o con correo y contraseña) | Todo lo anterior + calificar, comentar, sugerir pollerías, reportar comentarios |
| Admin (solo el dueño del proyecto) | Todo lo anterior + aprobar/rechazar sugerencias, ocultar pollerías y comentarios, resolver reportes |

## 3. Modelo de datos

**users**: id, username (único, nombre público), google_id (único, opcional), password_hash (opcional), name, email (único), avatar_url, role (`user` | `admin`), created_at
- `username`: 3 a 20 caracteres, letras, números y guion bajo. Se compara sin distinguir mayúsculas (índice único sobre `lower(username)`). Es lo único que se muestra públicamente; nunca se muestra `name` ni `email`.
- Constraint CHECK: al menos uno de `google_id` o `password_hash` debe tener valor. Postgres permite varios NULL en un índice único, por eso `google_id` puede ser opcional sin chocar entre cuentas de contraseña.
- Cuentas de Google nuevas nacen sin `username` y deben elegirlo antes de poder calificar, comentar o sugerir.

**restaurants**: id, name, slug (único), zone, address, maps_url, photo_url, status (`active` | `hidden`), created_at

**ratings**: id, user_id, restaurant_id, flavor_score, portion_score, service_score, place_score (1–10 cada una, obligatorias), comment (opcional, máx. 280 caracteres), status (`visible` | `hidden`), created_at, updated_at
- Índice único en `(user_id, restaurant_id)`.
- CHECK `between 1 and 10` en cada `*_score`.
- `updated_at` queda sin uso en v1: los votos no se editan (regla 1).

**suggestions**: id, user_id, name, zone, address, maps_url (opcional), status (`pending` | `approved` | `rejected`), reviewed_by, reviewed_at, created_at

**reports**: id, user_id, rating_id, reason, status (`open` | `resolved`), created_at

## 4. Reglas de negocio

1. Un usuario puede tener **una sola calificación por pollería** y **no puede editarla en v1**: un segundo envío se rechaza ("Ya calificaste esta pollería"). Se garantiza con índice único en la base de datos, no solo en código.
2. Para calificar hay que estar logueado y tener `username`.
2a. **Dos formas de acceso**: Google, o correo y contraseña (registro propio). No hay verificación de correo ni recuperación de contraseña en v1: ambas requieren enviar correos y por ahora no hay dominio propio para hacerlo.
2b. **No se unen cuentas automáticamente.** Si alguien entra con Google y su correo ya existe como cuenta de contraseña (o al revés), se rechaza con un mensaje que indica el método con el que se registró. Motivo: sin verificación de correo, unirlas permitiría que alguien se registre con el correo ajeno y conserve acceso después de que la víctima entre con Google.
2c. Registro y login propios tienen rate limiting por IP (Upstash) para frenar cuentas falsas y fuerza bruta. Contraseña mínima de 8 caracteres, guardada solo como hash.
3. Las sugerencias quedan en `pending` y **no aparecen públicamente** hasta que un admin las apruebe. Al aprobar se crea el `restaurant`.
4. Antes de enviar una sugerencia, el sistema busca nombres parecidos y avisa si ya existe algo similar (evitar duplicados).
5. Una pollería solo entra al ranking cuando tiene **al menos 10 calificaciones** (constante configurable). Antes aparece como "en votación".
6. El ranking usa **promedio bayesiano**, no promedio simple:
   `score = (v / (v + m)) * R + (m / (v + m)) * C`
   - `v` = votos de la pollería, `R` = su promedio, `m` = mínimo de votos (10), `C` = promedio global de todas las pollerías.
   - La nota de cada voto es el promedio simple de sus 4 criterios, en escala 1–10. `R` es el promedio de esas notas.
7. Rate limiting: máximo de 10 calificaciones por usuario por hora y 3 sugerencias por usuario por día (valores iniciales, ajustables).
8. Los comentarios ocultos por moderación no cuentan en la vista pública, pero la calificación se mantiene salvo que el admin oculte la calificación completa.

## 5. Pantallas (mobile-first)

- **Ingresar**: botón "Continuar con Google" + formulario de correo y contraseña + link a "Crear cuenta" y "Seguir viendo el ranking". Diseño en Stitch.
- **Crear cuenta**: registro con Google o con `@usuario`, correo y contraseña. Diseño en Stitch.
- **Elegir nombre de usuario**: onboarding tras el primer ingreso con Google. Diseño en Stitch.
- **Home / Ranking**: lista ordenada por score, filtro por zona, botón de compartir. Cada tarjeta tiene los botones "Votar" (lleva a Calificar) y "Mapa" (abre la ubicación de la pollería). En el header, quien no ingresó ve "Participar"; con sesión se ve su avatar, que abre un menú con "Mi perfil" y "Cerrar sesión".
- **Perfil de pollería**: foto, zona, mapa/link, promedio, nº de votos, comentarios recientes, botón "Calificar".
- **Calificar** (`/calificar/[slug]`): 4 criterios (Sabor y crocancia, Cantidad y porción, Atención y rapidez, Local) con escala segmentada del 1 al 10, nota general en vivo, barra de progreso y comentario opcional. Si el usuario ya votó, ve sus notas en solo lectura. Diseño en Stitch.
- **Sugerir pollería**: formulario corto con aviso de posibles duplicados.
- **Mi perfil** (`/mi-perfil`, requiere sesión): hoy muestra los datos de la cuenta (avatar o iniciales, nombre, `@usuario`, correo y forma de ingreso: Google o correo y contraseña) y el botón "Cerrar sesión". Pendiente: mis calificaciones y estado de mis sugerencias. Diseño en Stitch.
- **Admin** (protegido): cola de sugerencias, reportes, ocultar pollerías/comentarios.
- **Compartir**: preview (Open Graph) en cada perfil y en el ranking.

## 6. Requisitos no funcionales

- **Responsive real**: diseñado primero para 360px de ancho. Sin anchos fijos en px.
- **Accesibilidad básica**: contraste suficiente, zonas táctiles de al menos 44px, navegación por teclado, textos alternativos en imágenes.
- **Rendimiento**: pensado para datos móviles limitados. Imágenes optimizadas con `next/image`, sin librerías pesadas innecesarias.
- **Seguridad**: validación de toda entrada con Zod, autorización verificada en servidor (nunca confiar en el cliente), sin secretos en el repo.
- **Moderación**: botón de reportar en cada comentario. Comentarios solo sobre la comida/experiencia.

## 7. Stack

Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · PostgreSQL en Neon · Drizzle ORM · Auth.js (Google + Credentials, sesiones JWT) · Zod · Upstash Ratelimit · Vitest + Playwright · GitHub Actions · Deploy en Vercel.

## 8. Plan de implementación

1. Scaffold del proyecto, estructura de carpetas, lint, Vitest, deploy vacío a Vercel.
2. Neon + schema Drizzle + migración inicial + seed con 15–25 pollerías precargadas.
3. Dominio puro: ranking bayesiano con tests unitarios.
4. Ranking y perfil de pollería públicos (sin login).
5. Auth: Google, registro y login con correo y contraseña (librería de hash a definir), elección de `username`. Requiere migración nueva para `users`.
6. Calificar (caso de uso + índice único + rate limiting).
7. Sugerencias + panel de aprobación.
8. Pulido: previews al compartir, SEO, estados vacíos, manejo de errores.

## 9. Preguntas abiertas

- ¿Panel de admin en rutas protegidas de Next.js desde la v1, o aprobar sugerencias directo en la base de datos al inicio?
- ¿Fecha de cierre de votación (ej. fin de mes) o ranking continuo?
- ¿Nombre definitivo del proyecto y dominio? (Con dominio propio se podrían agregar verificación de correo y recuperación de contraseña.)
