import React from "react";
import type { BlockIntention } from "../types/workout";

// Prescribed RPE target band per mesocycle week (same progression as the cycle
// definition in RpeProgressionSection: acumulación→intensificación→pico→deload).
// Overlaid on the real weekly RPE chart so "prescrito vs real" reads in one view.
export const WEEK_RPE_TARGET: Record<string, { min: number; max: number }> = {
  w1: { min: 6, max: 7 },
  w2: { min: 7, max: 8 },
  w3: { min: 8, max: 9 },
  w4: { min: 5, max: 6 },
};

// Banda RPE por INTENCIÓN del bloque (independiente del layout fijo w1–w4). Cuando
// el capítulo declara (o infiere) su intención, la autorregulación usa esta banda
// en vez de asumir la progresión clásica por número de semana.
export const INTENTION_RPE_BAND: Record<BlockIntention, { min: number; max: number }> = {
  acumulacion: { min: 6, max: 8 },
  intensificacion: { min: 7, max: 9 },
  realizacion: { min: 8, max: 9.5 },
  restauracion: { min: 4, max: 6 },
};

// Brutalist vibrant background color bands mapping per week
export const WEEK_COLOR_MAPPING: Record<string, string> = {
  w1: "bg-neon-pink", // rosa
  w2: "bg-neon-orange", // naranja
  w3: "bg-neon-green", // verde
  w4: "bg-neon-cyan", // cian
};

// Complementary accent colors for blocks/highlights per week, in perfect sync with the center band
// PRVN monochrome: las semanas se distinguen por tipografía y estructura, no
// por color. Blanco uniforme con halo mínimo; la señal roja queda para RPE/PRs.
export const WEEK_ACCENT_COLORS: Record<string, { color: string; shadow: string }> = {
  w1: { color: "#FFFFFF", shadow: "0 0 0 1px rgba(255,255,255,0.25)" },
  w2: { color: "#FFFFFF", shadow: "0 0 0 1px rgba(255,255,255,0.25)" },
  w3: { color: "#FFFFFF", shadow: "0 0 0 1px rgba(255,255,255,0.25)" },
  w4: { color: "#DC2626", shadow: "0 0 0 1px rgba(220,38,38,0.35)" }, // deload marcada en rojo señal
};

// Claves legacy remapeadas a la paleta monocroma (blanco/grises + rojo señal).
export const ACCENT_COLORS_MAP: Record<string, { color: string; shadow: string }> = {
  "electric-blue": { color: "#FFFFFF", shadow: "0 0 0 1px rgba(255,255,255,0.25)" },
  "neon-green": { color: "#FFFFFF", shadow: "0 0 0 1px rgba(255,255,255,0.25)" },
  "royal-purple": { color: "#A3A3A3", shadow: "0 0 0 1px rgba(163,163,163,0.3)" },
  "neon-pink": { color: "#DC2626", shadow: "0 0 12px 1px rgba(220,38,38,0.4)" },
  "neon-orange": { color: "#DC2626", shadow: "0 0 12px 1px rgba(220,38,38,0.4)" },
  "neon-cyan": { color: "#D4D4D4", shadow: "0 0 0 1px rgba(212,212,212,0.3)" },
};

// High-contrast, vibrant complementary colored bands in perfect dualistic balance with each week's glowing accent border
export const WEEK_MID_BAND_COLORS: Record<
  string,
  { bg: string; text: string; bgStyle: React.CSSProperties }
