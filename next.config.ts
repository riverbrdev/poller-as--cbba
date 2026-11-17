import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const privateRoutes = ["/admin/:path*", "/login", "/register", "/mi-perfil/:path*", "/onboarding/:path*", "/calificar/:path*", "/api/:path*"];
    const sources = process.env.VERCEL_ENV === "preview" ? ["/:path*"] : privateRoutes;
    return sources.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
  // Fotos de perfil de las cuentas de Google (avatar del menú y de "Mi perfil").
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
