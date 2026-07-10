import { describe, it, expect } from "vitest";
import { detectBeatsFromSamples } from "./beatDetect";

const SR = 44100;

// Genera muestras con clics (transitorios) a un BPM dado sobre silencio.
function clickTrack(bpm: number, durationSec: number): Float32Array {
  const n = Math.floor(SR * durationSec);
  const s = new Float32Array(n);
  const period = Math.round((60 / bpm) * SR);
  for (let i = 0; i < n; i += period) {
    // click corto y fuerte (varias muestras para que caiga en una ventana RMS)
    for (let k = 0; k < 512 && i + k < n; k++) s[i + k] = 1 - k / 512;
  }
  return s;
}

describe("detectBeatsFromSamples", () => {
  it("detecta ~2 clics/seg a 120 BPM", () => {
    const beats = detectBeatsFromSamples(clickTrack(120, 4), SR, 0, 4);
    // 120 BPM = 2 por segundo → ~8 en 4s. Tolerancia por bordes/ventana.
    expect(beats.length).toBeGreaterThanOrEqual(6);
    expect(beats.length).toBeLessThanOrEqual(9);
    // ordenados y espaciados ~0.5s
    for (let i = 1; i < beats.length; i++) {
      expect(beats[i]).toBeGreaterThan(beats[i - 1]);
      expect(beats[i] - beats[i - 1]).toBeGreaterThanOrEqual(0.25);
    }
  });

  it("silencio → sin beats", () => {
    expect(detectBeatsFromSamples(new Float32Array(SR * 2), SR, 0, 2)).toEqual([]);
  });

  it("respeta offsetSec y acota a [0, durationSec]", () => {
    // clics durante 4s pero el video arranca en el segundo 2 y dura 1s
    const beats = detectBeatsFromSamples(clickTrack(120, 4), SR, 2, 1);
    expect(beats.every((t) => t >= 0 && t <= 1)).toBe(true);
  });

  it("entrada vacía o sample rate inválido → []", () => {
    expect(detectBeatsFromSamples(new Float32Array(0), SR, 0, 1)).toEqual([]);
    expect(detectBeatsFromSamples(clickTrack(120, 1), 0, 0, 1)).toEqual([]);
  });
});
