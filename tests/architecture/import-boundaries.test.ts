import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint();

async function restrictedImportErrors(filePath: string, importPath: string) {
  const [result] = await eslint.lintText(`import "${importPath}";\n`, { filePath });
  return (result?.messages ?? []).filter((message) => message.ruleId === "no-restricted-imports");
}

describe("límites entre capas", () => {
  it.each([
    ["src/app/page.tsx", "@/infrastructure/db"],
    ["src/app/api/x/route.ts", "../../../infrastructure/db"],
    ["src/app/page.tsx", "drizzle-orm"],
    ["src/components/card.tsx", "@/infrastructure/db"],
    ["src/components/card.tsx", "@/composition/container"],
    ["src/domain/ranking.ts", "zod"],
    ["src/domain/ranking.ts", "@/application/rate-restaurant"],
    ["src/application/rate-restaurant.ts", "@/infrastructure/db"],
    ["src/application/rate-restaurant.ts", "next/headers"],
  ])("%s no puede importar %s", async (filePath, importPath) => {
    expect(await restrictedImportErrors(filePath, importPath)).toHaveLength(1);
  });

  it.each([
    ["src/app/page.tsx", "@/application/rate-restaurant"],
    ["src/app/page.tsx", "@/composition/container"],
    ["src/domain/ranking.ts", "./constants"],
    ["src/domain/ranking.ts", "@/domain/constants"],
    ["src/application/rate-restaurant.ts", "@/domain/ranking"],
    ["src/composition/container.ts", "@/infrastructure/db"],
  ])("%s sí puede importar %s", async (filePath, importPath) => {
    expect(await restrictedImportErrors(filePath, importPath)).toHaveLength(0);
  });
});
