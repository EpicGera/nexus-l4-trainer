import { describe, it, expect, afterEach, vi } from "vitest";
import { effectTransform, canEncodeMp4, coverRect, flashAlpha, shakeOffset, fadeFactor } from "./videoExport";

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

describe("coverRect (cover-fit del clip a 1080×1920)", () => {
  const W = 1080, H = 1920;
  const covers = (sw: number, sh: number) => {
    const r = coverRect(sw, sh, W, H);
    // el rect cubre todo el marco (sin bandas) y queda centrado
    expect(r.w).toBeGreaterThanOrEqual(W - 1e-6);
    expect(r.h).toBeGreaterThanOrEqual(H - 1e-6);
    expect(r.dx).toBeCloseTo((W - r.w) / 2, 6);
    expect(r.dy).toBeCloseTo((H - r.h) / 2, 6);
  };

  it("clip landscape (16:9) cubre el marco vertical, recortando a los lados", () => {
    covers(1920, 1080);
    const r = coverRect(1920, 1080, W, H);
    expect(r.h).toBeCloseTo(H, 6); // el alto encaja exacto
    expect(r.w).toBeGreaterThan(W); // ancho excede → recorte lateral
  });

  it("clip portrait (9:16) encaja exacto en el marco", () => {
    covers(1080, 1920);
    const r = coverRect(1080, 1920, W, H);
    expect(r.w).toBeCloseTo(W, 6);
    expect(r.h).toBeCloseTo(H, 6);
    expect(r.dx).toBeCloseTo(0, 6);
  });

  it("clip cuadrado cubre el marco", () => covers(720, 720));

  it("dimensiones inválidas → rect del marco completo (sin dividir por cero)", () => {
    expect(coverRect(0, 0, W, H)).toEqual({ dx: 0, dy: 0, w: W, h: H });
  });
});

describe("flashAlpha (destello por beat)", () => {
  const beats = [1.0, 3.0];
  it("máximo (0.6) justo en el beat, decae a 0 en 150ms", () => {
    expect(flashAlpha(1.0, beats)).toBeCloseTo(0.6, 5);
    expect(flashAlpha(1.075, beats)).toBeCloseTo(0.3, 2); // mitad de la ventana
    expect(flashAlpha(1.15, beats)).toBeCloseTo(0, 5);
  });
  it("0 lejos de cualquier beat y antes del beat", () => {
    expect(flashAlpha(2.0, beats)).toBe(0);
    expect(flashAlpha(0.9, beats)).toBe(0); // el destello no se adelanta al beat
  });
  it("sin beats → siempre 0", () => {
    expect(flashAlpha(1.0, [])).toBe(0);
  });
});

describe("shakeOffset (sacudida por beat)", () => {
  const beats = [1.0];
  it("determinista: mismo tSec → mismo offset", () => {
    expect(shakeOffset(1.0, beats)).toEqual(shakeOffset(1.0, beats));
  });
  it("dentro de la amplitud (≤12px) y decae a 0 fuera de la ventana", () => {
    const at = shakeOffset(1.0, beats);
    expect(Math.hypot(at.dx, at.dy)).toBeLessThanOrEqual(12 + 1e-9);
    expect(shakeOffset(2.0, beats)).toEqual({ dx: 0, dy: 0 });
  });
});

describe("fadeFactor (fade in/out)", () => {
  it("0 en los extremos, 1 en el medio", () => {
    expect(fadeFactor(0, 10)).toBe(0);
    expect(fadeFactor(10, 10)).toBe(0);
    expect(fadeFactor(5, 10)).toBe(1);
  });
  it("rampa lineal en la ventana de fade (0.4s por defecto)", () => {
    expect(fadeFactor(0.2, 10)).toBeCloseTo(0.5, 5); // mitad de la subida
    expect(fadeFactor(9.8, 10)).toBeCloseTo(0.5, 5); // mitad de la bajada
    expect(fadeFactor(0.4, 10)).toBeCloseTo(1, 5);
  });
  it("clip muy corto: fades no se solapan (tope en duración/2)", () => {
    // duración 0.5s → fade efectivo 0.25s; el medio llega a 1
    expect(fadeFactor(0.25, 0.5)).toBeCloseTo(1, 5);
    expect(fadeFactor(0, 0.5)).toBe(0);
  });
  it("acota fuera de rango y casos degenerados", () => {
    expect(fadeFactor(-1, 10)).toBe(0);
    expect(fadeFactor(99, 10)).toBe(0);
    expect(fadeFactor(1, 0)).toBe(1); // duración 0 → sin fade
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
