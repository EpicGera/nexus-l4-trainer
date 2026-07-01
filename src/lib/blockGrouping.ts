// Strength blocks in the program are authored as a NAMED HEADER followed by
// "-> ..." sub-prescription lines, e.g.
//   "Heavy Deadlift - Levantamiento Principal"
//   "-> 2 series de 5 repeticiones con 90 kg"
//   "-> 2 series de 5 repeticiones con 95 kg"
// The header names the lift; the "-> " lines are its set tiers. They arrive as
// flat sibling items, so the app used to render all three as separate loggable
// stations. This resolver gives each item a role so the header renders as a
// title (never logged) and each tier inherits the lift name (so it classifies
// instead of landing in "sin clasificar").

import { isCueOrNote, getCleanExerciseName } from "./cueDetection";

const plain = (s: string) => String(s ?? "").replace(/<[^>]*>/g, "").trim();

// A tier line opens with an arrow bullet: "-> ", "→", "⟶", "⇒", "»".
const SUBLINE_RE = /^\s*(?:-+>|→|⟶|⇒|»)\s*/u;
// "Back Squat - Levantamiento Principal" -> "Back Squat".
const LIFT_SUFFIX_RE = /\s*[-–—]\s*Levantamiento\s+\p{L}+\s*$/iu;

export const isSubLine = (item: string): boolean => SUBLINE_RE.test(plain(item));

/** The catalog-resolvable lift name a header introduces (suffix stripped). */
export const liftHeaderName = (item: string): string =>
  plain(item).replace(LIFT_SUFFIX_RE, "").trim();

export type ItemRole = "cue" | "header" | "movement" | "subline";

export interface ResolvedBlockItem {
  /** Original item text/HTML, for display. */
  text: string;
  role: ItemRole;
  /** Name to log/classify against. Empty for cue and header (not loggable). */
  name: string;
}

/**
 * Assign each block item a role. A movement line immediately followed (skipping
 * cues) by "-> " lines is a HEADER; the following "-> " lines are SUBLINEs that
 * inherit the header's lift name. Everything else is a plain MOVEMENT or a CUE.
 */
export function resolveBlockItems(items: string[]): ResolvedBlockItem[] {
  const out: ResolvedBlockItem[] = [];
  let lift = "";
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (isCueOrNote(it)) {
      out.push({ text: it, role: "cue", name: "" });
      continue;
    }
    if (isSubLine(it)) {
      out.push({ text: it, role: "subline", name: lift || getCleanExerciseName(it) });
      continue;
    }
    const nextLoggable = items.slice(i + 1).find((x) => !isCueOrNote(x));
    if (nextLoggable && isSubLine(nextLoggable)) {
      lift = liftHeaderName(it);
      out.push({ text: it, role: "header", name: "" });
    } else {
      lift = "";
      out.push({ text: it, role: "movement", name: getCleanExerciseName(it) });
    }
  }
  return out;
}

/** Loggable stations only (movements + tiers), each with a resolved name. */
export const loggableBlockItems = (items: string[]): { text: string; name: string }[] =>
  resolveBlockItems(items)
    .filter((e) => e.role === "movement" || e.role === "subline")
    .map((e) => ({ text: e.text, name: e.name }))
    .filter((e) => e.name.length > 1);
