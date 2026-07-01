import { describe, it, expect } from "vitest";
import { parseJsonToDatabase, summarizeDatabase } from "./sheetImport";

// A flexible-block program (chapter-2 style): arbitrary ordered block keys
// (b1_warmup, b2_skill, b3_strength, b4_metcon, b5_accessories, b4_grunt…),
// 2–5 blocks per day, names beyond the fixed four.
const ch2 = {
  w1: {
    days: [
      {
        id: "w1d1", name: "LUNES", title: "El Pico y la Montaña",
        variations: [{
          tabName: "RX · MODO COMPETIDOR",
          b1_warmup: { title: "01. WARM-UP", scheme: "AMRAP 10 MIN", items: ["2 Min Bici", "10 Inchworms"] },
          b2_skill: { title: "02. HALTEROFILIA TÉCNICA", scheme: "10 MIN", items: ["3 Tall Muscle Clean"] },
          b3_strength: { title: "03. FUERZA", scheme: "4x6 @ 65-70% WM", items: ["Front Squat"] },
          b4_metcon: { title: "04. METCON", scheme: "AMRAP 14 MIN", items: ["15 Wall Balls", "10 Burpees", "5 Hang Power Cleans"] },
          b5_accessories: { title: "05. ACCESORIOS", scheme: "3 Series", items: ["DB Bench Press", "Plancha Lastrada"] },
        }],
      },
      {
        id: "w1d2", name: "MARTES", title: "Sangre en el Callejón",
        variations: [{
          tabName: "RX",
          b1_warmup: { title: "01. WARM-UP", scheme: "10 MIN", items: ["Movilidad"] },
          b2_gymnastics: { title: "02. GIMNASIA TÉCNICA", scheme: "EMOM 12", items: ["Seated DB Press", "Wall Walks"] },
          b3_metcon: { title: "03. METCON", scheme: "4 Rondas", items: ["400m Run", "Max DB Snatch"] },
          b4_grunt: { title: "04. GRUNT WORK", scheme: "3 Rondas", items: ["Farmer Carry", "Hammer Curls"] },
        }],
      },
    ],
  },
};

describe("flexible-block program import (chapter-2 style)", () => {
  it("is NOT rejected and preserves every block in order", () => {
    const db = parseJsonToDatabase(JSON.stringify(ch2));
    const d1 = db.w1.days[0].variations[0];
    expect(d1.blocks).toBeTruthy();
    expect(d1.blocks!.map((b) => b.key)).toEqual([
      "b1_warmup", "b2_skill", "b3_strength", "b4_metcon", "b5_accessories",
    ]);
    expect(d1.blocks![1].title).toBe("02. HALTEROFILIA TÉCNICA");
    expect(d1.blocks![3].items).toHaveLength(3);
  });

  it("buckets each block sensibly onto legacy lanes (skill/oly→strength, grunt→accessories)", () => {
    const db = parseJsonToDatabase(JSON.stringify(ch2));
    const d1 = db.w1.days[0].variations[0];
    expect(d1.blocks!.map((b) => b.bucket)).toEqual([
      "warmup", "strength", "strength", "metcon", "accessories",
    ]);
    // legacy strength lane merges skill + strength so nothing is lost
    expect(d1.strength.items).toEqual(["3 Tall Muscle Clean", "Front Squat"]);

    const d2 = db.w1.days[1].variations[0];
    expect(d2.blocks!.map((b) => b.bucket)).toEqual([
      "warmup", "strength", "metcon", "accessories",
    ]); // gymnastics→strength, grunt→accessories
  });

  it("counts flexible blocks in the summary (so import is accepted)", () => {
    const s = summarizeDatabase(parseJsonToDatabase(JSON.stringify(ch2)));
    expect(s.weeks).toBe(1);
    expect(s.days).toBe(2);
    expect(s.items).toBe(16); // 9 (d1) + 7 (d2)
  });

  it("leaves plain four-block programs untouched (blocks omitted)", () => {
    const legacy = { w1: { days: [{ title: "Día", strength: { items: ["Back Squat 5x5"] } }] } };
    const db = parseJsonToDatabase(JSON.stringify(legacy));
    expect(db.w1.days[0].variations[0].blocks).toBeUndefined();
    expect(db.w1.days[0].variations[0].strength.items).toEqual(["Back Squat 5x5"]);
  });
});

