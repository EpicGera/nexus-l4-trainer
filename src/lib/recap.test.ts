import { describe, it, expect } from "vitest";
import { computeWeekRecap, computeMonthRecap } from "./recap";
import { LoggedSet, TrainingSession } from "../types/training";

const mkSet = (p: Partial<LoggedSet>): LoggedSet => ({
  id: "x", exerciseId: "", exerciseName: "", weightKg: null, isBodyweight: false,
  addedLoadKg: null, reps: null, distanceM: null, calories: null, timeSec: null,
  rpe: null, rir: null, tempo: null, setType: "working", ts: 0, ...p,
});
const mkSession = (dayId: string, p: Partial<TrainingSession>): TrainingSession => ({
  id: `s_${dayId}`, date: "2026-06-14", dayId, completed: true, durationMin: 50,
  sessionRpe: null, sets: [], ...p,
});

describe("computeWeekRecap", () => {
  it("agrega solo las sesiones de la semana pedida", () => {
    const sessions = [
      mkSession("w3d1", { sessionRpe: 8, sets: [mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 5 })] }),
      mkSession("w3d2", { sessionRpe: 7, sets: [mkSet({ exerciseId: "deadlift", exerciseName: "Deadlift", weightKg: 140, reps: 3 })] }),
      mkSession("w2d1", { sessionRpe: 9, sets: [mkSet({ exerciseId: "clean", exerciseName: "Clean", weightKg: 80, reps: 2 })] }),
    ];
    const r = computeWeekRecap(sessions, "w3", 80);
    expect(r.sessions).toBe(2);
    expect(r.tonnageKg).toBe(500 + 420); // solo w3
    expect(r.avgRpe).toBe(7.5);
    expect(r.marks[0].name).toBe("Deadlift"); // mejor e1RM del período
    expect(r.headline).toMatch(/sesi[oó]n/i);
  });

  it("semana vacía degrada honestamente", () => {
    const r = computeWeekRecap([], "w1", 80);
    expect(r.sessions).toBe(0);
    expect(r.tonnageKg).toBe(0);
    expect(r.avgRpe).toBeNull();
    expect(r.headline).toMatch(/esperando|sin registros/i);
  });
});

describe("computeMonthRecap", () => {
  it("evolución por semana + chequeo de descarga (w4 baja = ok)", () => {
    const heavy = (dayId: string) => mkSession(dayId, { sessionRpe: 8, sets: [mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 10 })] });
    const light = (dayId: string) => mkSession(dayId, { sessionRpe: 6, sets: [mkSet({ exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 100, reps: 2 })] });
    const sessions = [heavy("w1d1"), heavy("w2d1"), heavy("w3d1"), light("w4d1")];
    const r = computeMonthRecap(sessions, 80);
    expect(r.totalSessions).toBe(4);
    expect(r.weeks.map((w) => w.tonnageKg)).toEqual([1000, 1000, 1000, 200]);
    expect(r.deloadOk).toBe(true); // 200 <= 1000*0.75
    expect(r.marks[0].name).toBe("Back Squat");
  });

  it("descarga alta se detecta", () => {
    const s = (dayId: string, reps: number) => mkSession(dayId, { sets: [mkSet({ exerciseId: "deadlift", exerciseName: "Deadlift", weightKg: 100, reps })] });
    const r = computeMonthRecap([s("w1d1", 10), s("w2d1", 10), s("w3d1", 10), s("w4d1", 10)], 80);
    expect(r.deloadOk).toBe(false); // w4 igual a las de carga
    expect(r.headline).toMatch(/alta|aflojar/i);
  });
});
