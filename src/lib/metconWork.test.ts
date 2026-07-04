import { describe, it, expect } from "vitest";
import { parsePrescribedItem, prescribedRounds, ladderSum, expandMetconWork } from "./metconWork";
import { MetconResult } from "../types/training";

const amrap = (p: Partial<MetconResult>): MetconResult => ({ format: "amrap", scaling: "rx", ...p });
const fortime = (p: Partial<MetconResult>): MetconResult => ({ format: "fortime", scaling: "rx", ...p });

describe("parsePrescribedItem — cantidades reales de la prescripción", () => {
  it("calorías, metros y reps, en cualquier orden", () => {
    expect(parsePrescribedItem("15 Cal Row")).toMatchObject({ qty: 15, unit: "cal" });
    expect(parsePrescribedItem("Row 15 cal")).toMatchObject({ qty: 15, unit: "cal" });
    expect(parsePrescribedItem("400m Run")).toMatchObject({ qty: 400, unit: "m" });
    expect(parsePrescribedItem("Run 1 km")).toMatchObject({ qty: 1000, unit: "m" });
    expect(parsePrescribedItem("12 Burpees")).toMatchObject({ qty: 12, unit: "reps" });
  });

  it("hombre/mujer '12/10 cal' toma la primera cifra; peso prescripto va aparte", () => {
    expect(parsePrescribedItem("12/10 Cal Assault Bike")).toMatchObject({ qty: 12, unit: "cal" });
    expect(parsePrescribedItem("20 Wall Balls (9kg)")).toMatchObject({ qty: 20, unit: "reps", weightKg: 9 });
  });

  it("sin cantidad ('Max Burpees') queda qty null; los cues no son movimientos", () => {
    expect(parsePrescribedItem("Max Burpees")).toMatchObject({ qty: null });
    expect(parsePrescribedItem("<span class='cue'>Mantené el ritmo</span>")).toBeNull();
  });
});

describe("prescribedRounds / ladderSum", () => {
  it("rondas explícitas, EVERY xN, y EMOM rotando entre movimientos", () => {
    expect(prescribedRounds("5 Rondas Por Tiempo", 2)).toBe(5);
    expect(prescribedRounds("Every 1:30 x 8", 1)).toBe(8);
    expect(prescribedRounds("EMOM 12", 3)).toBe(4); // 12 min / 3 movimientos
    expect(prescribedRounds("AMRAP 14 MIN", 2)).toBeNull();
  });

  it("escalera 21-15-9 suma 45; un rango '65-70' no es escalera", () => {
    expect(ladderSum("21-15-9 Por Tiempo")).toBe(45);
    expect(ladderSum("4x6 @ 65-70%")).toBeNull();
  });
});

describe("expandMetconWork — la cuenta completa", () => {
  const items = ["15 Cal Row", "10 Burpees", "200m Run"];

  it("AMRAP: prescripción × rondas reales (5 rondas de 15 cal = 75 cal REALES)", () => {
    const out = expandMetconWork(items, "AMRAP 14 MIN", amrap({ rounds: 5 }));
    expect(out).toEqual([
      { name: "Row", reps: null, calories: 75, distanceM: null, weightKg: null },
      { name: "Burpees", reps: 50, calories: null, distanceM: null, weightKg: null },
      { name: "Run", reps: null, calories: null, distanceM: 1000, weightKg: null },
    ]);
  });

  it("AMRAP con ronda parcial: los previos suman una ronda, el parcial sus reps", () => {
    const out = expandMetconWork(items, "AMRAP 14 MIN", amrap({ rounds: 3, reps: 4, partialRoundMovement: "Burpees" }));
    expect(out.find((m) => m.name === "Row")?.calories).toBe(60); // 3 + 1 rondas
    expect(out.find((m) => m.name === "Burpees")?.reps).toBe(34); // 3×10 + 4
    expect(out.find((m) => m.name === "Run")?.distanceM).toBe(600); // solo 3
  });

  it("For Time terminado multiplica por las rondas prescriptas", () => {
    const out = expandMetconWork(items, "3 Rondas Por Tiempo", fortime({ finished: true, timeSec: 600 }));
    expect(out.find((m) => m.name === "Row")?.calories).toBe(45);
  });

  it("For Time NO terminado no atribuye nada (honesto)", () => {
    expect(expandMetconWork(items, "3 Rondas", fortime({ finished: false, repsAtCap: 40 }))).toEqual([]);
  });

  it("escalera 21-15-9: cada movimiento sin número vale la suma", () => {
    const out = expandMetconWork(
      ["Thrusters (42.5kg)", "Pull-ups"],
      "21-15-9 Por Tiempo",
      fortime({ finished: true, timeSec: 420 }),
    );
    expect(out).toEqual([
      { name: "Thrusters", reps: 45, calories: null, distanceM: null, weightKg: 42.5 },
      { name: "Pull-ups", reps: 45, calories: null, distanceM: null, weightKg: null },
    ]);
  });

  it("AMRAP sin rondas registradas o formato max: nada que derivar", () => {
    expect(expandMetconWork(items, "AMRAP 14", amrap({}))).toEqual([]);
    expect(expandMetconWork(items, "Max reps", { format: "max", scaling: "rx" })).toEqual([]);
  });
});
