import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { getActiveRestaurants } from "@/app/_data/restaurants";
import { SITE_ORIGIN } from "@/app/_lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  const { restaurants } = await getActiveRestaurants();
  // Solo páginas públicas. No inventamos lastModified sin una fecha real de actualización.
  return [
    { url: `${SITE_ORIGIN}/` },
    { url: `${SITE_ORIGIN}/ranking` },
    { url: `${SITE_ORIGIN}/versus` },
    ...restaurants.map(({ slug }) => ({ url: `${SITE_ORIGIN}/polleria/${encodeURIComponent(slug)}` })),
  ];
}
