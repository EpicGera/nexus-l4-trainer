import { describe, it, expect } from "vitest";
import { parseJsonToDatabase } from "./sheetImport";

const prog = (scheme: string, bucketKey = "b2_metcon") => ({
  w1: { days: [ { id: "w1d1", name: "LUNES", title: "X", variations: [ {
    tabName: "RX",
    b1_warmup: { title: "01. WARM-UP", scheme: "10 MIN", items: ["Remo"] },
    [bucketKey]: { title: "02. METCON", scheme, items: ["10 Burpees"] },
  } ] } ] },
});

const metconBlock = (scheme: string) => {
  const db = parseJsonToDatabase(JSON.stringify(prog(scheme)));
  return db.w1.days[0].variations[0].blocks!.find((b) => b.bucket === "metcon")!;
};

describe("derived block metadata (Fase D)", () => {
  it("AMRAP 14 → medium / mixed, no cap", () => {
    const b = metconBlock("AMRAP 14 MIN");
    expect(b.timeDomain).toBe("medium");
    expect(b.energySystem).toBe("mixed");
    expect(b.capSec).toBeUndefined();
  });

  it("FOR TIME (Cap 20 MIN) → cap 1200s, long, oxidative", () => {
    const b = metconBlock("FOR TIME (Cap 20 MIN)");
    expect(b.capSec).toBe(1200);
    expect(b.timeDomain).toBe("long");
    expect(b.energySystem).toBe("oxidative");
  });

  it("Zona 2 continuous → oxidative regardless of length", () => {
    const b = metconBlock("35-40 MIN Continuos Zona 2");
    expect(b.timeDomain).toBe("long");
    expect(b.energySystem).toBe("oxidative");
  });

  it("intervals 4 Rondas (3 ON / 1 OFF) → 16 min → medium", () => {
    const b = metconBlock("Intervalos: 4 Rondas (3 Min ON / 1 Min OFF)");
    expect(b.timeDomain).toBe("medium");
  });

  it("non-metcon blocks get no time domain; cap still parsed if present", () => {
    const db = parseJsonToDatabase(JSON.stringify(prog("4x6 @ 70% WM", "b2_strength")));
    const s = db.w1.days[0].variations[0].blocks!.find((b) => b.key === "b2_strength")!;
    expect(s.timeDomain).toBeUndefined();
    expect(s.energySystem).toBeUndefined();
  });
});
