import { describe, expect, it } from "vitest";
import { isAllowlistedEmail, parseAdminAllowlist } from "@/domain/user/admin";

describe("parseAdminAllowlist", () => {
  it.each([undefined, "", "   ", ","])("sin correos (%s) nadie es admin", (raw) => {
    expect(parseAdminAllowlist(raw).size).toBe(0);
  });

  it("normaliza espacios y mayúsculas", () => {
    expect([...parseAdminAllowlist(" Juan@Gmail.com , ana@gmail.com")]).toEqual(["juan@gmail.com", "ana@gmail.com"]);
  });

  it.each(["a@b.com,,", "a@b.com, ,", "a@b.com,juan", "a@b.com,a@b@c", "a@b.com,@b.com", "a@b.com,a@"])(
    "ignora los elementos vacíos o mal escritos y conserva los válidos: %s",
    (raw) => {
      expect([...parseAdminAllowlist(raw)]).toEqual(["a@b.com"]);
    },
  );

  it("acepta más de tres correos", () => {
    expect(parseAdminAllowlist("a@x.com,b@x.com,c@x.com,d@x.com").size).toBe(4);
  });
});

describe("isAllowlistedEmail", () => {
  const allowlist = parseAdminAllowlist("juan@gmail.com");

  it("reconoce el correo aunque venga con otras mayúsculas o espacios", () => {
    expect(isAllowlistedEmail("  JUAN@gmail.com ", allowlist)).toBe(true);
  });

  it("rechaza un correo que no está en la lista", () => {
    expect(isAllowlistedEmail("ana@gmail.com", allowlist)).toBe(false);
  });

  it("con la lista vacía rechaza a todos", () => {
    expect(isAllowlistedEmail("juan@gmail.com", parseAdminAllowlist(undefined))).toBe(false);
  });
});
