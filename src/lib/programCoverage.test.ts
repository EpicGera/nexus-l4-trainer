import { describe, it, expect } from "vitest";
import { parseJsonToDatabase } from "./sheetImport";
import { programCoverage } from "./programCoverage";

// Build a program with metcons spanning some (not all) of the spectrum, so gaps appear.
const prog = {
  w1: { days: [
    { id: "w1d1", name: "LUNES", title: "A", variations: [{
      tabName: "RX",
      b1_warmup: { title: "01. WARM-UP", scheme: "10 MIN", items: ["Remo"] },
      b2_metcon: { title: "02. METCON", scheme: "AMRAP 14 MIN", items: ["Burpees"] },        // medium · mixed
      b3_flush: { title: "03. FLUSH", scheme: "40 MIN Continuos Zona 2", items: ["Remo"] },  // long · oxidative
    }] },
    { id: "w1d2", name: "MARTES", title: "B", variations: [{
      tabName: "RX",
      b1_metcon: { title: "01. METCON", scheme: "FOR TIME (Cap 5 MIN)", items: ["Thrusters"] }, // short · glycolytic
    }] },
  ] },
};

describe("programCoverage (Fase E spectrum)", () => {
  it("tallies energy systems + time domains from derived metcon metadata", () => {
    const cov = programCoverage(parseJsonToDatabase(JSON.stringify(prog)));
    expect(cov.totalMetcons).toBe(3);
    expect(cov.energy.oxidative).toBe(1);
    expect(cov.energy.mixed).toBe(1);
    expect(cov.energy.glycolytic).toBe(1);
    expect(cov.timeDomain.medium).toBe(1);
    expect(cov.timeDomain.long).toBe(1);
    expect(cov.timeDomain.short).toBe(1);
  });

  it("flags gaps: no phosphagen work, no sprint domain", () => {
    const cov = programCoverage(parseJsonToDatabase(JSON.stringify(prog)));
    expect(cov.energyGaps).toContain("phosphagen");
    expect(cov.timeGaps).toContain("sprint");
    expect(cov.timeGaps).not.toContain("long");
  });

  it("legacy four-block programs yield no coverage (no derived metadata)", () => {
    const legacy = parseJsonToDatabase(JSON.stringify({ w1: { days: [{ title: "X", metcon: { items: ["Run"] } }] } }));
    const cov = programCoverage(legacy);
    expect(cov.totalMetcons).toBe(0);
    expect(cov.energyGaps).toEqual([]);
  });
});
