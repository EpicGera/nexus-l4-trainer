import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { evaluateAthlete, buildChapterPrompt, localChapterProgram } from "./chapterCreator";

const SESSIONS_KEY = "nexus_sessions_v1";

const session = {
  id: "s1", date: "2026-06-14", dayId: "w1d1", completed: true, durationMin: 50, sessionRpe: 8,
  sets: [{
    id: "x", exerciseId: "back-squat", exerciseName: "Back Squat", weightKg: 120, isBodyweight: false,
    addedLoadKg: null, reps: 3, distanceM: null, calories: null, timeSec: null, rpe: 8, rir: 2,
    tempo: null, setType: "working", ts: 0,
  }],
};

describe("evaluateAthlete", () => {
  beforeEach(() => localStorage.removeItem(SESSIONS_KEY));
  afterEach(() => localStorage.removeItem(SESSIONS_KEY));

  it("returns a baseline assessment with no history", () => {
    const e = evaluateAthlete(80);
    expect(e.hasData).toBe(false);
    expect(e.recommendedIntention).toBe("acumulacion");
    expect(e.summary.toUpperCase()).toContain("EVALUACIÓN");
  });

  it("evaluates real sessions: e1RM, modal balance, intention", () => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([session]));
    const e = evaluateAthlete(80);
    expect(e.hasData).toBe(true);
    expect(e.topPrs[0]).toEqual({ name: "Back Squat", e1rmKg: 132 }); // Epley 120·(1+3/30)
    expect(e.modalBalancePct.W).toBe(100); // only weightlifting work
    expect(e.recommendedIntention).toBe("acumulacion"); // <8 sessions
    expect(e.acwr).toBeNull(); // not enough load-days
  });
});

describe("localChapterProgram (offline generator)", () => {
  const evalu = () => evaluateAthlete(80);

  it("builds a valid 4-week program with the right number of training days", () => {
    const { program } = localChapterProgram({ bossInspiration: "demonios", daysPerWeek: 5 }, evalu(), 1);
    expect(Object.keys(program).filter((k) => /^w\d+$/.test(k))).toHaveLength(4);
    expect(program.w1.days).toHaveLength(7);
    const training = program.w1.days.filter((d) => d.variations[0].strength.items.length > 0).length;
    expect(training).toBe(5);
  });

  it("is VARIED across chapters (different seeds → different programs) yet deterministic per seed", () => {
    const req = { bossInspiration: "demonios", daysPerWeek: 5 };
    const a = localChapterProgram(req, evalu(), 1);
    const b = localChapterProgram(req, evalu(), 999);
    expect(JSON.stringify(a.program)).not.toBe(JSON.stringify(b.program)); // not identical
    expect(JSON.stringify(localChapterProgram(req, evalu(), 1).program)).toBe(JSON.stringify(a.program)); // reproducible
  });

  it("reflects block intention in the strength scheme", () => {
    const req = { bossInspiration: "x", daysPerWeek: 5 };
    const acc = localChapterProgram({ ...req, blockIntention: "acumulacion" as const }, evalu(), 1);
    const intf = localChapterProgram({ ...req, blockIntention: "intensificacion" as const }, evalu(), 1);
    const accScheme = acc.program.w1.days[0].variations[0].strength.scheme;
    const intfScheme = intf.program.w1.days[0].variations[0].strength.scheme;
    expect(accScheme).not.toBe(intfScheme);
  });
});

describe("buildChapterPrompt", () => {
  it("embeds the request and the athlete evaluation", () => {
    const evalu = evaluateAthlete(80);
    const prompt = buildChapterPrompt(
      { bossInspiration: "demonios del desierto", daysPerWeek: 5, equipment: "barra y remo" },
      evalu,
    );
    expect(prompt).toContain("demonios del desierto");
    expect(prompt).toContain("DÍAS POR SEMANA: 5");
    expect(prompt).toContain("barra y remo");
    expect(prompt).toContain("EVALUACIÓN DEL ATLETA");
  });
});
