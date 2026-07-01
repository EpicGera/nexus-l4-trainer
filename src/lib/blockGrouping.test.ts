import { describe, it, expect } from "vitest";
import { resolveBlockItems, loggableBlockItems, isSubLine, liftHeaderName } from "./blockGrouping";

const DEADLIFT = [
  "Heavy Deadlift - Levantamiento Principal",
  "-> 2 series de 5 repeticiones con 90 kg",
  "-> 2 series de 5 repeticiones con 95 kg",
  "[NOTA]: Conservá el agarre para el metcon.",
];

describe("isSubLine / liftHeaderName", () => {
  it("detects -> and → tier lines", () => {
    expect(isSubLine("-> 2 series de 5 repeticiones con 90 kg")).toBe(true);
    expect(isSubLine("→ 4 series de 6 con 60 kg")).toBe(true);
    expect(isSubLine("Heavy Deadlift - Levantamiento Principal")).toBe(false);
  });

  it("strips the Levantamiento suffix to a catalog-resolvable lift", () => {
    expect(liftHeaderName("Heavy Deadlift - Levantamiento Principal")).toBe("Heavy Deadlift");
    expect(liftHeaderName("Front Squat - Levantamiento Secundario")).toBe("Front Squat");
  });
});

describe("resolveBlockItems", () => {
  const r = resolveBlockItems(DEADLIFT);

  it("marks the lift header as a non-loggable title", () => {
    expect(r[0].role).toBe("header");
    expect(r[0].name).toBe(""); // never logged
  });

  it("makes each tier a subline that inherits the lift name", () => {
    expect(r[1].role).toBe("subline");
    expect(r[1].name).toBe("Heavy Deadlift");
    expect(r[2].role).toBe("subline");
    expect(r[2].name).toBe("Heavy Deadlift");
  });

  it("keeps the cue as a cue", () => {
    expect(r[3].role).toBe("cue");
  });

  it("treats a standalone movement (no tiers) as a movement", () => {
    const r2 = resolveBlockItems(["Gorilla Rows con KB - 10 a 12 Reps por brazo"]);
    expect(r2[0].role).toBe("movement");
    expect(r2[0].name.length).toBeGreaterThan(1);
  });
});

describe("loggableBlockItems", () => {
  it("drops the header, keeps the two tiers named after the lift", () => {
    const out = loggableBlockItems(DEADLIFT);
    expect(out.map((e) => e.name)).toEqual(["Heavy Deadlift", "Heavy Deadlift"]);
  });
});