// Regression: a variation that carries BOTH the legacy fixed fields AND an
// explicit `blocks` array (the AI-export shape). The explicit array must win, so
// a second same-bucket block (two strength pieces) is never dropped.
describe("explicit blocks[] array wins over legacy fixed fields", () => {
  const both = {
    w1: {
      days: [
        {
          id: "w1d1", name: "LUNES", title: "El Pico y la Montaña",
          variations: [
            {
              tabName: "RX · MODO COMPETIDOR",
              // legacy fixed fields — only one strength lane (Frankenstein)
              warmup: { title: "01. WARM-UP", scheme: "AMRAP 10 MIN", items: ["2 Min Bici"] },
              strength: { key: "b2_skill", title: "03. FUERZA", scheme: "4x6", items: ["Back Squat 75-85kg"] },
              metcon: { title: "04. METCON", scheme: "AMRAP 14 MIN", items: ["15 Wall Balls"] },
              accessories: { title: "05. ACCESORIOS", scheme: "3 Series", items: ["DB Bench Press"] },
              // canonical ordered list — TWO strength blocks
              blocks: [
                { key: "b1_warmup", title: "01. WARM-UP", scheme: "AMRAP 10 MIN", items: ["2 Min Bici"], bucket: "warmup" },
                { key: "b2_strength", title: "02. FUERZA", scheme: "4x6 @ 75-80% RM", items: ["Back Squat 75-85kg"], bucket: "strength" },
                { key: "b3_strength", title: "03. FUERZA", scheme: "4x6 @ 65-70% WM", items: ["Front Squat 55-60kg"], bucket: "strength" },
                { key: "b4_metcon", title: "04. METCON", scheme: "AMRAP 14 MIN", items: ["15 Wall Balls"], bucket: "metcon", energySystem: "mixed", timeDomain: "medium" },
                { key: "b5_accessories", title: "05. ACCESORIOS", scheme: "3 Series", items: ["DB Bench Press"], bucket: "accessories" },
              ],
            },
          ],
        },
      ],
    },
  };

  it("keeps all 5 blocks including BOTH strength pieces (Back + Front Squat)", () => {
    const db = parseJsonToDatabase(JSON.stringify(both));
    const v = db.w1.days[0].variations[0];
    expect(v.blocks).toBeTruthy();
    expect(v.blocks!.map((b) => b.key)).toEqual([
      "b1_warmup", "b2_strength", "b3_strength", "b4_metcon", "b5_accessories",
    ]);
    const strengthItems = v.blocks!.filter((b) => b.bucket === "strength").flatMap((b) => b.items);
    expect(strengthItems).toEqual(["Back Squat 75-85kg", "Front Squat 55-60kg"]);
  });

  it("derives metcon metadata for the array path", () => {
    const db = parseJsonToDatabase(JSON.stringify(both));
    const metcon = db.w1.days[0].variations[0].blocks!.find((b) => b.bucket === "metcon")!;
    expect(metcon.timeDomain).toBe("medium");
    expect(metcon.energySystem).toBe("mixed");
  });

  it("a blocks-only variation (no legacy fields) imports non-empty", () => {
    const onlyBlocks = {
      w1: { days: [{ title: "Día", variations: [{ tabName: "RX", blocks: [
        { key: "b1_warmup", title: "01. WARM-UP", scheme: "10 MIN", items: ["Movilidad"], bucket: "warmup" },
        { key: "b2_strength", title: "02. FUERZA", scheme: "5x5", items: ["Deadlift"], bucket: "strength" },
      ] }] }] },
    };
    const db = parseJsonToDatabase(JSON.stringify(onlyBlocks));
    const v = db.w1.days[0].variations[0];
    expect(v.blocks!).toHaveLength(2);
    // legacy lanes still derived so old consumers aren't blank
    expect(v.warmup.items).toEqual(["Movilidad"]);
    expect(v.strength.items).toEqual(["Deadlift"]);
  });
});
