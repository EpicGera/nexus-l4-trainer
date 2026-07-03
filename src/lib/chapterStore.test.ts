import { describe, it, expect, beforeEach } from "vitest";
import {
  ensureChaptersInitialized, listChapters, getActiveChapterId, createChapter,
  switchToChapter, viewChapterProgram, getChapterSessionsRaw, getChapterCompleted,
} from "./chapterStore";
import { getProgramStartDate, getProgramTodayPosition, setProgramStartDate } from "./programStart";

const program = (tag: string) => ({ w1: { days: [{ id: "w1d1", name: "LUNES", title: tag, variations: [] }] } }) as any;
const setLive = (prog: any, sessions: string, completed: string[], logKey: string, logVal: string) => {
  localStorage.setItem("nexus_workouts_override", JSON.stringify(prog));
  localStorage.setItem("nexus_sessions_v1", sessions);
  completed.forEach((d) => localStorage.setItem(d, "true"));
  localStorage.setItem(logKey, logVal);
};

describe("chapterStore — snapshot/restore", () => {
  beforeEach(() => localStorage.clear());

  it("wraps the existing live program as Chapter 1", () => {
    setLive(program("ANDARIEL"), "[1]", ["w1d1"], "nexus_logs_w1d1_Back_Squat", "[2]");
    const idx = ensureChaptersInitialized();
    expect(idx.chapters).toHaveLength(1);
    expect(getActiveChapterId()).toBe("c1");
    expect(viewChapterProgram("c1")!.w1.days[0].title).toBe("ANDARIEL");
  });

  it("createChapter starts fresh and preserves the previous chapter's data", () => {
    setLive(program("ANDARIEL"), "[\"s1\"]", ["w1d1", "w1d2"], "nexus_logs_w1d1_Squat", "v1");
    ensureChaptersInitialized();
    const c2 = createChapter({ title: "SUN-KEN ROCK" }, program("SUNKEN"));

    // c2 is active, live data is fresh
    expect(getActiveChapterId()).toBe(c2.id);
    expect(localStorage.getItem("nexus_sessions_v1")).toBeNull();
    expect(localStorage.getItem("w1d1")).toBeNull();
    expect(localStorage.getItem("nexus_logs_w1d1_Squat")).toBeNull();

    // c1's archive still holds its data
    expect(getChapterSessionsRaw("c1")).toBe("[\"s1\"]");
    expect(getChapterCompleted("c1")).toEqual({ w1d1: true, w1d2: true });
    expect(viewChapterProgram("c1")!.w1.days[0].title).toBe("ANDARIEL");
  });

  it("logging in c2 does not touch c1; switching restores each chapter's live data", () => {
    setLive(program("ANDARIEL"), "[\"s1\"]", ["w1d1"], "nexus_logs_w1d1_Squat", "andariel");
    ensureChaptersInitialized();
    const c2 = createChapter({ title: "SUN-KEN ROCK" }, program("SUNKEN"));

    // log into c2
    localStorage.setItem("nexus_sessions_v1", "[\"s2\"]");
    localStorage.setItem("w1d1", "true");
    localStorage.setItem("nexus_logs_w1d1_Squat", "sunken");

    // switch back to c1 → its data is restored
    expect(switchToChapter("c1")).toBe(true);
    expect(localStorage.getItem("nexus_sessions_v1")).toBe("[\"s1\"]");
    expect(localStorage.getItem("nexus_logs_w1d1_Squat")).toBe("andariel");
    expect(viewChapterProgram("c1")!.w1.days[0].title).toBe("ANDARIEL");

    // switch to c2 → its data is restored, c1's untouched
    switchToChapter(c2.id);
    expect(localStorage.getItem("nexus_sessions_v1")).toBe("[\"s2\"]");
    expect(localStorage.getItem("nexus_logs_w1d1_Squat")).toBe("sunken");
    expect(getChapterSessionsRaw("c1")).toBe("[\"s1\"]");
  });

  it("createChapter anchors the cycle: today becomes Semana 1", () => {
    setLive(program("A"), "[]", [], "nexus_logs_x", "1");
    ensureChaptersInitialized();
    expect(getProgramStartDate()).toBeNull();
    createChapter({ title: "B" }, program("B"));
    expect(getProgramStartDate()).not.toBeNull();
    expect(getProgramTodayPosition().week).toBe("w1");
  });

  it("each chapter keeps its own calendar anchor across switches", () => {
    setLive(program("A"), "[]", [], "nexus_logs_x", "1");
    ensureChaptersInitialized();
    setProgramStartDate("2026-06-01"); // ancla manual del capítulo 1
    const c2 = createChapter({ title: "B" }, program("B")); // ancla c2 a esta semana
    const c2Anchor = getProgramStartDate();
    expect(c2Anchor).not.toBe("2026-06-01");

    switchToChapter("c1");
    expect(getProgramStartDate()).toBe("2026-06-01"); // c1 restaura la suya
    switchToChapter(c2.id);
    expect(getProgramStartDate()).toBe(c2Anchor); // y c2 la suya
  });

  it("listChapters is ordered and switching to active/unknown is a no-op", () => {
    setLive(program("A"), "[]", [], "nexus_logs_x", "1");
    ensureChaptersInitialized();
    createChapter({ title: "B" }, program("B"));
    expect(listChapters().map((c) => c.index)).toEqual([1, 2]);
    expect(switchToChapter(getActiveChapterId())).toBe(false);
    expect(switchToChapter("nope")).toBe(false);
  });
});
