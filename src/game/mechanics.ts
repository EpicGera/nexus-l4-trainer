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
