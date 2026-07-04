import { describe, it, expect } from "vitest";
import {
  parseSpecialDayJson, injectSpecialVariation, removeSpecialVariation,
  hasSpecialVariation, SPECIAL_TAB,
} from "./specialDay";

const dayJson = JSON.stringify({
  title: "TEAM WOD ESPECIAL",
  variations: [{
    tabName: "RX",
    b1_warmup: { title: "01. WARM-UP", scheme: "10 MIN", items: ["Remo suave"] },
    b2_metcon: { title: "02. METCON", scheme: "AMRAP 14 MIN", items: ["15 Cal Row", "10 Burpees"] },
  }],
});

const baseDb = () => ({
  w2: {
    days: [{
      id: "w2d3", name: "MIÉRCOLES", title: "DÍA NORMAL",
      variations: [{ tabName: "RX" } as any, { tabName: "SCALED" } as any],
    }],
  },
}) as any;

describe("parseSpecialDayJson", () => {
  it("parsea un día válido, fuerza la pestaña ESPECIAL y deriva metadata", () => {
    const { variation, audit } = parseSpecialDayJson(dayJson);
    expect(audit.ok).toBe(true);
    expect(variation.tabName).toBe(SPECIAL_TAB);
    const metcon = variation.blocks!.find((b) => b.bucket === "metcon")!;
    expect(metcon.timeDomain).toBe("medium"); // AMRAP 14 → los cálculos funcionan igual
    expect(metcon.items[0]).toContain("Row");
  });

  it("acepta una variación suelta (sin wrapper de día)", () => {
    const bare = JSON.stringify({
      b1_metcon: { title: "METCON", scheme: "EMOM 12", items: ["10 Wall Balls (9kg)"] },
    });
    const { variation } = parseSpecialDayJson(bare);
    expect(variation.tabName).toBe(SPECIAL_TAB);
    expect(variation.blocks!.length).toBeGreaterThan(0);
  });

  it("rechaza JSON inválido o sin ejercicios legibles", () => {
    expect(() => parseSpecialDayJson("no es json")).toThrow(/JSON válido/);
    expect(() => parseSpecialDayJson(JSON.stringify({ title: "vacío", variations: [{}] }))).toThrow();
  });
});

describe("inject/remove SpecialVariation", () => {
  it("agrega la ESPECIAL sin tocar las variaciones originales; re-subir reemplaza", () => {
    const { variation } = parseSpecialDayJson(dayJson);
    let db = injectSpecialVariation(baseDb(), "w2d3", variation);
    expect(db.w2.days[0].variations.map((v: any) => v.tabName)).toEqual(["RX", "SCALED", SPECIAL_TAB]);
    expect(hasSpecialVariation(db, "w2d3")).toBe(true);

    db = injectSpecialVariation(db, "w2d3", variation); // reemplaza, no duplica
    expect(db.w2.days[0].variations).toHaveLength(3);

    db = removeSpecialVariation(db, "w2d3");
    expect(db.w2.days[0].variations.map((v: any) => v.tabName)).toEqual(["RX", "SCALED"]);
    expect(hasSpecialVariation(db, "w2d3")).toBe(false);
  });

  it("dayId inexistente es no-op", () => {
    const { variation } = parseSpecialDayJson(dayJson);
    const db = baseDb();
    expect(injectSpecialVariation(db, "w9d9", variation)).toEqual(db);
  });
});