> = {
  // PRVN: banda estructural, no fluorescente. w4 (deload) invertida en blanco.
  w1: {
    bg: "#1A1A1A",
    text: "#FFFFFF",
    bgStyle: { background: "linear-gradient(90deg, #1F1F1F 0%, #0F0F0F 100%)" },
  },
  w2: {
    bg: "#1A1A1A",
    text: "#FFFFFF",
    bgStyle: { background: "linear-gradient(90deg, #1F1F1F 0%, #0F0F0F 100%)" },
  },
  w3: {
    bg: "#1A1A1A",
    text: "#FFFFFF",
    bgStyle: { background: "linear-gradient(90deg, #1F1F1F 0%, #0F0F0F 100%)" },
  },
  w4: {
    bg: "#FFFFFF",
    text: "#0A0A0A",
    bgStyle: { background: "linear-gradient(90deg, #FFFFFF 0%, #D4D4D4 100%)" },
  },
};

// Helper to calculate the active program week dynamically based on the current date
export const getWeekOfProgram = (date: Date = new Date()) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  // Week of year must be offset by the weekday of Jan 1st (not of `date`),
  // so every Mon-Sun block lands in the same week number.
  const weekOfYear = Math.ceil((oneJan.getDay() + 1 + numberOfDays) / 7);
  const programWeekVal = ((weekOfYear - 1) % 4) + 1; // 1 to 4
  return `w${programWeekVal}`;
};

// --- DYNAMIC BRAND RESOLVER FOR BLOCKS AND PLANS ---
// Canonical inspiration keys. A block's `inspiration` (when classified by AI at
// import, Fase 3) stores one of these; the keyword heuristic below is the
// fallback when there is no AI key.
export type BrandKey = "HAEDO" | "MAYHEM" | "HWPO" | "PRVN";

export interface BlockBrand {
  key: BrandKey;
  name: string;
  emblem: string;
  color: string;
  border: string;
  bg: string;
  text: string;
  badgeColor: string;
  desc: string;
}

// Single source of truth for brand display data, keyed by canonical key.
export const BRANDS: Record<BrandKey, BlockBrand> = {
  HAEDO: {
    key: "HAEDO",
    name: "Ateneo Haedo 🪣",
    emblem: "🥤 ATENEO HAEDO",
    color: "#34D399", // Emerald
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/30",
    text: "text-emerald-400",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    desc: "Postura e higiene espinal clínica. ¡Post-entreno de Coca-Cola helada con el gran Balde! 🥤",
  },
  MAYHEM: {
    key: "MAYHEM",
    name: "Mayhem Nation 🔥",
    emblem: "🔥 MAYHEM NATION",
    color: "#F97316", // Orange
    border: "border-orange-500/30",
    bg: "bg-orange-950/30",
    text: "text-orange-400",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    desc: "Volumen competitivo y resiliencia cardíaca. Programación inspirada en Froning y Valentín.",
  },
  HWPO: {
    key: "HWPO",
    name: "HWPO Grind ⛓️",
    emblem: "⛓️ HWPO GRIND",
    color: "#EF4444", // Red
    border: "border-red-500/30",
    bg: "bg-red-950/30",
    text: "text-red-400",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    desc: "Grind implacable de Mat Fraser. Fuerza bruta acumulada y accesorios de alta tensión.",
  },
  PRVN: {
    key: "PRVN",
    name: "PRVN Affiliate 🧬",
    emblem: "🧬 PRVN PROTOCOL",
    color: "#06B6D4", // Cyan
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/30",
    text: "text-cyan-400",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    desc: "Metrónomo de intervalos de Tia-Clair Toomey. Velocidad pura de barra y gimnasia higiénica.",
  },
};

/** Look a brand up by stored inspiration key (AI-classified). Falls back to PRVN. */
export function brandByKey(key?: string): BlockBrand {
  const k = (key || "").toUpperCase();
  return BRANDS[(k as BrandKey)] || BRANDS.PRVN;
}

