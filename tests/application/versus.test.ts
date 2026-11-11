import { describe, expect, it } from "vitest";
import { duelResult, type DuelChoice } from "@/domain/versus/duel";
import { createGetVersus, createVoteVersus } from "@/application/versus/versus";
import type { VersusRepository } from "@/application/ports/versus-repository";
import { createFakeRestaurantRepository, createFakeUserRepository } from "./fakes";
function setup(username: string | null = "tester") {
  const choices = new Map<string, DuelChoice>();
  const votes: VersusRepository = {
    counts: async () => ({ "lolo-chicken": [...choices.values()].filter((v) => v === "lolo-chicken").length, ricono: [...choices.values()].filter((v) => v === "ricono").length }),
    choiceFor: async (id) => choices.get(id) ?? null,
    createIfAbsent: async (id, choice) => { if (choices.has(id)) return false; choices.set(id, choice); return true; },
  };
  const restaurants = createFakeRestaurantRepository(["lolo-chicken", "ricono"].map((slug) => ({
    id: slug, slug, name: slug, zone: "Centro", address: "", mapsUrl: null, photoUrl: null,
  })));
  const users = createFakeUserRepository([{ id: "u1", username, name: "Test", email: "test@example.com", googleId: null, passwordHash: "hash", avatarUrl: null }]);
  const deps = { votes, restaurants, users };
  return { vote: createVoteVersus(deps), get: createGetVersus(deps), votes, deps };
}
describe("Versus independiente", () => {
  it("registra una eleccion y muestra el lider y el voto propio", async () => {
    const { vote, get } = setup();
    expect(await vote("u1", "ricono")).toEqual({ ok: true });
    expect(await get("u1")).toMatchObject({ choice: "ricono", leader: "ricono", total: 1, percentages: { ricono: 100, "lolo-chicken": 0 } });
    expect((await get())?.choice).toBeNull();
  });
  it("rechaza cambiar de candidato o repetir el voto", async () => {
    const { vote, votes } = setup();
    await vote("u1", "lolo-chicken");
    expect(await vote("u1", "ricono")).toEqual({ ok: false, error: "already_voted" });
    expect(await vote("u1", "lolo-chicken")).toEqual({ ok: false, error: "already_voted" });
    expect(await votes.counts()).toEqual({ "lolo-chicken": 1, ricono: 0 });
  });
  it("solo permite los participantes del duelo", async () => {
    const { vote } = setup();
    expect(await vote("u1", "other")).toEqual({ ok: false, error: "invalid_choice" });
  });
  it("exige cuenta existente y username", async () => {
    expect(await setup().vote("missing", "ricono")).toEqual({ ok: false, error: "user_not_found" });
    expect(await setup(null).vote("u1", "ricono")).toEqual({ ok: false, error: "username_required" });
  });
  it("no permite votar si falta un participante activo", async () => {
    const { deps } = setup();
    deps.restaurants = createFakeRestaurantRepository([]);
    expect(await createVoteVersus(deps)("u1", "ricono")).toEqual({ ok: false, error: "unavailable" });
    expect(await createGetVersus(deps)()).toBeNull();
  });
  it("admite solo uno de dos envios simultaneos", async () => {
    const { vote } = setup();
    const results = await Promise.all([vote("u1", "ricono"), vote("u1", "lolo-chicken")]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
  });
});
describe("Resultado del duelo", () => {
  it("no inventa un ganador o porcentaje sin votos", () => {
    expect(duelResult({ "lolo-chicken": 0, ricono: 0 })).toEqual({ total: 0, leader: null, percentages: { "lolo-chicken": 0, ricono: 0 } });
  });
  it("reconoce empate y lider por cantidad", () => {
    expect(duelResult({ "lolo-chicken": 3, ricono: 3 }).leader).toBeNull();
    expect(duelResult({ "lolo-chicken": 2, ricono: 1 })).toMatchObject({ leader: "lolo-chicken", percentages: { "lolo-chicken": 67, ricono: 33 } });
  });
});
