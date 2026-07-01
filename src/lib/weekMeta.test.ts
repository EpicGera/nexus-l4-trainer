import { describe, it, expect } from "vitest";
import { parseJsonToDatabase } from "./sheetImport";

describe("week meta (block intention + Lifestyle Gear)", () => {
  it("reads explicit meta and normalizes aliases (deload→restauracion, gear clamp)", () => {
    const db = parseJsonToDatabase(JSON.stringify({
      w1: { meta: { intention: "deload", gear: 2 }, days: [{ title: "X", strength: { items: ["Squat"] } }] },
      w2: { meta: { intention: "Peak", gear: 9 }, days: [{ title: "Y", metcon: { items: ["Run"] } }] },
    }));
    expect(db.w1.meta).toEqual({ intention: "restauracion", gear: 2 });
    expect(db.w2.meta).toEqual({ intention: "realizacion" }); // gear 9 out of range → dropped
  });

  it("infers intention from titles when meta absent, flagging it inferred", () => {
    const db = parseJsonToDatabase(JSON.stringify({
      w1: { days: [{ title: "Cicatrices del Jefe (Deload)", warmup: { items: ["Movilidad"] } }] },
      w2: { days: [{ title: "La Furia del Boss (Peak Week)", strength: { items: ["Front Squat"] } }] },
      w3: { days: [{ title: "Día normal", strength: { items: ["Back Squat"] } }] },
    }));
    expect(db.w1.meta).toEqual({ intention: "restauracion", inferred: true });
    expect(db.w2.meta).toEqual({ intention: "realizacion", inferred: true });
    expect(db.w3.meta).toBeUndefined(); // nothing to infer → no meta
  });

  it("leaves plain programs without meta", () => {
    const db = parseJsonToDatabase(JSON.stringify({ w1: { days: [{ title: "X", strength: { items: ["Squat"] } }] } }));
    expect(db.w1.meta).toBeUndefined();
  });
});
