// The athlete's OBJECTIVE — the persistent thread that drives chapter-to-chapter
// periodization toward a goal (not just "vary from last month"). Stored locally
// and fed into the chapter generator so each new chapter is the next step toward
// it, measured against the athlete's real marks.

export interface LiftTarget {
  /** movement name as the athlete writes it, e.g. "Snatch" */
  movement: string;
  /** target load in kg */
  targetKg: number;
}

export interface AthleteObjective {
  /** free-text north star, e.g. "Clasificar al Open / primer ring muscle-up" */
  statement: string;
  /** measurable strength targets */
  lifts: LiftTarget[];
  /** target skills, free text, e.g. ["Primer Ring Muscle-Up", "DU sin tropiezos x50"] */
  skills: string[];
  /** horizon in chapters (mesocycles) to reach it, optional */
  horizonChapters?: number;
}

const KEY = "nexus_athlete_objective";

export const EMPTY_OBJECTIVE: AthleteObjective = { statement: "", lifts: [], skills: [] };

export function getObjective(): AthleteObjective {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const o = JSON.parse(raw);
      return {
        statement: String(o.statement || ""),
        lifts: Array.isArray(o.lifts)
          ? o.lifts
              .map((l: any) => ({ movement: String(l.movement || "").trim(), targetKg: Number(l.targetKg) }))
              .filter((l: LiftTarget) => l.movement && l.targetKg > 0)
          : [],
        skills: Array.isArray(o.skills) ? o.skills.map((s: any) => String(s).trim()).filter(Boolean) : [],
        horizonChapters: o.horizonChapters ? Number(o.horizonChapters) : undefined,
      };
    }
  } catch {
    /* storage restricted / malformed — fall through to empty */
  }
  return { ...EMPTY_OBJECTIVE };
}

export function setObjective(o: AthleteObjective): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* ignore quota / restricted storage */
  }
}

export function hasObjective(o: AthleteObjective): boolean {
  return !!(o.statement.trim() || o.lifts.length || o.skills.length);
}

/**
 * Render the objective + the GAP to the athlete's current marks as a prompt
 * block, so the generator can prescribe the next step toward it. `currentMarks`
 * are real e1RM / logged maxes (movement name → kg). Returns "" when no objective
 * is set (the generator then just periodizes from the evaluation).
 */
export function objectiveGapText(o: AthleteObjective, currentMarks: { name: string; kg: number }[]): string {
  if (!hasObjective(o)) return "";
  const lines: string[] = [];
  if (o.statement.trim()) lines.push(`Meta declarada: ${o.statement.trim()}.`);
  if (o.horizonChapters) lines.push(`Horizonte: ${o.horizonChapters} capítulo(s).`);

  if (o.lifts.length) {
    const gaps = o.lifts.map((t) => {
      const cur = bestMatch(t.movement, currentMarks);
      if (cur == null) return `${t.movement}: objetivo ${t.targetKg}kg (sin marca actual registrada — establecela este capítulo).`;
      const diff = Math.round(t.targetKg - cur);
      if (diff <= 0) return `${t.movement}: ${cur}kg ≥ objetivo ${t.targetKg}kg ✅ (mantener / subir el techo).`;
      const pct = Math.round((diff / t.targetKg) * 100);
      return `${t.movement}: ${cur}kg → ${t.targetKg}kg (faltan ${diff}kg, ${pct}%).`;
    });
    lines.push("Brecha de fuerza al objetivo: " + gaps.join(" "));
  }
  if (o.skills.length) lines.push(`Skills objetivo (programar exposición progresiva): ${o.skills.join(", ")}.`);
  return lines.join("\n");
}

/** Best current mark for a target movement by case-insensitive name match. */
function bestMatch(movement: string, marks: { name: string; kg: number }[]): number | null {
  const m = movement.toLowerCase().trim();
  let best: number | null = null;
  for (const mark of marks) {
    const n = mark.name.toLowerCase();
    if (n === m || n.includes(m) || m.includes(n)) best = Math.max(best ?? 0, mark.kg);
  }
  return best;
}
