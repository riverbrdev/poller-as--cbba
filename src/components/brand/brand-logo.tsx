import Image from "next/image";
import { cn } from "@/components/lib/utils";

/**
 * Logotipo de ComiDeli ("Comi" + tenedor + "Deli"), recortado sin bordes transparentes.
 * El alto lo define quien lo usa (h-7, h-10…); el ancho sale de la proporción del archivo.
 */
export const BRAND_LOGO = { src: "/brand/comideli-logo.png", width: 958, height: 250 } as const;

type BrandLogoProps = {
  className?: string;
  /** Solo para el logo que se ve al cargar (header): se descarga sin esperar. */
  eager?: boolean;
  /** Texto alternativo; vacío si ya hay un nombre accesible alrededor. */
  alt?: string;
};

export function BrandLogo({ className, eager = false, alt = "ComiDeli" }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO.src}
      width={BRAND_LOGO.width}
      height={BRAND_LOGO.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      sizes="(min-width: 640px) 160px, 128px"
      className={cn("h-8 w-auto select-none", className)}
    />
  );
}

/** Ilustraciones de marca (public/brand). Se usan poco y solo donde la sección queda vacía. */
export const BRAND_ART = {
  cholita: { src: "/brand/cholita.png", width: 488, height: 460 },
  trophy: { src: "/brand/copa-tenedor.png", width: 224, height: 240 },
  podium: { src: "/brand/rank.png", width: 396, height: 482 },
  icon: { src: "/brand/comideli-icon.png", width: 500, height: 500 },
} as const;

type BrandArtProps = {
  art: keyof typeof BRAND_ART;
  /** Tamaño con utilidades de Tailwind (h-*, w-auto…). */
  className?: string;
  /** Ancho aproximado en pantalla, para que next/image no baje un archivo más grande. */
  sizes: string;
  eager?: boolean;
};

/** Ilustración decorativa: siempre con alt vacío, el texto de al lado ya dice lo importante. */
export function BrandArt({ art, className, sizes, eager = false }: BrandArtProps) {
  const { src, width, height } = BRAND_ART[art];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className={cn("pointer-events-none select-none", className)}
    />
  );
}
