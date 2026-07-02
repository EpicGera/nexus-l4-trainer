// Agrupación estricta (Tight Grouping, enciclopedia V7 caps. 17-18): en metcons de
// intervalos, el dominio aeróbico se mide por la MÍNIMA desviación entre rondas,
// no por el intervalo más rápido. Picos al inicio + colapso al final = fracaso
// táctico. Esta es una herramienta de coach: el atleta pega sus tiempos y ve
// la calidad de su pacing. No depende del modelo de logging.

export type GroupingVerdict = "elite" | "solid" | "ok" | "loose";

export interface GroupingResult {
  count: number;
  meanSec: number;
  sdSec: number;
  /** coefficient of variation (sd/mean) as a percentage */
  cvPct: number;
  spreadSec: number;
  fastestSec: number;
  slowestSec: number;
  verdict: GroupingVerdict;
}

/** Parse "1:52", "112", separated by commas/spaces/newlines into seconds. */
export function parseSplits(text: string): number[] {
  return (text || "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseTimeToSec)
    .filter((n): n is number => n != null && n > 0);
}

export function parseTimeToSec(s: string): number | null {
  const t = (s || "").trim();
  const mmss = t.match(/^(\d+):(\d{1,2})$/);
  if (mmss) return parseInt(mmss[1], 10) * 60 + parseInt(mmss[2], 10);
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export function fmtSec(sec: number): string {
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : `${r}s`;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Compute spread/SD/CV across interval splits + a pacing verdict. Null if <2. */
export function tightGrouping(splits: number[]): GroupingResult | null {
  const xs = splits.filter((n) => n > 0);
  if (xs.length < 2) return null;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  const sd = Math.sqrt(variance);
  const cv = mean > 0 ? (sd / mean) * 100 : 0;
  const fastest = Math.min(...xs);
  const slowest = Math.max(...xs);
  const verdict: GroupingVerdict = cv < 2 ? "elite" : cv < 4 ? "solid" : cv < 8 ? "ok" : "loose";
  return {
    count: xs.length,
    meanSec: round1(mean),
    sdSec: round1(sd),
    cvPct: round1(cv),
    spreadSec: round1(slowest - fastest),
    fastestSec: fastest,
    slowestSec: slowest,
    verdict,
  };
}

export const GROUPING_META: Record<GroupingVerdict, { label: string; color: string; hint: string }> = {
  elite: { label: "AGRUPACIÓN ÉLITE", color: "#00f0ff", hint: "Dominio absoluto del motor: rondas casi idénticas." },
  solid: { label: "SÓLIDA", color: "#1F51FF", hint: "Buen control de ritmo; pequeñas variaciones." },
  ok: { label: "ACEPTABLE", color: "#ff8a00", hint: "Variación notable — apuntá a rondas más parejas." },
  loose: { label: "DISPERSA", color: "#ff0055", hint: "Picos y colapsos: fracaso táctico (cap. 17). Salí más conservador." },
};
