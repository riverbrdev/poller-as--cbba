import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_ORIGIN } from "@/app/_lib/seo";
import { GoogleAnalytics } from "@/app/_components/google-analytics";

// Tipografía única de ComiDeli (diseño Stitch): Plus Jakarta Sans.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const DESCRIPTION = "El ranking del mejor pollo de Cochabamba, calificado por la gente.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "ComiDeli",
  description: DESCRIPTION,
  // Para que el enlace se vea bien al compartirlo por WhatsApp o Facebook (CLAUDE.md).
  openGraph: {
    title: "ComiDeli",
    description: DESCRIPTION,
    type: "website",
    locale: "es_BO",
    siteName: "ComiDeli",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ComiDeli: el ranking del pollo de Cochabamba" }],
  },
  twitter: { card: "summary_large_image", title: "ComiDeli", description: DESCRIPTION, images: ["/opengraph-image"] },
};

// viewport-fit=cover: en iPhone, env(safe-area-inset-bottom) da el alto de la rayita de inicio
// y la barra de pestañas de abajo deja ese espacio libre.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next desactiva el scroll suave al cambiar de página (Next 16), así solo se deslizan los anclas.
    <html lang="es" data-scroll-behavior="smooth" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
        <GoogleAnalytics />
        {/* Vercel Web Analytics: visitas y páginas vistas (solo registra en el deploy de Vercel). */}
        <Analytics />
      </body>
    </html>
  );
}
