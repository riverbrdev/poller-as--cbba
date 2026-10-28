import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Reglas de capas (ver CLAUDE.md). Cada capa solo importa de las capas que tiene debajo.
const infrastructure = [
  "@/infrastructure",
  "@/infrastructure/*",
  "**/infrastructure",
  "**/infrastructure/*",
];
const dataAndVendorPackages = [
  "drizzle-orm",
  "drizzle-orm/*",
  "@neondatabase/*",
  "@upstash/*",
  "next-auth",
  "next-auth/*",
];
const noInfrastructureMessage =
  "app/ y components/ no acceden a infraestructura: usa un caso de uso de application/ vía composition/.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: [...infrastructure, ...dataAndVendorPackages], message: noInfrastructureMessage },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: [...infrastructure, ...dataAndVendorPackages], message: noInfrastructureMessage },
            {
              group: ["@/composition", "@/composition/*", "**/composition", "**/composition/*"],
              message: "components/ no ejecuta casos de uso: recibe los datos por props.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?!\\.|@/domain(/|$))",
              message: "domain/ no importa nada externo al proyecto ni de otras capas.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...infrastructure,
                ...dataAndVendorPackages,
                "@/app",
                "@/app/*",
                "@/components",
                "@/components/*",
                "@/composition",
                "@/composition/*",
                "next",
                "next/*",
              ],
              message: "application/ depende solo de domain/ y de sus propias interfaces.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
