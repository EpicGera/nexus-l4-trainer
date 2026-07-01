import { describe, it, expect } from "vitest";
import { CATALOG, getExercise, resolveExercise, inferExercise, resolveOrInfer, classifyMovement } from "./exerciseCatalog";
import { MODALITIES, PATTERNS, SKILLS } from "../types/training";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

describe("exercise catalog integrity", () => {
  it("has a solid core of movements", () => {
    expect(CATALOG.length).toBeGreaterThan(40);
  });

  it("has unique ids", () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only valid taxonomy values", () => {
    for (const e of CATALOG) {
      expect(MODALITIES).toContain(e.modality);
      expect(PATTERNS).toContain(e.pattern);
      expect(e.skills.length).toBeGreaterThan(0);
      e.skills.forEach((s) => expect(SKILLS).toContain(s));
    }
  });

  it("defines a displacement wherever the work model needs one", () => {
    for (const e of CATALOG) {
      if (e.workModel === "load-displacement" || e.workModel === "bodyweight") {
        expect(e.displacementM, `${e.id} needs displacementM`).toBeGreaterThan(0);
      }
      if (e.workModel === "bodyweight") {
        expect(e.bodyweightFraction, `${e.id} needs bodyweightFraction`).toBeGreaterThan(0);
      }
    }
  });

  it("has no alias collisions across different movements", () => {
    const seen: Record<string, string> = {};
    for (const e of CATALOG) {
      for (const key of [e.id, e.name, ...e.aliases]) {
        const n = norm(key);
        if (seen[n] && seen[n] !== e.id) {
          throw new Error(`alias "${n}" maps to both ${seen[n]} and ${e.id}`);
        }
        seen[n] = e.id;
      }
    }
    expect(true).toBe(true);
  });
});

describe("resolveExercise", () => {
  it("resolves exact names and aliases (multi-language)", () => {
    expect(resolveExercise("Back Squat")?.id).toBe("back-squat");
    expect(resolveExercise("Remo")?.id).toBe("row-erg");
    expect(resolveExercise("Dominadas")?.id).toBe("pull-up");
    expect(resolveExercise("DU")?.id).toBe("double-under");
    expect(resolveExercise("Power Clean")?.id).toBe("clean");
  });

  it("resolves a movement embedded in a free-text prescription line", () => {
    expect(resolveExercise("21 Wall Balls")?.id).toBe("wall-ball");
    expect(resolveExercise("Max Burpees")?.id).toBe("burpee");
  });

  it("returns null for unknown text", () => {
    expect(resolveExercise("asdfqwer")).toBeNull();
    expect(resolveExercise("")).toBeNull();
  });

  it("getExercise returns the entry by id", () => {
    expect(getExercise("thruster")?.name).toBe("Thruster");
    expect(getExercise("nope")).toBeUndefined();
  });
});

describe("open-world fallback (chapter 2 brings unknown movements)", () => {
  it("infers a sensible classification for movements not in the catalog", () => {
    const sandbag = inferExercise("Sandbag Carry");
    expect(sandbag.modality).toBe("W");
    expect(sandbag.pattern).toBe("carry");
    expect(sandbag.source).toBe("inferred");

    const echo = inferExercise("Echo Bike");
    expect(echo.modality).toBe("M");
    expect(echo.workModel).toBe("erg-calories");

    const wallWalk = inferExercise("Wall Walk");
    expect(wallWalk.modality).toBe("G");
  });

  it("never fabricates displacement-based work for an inferred movement", () => {
    const x = inferExercise("Devil Press");
    expect(["none", "erg-calories", "distance"]).toContain(x.workModel);
    expect(x.confidence).toBe("low");
  });

  it("resolveOrInfer never returns null — the app cannot break on a new movement", () => {
    expect(resolveOrInfer("Back Squat").source).toBe("catalog");
    // Yoke Carry is deliberately NOT in the catalog → must infer, not break.
    expect(resolveOrInfer("Yoke Carry").source).toBe("inferred");
    // even gibberish / empty resolve to a usable stub
    expect(resolveOrInfer("zxcvqwer")).not.toBeNull();
    expect(resolveOrInfer("").name).toBeTruthy();
  });

  it("uses block context to disambiguate modality", () => {
    expect(inferExercise("Sled Drag", { bucket: "strength", hasLoad: true }).modality).toBe("W");
  });

  it("a user classification (1-tap) overrides inference for that movement", () => {
    try {
      expect(resolveOrInfer("Atlas Stone Carry").source).not.toBe("user");
      classifyMovement("Atlas Stone Carry", "M", "monostructural");
      const r = resolveOrInfer("Atlas Stone Carry");
      expect(r.source).toBe("user");
      expect(r.modality).toBe("M");
      expect(r.pattern).toBe("monostructural");
    } finally {
      try { localStorage.removeItem("nexus_catalog_overrides"); } catch {}
    }
  });
});
