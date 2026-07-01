import { describe, it, expect } from "vitest";
import { toCanonicalProgram, fromCanonicalProgram, CANONICAL_SCHEMA_VERSION } from "./canonicalProgram";
import { parseJsonToDatabase } from "./sheetImport";

// A flexible day with TWO strength blocks (the data-loss case).
const flexible = {
  w1: {
    days: [
      {
        id: "w1d1", name: "LUNES", title: "El Pico y la Montaña",
        variations: [
          {
            tabName: "RX",
            blocks: [
              { key: "b1_warmup", title: "01. WARM-UP", scheme: "AMRAP 10", items: ["2 Min Bici"], bucket: "warmup" },
              { key: "b2_strength", title: "02. FUERZA", scheme: "4x6", items: ["Back Squat"], bucket: "strength" },
              { key: "b3_strength", title: "03. FUERZA", scheme: "4x6", items: ["Front Squat"], bucket: "strength" },
              { key: "b4_metcon", title: "04. METCON", scheme: "AMRAP 14 MIN", items: ["15 Wall Balls"], bucket: "metcon" },
            ],
          },
        ],
      },
    ],
  },
};

describe("canonical program (interchange format)", () => {
  it("toCanonical emits schemaVersion + weeks[] and NO legacy lanes", () => {
    const db = parseJsonToDatabase(JSON.stringify(flexible));
    const c = toCanonicalProgram(db, { title: "ACTO II", lore: "Seúl" });
    expect(c.schemaVersion).toBe(CANONICAL_SCHEMA_VERSION);
    expect(c.title).toBe("ACTO II");
    expect(Array.isArray(c.weeks)).toBe(true);
    expect(c.weeks[0].week).toBe(1);
    const v: any = c.weeks[0].days[0].variations[0];
    expect(v.blocks).toHaveLength(4);
    // canonical variation carries ONLY blocks — no warmup/strength/metcon/accessories
    expect(v.warmup).toBeUndefined();
    expect(v.strength).toBeUndefined();
  });

  it("preserves both strength blocks (no collapse)", () => {
    const db = parseJsonToDatabase(JSON.stringify(flexible));
    const c = toCanonicalProgram(db);
    const strength = c.weeks[0].days[0].variations[0].blocks.filter((b) => b.bucket === "strength");
    expect(strength.flatMap((b) => b.items)).toEqual(["Back Squat", "Front Squat"]);
  });

  it("derives blocks from legacy lanes for a four-block (no blocks[]) day", () => {
    const legacy = { w1: { days: [{ id: "w1d1", title: "Día", strength: { title: "FUERZA", scheme: "5x5", items: ["Deadlift"] } }] } };
    const db = parseJsonToDatabase(JSON.stringify(legacy));
    const c = toCanonicalProgram(db);
    const blocks = c.weeks[0].days[0].variations[0].blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].bucket).toBe("strength");
    expect(blocks[0].items).toEqual(["Deadlift"]);
  });

  it("round-trips db → canonical → db preserving both strength blocks", () => {
    const db = parseJsonToDatabase(JSON.stringify(flexible));
    const back = fromCanonicalProgram(toCanonicalProgram(db));
    const blocks = back.w1.days[0].variations[0].blocks!;
    expect(blocks.map((b) => b.key)).toEqual(["b1_warmup", "b2_strength", "b3_strength", "b4_metcon"]);
    const strengthItems = blocks.filter((b) => b.bucket === "strength").flatMap((b) => b.items);
    expect(strengthItems).toEqual(["Back Squat", "Front Squat"]);
  });

  it("drops empty placeholder lanes (a rest day → only its real block)", () => {
    // Legacy rest day: warmup has content, the other three lanes are bare
    // placeholders (title only, empty scheme + items).
    const rest = { w1: { days: [{ id: "w1d5", title: "Descanso", variations: [{
      tabName: "RX",
      warmup: { title: "01. DESCANSO", scheme: "Salida", items: ["Descanso Pasivo"] },
      strength: { title: "02. FUERZA", scheme: "", items: [] },
      metcon: { title: "03. METCON", scheme: "", items: [] },
      accessories: { title: "04. ACCESORIOS", scheme: "", items: [] },
    }] }] } };
    // Feed the raw legacy variation straight in (mirrors the real export path).
    const db: any = { w1: { days: [{ id: "w1d5", name: "VIE", title: "Descanso", isCompleted: false, variations: rest.w1.days[0].variations }] } };
    const c = toCanonicalProgram(db);
    const blocks = c.weeks[0].days[0].variations[0].blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].bucket).toBe("warmup");
  });

  it("derives metcon metadata (capSec/timeDomain/energySystem) from the scheme", () => {
    const db: any = { w1: { days: [{ id: "w1d1", name: "LUN", title: "Día", isCompleted: false, variations: [{
      tabName: "RX",
      warmup: { title: "WARM", scheme: "3 Rondas", items: ["Mov"] },
      strength: { title: "FUERZA", scheme: "", items: [] },
      metcon: { title: "METCON", scheme: "21-15-9 | Cap 8:00", items: ["Remo", "KB Push Press"] },
      accessories: { title: "ACC", scheme: "", items: [] },
    }] }] } };
    const metcon = toCanonicalProgram(db).weeks[0].days[0].variations[0].blocks.find((b) => b.bucket === "metcon")!;
    expect(metcon.capSec).toBe(480);
    expect(metcon.timeDomain).toBe("medium");
    expect(metcon.energySystem).toBe("mixed");
  });

  it("parseJsonToDatabase accepts the canonical weeks[] form directly", () => {
    const canonical = {
      schemaVersion: "1.0",
      title: "ACTO II",
      weeks: [
        { week: 1, intention: "intensificacion", days: [
          { id: "w1d1", name: "LUNES", title: "Día", variations: [
            { tabName: "RX", blocks: [
              { key: "b1_warmup", bucket: "warmup", title: "WARM", scheme: "10", items: ["Mov"] },
              { key: "b2_strength", bucket: "strength", title: "FUERZA", scheme: "5x5", items: ["Squat"] },
            ] },
          ] },
        ] },
      ],
    };
    const db = parseJsonToDatabase(JSON.stringify(canonical));
    expect(db.w1.days[0].variations[0].blocks).toHaveLength(2);
    expect(db.w1.meta?.intention).toBe("intensificacion");
  });
});
