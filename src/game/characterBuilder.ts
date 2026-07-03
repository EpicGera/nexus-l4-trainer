/**
 * NEXUS: EL ABISMO — character builder.
 *
 * The single data boundary of the game: takes the canonical athlete stats
 * (computeAthleteStats) plus the real logged movement names and produces the
 * GameCharacter the engine consumes. Pure and deterministic — the game itself
 * never reads localStorage or Firestore.
 *
 * Golden rule: nothing is bought, everything is trained. Every number here
 * must trace back to something the athlete actually did in the box.
 */

import { AthleteStatsDoc } from "../lib/athleteStats";
import { cleanExerciseLabel } from "../lib/historyUtils";
import { detectSkills, pickLoadout, UnlockedSkill } from "./skills";
import { Cosmetic, unlockCosmetics } from "./cosmetics";

export interface GameCharacter {
  identity: string;
  rank: string;
  level: number;
  /** max hit points — from training consistency */
  vitality: number;
  /** base damage — from the best real PR */
  power: number;
  /** max willpower (skill resource) — from accumulated tonnage */
  stamina: number;
  /** willpower regen per second */
  staminaRegen: number;
  /** crit chance 0..1 — from RPE discipline */
  critChance: number;
  /** movement speed in world units/s — from achievements & quests */
  moveSpeed: number;
  /** powers unlocked by real logged movements */
  skills: UnlockedSkill[];
  /** loadout actually equipped for a rift (max 4) */
  loadout: UnlockedSkill[];
  /** reliquias visuales por logros reales — jamás tocan stats */
  cosmetics: Cosmetic[];
}

const RANKS: { xp: number; name: string }[] = [
  { xp: 0, name: "RECLUTA" },
  { xp: 1000, name: "GUERRERO" },
  { xp: 1500, name: "CENTURIÓN" },
  { xp: 2500, name: "GLADIADOR" },
  { xp: 4000, name: "CAMPEÓN" },
  { xp: 6000, name: "LEYENDA" },
  { xp: 10000, name: "TITÁN" },
];

function rankFor(xp: number): string {
  let current = RANKS[0].name;
  for (const r of RANKS) {
    if (xp >= r.xp) current = r.name;
    else break;
  }
  return current;
}

/**
 * Scan localStorage for every movement the athlete has logged, with its best
 * weight. Mirrors the key derivation used across the app
 * (`nexus_logs_<dayId>_<Exercise_Name>`); prefers the clean `exName` stored
 * in each set when present.
 */
export function collectLoggedMovements(): { name: string; prKg: number }[] {
  const best = new Map<string, number>();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("nexus_logs_")) continue;

      let sets: any[];
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        sets = parsed;
      } catch {
        continue;
      }

      const withoutPrefix = key.slice("nexus_logs_".length);
      const firstUnderscore = withoutPrefix.indexOf("_");
      const derivedName =
        firstUnderscore === -1
          ? ""
          : withoutPrefix.slice(firstUnderscore + 1).replace(/_/g, " ");

      sets.forEach((set) => {
        const name =
          (set?.exName && String(set.exName).trim()) ||
          cleanExerciseLabel(derivedName) ||
          derivedName;
        if (!name) return;
        const weightMatch = String(set?.weight ?? "").match(/(\d+(?:\.\d+)?)/);
        const kg = weightMatch ? parseFloat(weightMatch[1]) : 0;
        const prev = best.get(name) ?? -1;
        if (kg > prev) best.set(name, kg);
      });
    }
  } catch {
    /* localStorage unavailable — return what we have */
  }

  return Array.from(best.entries()).map(([name, prKg]) => ({
    name,
    prKg: Math.max(0, prKg),
  }));
}

/**
 * Build the Eco from real data. All formulas are intentionally simple and
 * monotonic: more real training always means a stronger character.
 */
export function buildCharacter(
  stats: AthleteStatsDoc,
  movements: { name: string; prKg: number }[],
): GameCharacter {
  const bestPr = Object.values(stats.prs).reduce(
    (max, pr) => Math.max(max, pr.weightKg),
    0,
  );

  // VITALIDAD: 120 base + 12 per completed day + 60 per perfect week (cap 999)
  const vitality = Math.min(
    999,
    120 + stats.daysCompleted * 12 + stats.perfectWeeks * 60,
  );

  // PODER: 8 base + 0.45 per kg of best PR (cap 150)
  const power = Math.min(150, Math.round(8 + bestPr * 0.45));

  // AGUANTE: 80 base + 1 per 500kg of total tonnage (cap 250); regen scales mildly
  const stamina = Math.min(250, 80 + Math.floor(stats.totalVolumeKg / 500));
  const staminaRegen = 6 + Math.min(10, stats.totalSets / 50);

  // TÉCNICA: crit from RPE discipline — closer avgRpe is to 7.5, sharper the Eco.
  // No data → modest 5%.
  let critChance = 0.05;
  if (stats.avgRpe !== null) {
    const closeness = Math.max(0, 3 - Math.abs(stats.avgRpe - 7.5)) / 3; // 0..1
    critChance = 0.05 + closeness * 0.3; // 5%..35%
  }

  // VOLUNTAD: speed from achievements + quests (190..260 units/s)
  const willScore = Math.min(12, stats.achievements.length + stats.questsCompleted);
  const moveSpeed = 190 + willScore * 6;

  const skills = detectSkills(movements);
  const loadout = pickLoadout(skills);

  // Level: same XP economy as the app (800 base + 100/day + quest XP)
  const level = Math.max(1, Math.floor(stats.xpTotal / 400));

  return {
    identity: stats.identity || "ATLETA NEXUS",
    rank: rankFor(stats.xpTotal),
    level,
    vitality,
    power,
    stamina,
    staminaRegen,
    critChance: Math.round(critChance * 1000) / 1000,
    moveSpeed,
    skills,
    loadout,
    cosmetics: unlockCosmetics({
      perfectWeeks: stats.perfectWeeks,
      bestPrKg: bestPr,
      daysCompleted: stats.daysCompleted,
    }),
  };
}
