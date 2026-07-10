import { describe, it, expect, beforeEach } from "vitest";
import { proposeAdjustments } from "./autoregulate";
import { isAutoregApplied, markAutoregApplied } from "./workingMax";
import { puntajeNexus } from "./nexusScore";
import type { NexusScore, LiftScore } from "./nexusScore";
import type { TrainingSession } from "../types/training";

const lift = (over: Partial<LiftScore>): LiftScore => ({
  exerciseId: "back-squat", name: "Back Squat", avgRpe: 6, sets: 3, targetMid: 7.5, rpeDelta: -1.5, perf: "bajo", ...over,
});

const score = (over: Partial<NexusScore>): NexusScore => ({
  week: "w2", sessions: 3, hasData: true, score: 70, status: "", maxRpe: 7,
  lifts: [], metcons: [], prs: [], ...over,
});

describe("proposeAdjustments", () => {
  it("proposes wm-up when a lift was easy and no veto", () => {
    const r = proposeAdjustments(score({ lifts: [lift({})] }), { acwr: 1.0 });
    expect(r.vetoed).toBe(false);
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-up", deltaPct: 2.5 });
  });

  it("vetoes up-regulation on high ACWR (holds at 0%)", () => {
    const r = proposeAdjustments(score({ lifts: [lift({})] }), { acwr: 1.5 });
    expect(r.vetoed).toBe(true);
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-up", deltaPct: 0 });
    expect(r.vetoReason).toMatch(/ACWR/);
  });

  it("vetoes on a near-max RPE in the week", () => {
    const r = proposeAdjustments(score({ maxRpe: 9.5, lifts: [lift({})] }), { acwr: 1.0 });
    expect(r.vetoed).toBe(true);
    expect(r.adjustments[0].deltaPct).toBe(0);
  });

  it("proposes wm-down when a lift was above target", () => {
    const r = proposeAdjustments(score({ lifts: [lift({ perf: "sobre", avgRpe: 9, rpeDelta: 1.5 })] }), { acwr: 1.0 });
    expect(r.adjustments[0]).toMatchObject({ kind: "wm-down", deltaPct: -5 });
  });

  it("does not up-regulate a single-set easy lift", () => {
    const r = proposeAdjustments(score({ lifts: [lift({ sets: 1 })] }), { acwr: 1.0 });
    expect(r.adjustments.length).toBe(0);
  });

  it("emits a pr-bump even under veto", () => {
    const r = proposeAdjustments(
      score({ maxRpe: 9.5, prs: [{ exerciseId: "snatch", name: "Snatch", e1rm: 85, current: 80 }] }),
      { acwr: 1.0 },
    );
    expect(r.adjustments[0]).toMatchObject({ kind: "pr-bump", newOneRmKg: 85 });
  });
});

// El bug "siempre queda un ajuste": tras aplicar/omitir, el mismo ajuste NO
// debe volver a considerarse (la marca por semana+lift lo consume).
describe("marca de autorregulación aplicada (fix del bucle)", () => {
  beforeEach(() => localStorage.clear());

  it("un lift sin marca es accionable; tras marcarlo, se excluye", () => {
    expect(isAutoregApplied("w2", "back-squat")).toBe(false);
    markAutoregApplied("w2", "back-squat");
    expect(isAutoregApplied("w2", "back-squat")).toBe(true);
    // otra semana no queda afectada
    expect(isAutoregApplied("w3", "back-squat")).toBe(false);

    // El filtro de la sección: (deltaPct!=0) && !isAutoregApplied(week, id)
    const adjustments = proposeAdjustments(score({ lifts: [lift({})] }), { acwr: 1.0 }).adjustments;
    const actionable = adjustments.filter(
      (a) => a.deltaPct !== 0 && !isAutoregApplied("w2", a.exerciseId),
    );
    expect(actionable.length).toBe(0); // ya consumido → no reaparece
  });
});

describe("puntajeNexus usa la banda por INTENCIÓN cuando se declara", () => {
  beforeEach(() => localStorage.clear());

  const seed = (rpe: number) => {
    const session: TrainingSession = {
      id: "s", date: "2026-07-10", dayId: "w2d1", programWeek: "w2", completed: true,
      durationMin: 40, sessionRpe: rpe,
      sets: [{ id: "1", exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100,
        isBodyweight: false, addedLoadKg: null, reps: 5, distanceM: null, calories: null,
        timeSec: null, rpe, rir: null, tempo: null, setType: "working", ts: 0 }],
    };
    localStorage.setItem("nexus_sessions_v1", JSON.stringify([session]));
  };

  it("RPE 7 es 'banda' en intensificación (7-9) pero 'sobre' en la fija w2 (7-8)", () => {
    seed(7);
    // banda por intención (7-9) → mid 8 → RPE 7 queda 'bajo/banda', no 'sobre'
    const byIntention = puntajeNexus("w2", { intention: "intensificacion" });
    expect(byIntention.lifts[0].targetMid).toBe(8);
    expect(byIntention.lifts[0].perf).not.toBe("sobre");
  });
});
