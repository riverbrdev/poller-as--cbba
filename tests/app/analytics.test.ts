import { describe, expect, it } from "vitest";
import { getAnalyticsId } from "@/app/_lib/analytics";

describe("activación de GA4", () => {
  it("habilita un ID válido solo en producción", () => {
    expect(getAnalyticsId(" G-ABC1234567 ", "production", "production")).toBe("G-ABC1234567");
    expect(getAnalyticsId("G-ABC1234567", "production", undefined)).toBe("G-ABC1234567");
  });

  it.each([undefined, "", "UA-12345-1", "G-", "G-ABC';alert(1)//"])("no carga scripts con ID inválido: %s", (id) => {
    expect(getAnalyticsId(id, "production", "production")).toBeNull();
  });

  it.each([
    ["development", undefined],
    ["test", undefined],
    ["production", "preview"],
    ["production", "development"],
  ])("excluye entorno %s / %s", (nodeEnv, vercelEnv) => {
    expect(getAnalyticsId("G-ABC1234567", nodeEnv, vercelEnv)).toBeNull();
  });
});
