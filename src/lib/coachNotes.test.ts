import { describe, it, expect } from "vitest";
import { computeCoachNotes, noteFor, type CoachInputs } from "./coachNotes";

const base: CoachInputs = { week: "w4" };

describe("computeCoachNotes", () => {
  it("sin datos → sin notas (el silencio también es humano)", () => {
    expect(computeCoachNotes(base)).toEqual([]);
  });

  it("rpe-vs-target: dispara arriba y abajo, silencio dentro de ±0.5", () => {
    const hi = noteFor(computeCoachNotes({ ...base, rpeAvg: 7.4, rpeTarget: 6.5 }), "rpe-hero");
    expect(hi?.text).toContain("0.9");
    const lo = noteFor(computeCoachNotes({ ...base, rpeAvg: 6.0, rpeTarget: 6.8 }), "rpe-hero");
    expect(lo?.text.toLowerCase()).toMatch(/debajo|abajo|suave/);
    // dentro de la banda: nada
    expect(noteFor(computeCoachNotes({ ...base, rpeAvg: 6.7, rpeTarget: 6.5 }), "rpe-hero")).toBeNull();
  });

  it("rpe-peak: solo si el real supera al prescrito por ≥1.0, y lleva dayIndex", () => {
    const on = noteFor(computeCoachNotes({ ...base, rpePeak: { dayIndex: 2, real: 9, prescribed: 6.5 } }), "rpe-chart");
    expect(on?.meta?.dayIndex).toBe(2);
    expect(noteFor(computeCoachNotes({ ...base, rpePeak: { dayIndex: 2, real: 7, prescribed: 6.5 } }), "rpe-chart")).toBeNull();
  });

  it("missed-day: solo si el día perdido ya pasó respecto de hoy", () => {
    expect(noteFor(computeCoachNotes({ ...base, missedDayIndex: 3, todayIndex: 4 }), "days")?.text).toContain("jueves");
    expect(noteFor(computeCoachNotes({ ...base, missedDayIndex: 5, todayIndex: 4 }), "days")).toBeNull();
  });

  it("autoreg-earned: solo aceptada y puntaje > 100", () => {
    expect(noteFor(computeCoachNotes({ ...base, autoreg: { puntajeNexus: 112, accepted: true } }), "autoreg")?.text).toContain("112");
    expect(noteFor(computeCoachNotes({ ...base, autoreg: { puntajeNexus: 112, accepted: false } }), "autoreg")).toBeNull();
    expect(noteFor(computeCoachNotes({ ...base, autoreg: { puntajeNexus: 90, accepted: true } }), "autoreg")).toBeNull();
  });

  it("lift-lagging: nombra el rezagado (<60%) cuando los demás van bien (≥80%)", () => {
    const n = noteFor(
      computeCoachNotes({ ...base, liftRatios: [{ name: "Press", pct: 0.52 }, { name: "Squat", pct: 0.88 }, { name: "Deadlift", pct: 0.96 }] }),
      "strength",
    );
    expect(n?.meta?.name).toBe("Press");
    // si el débil no está tan abajo, no dispara
    expect(noteFor(computeCoachNotes({ ...base, liftRatios: [{ name: "Press", pct: 0.7 }, { name: "Squat", pct: 0.88 }] }), "strength")).toBeNull();
  });

  it("xp-pace: estima semanas al próximo rango", () => {
    const n = noteFor(computeCoachNotes({ ...base, xpPerWeek: 400, xpToNext: 1160 }), "rank");
    expect(n?.meta?.weeks).toBe(3); // ceil(1160/400)
  });

  it("radar-weak: marca el atributo más flojo (<55 y lejos del promedio)", () => {
    const n = noteFor(
      computeCoachNotes({ ...base, radar: [{ attr: "Fuerza", value: 74 }, { attr: "Consistencia", value: 50 }, { attr: "Técnica", value: 83 }] }),
      "radar",
    );
    expect(n?.meta?.attr).toBe("Consistencia");
  });

  it("monotony-high: solo si supera 2.0", () => {
    expect(noteFor(computeCoachNotes({ ...base, monotony: 2.4 }), "fatigue")).not.toBeNull();
    expect(noteFor(computeCoachNotes({ ...base, monotony: 1.8 }), "fatigue")).toBeNull();
  });

  it("determinismo: misma semana → mismo texto; máx. una nota por target", () => {
    const a = computeCoachNotes({ ...base, rpeAvg: 7.4, rpeTarget: 6.5 });
    const b = computeCoachNotes({ ...base, rpeAvg: 7.4, rpeTarget: 6.5 });
    expect(a).toEqual(b);
    expect(a.filter((n) => n.target === "rpe-hero")).toHaveLength(1);
  });
});
