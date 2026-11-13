import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Tipografía única de ComiDeli (diseño Stitch): Plus Jakarta Sans.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const DESCRIPTION = "El ranking del mejor pollo de Cochabamba, votado por la gente.";

// Base de las URLs de Open Graph: las fotos se guardan como rutas relativas (/pollerias/<slug>.webp)
// y WhatsApp/Facebook necesitan la URL completa para mostrar la imagen.
const deployedHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || (deployedHost ? `https://${deployedHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ComiDeli",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // Para que el enlace se vea bien al compartirlo por WhatsApp o Facebook (CLAUDE.md).
  openGraph: {
    title: "ComiDeli",
    description: DESCRIPTION,
    type: "website",
    locale: "es_BO",
    siteName: "ComiDeli",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ComiDeli: el ranking del pollo de Cochabamba" }],
  },
  twitter: { card: "summary_large_image", title: "ComiDeli", description: DESCRIPTION, images: ["/opengraph-image"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next desactiva el scroll suave al cambiar de página (Next 16), así solo se deslizan los anclas.
    <html lang="es" data-scroll-behavior="smooth" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
