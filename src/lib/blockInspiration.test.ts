import { describe, it, expect } from "vitest";
import {
  blockInspirationId,
  heuristicInspirationMap,
  applyInspirationMap,
  blocksForPrompt,
} from "./blockInspiration";
import { Database, ProgramBlock } from "../types/workout";

function block(key: string, title: string, items: string[]): ProgramBlock {
  return { key, title, scheme: "", items, bucket: "strength" };
}

function dbWith(blocks: ProgramBlock[], tabName = ""): Database {
  return {
    w1: {
      days: [
        {
          id: "w1d1",
          name: "LUNES",
          title: "Día 1",
          isCompleted: false,
          variations: [{ tabName, warmup: {} as any, strength: {} as any, metcon: {} as any, accessories: {} as any, blocks }],
        },
      ],
    },
  };
}

describe("blockInspiration (Fase 3)", () => {
  it("ids are stable dayId::blockKey", () => {
    expect(blockInspirationId("w1d1", "b2_")).toBe("w1d1::b2_");
  });

  it("heuristic map classifies each block by keywords", () => {
    const db = dbWith([
      block("b1_", "Fuerza", ["Back Squat 5x5 pesado"]),
      block("b2_", "Metcon", ["AMRAP dobles bar speed"]),
      block("b3_", "Equipo", ["Sincro con compañero relevos"]),
    ]);
    const map = heuristicInspirationMap(db);
    expect(map["w1d1::b1_"]).toBe("HWPO"); // back squat / pesado
    expect(map["w1d1::b2_"]).toBe("PRVN"); // default precision
    expect(map["w1d1::b3_"]).toBe("MAYHEM"); // sincro / relevos
  });

  it("applyInspirationMap writes inspiration without mutating the source", () => {
    const db = dbWith([block("b1_", "Fuerza", ["Deadlift"])]);
    const tagged = applyInspirationMap(db, { "w1d1::b1_": "HWPO" });
    expect(tagged.w1.days[0].variations[0].blocks![0].inspiration).toBe("HWPO");
    // original untouched
    expect(db.w1.days[0].variations[0].blocks![0].inspiration).toBeUndefined();
  });

  it("applyInspirationMap leaves unmapped blocks alone", () => {
    const db = dbWith([block("b1_", "Fuerza", ["Deadlift"])]);
    const tagged = applyInspirationMap(db, {});
    expect(tagged.w1.days[0].variations[0].blocks![0].inspiration).toBeUndefined();
  });

  it("blocksForPrompt produces compact ids + capped items", () => {
    const db = dbWith([block("b1_", "Fuerza", ["a", "b", "c", "d", "e", "f", "g", "h"])]);
    const out = blocksForPrompt(db);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("w1d1::b1_");
    expect(out[0].items.length).toBeLessThanOrEqual(6);
  });
});
