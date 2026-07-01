// Per-day title theming (Fase 2). The boss day glows red, team days green, the
// max-volume day orange; recovery days are muted; everything else uses the
// active chapter's accent. Detection is keyword-based on the day title + blocks.

import { ChapterTheme } from "./chapterStore";

export type DayType = "boss" | "team" | "volume" | "recovery" | "default";

// Per-chapter title font (Fase 2). Curated faces loaded from Google Fonts in
// index.html; "custom" resolves to an admin-uploaded face (see lib/customFont).
// "default" keeps the standard brutalist face (the generator always uses this).
export const FONT_FAMILY: Record<string, string> = {
  default: "",
  diablo: "'Pirata One', 'UnifrakturCook', serif",
  sunkenrock: "'Black Ops One', 'Bangers', system-ui",
  cinzel: "'Cinzel Decorative', serif",
  metal: "'Metal Mania', system-ui",
  comic: "'Bangers', system-ui",
  gothic: "'UnifrakturCook', 'Pirata One', serif",
  custom: "'NexusL4Custom', system-ui",
};

// Options offered in the admin font picker (in display order).
export const FONT_OPTIONS: { key: string; label: string }[] = [
  { key: "default", label: "Estándar" },
  { key: "diablo", label: "Diablo (blackletter)" },
  { key: "sunkenrock", label: "Sun Ken Rock (impacto)" },
  { key: "cinzel", label: "Cinzel (épica)" },
  { key: "metal", label: "Metal Mania" },
  { key: "comic", label: "Cómic (Bangers)" },
  { key: "gothic", label: "Gótica" },
  { key: "custom", label: "Personalizada (subida)" },
];

export function fontFamilyFor(fontKey: string | undefined): string {
  return FONT_FAMILY[fontKey || "default"] || "";
}

const strip = (s: string) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Classify a day from its title + (optionally) its block text. */
export function detectDayType(title: string, blockText = ""): DayType {
  const s = strip(`${title} ${blockText}`);
  // Recovery intent overrides everything (a "Boss (Recuperación)" day is a rest day).
  if (/\b(descanso|recuperaci|deload|regenera|portal|flush|cicatrices|vigilancia|meditaci|mente de agua|tejido blando)/.test(s)) return "recovery";
  // A real boss BATTLE — not the word "boss" used thematically ("La Furia del
  // Boss"). Requires an explicit battle marker: boss fight, solo run, the final
  // assault, or the recurring boss name (sindicato).
  if (/boss fight|solo run|asalto final|final boss|\bsub-?jefe\b|jefe principal|sindicato/.test(s)) return "boss";
  if (/\b(team|equipo|pareja|parejas|sincro|synchro|i go|you go|relevos|clan|co-?op|compa[nñ])/.test(s)) return "team";
  if (/\b(volumen|chipper|resistencia bruta|prueba de resiliencia|grunt)/.test(s)) return "volume";
  return "default";
}

export interface DayVisual {
  type: DayType;
  /** CSS gradient for the central band / title backdrop. */
  band: string;
  /** accent color used for the status dot, glow. */
  accent: string;
  /** text-shadow glow for the title. */
  glow: string;
}

const VISUALS: Record<Exclude<DayType, "default">, Omit<DayVisual, "type">> = {
  boss: {
    band: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(239,68,68,0.55) 0%, rgba(127,29,29,0.5) 45%, rgba(14,14,17,0.98) 95%)",
    accent: "#ef4444",
    glow: "0 0 16px #ef4444, 0 0 34px #b91c1c, 0 0 60px #7f1d1d, 0 0 6px #000",
  },
  team: {
    band: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(34,197,94,0.5) 0%, rgba(20,83,45,0.5) 45%, rgba(14,14,17,0.98) 95%)",
    accent: "#22c55e",
    glow: "0 0 16px #22c55e, 0 0 34px #15803d, 0 0 60px #14532d, 0 0 6px #000",
  },
  volume: {
    band: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(251,146,60,0.55) 0%, rgba(124,45,18,0.5) 45%, rgba(14,14,17,0.98) 95%)",
    accent: "#fb923c",
    glow: "0 0 16px #fb923c, 0 0 34px #ea580c, 0 0 60px #7c2d12, 0 0 6px #000",
  },
  recovery: {
    band: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(45,212,191,0.4) 0%, rgba(15,118,110,0.4) 45%, rgba(14,14,17,0.98) 95%)",
    accent: "#2dd4bf",
    glow: "0 0 12px #2dd4bf, 0 0 26px #0d9488, 0 0 6px #000",
  },
};

/** Resolve the visual for a day, falling back to the chapter accent. */
export function dayVisual(title: string, chapter: ChapterTheme, blockText = ""): DayVisual {
  const type = detectDayType(title, blockText);
  if (type !== "default") return { type, ...VISUALS[type] };
  const a = chapter.accent;
  return {
    type,
    band: `radial-gradient(circle at var(--mx,50%) var(--my,50%), ${a}88 0%, ${chapter.band}cc 45%, rgba(14,14,17,0.98) 95%)`,
    accent: a,
    glow: `0 0 15px ${a}, 0 0 32px ${chapter.band}, 0 0 6px #000`,
  };
}
