import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Spec 003, FR-009: el único acceso visible al área de administración es la entrada
// "Panel de administración" del menú de la cuenta, que solo se muestra a admins
// (header-account.tsx lo decide con getAdminAccess). Ninguna otra pantalla enlaza ni redirige ahí.
// Al admin también lo lleva el servidor después del login (application/admin/post-sign-in-destination.ts).
const ROOT = process.cwd();
const SCANNED_DIRS = ["src/components", "src/app"];
const ALLOWED_DIR = join(ROOT, "src/app/admin");
const ADMIN_ROUTE_FILE = "src/components/account/routes.ts";
const ADMIN_MENU_FILE = "src/components/account/user-menu.tsx";

// href="/admin", href={"/admin"}, redirect("/admin"), router.push('/admin'), `/admin`…
// No mira comentarios que solo mencionan la ruta.
const ADMIN_LINK = /(href|redirect|push|replace)\s*[=(:]\s*\{?\s*["'`]\/admin\b/;
const ADMIN_HREF_USE = /\bADMIN_HREF\b/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return path === ALLOWED_DIR ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

const files = () => SCANNED_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir)));

describe("enlaces al área de administración", () => {
  it("la expresión detecta enlaces y redirecciones, no comentarios", () => {
    expect(ADMIN_LINK.test('<Link href="/admin">')).toBe(true);
    expect(ADMIN_LINK.test("redirect('/admin')")).toBe(true);
    expect(ADMIN_LINK.test("router.push(`/admin/x`)")).toBe(true);
    expect(ADMIN_LINK.test("// después del login el servidor lleva a /admin")).toBe(false);
    expect(ADMIN_LINK.test('href="/administrar-cuenta"')).toBe(false);
  });

  it("ningún componente ni página fuera de src/app/admin enlaza a /admin escribiendo la ruta", () => {
    const offenders = files()
      .filter((file) => ADMIN_LINK.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders, `Enlaces a /admin encontrados en: ${offenders.join(", ")}`).toEqual([]);
  });

  it("solo el menú de la cuenta usa ADMIN_HREF, y lo muestra únicamente con isAdmin", () => {
    const users = files()
      .filter((file) => ADMIN_HREF_USE.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file))
      .sort();

    expect(users).toEqual([ADMIN_ROUTE_FILE, ADMIN_MENU_FILE].sort());
    expect(readFileSync(join(ROOT, ADMIN_MENU_FILE), "utf8")).toMatch(
      /\{isAdmin \? \(\s*<DropdownMenuItem render=\{<Link href=\{ADMIN_HREF\}/,
    );
  });
});
