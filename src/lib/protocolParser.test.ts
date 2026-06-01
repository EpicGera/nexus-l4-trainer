import { describe, it, expect } from "vitest";
import { parseProtocol } from "./protocolParser";

describe("parseProtocol", () => {
  describe("Warmup patterns", () => {
    it("should parse WARMUP protocols with specific time", () => {
      const result = parseProtocol("WARMUP", "15 Minutos", "");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "PUESTA A PUNTO L4",
        work: 900, // 15 mins
        rest: 90,
        rounds: 1,
      });
    });

    it("should parse WARMUP protocols with default time", () => {
      const result = parseProtocol("WARMUP", "General Movement", "");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "PUESTA A PUNTO L4",
        work: 600, // 10 mins (default)
        rest: 90,
        rounds: 1,
      });
    });
  });

  describe("Tabata patterns", () => {
    it("should parse TABATA correctly", () => {
      const result = parseProtocol("Workout 1", "TABATA", "METCON");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "TABATA (CARIOCAS)",
        work: 20,
        rest: 10,
        rounds: 8,
      });
    });
  });

  describe("Interval patterns", () => {
    it("should parse ON/OFF INTERVAL correctly (seconds)", () => {
      const result = parseProtocol("Intervals", "30S ON / 30S OFF x 5", "");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "INTERVALOS",
        work: 30,
        rest: 30,
        rounds: 5,
      });
    });

    it("should parse ON/OFF INTERVAL correctly (minutes)", () => {
      const result = parseProtocol("Intervals", "1 MIN ON / 2 MIN OFF x 3", "");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "INTERVALOS",
        work: 60,
        rest: 120,
        rounds: 3,
      });
    });
  });

  describe("EMOM patterns", () => {
    it("should parse common EMOM properly", () => {
      const result = parseProtocol("EMOM 10 MIN", "EMOM 10", "");
      expect(result).toEqual({
        type: "EMOM",
        name: "EMOM",
        work: 60,
        rest: 0,
        rounds: 10,
      });
    });

    it("should parse E2MOM properly", () => {
      const result = parseProtocol("E2MOM 12 MIN", "E2MOM x 6", "");
      expect(result).toEqual({
        type: "EMOM",
        name: "E2MOM",
        work: 120,
        rest: 0,
        rounds: 6,
      });
    });

    it("should parse EVERY MM:SS pattern properly", () => {
      const result = parseProtocol("Workout", "EVERY 1:30 X 10", "");
      expect(result).toEqual({
        type: "EMOM",
        name: "EVERY BLOCK",
        work: 90,
        rest: 0,
        rounds: 10,
      });
    });

    it("should parse EVERY X MIN pattern properly", () => {
      const result = parseProtocol("Workout", "EVERY 2 MIN X 5", "");
      expect(result).toEqual({
        type: "EMOM",
        name: "EVERY BLOCK",
        work: 120,
        rest: 0,
        rounds: 5,
      });
    });
  });

  describe("AMRAP and CAP patterns", () => {
    it("should parse AMRAP properly", () => {
      const result = parseProtocol("AMRAP 15 MIN", "AMRAP 15", "");
      expect(result).toEqual({
        type: "AMRAP",
        name: "AMRAP",
        work: 900,
        rest: 0,
        rounds: 1,
      });
    });

    it("should parse TIME CAPS correctly", () => {
      const result = parseProtocol("Workout", "FOR TIME", "TIME CAP 10:30");
      expect(result).toEqual({
        type: "AMRAP",
        name: "FOR TIME (A CAP)",
        work: 630, // 10 mins 30 secs
        rest: 0,
        rounds: 1,
      });
    });
  });

  describe("Countdown and continuous patterns", () => {
    it("should parse COUNTDOWN properly", () => {
      const result = parseProtocol("Zone 2", "30 Minutos Zona 2", "");
      expect(result).toEqual({
        type: "AMRAP",
        name: "COUNTDOWN",
        work: 1800,
        rest: 0,
        rounds: 1,
      });
    });

    it("should parse COUNTDOWN with pipe rounds properly", () => {
      const result = parseProtocol("Zone 2", "10 Minutos | 2 Rondas", "");
      expect(result).toEqual({
        type: "INTERVAL",
        name: "BLOQUES TEMPORIZADOS",
        work: 300, // 10 mins / 2 rounds
        rest: 30, // Transition rest
        rounds: 2,
      });
    });
  });

  describe("Strength and rest patterns", () => {
    it("should parse STRENGTH with explicit rest seconds", () => {
      const result = parseProtocol("Strength", "4x6 @ 70% REST 90S", "");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "TRABAJO Y DESCANSO",
        work: 120, // default 2 mins work
        rest: 90,
        rounds: 4,
      });
    });

    it("should parse STRENGTH with explicit rest minutes", () => {
      const result = parseProtocol("Strength", "3x5 REST 2 MIN", "");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "TRABAJO Y DESCANSO",
        work: 120, // default 2 mins work
        rest: 2,
        rounds: 3,
      });
    });

    it("should parse NxM strength pattern", () => {
      const result = parseProtocol("Strength", "5x5 @ 80%", "");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "FUERZA PROGRAMADA",
        work: 120, // default 2 mins work
        rest: 90, // default 90s rest
        rounds: 5,
      });
    });

    it("should parse FUERZA fallback", () => {
      const result = parseProtocol("FUERZA", "5 RONDAS", "");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "FUERZA RECOMENDADA",
        work: 120,
        rest: 90,
        rounds: 5,
      });
    });
  });

  describe("General rounds and FOR TIME patterns", () => {
    it("should parse General Rounds METCON", () => {
      const result = parseProtocol("Workout", "5 RONDAS", "METCON");
      expect(result).toEqual({
        type: "FOR_TIME",
        name: "FOR TIME",
        work: 900, // default 15 min cap
        rest: 0,
        rounds: 5,
      });
    });

    it("should parse General Rounds ACCESSORIES", () => {
      const result = parseProtocol("Workout", "3 SERIES", "ACCESSORIES");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "ACCESORIOS",
        work: 240, // 12 min cap / 3 rounds
        rest: 60,
        rounds: 3,
      });
    });

    it("should parse explicit FOR TIME", () => {
      const result = parseProtocol("Workout", "FOR TIME", "");
      expect(result).toEqual({
        type: "FOR_TIME",
        name: "POR TIEMPO",
        work: 0,
        rest: 0,
        rounds: 1,
      });
    });

    it("should parse descending rep scheme (e.g., 21-15-9)", () => {
      const result = parseProtocol("Workout", "21-15-9", "");
      expect(result).toEqual({
        type: "FOR_TIME",
        name: "POR TIEMPO",
        work: 0,
        rest: 0,
        rounds: 1,
      });
    });
  });

  describe("Fallbacks", () => {
    it("should fall back to ACTIVACIÓN L4 for qualitative schemes", () => {
      const result = parseProtocol("Enfoque Core", "Isometric Focus", "");
      expect(result).toEqual({
        type: "STRENGTH",
        name: "ACTIVACIÓN L4",
        work: 120,
        rest: 60,
        rounds: 3,
      });
    });

    it("should fall back to NORMAL for unknown protocols", () => {
      const result = parseProtocol("Unknown", "Do some reps", "");
      expect(result).toEqual({
        type: "NORMAL",
        name: "TEMPORIZADOR LIBRE",
        work: 0,
        rest: 60,
        rounds: 1,
      });
    });
  });
});
