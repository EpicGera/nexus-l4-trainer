import { describe, it, expect } from "vitest";
import { parseCsvToDatabase } from "./sheetImport";
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
