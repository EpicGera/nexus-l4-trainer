import { describe, it, expect } from "vitest";
import { muscleLoadForVariation, toHeatmapParts } from "./muscleMap";

const empty = { title: "", scheme: "", items: [] as string[] };
const dayWith = (metconItems: string[], strengthItems: string[] = []) =>
  ({
    tabName: "RX",
    warmup: empty,
    strength: { title: "FUERZA", scheme: "", items: strengthItems },
    metcon: { title: "METCON", scheme: "AMRAP 12", items: metconItems },
    accessories: empty,
  } as any);

describe("muscleLoadForVariation", () => {
  it("día de squat carga cuádriceps y glúteos por encima del resto", () => {
    const load = muscleLoadForVariation(dayWith([], ["Back Squat 5x5 @ 80% WM", "Front Squat 3x3 @ 75% WM"]));
    expect(load.quads).toBe(1); // el más trabajado → normalizado a 1
    expect(load.glutes).toBeGreaterThan(0);
    expect(load.quads).toBeGreaterThan(load.chest);
  });

  it("día de tracción carga dorsales / espalda alta", () => {
    const load = muscleLoadForVariation(dayWith(["15 Pull-ups", "12 Barbell Row @ 40kg"]));
    expect(load.lats).toBeGreaterThan(0);
    expect(load.upper_back).toBeGreaterThan(0);
    expect(load.lats + load.upper_back).toBeGreaterThan(load.quads);
  });

  it("día vacío → todo 0 (sin dividir por cero)", () => {
    const load = muscleLoadForVariation(dayWith([]));
    expect(Object.values(load).every((v) => v === 0)).toBe(true);
  });
});

describe("toHeatmapParts (13 grupos → 8 regiones del maniquí)", () => {
  it("día de squat enciende leg y butt por encima del resto", () => {
    const parts = toHeatmapParts(muscleLoadForVariation(dayWith([], ["Back Squat 5x5 @ 80% WM"])));
    expect(parts.leg).toBe(1); // quads (max) → leg
    expect(parts.butt).toBeGreaterThan(0); // glutes → butt
    expect(parts.leg).toBeGreaterThan(parts.chest ?? 0);
  });

  it("colapsa por MAX, no por suma (leg = max(quads,hamstrings,calves))", () => {
    const load = muscleLoadForVariation(dayWith([], ["Back Squat 5x5 @ 80% WM"]));
    const parts = toHeatmapParts(load);
    // leg toma el máximo de sus grupos, nunca los suma → ≤ 1
    expect(parts.leg).toBeLessThanOrEqual(1);
    expect(parts.leg).toBe(Math.max(load.quads, load.hamstrings, load.calves));
  });
});
