// Autoregulation engine — turns a Puntaje Nexus into PROPOSED load adjustments
// for the next week, via the Working-Max lever (no program JSON mutation). Pure;
// the UI applies the proposals only on explicit athlete confirmation.
//
// Safety veto (enciclopedia, jerarquía salud>recuperación>adherencia>rendimiento):
// high ACWR or a near-max RPE in the week FORBIDS up-regulation — only hold or
// down. A PR is a measured fact, so a pr-bump is always allowed.

import type { NexusScore } from "./nexusScore";

export type AdjustKind = "wm-up" | "wm-down" | "pr-bump";

export interface Adjustment {
  exerciseId: string;
  name: string;
  kind: AdjustKind;
  /** % change to the Working-Max factor (wm-up/down); 0 for pr-bump */
  deltaPct: number;
  /** for pr-bump: proposed new 1RM in kg */
  newOneRmKg?: number;
  reason: string;
}

export interface AutoregResult {
  vetoed: boolean;
  vetoReason?: string;
  adjustments: Adjustment[];
}

const UP_STEP = 2.5; // % per week, conservative
const DOWN_STEP = -5;

export function proposeAdjustments(
  score: NexusScore,
  opts: { acwr?: number | null } = {},
): AutoregResult {
  const acwr = opts.acwr ?? null;
  const highAcwr = acwr != null && acwr > 1.4;
  const nearMaxRpe = score.maxRpe >= 9.5;
  const vetoed = highAcwr || nearMaxRpe;
  const vetoReason = highAcwr
    ? `ACWR ${acwr} > 1.4 (carga aguda alta)`
    : nearMaxRpe
      ? `RPE ${score.maxRpe} en la semana (cerca del máximo)`
      : undefined;

  const adjustments: Adjustment[] = [];

  for (const lift of score.lifts) {
    if (lift.perf === "bajo" && lift.sets >= 2) {
      if (vetoed) {
        adjustments.push({
          exerciseId: lift.exerciseId, name: lift.name, kind: "wm-up", deltaPct: 0,
          reason: `Fácil (RPE ${lift.avgRpe} vs objetivo ${lift.targetMid}) pero VETADO: ${vetoReason}. Mantener.`,
        });
      } else {
        adjustments.push({
          exerciseId: lift.exerciseId, name: lift.name, kind: "wm-up", deltaPct: UP_STEP,
          reason: `RPE ${lift.avgRpe} por debajo del objetivo ${lift.targetMid} en ${lift.sets} series → subir Working Max ${UP_STEP}%.`,
        });
      }
    } else if (lift.perf === "sobre") {
      adjustments.push({
        exerciseId: lift.exerciseId, name: lift.name, kind: "wm-down", deltaPct: DOWN_STEP,
        reason: `RPE ${lift.avgRpe} por encima del objetivo ${lift.targetMid} → bajar Working Max ${DOWN_STEP}% para preservar técnica.`,
      });
    }
  }

  for (const pr of score.prs) {
    adjustments.push({
      exerciseId: pr.exerciseId, name: pr.name, kind: "pr-bump", deltaPct: 0,
      newOneRmKg: pr.e1rm,
      reason: pr.current != null
        ? `PR estimado ${pr.e1rm}kg supera tu 1RM actual (${pr.current}kg) → actualizar marca.`
        : `PR estimado ${pr.e1rm}kg y sin 1RM cargado → establecer marca.`,
    });
  }

  return { vetoed, vetoReason, adjustments };
}
