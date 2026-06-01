import React from "react";

// Brutalist vibrant background color bands mapping per week
export const WEEK_COLOR_MAPPING: Record<string, string> = {
  w1: "bg-neon-pink", // rosa
  w2: "bg-neon-orange", // naranja
  w3: "bg-neon-green", // verde
  w4: "bg-neon-cyan", // cian
};

// Complementary accent colors for blocks/highlights per week, in perfect sync with the center band
export const WEEK_ACCENT_COLORS: Record<string, { color: string; shadow: string }> = {
  w1: {
    color: "#00F0FF", // Cyan (Complement to Pink)
    shadow: "0 0 15px 2px rgba(0, 240, 255, 0.6)",
  },
  w2: {
    color: "#BD00FF", // Electric Purple (Complement to Yellow/Lime)
    shadow: "0 0 15px 2px rgba(189, 0, 255, 0.6)",
  },
  w3: {
    color: "#FF007F", // Neon Pink (Complement to Neon Green)
    shadow: "0 0 15px 2px rgba(255, 0, 127, 0.6)",
  },
  w4: {
    color: "#FF5A00", // Neon Orange (Complement to Neon Cyan)
    shadow: "0 0 15px 2px rgba(255, 90, 0, 0.6)",
  },
};

export const ACCENT_COLORS_MAP: Record<string, { color: string; shadow: string }> = {
  "electric-blue": {
    color: "#1F51FF",
    shadow: "0 0 15px 2px rgba(31, 81, 255, 0.6)",
  },
  "neon-green": {
    color: "#39FF14",
    shadow: "0 0 15px 2px rgba(57, 255, 20, 0.6)",
  },
  "royal-purple": {
    color: "#BD00FF",
    shadow: "0 0 15px 2px rgba(189, 0, 255, 0.6)",
  },
  "neon-pink": {
    color: "#FF007F",
    shadow: "0 0 15px 2px rgba(255, 0, 127, 0.6)",
  },
  "neon-orange": {
    color: "#FF5A00",
    shadow: "0 0 15px 2px rgba(255, 90, 0, 0.6)",
  },
  "neon-cyan": {
    color: "#00F0FF",
    shadow: "0 0 15px 2px rgba(0, 240, 255, 0.6)",
  },
};

// High-contrast, vibrant complementary colored bands in perfect dualistic balance with each week's glowing accent border
export const WEEK_MID_BAND_COLORS: Record<
  string,
  { bg: string; text: string; bgStyle: React.CSSProperties }
> = {
  w1: {
    bg: "#FF007F", // Vivid Neon Pink/Rose complementary to Cyan accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #FF007F 0%, #E11D48 100%)" },
  },
  w2: {
    bg: "#39FF14", // Vibrant Neon Lime complementary to Purple accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #39FF14 0%, #15B300 100%)" },
  },
  w3: {
    bg: "#00F0FF", // Electrifying Cyan complementary to Pink accent
    text: "#000000",
    bgStyle: { background: "linear-gradient(90deg, #00F0FF 0%, #0369A1 100%)" },
  },
  w4: {
    bg: "#BD00FF", // Royal Purple complementary to Orange accent
    text: "#ffffff",
    bgStyle: { background: "linear-gradient(90deg, #BD00FF 0%, #6D28D9 100%)" },
  },
};

// Helper to calculate the active program week dynamically based on the current date
export const getWeekOfProgram = (date: Date = new Date()) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekOfYear = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
  const programWeekVal = ((weekOfYear - 1) % 4) + 1; // 1 to 4
  return `w${programWeekVal}`;
};

// --- DYNAMIC BRAND RESOLVER FOR BLOCKS AND PLANS ---
export const resolveBlockBrand = (
  tabName: string = "",
  blockTitle: string = "",
  items: string[] = [],
) => {
  const tabLower = tabName.toLowerCase();
  const titleLower = blockTitle.toLowerCase();
  const itemsText = items.join(" ").toLowerCase();

  // 1. Ateneo Haedo: Look for words like haedo, luk, lucas, balde, co-op con luk, soga, psoas, o fregar
  if (
    tabLower.includes("haedo") ||
    tabLower.includes("luk") ||
    titleLower.includes("haedo") ||
    itemsText.includes("haedo") ||
    itemsText.includes("lucas") ||
    itemsText.includes("balde")
  ) {
    return {
      name: "Ateneo Haedo 🪣",
      emblem: "🥤 ATENEO HAEDO",
      color: "#34D399", // Emerald
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/30",
      text: "text-emerald-400",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      desc: "Postura e higiene espinal clínica. ¡Post-entreno de Coca-Cola helada con el gran Balde! 🥤",
    };
  }

  // 2. Mayhem Nation (Valentín / Team format): Look for words like san justo, valentin, sincro, equipo, chipper, team, mayhem, fiter
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
    return {
      name: "Mayhem Nation 🔥",
      emblem: "🔥 MAYHEM NATION",
      color: "#F97316", // Orange
      border: "border-orange-500/30",
      bg: "bg-orange-950/30",
      text: "text-orange-400",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      desc: "Volumen competitivo y resiliencia cardíaca. Programación inspirada en Froning y Valentín.",
    };
  }

  // 3. HWPO Grind (Mat Fraser): Look for words like hwpo, grind, fraser, pesado, deadlift, rm, squat pesado, clean pulls, clean pesado
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
    return {
      name: "HWPO Grind ⛓️",
      emblem: "⛓️ HWPO GRIND",
      color: "#EF4444", // Red
      border: "border-red-500/30",
      bg: "bg-red-950/30",
      text: "text-red-400",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      desc: "Grind implacable de Mat Fraser. Fuerza bruta acumulada y accesorios de alta tensión.",
    };
  }

  // 4. Default: PRVN Affiliate (Toomey's style of precision/intervals): Double unders, bar speed, intervals, precision
  return {
    name: "PRVN Affiliate 🧬",
    emblem: "🧬 PRVN PROTOCOL",
    color: "#06B6D4", // Cyan
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/30",
    text: "text-cyan-400",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    desc: "Metrónomo de intervalos de Tia-Clair Toomey. Velocidad pura de barra y gimnasia higiénica.",
  };
};

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
