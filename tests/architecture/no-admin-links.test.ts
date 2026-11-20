import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Spec 003, FR-009: ninguna pantalla enlaza ni redirige al área de administración.
// Al admin lo lleva ahí el servidor después del login (application/admin/post-sign-in-destination.ts).
const ROOT = process.cwd();
const SCANNED_DIRS = ["src/components", "src/app"];
const ALLOWED_DIR = join(ROOT, "src/app/admin");

// href="/admin", href={"/admin"}, redirect("/admin"), router.push('/admin'), `/admin`…
// No mira comentarios que solo mencionan la ruta.
const ADMIN_LINK = /(href|redirect|push|replace)\s*[=(:]\s*\{?\s*["'`]\/admin\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return path === ALLOWED_DIR ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("sin enlaces al área de administración", () => {
  it("la expresión detecta enlaces y redirecciones, no comentarios", () => {
    expect(ADMIN_LINK.test('<Link href="/admin">')).toBe(true);
    expect(ADMIN_LINK.test("redirect('/admin')")).toBe(true);
    expect(ADMIN_LINK.test("router.push(`/admin/x`)")).toBe(true);
    expect(ADMIN_LINK.test("// después del login el servidor lleva a /admin")).toBe(false);
    expect(ADMIN_LINK.test('href="/administrar-cuenta"')).toBe(false);
  });

  it("ningún componente ni página fuera de src/app/admin enlaza a /admin", () => {
    const offenders = SCANNED_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir)))
      .filter((file) => ADMIN_LINK.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders, `Enlaces a /admin encontrados en: ${offenders.join(", ")}`).toEqual([]);
  });
});
