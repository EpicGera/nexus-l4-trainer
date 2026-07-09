import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseSpecialDayJson, parseSpecialDayText, parseSpecialDay,
  injectSpecialVariation, removeSpecialVariation,
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

describe("parseSpecialDayJson — desanida formas que devuelve la IA (unwrapDayCandidate)", () => {
  const oneDay = {
    title: "DÍA X",
    variations: [{ b2_metcon: { title: "METCON", scheme: "AMRAP 10", items: ["10 Burpees"] } }],
  };

  it("acepta un programa canónico {schemaVersion, weeks:[]} de UN día", () => {
    const prog = JSON.stringify({ schemaVersion: "1.0", weeks: [{ days: [oneDay] }] });
    expect(parseSpecialDayJson(prog).variation.tabName).toBe(SPECIAL_TAB);
  });

  it("acepta un programa legacy {w1:{days:[]}} de UN día", () => {
    const prog = JSON.stringify({ w1: { days: [oneDay] } });
    expect(parseSpecialDayJson(prog).variation.tabName).toBe(SPECIAL_TAB);
  });

  it("acepta un array de UN día", () => {
    expect(parseSpecialDayJson(JSON.stringify([oneDay])).variation.tabName).toBe(SPECIAL_TAB);
  });

  it("rechaza un programa de N>1 días con mensaje accionable", () => {
    const prog = JSON.stringify({ w1: { days: [oneDay, oneDay] } });
    expect(() => parseSpecialDayJson(prog)).toThrow(/UN solo día/);
  });

  it("rechaza N>1 días en canónico y en array", () => {
    expect(() => parseSpecialDayJson(JSON.stringify({ weeks: [{ days: [oneDay, oneDay] }] }))).toThrow(/UN solo día/);
    expect(() => parseSpecialDayJson(JSON.stringify([oneDay, oneDay]))).toThrow(/UN solo día/);
  });
});

describe("parseSpecialDayText (archivo de texto con bloques)", () => {
  const txt = `TÍTULO: WOD Cumpleaños de Fulano
CALENTAMIENTO
3 rondas: 10 air squats, 10 push-ups
METCON: AMRAP 12
- 15 Cal Row
- 12 Wall Balls (9kg)
- 9 Pull-ups
FUERZA
Back Squat 5x5 @ 80%
ACCESORIOS
3x12 Curl de bíceps`;

  it("reconoce encabezados, título y esquema del metcon", () => {
    const { variation } = parseSpecialDayText(txt);
    expect(variation.tabName).toBe(SPECIAL_TAB);
    const metcon = variation.blocks!.find((b) => b.bucket === "metcon")!;
    expect(metcon.timeDomain).toBe("medium"); // AMRAP 12 → clasifica, los cálculos andan
    expect(metcon.items.join(" ")).toContain("Wall Balls");
    expect(variation.blocks!.some((b) => b.bucket === "strength")).toBe(true);
    expect(variation.blocks!.some((b) => b.bucket === "warmup")).toBe(true);
  });

  it("separa items por coma bajo un encabezado", () => {
    const { variation } = parseSpecialDayText(txt);
    const warm = variation.blocks!.find((b) => b.bucket === "warmup")!;
    expect(warm.items.length).toBeGreaterThanOrEqual(2); // air squats + push-ups
  });

  it("una lista de movimientos sin encabezados cae a metcon (forgiving)", () => {
    const { variation } = parseSpecialDayText("10 Thrusters\n15 Pull-ups\n20 Box Jumps");
    const metcon = variation.blocks!.find((b) => b.bucket === "metcon")!;
    expect(metcon.items.length).toBe(3);
  });

  it("texto vacío falla con mensaje claro", () => {
    expect(() => parseSpecialDayText("   \n  ")).toThrow(/vac[ií]o/i);
  });
});

describe("docs/GUIA-dia-especial.md — los ejemplos JSON de la guía parsean", () => {
  // Extrae cada bloque ```json de la guía y verifica que la app lo acepte.
  // Si alguien edita la guía y rompe un ejemplo, CI lo caza.
  const md = readFileSync(join(__dirname, "../../docs/GUIA-dia-especial.md"), "utf8");
  const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);

  it("la guía tiene al menos 3 ejemplos JSON (bendecido + A + B)", () => {
    expect(blocks.length).toBeGreaterThanOrEqual(3);
  });

  blocks.forEach((block, i) => {
    it(`ejemplo #${i + 1} de la guía es un día especial válido`, () => {
      const { variation, audit } = parseSpecialDayJson(block);
      expect(audit.ok).toBe(true);
      expect(variation.tabName).toBe(SPECIAL_TAB);
    });
  });
});

describe("parseSpecialDay (auto-detecta JSON vs texto)", () => {
  it("enruta JSON al parser JSON y texto al parser de texto", () => {
    const json = JSON.stringify({ title: "X", variations: [{ b2_metcon: { title: "METCON", scheme: "AMRAP 10", items: ["10 Burpees"] } }] });
    expect(parseSpecialDay(json).variation.tabName).toBe(SPECIAL_TAB);
    expect(parseSpecialDay("METCON: EMOM 10\n10 Wall Balls").variation.tabName).toBe(SPECIAL_TAB);
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
