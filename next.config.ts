import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
