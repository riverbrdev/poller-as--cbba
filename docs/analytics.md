# Google Analytics 4 en ComiDeli

## Activación

1. Crear una propiedad GA4 llamada ComiDeli con zona horaria de Bolivia y un flujo Web para https://www.comideli.com.bo.
2. Copiar el ID de medición del flujo, con formato `G-XXXXXXXXXX`.
3. En Vercel → proyecto → Settings → Environment Variables, añadir `NEXT_PUBLIC_GA_MEASUREMENT_ID` con ese ID, únicamente para **Production**.
4. Desplegar nuevamente: Next.js incorpora la variable pública al compilar. No basta con guardar la variable en Vercel.
5. En el flujo Web, mantener activada la medición mejorada de **Vistas de página**, incluida la opción avanzada de cambios de página basados en el historial del navegador. Esto registra los cambios de ruta de Next.js sin añadir eventos manuales duplicados.
6. Desactivar la medición automática de interacciones con formularios: para esta integración solo necesitamos tráfico, no datos de formularios de acceso o reseñas. No configurar recopilación de datos proporcionados por usuarios.

## Alcance y arquitectura

- Presentación: `app/_components/google-analytics.tsx` carga la etiqueta con `next/script` después de la hidratación inicial. El layout la incluye una sola vez.
- Configuración de presentación: `app/_lib/analytics.ts` valida el ID y excluye desarrollo, tests y previews de Vercel. Sin ID válido no se carga Google Analytics.
- Sin cambios en domain, application, infrastructure, autenticación, votos ni base de datos. No se envían explícitamente nombres, correos, comentarios ni identificadores de cuentas. Las visitas no equivalen a usuarios registrados.
- Las señales de Google y la personalización publicitaria están desactivadas. Esta integración básica no incorpora un gestor de consentimiento; esos ajustes no equivalen a desactivar las cookies de analítica.
- No instalar además el mismo GA4 mediante Tag Manager u otro componente: produciría medición duplicada.

## Comprobación tras desplegar

Abrir la web, navegar desde el ranking a una pollería y luego a Versus. En GA4 → Informes → Tiempo real comprobar actividad y páginas. Tag Assistant permite confirmar el ID y revisar que cada navegación genere una sola vista de página. Los bloqueadores y la configuración de privacidad pueden impedir la medición.

No hay datos históricos anteriores a la instalación. La recepción real queda pendiente hasta configurar un ID válido y desplegar. Para desactivar, eliminar la variable de Vercel y volver a desplegar.

Referencias: [medición de aplicaciones de una sola página](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [etiqueta de Google](https://developers.google.com/tag-platform/gtagjs).
