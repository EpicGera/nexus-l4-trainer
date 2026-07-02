import { describe, it, expect } from "vitest";
import { auditProgram } from "./auditProgram";

// Mirrors the shape of a real athlete program (the Friday that broke auto-read).
const realDay = {
  w1: {
    days: [
      {
        id: "w1d5",
        name: "VIERNES",
        title: "La Prueba de la Banda",
        variations: [
          {
            tabName: "RX",
            b1_warmup: { title: "01. WARM-UP", scheme: "10 MIN", items: ["3 Rondas: 30s Hollow Hold"] },
            b2_strength: {
              title: "02. SKILL (Gimnasia Empuje Invertido)",
              scheme: "15 MIN RELOJ",
              items: [
                "5x5 Pike Push-ups estrictos a tempo (o negativas de HSPU)",
                "[NOTA]: Sustituido para evitar tendinopatía.",
                "3x20 Segundos Handstand Hold contra la pared",
                "30 a 40 Crossovers en cada minuto",
              ],
            },
            b3_metcon: {
              title: "03. METCON (El Sub-Jefe) [Resistencia Metabólica]",
              scheme: "FOR TIME (Cap 20 MIN)",
              items: ["50 Box Jump Overs", "40 Hand-Release Push-ups"],
            },
            b4_accessories: {
              title: "04. ACCESORIOS",
              scheme: "3 Series",
              items: ["Bulgarian Split Squats con DB (2x15kg) - 8 Reps por pierna"],
            },
          },
        ],
      },
    ],
  },
};

describe("auditProgram", () => {
  it("rejects a non-program", () => {
    expect(auditProgram(null).ok).toBe(false);
    expect(auditProgram([]).ok).toBe(false);
    expect(auditProgram({ foo: 1 }).ok).toBe(false);
  });

  it("passes a real program (no hard errors) and counts structure", () => {
    const r = auditProgram(realDay);
    expect(r.ok).toBe(true);
    expect(r.stats.weeks).toBe(1);
    expect(r.stats.days).toBe(1);
    expect(r.stats.blocks).toBe(4);
  });

  it("auto-fixes messy titles in the normalized copy (non-destructive)", () => {
    const r = auditProgram(realDay);
    const v = r.normalized.w1.days[0].variations[0];
    expect(v.b2_strength.title).toBe("02. SKILL · Gimnasia Empuje Invertido");
    expect(v.b3_metcon.title).toBe("03. METCON · El Sub-Jefe");
    expect(r.stats.titlesFixed).toBe(2);
    // original input is untouched
    expect(realDay.w1.days[0].variations[0].b2_strength.title).toBe("02. SKILL (Gimnasia Empuje Invertido)");
  });

  it("audits the canonical blocks[] array (preferred over legacy lane keys)", () => {
    const canonical = {
      w1: {
        days: [
          {
            id: "w1d1",
            variations: [
              {
                tabName: "RX",
                // both representations present, as the app's own export emits
                strength: { title: "02. FUERZA (Piernas de Roca)", scheme: "4x6", items: ["Back Squat"] },
                blocks: [
                  { key: "b2_strength", bucket: "strength", title: "02. FUERZA (Piernas de Roca)", scheme: "4x6", items: ["Back Squat"] },
                ],
              },
            ],
          },
        ],
      },
    };
    const r = auditProgram(canonical);
    expect(r.normalized.w1.days[0].variations[0].blocks[0].title).toBe("02. FUERZA · Piernas de Roca");
    expect(r.stats.titlesFixed).toBe(1); // counted once (blocks[] preferred, lane skipped)
  });

  it("flags a weighted movement with no load (% WM / % / kg)", () => {
    const prog = {
      w1: { days: [ { id: "w1d1", variations: [ { tabName: "RX",
        b2_strength: { title: "02. FUERZA", scheme: "3 Series", items: ["Bulgarian Split Squat", "5x5 Pike Push-ups"] },
      } ] } ] },
    };
    const r = auditProgram(prog);
    const flagged = r.issues.filter((i) => /sin carga WMD/.test(i.message));
    expect(flagged.length).toBe(1); // Bulgarian is loaded with no load; Pike is bodyweight
    expect(flagged[0].where).toMatch(/Bulgarian/i);
    expect(r.stats.loadedWithoutLoad).toBe(1);
  });

  it("does not flag a loaded movement when scheme/item carries % WM, % or kg", () => {
    const wm = { w1: { days: [ { id: "w1d1", variations: [ { tabName: "RX",
      b2_strength: { title: "02. FUERZA", scheme: "4x6 @ 70% WM", items: ["Back Squat"] } } ] } ] } };
    const pct = { w1: { days: [ { id: "w1d1", variations: [ { tabName: "RX",
      b2_strength: { title: "02. FUERZA", scheme: "4x6 @ 65-70%", items: ["Back Squat"] } } ] } ] } };
    const kg = { w1: { days: [ { id: "w1d1", variations: [ { tabName: "RX",
      b4_accessories: { title: "04. ACCESORIOS", scheme: "3 Series", items: ["Bulgarian Split Squat — 8 reps @ 15kg"] } } ] } ] } };
    expect(auditProgram(wm).stats.loadedWithoutLoad).toBe(0);
    expect(auditProgram(pct).stats.loadedWithoutLoad).toBe(0);
    expect(auditProgram(kg).stats.loadedWithoutLoad).toBe(0);
  });

  it("flags only the unreadable per-set item (Crossovers), not the readable ones or metcon", () => {
    const r = auditProgram(realDay);
    const unreadable = r.issues.filter((i) => /No legible/.test(i.message));
    expect(unreadable.length).toBe(1);
    expect(unreadable[0].where).toMatch(/Crossovers|ítem 4/i);
    expect(r.stats.unreadableItems).toBe(1);
  });

  it("hard-fails (ok:false) when most stations are unreadable — gate, not advice", () => {
    const broken = {
      w1: {
        days: [
          {
            id: "w1d1",
            variations: [
              {
                tabName: "RX",
                b1_strength: {
                  title: "01. FUERZA",
                  scheme: "TRABAJO LIBRE",
                  items: [
                    "Handstand Walk práctica libre",
                    "Skill de anillas a criterio",
                  ],
                },
              },
            ],
          },
        ],
      },
    };
    const r = auditProgram(broken);
    expect(r.stats.unreadableItems).toBeGreaterThanOrEqual(1);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("a single unreadable station among many readable ones still imports (ok:true)", () => {
    expect(auditProgram(realDay).ok).toBe(true);
  });
});
