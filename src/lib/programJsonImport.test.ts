import { describe, it, expect } from "vitest";
import { parseJsonToDatabase, summarizeDatabase } from "./sheetImport";

describe("parseJsonToDatabase", () => {
  it("loads a complete Database-shaped program", () => {
    const json = JSON.stringify({
      w1: {
        days: [
          {
            id: "w1d1",
            name: "LUNES",
            title: "Día de Fuerza",
            variations: [
              {
                tabName: "RX",
                warmup: { title: "01. WARM-UP", scheme: "10 Min", items: ["Remo suave"] },
                strength: { title: "02. FUERZA", scheme: "5x5", items: ["Back Squat @ 75%"] },
                metcon: { title: "03. METCON", scheme: "AMRAP 12", items: ["10 Burpees", "15 Wall Balls"] },
                accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["Plancha 60s"] },
              },
            ],
          },
        ],
      },
    });

    const db = parseJsonToDatabase(json);
    expect(Object.keys(db)).toEqual(["w1"]);
    expect(db.w1.days).toHaveLength(1);
    const day = db.w1.days[0];
    expect(day.id).toBe("w1d1");
    expect(day.hasTabs).toBe(false);
    expect(day.isCompleted).toBe(false);
    expect(day.variations[0].metcon.items).toHaveLength(2);
  });

  it("derives ids, day names and tabNames when missing (AI-friendly)", () => {
    const json = JSON.stringify({
      W2: {
        days: [
          { title: "Día simple", strength: { items: ["Deadlift 3x3"] } },
          { title: "Doble plan", variations: [{ metcon: { items: ["Run 400m"] } }, { metcon: { items: ["Bike 1km"] } }] },
        ],
      },
    });

    const db = parseJsonToDatabase(json);
    expect(Object.keys(db)).toEqual(["w2"]);
    const [d1, d2] = db.w2.days;
    // flat day → wrapped as single variation, id/name derived
    expect(d1.id).toBe("w2d1");
    expect(d1.name).toBe("LUNES");
    expect(d1.variations[0].tabName).toBe("ÚNICO");
    expect(d1.variations[0].strength.items).toEqual(["Deadlift 3x3"]);
    expect(d1.variations[0].warmup.items).toEqual([]);
    // two variations → tabs derived
    expect(d2.hasTabs).toBe(true);
    expect(d2.variations.map((v) => v.tabName)).toEqual(["PLAN A", "PLAN B"]);
  });

  it("accepts a bare array of days as a week", () => {
    const json = JSON.stringify({
      w1: [{ name: "LUNES", metcon: { items: ["For Time 21-15-9"] } }],
    });
    const db = parseJsonToDatabase(json);
    expect(db.w1.days[0].variations[0].metcon.items).toEqual(["For Time 21-15-9"]);
  });

  it("ignores non-week keys and rejects empty/invalid input", () => {
    expect(() => parseJsonToDatabase("no es json")).toThrow(/JSON válido/);
    expect(() => parseJsonToDatabase("[]")).toThrow(/objeto/);
    expect(() => parseJsonToDatabase(JSON.stringify({ meta: { foo: 1 } }))).toThrow(
      /semanas válidas/,
    );
  });

  it("caps weeks at 7 days and drops empty item strings", () => {
    const days = Array.from({ length: 9 }).map((_, i) => ({
      title: `Día ${i + 1}`,
      warmup: { items: ["Movilidad", "", "   ", 42] },
    }));
    const db = parseJsonToDatabase(JSON.stringify({ w1: { days } }));
    expect(db.w1.days).toHaveLength(7);
    expect(db.w1.days[0].variations[0].warmup.items).toEqual(["Movilidad", "42"]);
  });
});

describe("summarizeDatabase", () => {
  it("counts weeks, days and exercises across variations", () => {
    const db = parseJsonToDatabase(
      JSON.stringify({
        w1: [
          { strength: { items: ["A", "B"] } },
          { variations: [{ metcon: { items: ["C"] } }, { metcon: { items: ["D", "E"] } }] },
        ],
        w2: [{ warmup: { items: ["F"] } }],
      }),
    );
    const summary = summarizeDatabase(db);
    expect(summary.weeks).toBe(2);
    expect(summary.days).toBe(3);
    expect(summary.items).toBe(6);
  });
});
