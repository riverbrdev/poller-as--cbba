import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/app/_lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Login y páginas privadas deben poder leerse para que Google vea su noindex.
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
