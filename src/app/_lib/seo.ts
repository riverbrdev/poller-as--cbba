import type { Metadata } from "next";

/** Un único origen canónico, también al compilar previews o ejecutar en local. */
export const SITE_ORIGIN = "https://www.comideli.com.bo";
export const HOME_TITLE = "ComiDeli | Mejores pollerías de Cochabamba";
export const HOME_DESCRIPTION = "Descubre las mejores pollerías de Cochabamba en ComiDeli. Consulta el ranking de pollos, compara calificaciones y conoce las opiniones de la comunidad.";
export const HOME_METADATA: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/",
    type: "website", locale: "es_BO", siteName: "ComiDeli",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ComiDeli: ranking de pollos de Cochabamba" }],
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: ["/opengraph-image"] },
};
