/**
 * NEXUS: EL ABISMO — Fase 2 Hito 2: mecánicas puras de los enemigos nuevos.
 *
 * LA LESIÓN — manifestación de entrenar lastimado: su golpe aplica un debuff
 * visible de movilidad por tiempo; se limpia al cambiar de acto.
 * EL PLATEAU — manifestación del estancamiento: escudo que SOLO rompen los
 * golpes críticos (hace que TÉCNICA/RPE real importe). Sin críticos, el
 * escudo se regenera; una vez roto, queda roto.
 *
 * Puro y testeado; el engine solo aplica los resultados.
 */

// ── LA LESIÓN ───────────────────────────────────────────────────────────────
export const LESION_DEBUFF_SEC = 4;
export const LESION_SLOW_FACTOR = 0.6; // multiplicador de velocidad del Eco

// ── EL PLATEAU ──────────────────────────────────────────────────────────────
export const PLATEAU_REGEN_DELAY_SEC = 3; // sin críticos recibidos → regenera
export const PLATEAU_REGEN_PER_SEC = 26;

/** Solo los críticos muerden el escudo; el resto rebota. */
export function plateauShieldAfterHit(shield: number, dmg: number, crit: boolean): number {
  if (shield <= 0) return 0;
  return crit ? Math.max(0, shield - dmg) : shield;
}

/** Regenera solo si sigue en pie (roto queda roto) y hace rato no recibe crítico. */
export function plateauShieldRegen(
  shield: number,
  maxShield: number,
  sinceCritSec: number,
  dt: number,
): number {
  if (shield <= 0 || shield >= maxShield) return shield;
  if (sinceCritSec < PLATEAU_REGEN_DELAY_SEC) return shield;
  return Math.min(maxShield, shield + PLATEAU_REGEN_PER_SEC * dt);
}

// ── ÉLITES ── sombras marcadas (◆): más grandes, más letales, mejor botín.
export const ELITE_CHANCE = 0.1;

export interface EliteBase {
  hp: number;
  damage: number;
  radius: number;
  speed: number;
}

/** Escala una sombra a élite. Más lenta pero mucho más peligrosa. */
export function applyElite<T extends EliteBase>(e: T): T {
  return {
    ...e,
    hp: Math.round(e.hp * 2.2),
    damage: Math.round(e.damage * 1.5),
    radius: Math.round(e.radius * 1.35),
    speed: Math.round(e.speed * 0.85),
  };
}

// ── ORBES DE VIDA ── botín Diablo-style: curan un % de la vitalidad.
export const ORB_HEAL_FRAC = 0.08;
export const ORB_MAGNET_RADIUS = 110; // px: el orbe vuela hacia el Eco
export const ORB_PICKUP_RADIUS = 22;

/** ¿Cuántos orbes suelta una sombra al morir? (roll ∈ [0,1)) */
export function orbDropCount(
  kind: "minion" | "brute" | "boss" | "lesion" | "plateau",
  elite: boolean,
  roll: number,
): number {
  if (kind === "boss") return 5;
  if (kind === "plateau") return 3;
  if (elite) return 2;
  if (kind === "brute" || kind === "lesion") return roll < 0.45 ? 1 : 0;
  return roll < 0.22 ? 1 : 0;
}

// ── COMBO ── bajas encadenadas dentro de la ventana suman racha.
export const COMBO_WINDOW_SEC = 2.5;
export const COMBO_MIN_SHOW = 3;

// ── plan de spawns por acto ─────────────────────────────────────────────────
export interface SpawnPlan {
  /** Probabilidad por sala de que aparezca LA LESIÓN (desde el acto 2). */
  lesionChancePerRoom: number;
  /** EL PLATEAU custodia el último acto (mini-jefe). */
  plateauOnFloor: boolean;
}

export function spawnPlanForDepth(depth: number, totalFloors: number): SpawnPlan {
  return {
    lesionChancePerRoom: depth >= 2 ? 0.35 : 0,
    plateauOnFloor: totalFloors >= 2 && depth >= totalFloors,
  };
}
