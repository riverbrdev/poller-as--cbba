import { describe, expect, it } from "vitest";
import { toSlug } from "@/domain/restaurant/slug";

describe("toSlug", () => {
  it.each([
    ["Lolo Chicken", "lolo-chicken"],
    ["Chicken's Kingdom", "chickens-kingdom"],
    ["Chester's Fried Chicken", "chesters-fried-chicken"],
    ["Pollos Vizzio's", "pollos-vizzios"],
    ["Pollería El Ñandú", "polleria-el-nandu"],
    ["  Pollos   & Más!  ", "pollos-mas"],
  ])("%s → %s", (name, slug) => {
    expect(toSlug(name)).toBe(slug);
  });
});
