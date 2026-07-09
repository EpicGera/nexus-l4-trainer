import { describe, it, expect, afterEach, vi } from "vitest";
import { effectTransform, canEncodeMp4 } from "./videoExport";

describe("effectTransform", () => {
  it("kenburns: identidad en t=0, escala objetivo en t=1, monótona", () => {
    expect(effectTransform("kenburns", 0)).toMatchObject({ scale: 1 });
    expect(effectTransform("kenburns", 1).scale).toBeCloseTo(1.12, 5);
    const mid = effectTransform("kenburns", 0.5).scale;
    expect(mid).toBeGreaterThan(1);
    expect(mid).toBeLessThan(1.12);
  });

  it("kenburns: el pan nunca destapa el borde (|txN|,|tyN| ≤ (scale-1)/2)", () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const { scale, txN, tyN } = effectTransform("kenburns", t);
      const margin = (scale - 1) / 2 + 1e-9;
      expect(Math.abs(txN)).toBeLessThanOrEqual(margin);
      expect(Math.abs(tyN)).toBeLessThanOrEqual(margin);
    }
  });

  it("pulse: vuelve a la escala inicial al final del ciclo", () => {
    expect(effectTransform("pulse", 0).scale).toBeCloseTo(1, 5);
    expect(effectTransform("pulse", 1).scale).toBeCloseTo(1, 5);
    expect(effectTransform("pulse", 0.5).scale).toBeCloseTo(1.05, 5);
  });

  it("none: identidad en todo t", () => {
    expect(effectTransform("none", 0.7)).toEqual({ scale: 1, txN: 0, tyN: 0 });
  });

  it("acota t fuera de rango", () => {
    expect(effectTransform("kenburns", -5).scale).toBe(1);
    expect(effectTransform("kenburns", 9).scale).toBeCloseTo(1.12, 5);
  });
});

describe("canEncodeMp4 (pipeline select)", () => {
  afterEach(() => {
    delete (globalThis as any).VideoEncoder;
  });

  it("false cuando no hay WebCodecs", async () => {
    delete (globalThis as any).VideoEncoder;
    expect(await canEncodeMp4()).toBe(false);
  });

  it("refleja isConfigSupported cuando WebCodecs existe", async () => {
    (globalThis as any).VideoEncoder = {
      isConfigSupported: vi.fn().mockResolvedValue({ supported: true }),
    };
    expect(await canEncodeMp4()).toBe(true);

    (globalThis as any).VideoEncoder.isConfigSupported = vi.fn().mockResolvedValue({ supported: false });
    expect(await canEncodeMp4()).toBe(false);
  });
});
