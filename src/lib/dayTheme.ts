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

// Estética adulta: escala de grises con UN acento (rojo señal solo para boss).
// El tipo de día se comunica por el chip textual del subheader, no por glow de
// color. Bandas sutiles y un solo layer de sombra (máx 12px).
const GRAY_BAND =
  "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 45%, rgba(10,10,10,0.98) 95%)";
const GRAY_GLOW = "0 0 10px rgba(0,0,0,0.6)";

const VISUALS: Record<Exclude<DayType, "default">, Omit<DayVisual, "type">> = {
  boss: {
    band: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(220,38,38,0.35) 0%, rgba(127,29,29,0.30) 45%, rgba(10,10,10,0.98) 95%)",
    accent: "#DC2626",
    glow: "0 0 12px rgba(220,38,38,0.55), 0 0 6px #000",
  },
  team: { band: GRAY_BAND, accent: "#FAFAFA", glow: GRAY_GLOW },
  volume: { band: GRAY_BAND, accent: "#FAFAFA", glow: GRAY_GLOW },
  recovery: { band: GRAY_BAND, accent: "#A1A1AA", glow: GRAY_GLOW },
};

/** Resolve the visual for a day, falling back to a neutral mono band. */
export function dayVisual(title: string, chapter: ChapterTheme, blockText = ""): DayVisual {
  const type = detectDayType(title, blockText);
  if (type !== "default") return { type, ...VISUALS[type] };
  return { type, band: GRAY_BAND, accent: chapter.accent, glow: GRAY_GLOW };
}
