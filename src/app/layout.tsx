import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Tipografía única de DeliCocha (diseño Stitch): Plus Jakarta Sans.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const DESCRIPTION = "El ranking del mejor pollo de Cochabamba, votado por la gente.";

export const metadata: Metadata = {
  title: "DeliCocha",
  description: DESCRIPTION,
  // Para que el enlace se vea bien al compartirlo por WhatsApp o Facebook (CLAUDE.md).
  openGraph: {
    title: "DeliCocha",
    description: DESCRIPTION,
    type: "website",
    locale: "es_BO",
    siteName: "DeliCocha",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">{children}</body>
    </html>
  );
}
