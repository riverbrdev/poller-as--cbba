/**
 * Convierte el nombre de una pollería en un slug para su URL.
 * "Chicken's Kingdom" → "chickens-kingdom", "Pollos Vizzio's" → "pollos-vizzios".
 */
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