/** Keyword heuristic → canonical brand key (the fallback when no AI is configured). */
export function resolveBlockBrandKey(
  tabName: string = "",
  blockTitle: string = "",
  items: string[] = [],
): BrandKey {
  const tabLower = tabName.toLowerCase();
  const titleLower = blockTitle.toLowerCase();
  const itemsText = items.join(" ").toLowerCase();

  // 1. Ateneo Haedo: haedo, luk, lucas, balde
  if (
    tabLower.includes("haedo") ||
    tabLower.includes("luk") ||
    titleLower.includes("haedo") ||
    itemsText.includes("haedo") ||
    itemsText.includes("lucas") ||
    itemsText.includes("balde")
  ) {
    return "HAEDO";
  }

  // 2. Mayhem Nation (Valentín / Team format): san justo, valentin, sincro, equipo, mayhem
  if (
    tabLower.includes("san justo") ||
    tabLower.includes("justo") ||
    tabLower.includes("murph") ||
    titleLower.includes("sincro") ||
    titleLower.includes("equipo") ||
    titleLower.includes("san justo") ||
    itemsText.includes("sincro") ||
    itemsText.includes("valentín") ||
    itemsText.includes("san justo") ||
    itemsText.includes("mayhem") ||
    itemsText.includes("compañero") ||
    itemsText.includes("relevos")
  ) {
    return "MAYHEM";
  }

  // 3. HWPO Grind (Mat Fraser): hwpo, grind, fraser, pesado, deadlift, back squat
  if (
    tabLower.includes("grind") ||
    tabLower.includes("hwpo") ||
    titleLower.includes("grind") ||
    itemsText.includes("hwpo") ||
    itemsText.includes("fraser") ||
    itemsText.includes("pesado") ||
    itemsText.includes("deadlift") ||
    itemsText.includes("back squat") ||
    itemsText.includes("hipertrofia") ||
    itemsText.includes("forja de charsi") ||
    itemsText.includes("clean pull")
  ) {
    return "HWPO";
  }

  // 4. Default: PRVN Affiliate (precision/intervals).
  return "PRVN";
}

export const resolveBlockBrand = (
  tabName: string = "",
  blockTitle: string = "",
  items: string[] = [],
): BlockBrand => BRANDS[resolveBlockBrandKey(tabName, blockTitle, items)];

export const MASTER_ACHIEVEMENTS = [
  {
    id: "first_day",
    title: "Iniciación L4 ⚡",
    description:
      "Completaste tu primer misión diaria de entrenamiento físico en el pizarrón.",
    icon: "⚡",
    rarity: "COMÚN",
    color: "#00F0FF", // Electric Blue
  },
  {
    id: "five_days",
    title: "Espíritu Mayhem 🔥",
    description:
      "Has acumulado al menos 5 misiones completadas. El espíritu de Froning está contigo.",
    icon: "🔥",
    rarity: "RARO",
    color: "#FBBF24", // Amber
  },
  {
    id: "perfect_week",
    title: "Magnesio Puro 🏆",
    description:
      "Semana dorada perfecta: has completado los 7 días de entrenamiento técnico.",
    icon: "🏆",
    rarity: "ÉLITE",
    color: "#10B981", // Emerald
  },
  {
    id: "clinical_sec",
    title: "Misión Impecable 🧪",
    description:
      "Completaste una misión secundaria habilitando todas las validaciones clínicas L4 (ROM, BIO, RPE).",
    icon: "🧪",
    rarity: "ÉLITE",
    color: "#A78BFA", // Purple
  },
  {
    id: "fraser_grind",
    title: "Hijo de Fraser ⛓️",
    description:
      'Elegiste el perfil "HWPO Grind" o entrenaste con un nivel de auto-explicación técnica pesada (RPE >= 8.5).',
    icon: "⛓️",
    rarity: "LEYENDA",
    color: "#EF4444", // Red
  },
  {
    id: "adaptive_coke",
    title: "Cazador de Cocas 🥤",
    description:
      'Habilitaste el perfil adaptativo "Haedo" inspirado en Balde. ¡Salud postural y una Coca-Cola post-entreno!',
    icon: "🥤",
    rarity: "RARO",
    color: "#34D399", // Mint
  },
];
