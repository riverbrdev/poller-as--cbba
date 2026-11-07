# Contrato: rutas, redirecciones y componentes de UI

## Rutas

| Ruta | Acceso | Qué muestra |
|---|---|---|
| `/` | público | Catálogo. Cada tarjeta tiene **Votar** → `/calificar/<slug>` y **Mapa** → `mapsUrl` (pestaña nueva). Sigue en caché, sin leer la sesión. |
| `/calificar/[slug]` | sesión + `username` | La foto y el nombre llegan en el shell estático; la sesión y el voto previo, dentro de `<Suspense>`. Pollería activa sin voto del usuario → formulario. Con voto → aviso "Ya calificaste" (FR-019a). Inexistente u oculta → `notFound()`. |
| `/login?callbackUrl=…` | público | Igual que hoy, pero tras ingresar va a `callbackUrl` (si es segura). |
| `/register?callbackUrl=…` | público | Igual: tras crear la cuenta va a `callbackUrl`. |
| `/onboarding/username?callbackUrl=…` | sesión | Tras elegir username va a `callbackUrl`. |

### Metadata de `/calificar/[slug]`

`generateMetadata`: `title` "Califica {nombre} · ComiDeli", `description` "Califica sabor, porción, atención y local de {nombre} en Cochabamba.", Open Graph con `photoUrl` si existe, `robots: { index: false }`.

## Redirecciones (dominio: `src/domain/user/access.ts`)

`redirectFor({ pathname, hasSession, hasUsername })` → `string | null` (misma firma que hoy; solo cambia el valor devuelto)

| Situación | Resultado |
|---|---|
| `/calificar/pollos-kingdom` sin sesión | `/login?callbackUrl=%2Fcalificar%2Fpollos-kingdom` |
| `/calificar/pollos-kingdom` con sesión sin username | `/onboarding/username?callbackUrl=%2Fcalificar%2Fpollos-kingdom` |
| `/calificar/pollos-kingdom` con sesión y username | `null` |
| rutas públicas | `null` (sin cambios) |

`safeCallbackPath(value: string | null | undefined): string`

| Entrada | Salida |
|---|---|
| `"/calificar/pollos-kingdom"` | `"/calificar/pollos-kingdom"` |
| `null`, `""` | `"/"` |
| `"https://malo.com"`, `"//malo.com"`, `"/\\malo.com"`, `"javascript:alert(1)"` | `"/"` |
| `"calificar/x"` (sin `/` inicial) | `"/"` |

## Componentes (`src/components/`)

### `home/restaurant-card.tsx` (cambia)

```ts
type RestaurantCardData = {
  name: string; slug: string; zone: string; address: string;
  photoUrl: string | null; mapsUrl: string | null;
};
```

- Fila inferior: `[ Votar (primario, flex-1) ][ Mapa (secundario) ]`, ambos con `min-h-11` (44 px) y en una sola fila desde 360 px.
- **Votar**: `<Link href={`/calificar/${slug}`}>`, accesible como "Votar por {nombre}".
- **Mapa**: `<a href={mapsUrl} target="_blank" rel="noopener noreferrer">`, accesible como "Ver ubicación de {nombre} en el mapa". Si no hay `mapsUrl`, no se muestra.
- El texto informativo pasa a: "Califica sabor, porción, atención y local."

### `rating/` (nuevos)

| Componente | Tipo | Props principales | Responsabilidad |
|---|---|---|---|
| `rating-form.tsx` | cliente | `restaurant`, `hero: { banner, card }`, `action` | Estado de las 4 notas y del comentario, `useActionState`, layout responsive (columna lateral fija en `lg:`, barra inferior fija en móvil), confirmación al guardar con la nota general y las 4 notas. Recibe la foto ya renderizada en `hero`, no la importa |
| `score-scale.tsx` | cliente | `criterion`, `value`, `onChange` | 10 radios nativos `name={criterion.key}` con estilo de barra segmentada, rellena hasta `value`; muestra "8 · Muy bueno" y los textos del 1 y del 10 |
| `score-ring.tsx` | servidor/cliente | `value: number \| null` | Anillo SVG con la nota general |
| `progress-bar.tsx` | servidor/cliente | `done`, `total` | "N de 4 criterios · %" con barra |
| `rating-hero.tsx` | sin estado (se renderiza en `page.tsx`, fuera del Suspense) | `restaurant`, `variant: "banner" \| "card"` | Foto (`next/image`, `priority`), nombre y zona; marcador sin foto igual al de la tarjeta |
| `already-rated.tsx` | servidor | `restaurant`, `rating` | Aviso "Ya calificaste esta pollería" con las 4 notas, la nota general y "Volver al catálogo" |
| `messages.ts` | — | — | Códigos de error → texto en español |

Los criterios, etiquetas y promedios salen de `src/domain/rating/`. Los colores salen de los tokens del tema (`brand`, `brand-dark`, `brand-soft`, `ink`, `ink-muted`, `line`, `cream`, `surface-soft`).
