# SPEC — Ranking de Pollos de Cochabamba

> Nombre provisional: **PolloRanking**. Cambiar cuando se decida el definitivo.

## 1. Qué es

Web app de entretenimiento donde la gente de Cochabamba califica pollerías y se arma un ranking público del mejor pollo de la ciudad. Hay que registrarse para votar. Las personas pueden sugerir pollerías nuevas, que entran a una cola de aprobación manual.

**Objetivo principal:** que sea fácil de compartir (links con preview en WhatsApp/Facebook/Instagram) y que se use desde el celular.

**No es objetivo (v1):** monetización, reseñas largas, categorías separadas (presa, ají, precio), app nativa, multi-ciudad.

## 2. Usuarios y roles

| Rol | Puede |
|---|---|
| Visitante | Ver ranking, ver perfil de cada pollería |
| Usuario (logueado con Google) | Todo lo anterior + calificar, comentar, sugerir pollerías, reportar comentarios |
| Admin (solo el dueño del proyecto) | Todo lo anterior + aprobar/rechazar sugerencias, ocultar pollerías y comentarios, resolver reportes |

## 3. Modelo de datos

**users**: id, google_id (único), name, email (único), avatar_url, role (`user` | `admin`), created_at

**restaurants**: id, name, slug (único), zone, address, maps_url, photo_url, status (`active` | `hidden`), created_at

**ratings**: id, user_id, restaurant_id, stars (1–5), comment (opcional, máx. 280 caracteres), status (`visible` | `hidden`), created_at, updated_at
- Índice único en `(user_id, restaurant_id)`.

**suggestions**: id, user_id, name, zone, address, maps_url (opcional), status (`pending` | `approved` | `rejected`), reviewed_by, reviewed_at, created_at

**reports**: id, user_id, rating_id, reason, status (`open` | `resolved`), created_at

## 4. Reglas de negocio

1. Un usuario puede tener **una sola calificación por pollería**. Puede editarla, no duplicarla. Se garantiza con índice único en la base de datos, no solo en código.
2. Para calificar hay que estar logueado.
3. Las sugerencias quedan en `pending` y **no aparecen públicamente** hasta que un admin las apruebe. Al aprobar se crea el `restaurant`.
4. Antes de enviar una sugerencia, el sistema busca nombres parecidos y avisa si ya existe algo similar (evitar duplicados).
5. Una pollería solo entra al ranking cuando tiene **al menos 10 calificaciones** (constante configurable). Antes aparece como "en votación".
6. El ranking usa **promedio bayesiano**, no promedio simple:
   `score = (v / (v + m)) * R + (m / (v + m)) * C`
   - `v` = votos de la pollería, `R` = su promedio, `m` = mínimo de votos (10), `C` = promedio global de todas las pollerías.
7. Rate limiting: máximo de 10 calificaciones por usuario por hora y 3 sugerencias por usuario por día (valores iniciales, ajustables).
8. Los comentarios ocultos por moderación no cuentan en la vista pública, pero la calificación en estrellas se mantiene salvo que el admin oculte la calificación completa.

## 5. Pantallas (mobile-first)

- **Home / Ranking**: lista ordenada por score, filtro por zona, botón de compartir.
- **Perfil de pollería**: foto, zona, mapa/link, promedio, nº de votos, comentarios recientes, botón "Calificar".
- **Calificar**: estrellas grandes y táctiles + comentario opcional.
- **Sugerir pollería**: formulario corto con aviso de posibles duplicados.
- **Mi perfil**: mis calificaciones y estado de mis sugerencias.
- **Admin** (protegido): cola de sugerencias, reportes, ocultar pollerías/comentarios.
- **Compartir**: preview (Open Graph) en cada perfil y en el ranking.

## 6. Requisitos no funcionales

- **Responsive real**: diseñado primero para 360px de ancho. Sin anchos fijos en px.
- **Accesibilidad básica**: contraste suficiente, zonas táctiles de al menos 44px, navegación por teclado, textos alternativos en imágenes.
- **Rendimiento**: pensado para datos móviles limitados. Imágenes optimizadas con `next/image`, sin librerías pesadas innecesarias.
- **Seguridad**: validación de toda entrada con Zod, autorización verificada en servidor (nunca confiar en el cliente), sin secretos en el repo.
- **Moderación**: botón de reportar en cada comentario. Comentarios solo sobre la comida/experiencia.

## 7. Stack

Next.js (App Router) + TypeScript · Tailwind + shadcn/ui · PostgreSQL en Neon · Drizzle ORM · Auth.js con Google · Zod · Upstash Ratelimit · Vitest + Playwright · GitHub Actions · Deploy en Vercel.

## 8. Plan de implementación

1. Scaffold del proyecto, estructura de carpetas, lint, Vitest, deploy vacío a Vercel.
2. Neon + schema Drizzle + migración inicial + seed con 15–25 pollerías precargadas.
3. Dominio puro: ranking bayesiano con tests unitarios.
4. Ranking y perfil de pollería públicos (sin login).
5. Auth con Google.
6. Calificar (caso de uso + índice único + rate limiting).
7. Sugerencias + panel de aprobación.
8. Pulido: previews al compartir, SEO, estados vacíos, manejo de errores.

## 9. Preguntas abiertas

- ¿Panel de admin en rutas protegidas de Next.js desde la v1, o aprobar sugerencias directo en la base de datos al inicio?
- ¿Fecha de cierre de votación (ej. fin de mes) o ranking continuo?
- ¿Nombre definitivo del proyecto y dominio?
