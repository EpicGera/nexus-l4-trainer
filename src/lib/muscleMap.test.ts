import { describe, it, expect } from "vitest";
import { muscleLoadForVariation } from "./muscleMap";

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
