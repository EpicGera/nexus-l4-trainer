// Detección de beats offline para sincronizar los destellos del video Story con
// la música. Corre UNA vez sobre el AudioBuffer ya decodificado (el mismo que se
// muxea al mp4), antes del loop de render, y devuelve los tiempos de beat en
// segundos relativos al inicio del video.
//
// ponytail: energía RMS por ventana + umbral por media móvil. Es el detector de
// onsets más simple que funciona con música percusiva; si algún día falla con
// pistas sin transitorios marcados, el upgrade es spectral flux (FFT).

const WINDOW = 1024; // muestras por ventana de energía
const THRESHOLD_FACTOR = 1.4; // energía > media_móvil × factor ⇒ candidato
const MIN_GAP_SEC = 0.25; // separación mínima entre beats (~240 BPM techo)

/**
 * Núcleo puro (testeable sin WebAudio): recibe las muestras mono y el sample
 * rate. `offsetSec` es desde qué segundo del audio arranca el video; los tiempos
 * devueltos ya vienen relativos al inicio del video y acotados a [0, durationSec].
 */
export function detectBeatsFromSamples(
  samples: Float32Array,
  sampleRate: number,
  offsetSec: number,
  durationSec: number,
): number[] {
  if (!samples.length || sampleRate <= 0) return [];

  // Energía RMS por ventana.
  const windowCount = Math.floor(samples.length / WINDOW);
  const energy = new Float32Array(windowCount);
  for (let w = 0; w < windowCount; w++) {
    let sum = 0;
    const base = w * WINDOW;
    for (let i = 0; i < WINDOW; i++) {
      const s = samples[base + i];
      sum += s * s;
    }
    energy[w] = Math.sqrt(sum / WINDOW);
  }

  // Media móvil ~1s como umbral adaptativo (se banca cambios de volumen).
  const avgSpan = Math.max(1, Math.round(sampleRate / WINDOW));
  const secPerWindow = WINDOW / sampleRate;
  const minGapWindows = Math.max(1, Math.round(MIN_GAP_SEC / secPerWindow));

  const beats: number[] = [];
  let lastBeatWindow = -Infinity;
  for (let w = 0; w < windowCount; w++) {
    const from = Math.max(0, w - avgSpan);
    const to = Math.min(windowCount - 1, w + avgSpan);
    let sum = 0;
    for (let k = from; k <= to; k++) sum += energy[k];
    const localAvg = sum / (to - from + 1);

    const isPeak =
      energy[w] > localAvg * THRESHOLD_FACTOR &&
      energy[w] >= (energy[w - 1] ?? 0) &&
      energy[w] >= (energy[w + 1] ?? 0);

    if (isPeak && w - lastBeatWindow >= minGapWindows) {
      const tAbs = w * secPerWindow;
      const tRel = tAbs - offsetSec;
      if (tRel >= 0 && tRel <= durationSec) beats.push(tRel);
      lastBeatWindow = w;
    }
  }
  return beats;
}

/** Envoltorio sobre un AudioBuffer decodificado (canal 0 = izquierdo/mono). */
export function detectBeats(
  buffer: AudioBuffer,
  offsetSec: number,
  durationSec: number,
): number[] {
  return detectBeatsFromSamples(
    buffer.getChannelData(0),
    buffer.sampleRate,
    offsetSec,
    durationSec,
  );
}
