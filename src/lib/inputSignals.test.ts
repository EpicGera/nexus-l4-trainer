import { describe, it, expect } from "vitest";
import { detectInputMode, inputModeFor, InputMode, prescribedReps, prescribedSets, prescribedSeconds, prescribedKg, prescribedPct } from "./inputSignals";
import { Exercise } from "../types/training";

const ex = (over: Partial<Exercise>): Exercise => ({
  id: "x",
  name: "X",
  aliases: [],
  modality: "W",
  pattern: "squat",
  loadType: "external",
  unilateral: false,
  skills: ["strength"],
  workModel: "load-displacement",
  ...over,
});

const LOADED = ex({}); // external / load-displacement
const CAL = ex({ workModel: "erg-calories", loadType: "machine", modality: "M", pattern: "monostructural" });
const BW = ex({ loadType: "bodyweight", workModel: "none", modality: "G", pattern: "core" });
const BW_LOAD = ex({ loadType: "bodyweight+load", workModel: "bodyweight", modality: "G", pattern: "vertical-pull" });

describe("inputModeFor (catalog default)", () => {
  it("maps work/load model to a mode", () => {
    expect(inputModeFor(LOADED)).toBe("loaded");
    expect(inputModeFor(CAL)).toBe("cardioCal");
    expect(inputModeFor(BW)).toBe("bodyweight");
    expect(inputModeFor(BW_LOAD)).toBe("loadedBodyweight");
  });
});

describe("detectInputMode (text wins on explicit units)", () => {
  it("calories → cardioCal regardless of catalog default", () => {
    expect(detectInputMode("15 Cal Remo o Ski", BW)).toBe("cardioCal");
    expect(detectInputMode("Calorías Remo", LOADED)).toBe("cardioCal");
  });

  it("meters → cardioDist, even when the catalog says calories (500m Row)", () => {
    expect(detectInputMode("500m Row", CAL)).toBe("cardioDist");
    expect(detectInputMode("400m Run", BW)).toBe("cardioDist");
    expect(detectInputMode("Carrera 1 km", LOADED)).toBe("cardioDist");
  });

  it("explicit external load → loaded for an otherwise bodyweight/inferred default", () => {
    expect(detectInputMode("Thrusters con barra (50kg)", BW)).toBe("loaded");
    expect(detectInputMode("Back Squat 4x6 @ 70%", BW)).toBe("loaded");
    expect(detectInputMode("-> 2 series de 5 repeticiones con 90 kg", LOADED)).toBe("loaded");
  });

  it("does NOT downgrade a weighted-bodyweight catalog default on a load word", () => {
    expect(detectInputMode("Weighted Pull-up 10kg", BW_LOAD)).toBe("loadedBodyweight");
  });

  it("meters on a loaded carry keeps loaded (logs the weight, not distance)", () => {
    expect(detectInputMode("Farmer Carry 40 Metros", LOADED)).toBe("loaded");
  });

  it("hold/plank → timed when the catalog isn't loaded", () => {
    expect(detectInputMode("Plancha hold 60s", BW)).toBe("timed");
    expect(detectInputMode("L-sit hold", BW)).toBe("timed");
  });

  it("no explicit signal → the catalog default stands", () => {
    expect(detectInputMode("Toes-to-Bar", BW)).toBe("bodyweight");
    expect(detectInputMode("Strict Pull-ups", BW)).toBe("bodyweight");
    expect(detectInputMode("Back Squat", LOADED)).toBe("loaded");
  });
});

describe("prescribed prefill parsers", () => {
  it("reps from NxM, ranges and plain counts", () => {
    expect(prescribedReps("4x6 @ 75-80%")).toBe(6);
    expect(prescribedReps("5x3")).toBe(3);
    expect(prescribedReps("2 series de 5 repeticiones con 90 kg")).toBe(5);
    expect(prescribedReps("10 a 12 Reps por brazo")).toBe(10);
    expect(prescribedReps("20 Reps")).toBe(20);
    expect(prescribedReps("3 Series")).toBeNull();
  });

  it("sets count from NxM and explicit series/rondas", () => {
    expect(prescribedSets("4x6 @ 75-80%")).toBe(4);
    expect(prescribedSets("5 x 3")).toBe(5);
    expect(prescribedSets("3 Series de 8")).toBe(3);
    expect(prescribedSets("4 sets")).toBe(4);
    expect(prescribedSets("5 RONDAS POR TIEMPO")).toBe(5);
    expect(prescribedSets("20 Reps")).toBeNull();
    expect(prescribedSets("15 MIN RELOJ")).toBeNull();
  });

  // Real items from an athlete's program JSON (reps live in the item text, with
  // load/time multipliers that must not be misread as reps).
  it("does not misread a load multiplier as reps/sets ('2x15kg')", () => {
    const item = "Bulgarian Split Squats con DB (2x15kg) - 8 Reps por pierna";
    expect(prescribedReps(item)).toBe(8); // explicit reps, not 15
    expect(prescribedSets(item)).toBeNull(); // sets come from the block scheme
    expect(prescribedKg(item)).toBe(15);
  });

  it("reps/sets from a real skill item ('5x5 Pike Push-ups estrictos a tempo')", () => {
    const item = "5x5 Pike Push-ups estrictos a tempo (o negativas de HSPU)";
    expect(prescribedReps(item)).toBe(5);
    expect(prescribedSets(item)).toBe(5);
  });

  it("timed hold: seconds not reps ('3x20 Segundos Handstand Hold')", () => {
    const item = "3x20 Segundos Handstand Hold contra la pared";
    expect(prescribedReps(item)).toBeNull();
    expect(prescribedSets(item)).toBe(3);
    expect(prescribedSeconds(item)).toBe(20);
  });

  it("prescribedSeconds parses bare seconds", () => {
    expect(prescribedSeconds("30 seg hold")).toBe(30);
    expect(prescribedSeconds("5x5 reps")).toBeNull();
  });

  it("explicit kg from the text", () => {
    expect(prescribedKg("2 series de 5 repeticiones con 90 kg")).toBe(90);
    expect(prescribedKg("Thrusters con barra (50kg)")).toBe(50);
    expect(prescribedKg("4x6 @ 75-80%")).toBeNull();
  });

  it("intensity percentage of 1RM", () => {
    expect(prescribedPct("4x6 @ 75-80% RM")).toEqual({ lo: 75, hi: 80 });
    expect(prescribedPct("@ 90%")).toEqual({ lo: 90, hi: 90 });
    expect(prescribedPct("3 Series")).toBeNull();
  });
});

// guards the union stays in sync with the wizard's renderer
const _modes: InputMode[] = ["loaded", "bodyweight", "loadedBodyweight", "cardioCal", "cardioDist", "timed"];
