/**
 * NEXUS: EL ABISMO — skill catalog.
 *
 * Every CrossFit movement pattern the athlete has actually logged unlocks a
 * power for their Eco. Detection is by name pattern against the real exercise
 * names found in the training log; power scales with the real PR (kg) of the
 * movement that unlocked it.
 */

export type SkillArchetype =
  | "slam" // AoE around the player
  | "dash" // lightning dash with damage along the path
  | "pull" // drags enemies toward the player + damage
  | "burst" // knockback explosion
  | "strike" // high single-target damage
  | "projectile" // wave projectile toward facing
  | "spin" // wide-radius spin damage
  | "speed" // temporary speed buff
  | "guard" // temporary armor buff
  | "heal"; // self-heal (once per rift)

export interface SkillDef {
  id: string;
  name: string;
  /** Spanish flavor line shown in the HUD/intro */
  flavor: string;
  archetype: SkillArchetype;
  /** regexes matched (case-insensitive) against logged exercise names */
  patterns: RegExp[];
  /** base damage/effect multiplier vs the character's PODER stat */
  powerMult: number;
  /** willpower (energy) cost */
  cost: number;
  /** cooldown in milliseconds */
  cooldownMs: number;
  /** icon glyph for HUD buttons */
  glyph: string;
  /** equip priority when more than 4 are unlocked (higher first) */
  priority: number;
}

export const SKILL_CATALOG: SkillDef[] = [
  {
    id: "falla_sismica",
    name: "FALLA SÍSMICA",
    flavor: "Tu peso muerto parte el asfalto del Abismo.",
    archetype: "slam",
    patterns: [/dead\s*lift/i, /deadlift/i, /peso\s*muerto/i],
    powerMult: 1.6,
    cost: 30,
    cooldownMs: 5000,
    glyph: "⛏",
    priority: 90,
  },
  {
    id: "coloso",
    name: "COLOSO",
    flavor: "La sentadilla te enseñó a no ceder terreno.",
    archetype: "guard",
    patterns: [/squat/i, /sentadilla/i],
    powerMult: 0,
    cost: 25,
    cooldownMs: 9000,
    glyph: "🛡",
    priority: 70,
  },
  {
    id: "arranque_voltaico",
    name: "ARRANQUE VOLTAICO",
    flavor: "Un snatch perfecto: del suelo al cielo en un parpadeo.",
    archetype: "dash",
    patterns: [/snatch/i, /arranque/i],
    powerMult: 1.2,
    cost: 25,
    cooldownMs: 4000,
    glyph: "⚡",
    priority: 85,
  },
  {
    id: "gravedad_inversa",
    name: "GRAVEDAD INVERSA",
    flavor: "La cargada domina lo que pesa. Acá, todo pesa hacia vos.",
    archetype: "pull",
    patterns: [/clean/i, /cargada/i],
    powerMult: 0.9,
    cost: 30,
    cooldownMs: 7000,
    glyph: "🌀",
    priority: 75,
  },
  {
    id: "prensa_celestial",
    name: "PRENSA CELESTIAL",
    flavor: "Todo lo que empujaste sobre tu cabeza ahora empuja por vos.",
    archetype: "burst",
    patterns: [/press/i, /jerk/i, /push\s*up/i, /empuje/i, /envi[oó]n/i],
    powerMult: 1.1,
    cost: 28,
    cooldownMs: 6000,
    glyph: "✦",
    priority: 72,
  },
  {
    id: "garra_ascendente",
    name: "GARRA ASCENDENTE",
    flavor: "Cada dominada fue un pacto: lo que agarrás, no se suelta.",
    archetype: "strike",
    patterns: [/pull\s*up/i, /dominada/i, /chin\s*up/i, /muscle\s*up/i],
    powerMult: 2.2,
    cost: 22,
    cooldownMs: 3500,
    glyph: "🪝",
    priority: 80,
  },
  {
    id: "propulsor",
    name: "PROPULSOR",
    flavor: "El thruster comprimido en una onda que no perdona.",
    archetype: "projectile",
    patterns: [/thruster/i, /wall\s*ball/i],
    powerMult: 1.3,
    cost: 20,
    cooldownMs: 2500,
    glyph: "◎",
    priority: 78,
  },
  {
    id: "pendulo_de_hierro",
    name: "PÉNDULO DE HIERRO",
    flavor: "El swing no termina: orbita.",
    archetype: "spin",
    patterns: [/kettlebell/i, /\bkb\b/i, /swing/i, /pesa\s*rusa/i],
    powerMult: 0.8,
    cost: 26,
    cooldownMs: 5500,
    glyph: "☄",
    priority: 65,
  },
  {
    id: "sobremarcha",
    name: "SOBREMARCHA",
    flavor: "Los metros que remaste te deben velocidad.",
    archetype: "speed",
    patterns: [/\brun\b/i, /\brow\b/i, /remo/i, /\bbike\b/i, /assault/i, /\bski\b/i, /carrera/i, /sprint/i, /cardio/i],
    powerMult: 0,
    cost: 18,
    cooldownMs: 8000,
    glyph: "»",
    priority: 60,
  },
  {
    id: "segundo_aliento",
    name: "SEGUNDO ALIENTO",
    flavor: "El burpee es la prueba: siempre te volvés a levantar.",
    archetype: "heal",
    patterns: [/burpee/i],
    powerMult: 0,
    cost: 0,
    cooldownMs: 60000,
    glyph: "♥",
    priority: 88,
  },
];

export interface UnlockedSkill extends SkillDef {
  /** the real logged movement that unlocked this power */
  sourceMovement: string;
  /** the athlete's best PR (kg) on that movement — 0 for bodyweight/cardio */
  sourcePrKg: number;
}

/**
 * Match the athlete's real logged movement names (and their PR weights)
 * against the catalog. Returns each skill at most once, keeping the
 * highest-PR source, ordered by priority desc.
 */
export function detectSkills(
  movements: { name: string; prKg: number }[],
): UnlockedSkill[] {
  const byId = new Map<string, UnlockedSkill>();

  movements.forEach(({ name, prKg }) => {
    if (!name || !name.trim()) return;
    SKILL_CATALOG.forEach((def) => {
      if (def.patterns.some((p) => p.test(name))) {
        const existing = byId.get(def.id);
        if (!existing || prKg > existing.sourcePrKg) {
          byId.set(def.id, { ...def, sourceMovement: name.trim(), sourcePrKg: prKg });
        }
      }
    });
  });

  return Array.from(byId.values()).sort((a, b) => b.priority - a.priority);
}

/** Up to 4 powers travel into a rift, picked by priority. */
export function pickLoadout(unlocked: UnlockedSkill[], max = 4): UnlockedSkill[] {
  return unlocked.slice(0, max);
}
