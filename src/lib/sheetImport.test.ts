import { describe, it, expect, beforeEach } from "vitest";
import { parseCsvToDatabase, deriveBlockMeta, backfillLocalLogsFromDatabase } from "./sheetImport";
import { isCueOrNote } from "./cueDetection";

const HEADER =
  "Skip (Libre),Fecha Log,Semana,Día,Bloque,Ejercicio,Esquema Pautado," +
  "Intensidad (% RM),Tempo / Rest,Rondas Completas,Reps Extra,Tiempo Total," +
  "Kg Levantados,RPE,RIR,Tipo (Rx/Scaled),PR del Mes (Auto),Notas y Comentarios";

const CSV = [
  HEADER,
  // section header row (empty Semana) -> must be ignored
  "SEMANA 1,,,,Boss: Hordas,,,,,,,,,,,,,",
  // warmup coaching note in the Ejercicio column -> must be marked as a cue
  "FALSE,,Semana 1,Lunes,Warmup,[NOTA]: Acordar método y posición antes de empezar,,,,,,,,,,,,",
  // strength row
  'FALSE,,Semana 1,Lunes,Fuerza,Back Squat,4x6 @ 65-70% RM (Tempo 21X1 / Rest 90s),65-70%,Tempo 21X1 / Rest 90s,4,0,0:14:00,80,7,3,Rx,,',
  // metcon row with apostrophe-minute intervals + bodyweight + PR
  `FALSE,,Semana 1,Lunes,Metcon,Double Unders,Intervalos 4 Rondas (3' ON / 1' OFF) - 60 reps,,,4,0,,bodyweight,7,3,Rx,🏆 MÁX,`,
].join("\n");

describe("sheetImport - parseCsvToDatabase", () => {
  const db = parseCsvToDatabase(CSV);

  it("builds 4 weeks of 7 days each", () => {
    expect(Object.keys(db)).toEqual(["w1", "w2", "w3", "w4"]);
    expect(db.w1.days).toHaveLength(7);
  });

  it("ignores section-header rows and maps week/day ids", () => {
    const lunes = db.w1.days[0];
    expect(lunes.id).toBe("w1d1");
    expect(lunes.name).toBe("LUNES");
  });

  it("buckets blocks and normalizes the strength scheme", () => {
    const s = db.w1.days[0].variations[0].strength;
    expect(s.scheme).toBe("4x6 @ 65-70% | Rest 90s");
    expect(s.items[0]).toContain("Back Squat");
    expect(s.items[0]).toContain("Registro: 80kg · RPE 7");
  });

  it("normalizes apostrophe-minute intervals and flags PRs", () => {
    const m = db.w1.days[0].variations[0].metcon;
    expect(m.scheme).toBe("3 Min ON / 1 Min OFF x 4 Rondas");
    expect(m.items[0]).toContain("Double Unders");
    expect(m.items[0]).toContain("🏆 PR");
  });

  it("marks a coaching note in the Ejercicio column as a cue span (data-driven)", () => {
    const w = db.w1.days[0].variations[0].warmup;
    expect(w.items[0]).toContain("class='cue'");
    expect(w.items[0]).toContain("Acordar método y posición");
    // and isCueOrNote agrees via the marker, not the runtime regex
    expect(isCueOrNote(w.items[0])).toBe(true);
  });

  it("leaves untouched days with empty blocks", () => {
    const martes = db.w1.days[1].variations[0];
    expect(martes.strength.items).toEqual([]);
    expect(martes.metcon.items).toEqual([]);
  });
});

describe("deriveBlockMeta — duración de intervalos EVERY", () => {
  it("Every M:SS x N clasifica corto/glucolítico (antes quedaba sin metadata)", () => {
    const meta = deriveBlockMeta("metcon", "Every 1:30 x 5");
    expect(meta.timeDomain).toBe("short"); // 7.5 min
    expect(meta.energySystem).toBe("glycolytic");
  });

  it("Every N min x K también", () => {
    const meta = deriveBlockMeta("metcon", "Every 2 min x 12");
    expect(meta.timeDomain).toBe("long"); // 24 min
  });

  it("esquemas sin duración inferible siguen honestamente sin clasificar", () => {
    const meta = deriveBlockMeta("metcon", "21-15-9 Por Tiempo");
    expect(meta.timeDomain).toBeUndefined();
    expect(meta.energySystem).toBeUndefined();
  });
});

describe("backfillLocalLogsFromDatabase — guard de posición del programa", () => {
  const cueItem = (name: string, reg: string) =>
    `${name} <span class='cue'>Registro: ${reg}</span>`;
  const dayWith = (id: string, items: string[]) => ({
    id,
    name: "LUNES",
    title: "X",
    variations: [{
      tabName: "RX",
      warmup: { title: "", scheme: "", items: [] },
      strength: { title: "", scheme: "", items },
      metcon: { title: "", scheme: "", items: [] },
      accessories: { title: "", scheme: "", items: [] },
    }],
  });
  const db = {
    w1: { days: [dayWith("w1d1", [cueItem("Back Squat", "80kg · RPE 7")])] },
    w3: { days: [dayWith("w3d2", [cueItem("Deadlift", "RPE 8")])] },
  } as any;
  const pos = { week: "w2", dayIndex: 3 }; // el atleta va por la semana 2

  beforeEach(() => localStorage.clear());

  it("siembra días pasados pero nunca días futuros", () => {
    backfillLocalLogsFromDatabase(db, pos);
    expect(localStorage.getItem("nexus_logs_w1d1_Back_Squat")).not.toBeNull();
    expect(localStorage.getItem("nexus_logs_w3d2_Deadlift")).toBeNull();
  });

  it("retira el fantasma futuro con firma exacta del backfill", () => {
    localStorage.setItem(
      "nexus_logs_w3d2_Deadlift",
      JSON.stringify([{ id: "g1", weight: "", reps: "1", rpe: "8", timestamp: 123 }]),
    );
    backfillLocalLogsFromDatabase(db, pos);
    expect(localStorage.getItem("nexus_logs_w3d2_Deadlift")).toBeNull();
  });

  it("preserva un log futuro divergente (puede ser real)", () => {
    const real = JSON.stringify([{ id: "r1", weight: "140", reps: "5", rpe: "9", timestamp: 456 }]);
    localStorage.setItem("nexus_logs_w3d2_Deadlift", real);
    backfillLocalLogsFromDatabase(db, pos);
    expect(localStorage.getItem("nexus_logs_w3d2_Deadlift")).toBe(real);
  });
});
