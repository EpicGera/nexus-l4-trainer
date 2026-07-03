/**
 * NEXUS: EL ABISMO — Fase 2 Hito 3: loot cosmético por logros reales.
 *
 * Regla de oro intacta: nada se compra, todo se entrena. Las reliquias son
 * PURAMENTE visuales — este tipo no tiene campos de stats a propósito; si
 * alguna vez los tiene, se rompió el contrato de diseño.
 */

export interface Cosmetic {
  id: string;
  kind: "aura" | "trail" | "mark";
  name: string;
  /** color CSS de la reliquia (anillo, estela o marca de HUD) */
  color: string;
  /** el logro real que la desbloqueó, para mostrarlo en el resumen */
  source: string;
}

export interface CosmeticInput {
  perfectWeeks: number;
  bestPrKg: number;
  daysCompleted: number;
}

export function unlockCosmetics(i: CosmeticInput): Cosmetic[] {
  const out: Cosmetic[] = [];
  if (i.perfectWeeks >= 1) {
    out.push({
      id: "aura-forjada",
      kind: "aura",
      name: "AURA FORJADA",
      color: "#f59e0b",
      source: `${i.perfectWeeks} semana${i.perfectWeeks > 1 ? "s" : ""} perfecta${i.perfectWeeks > 1 ? "s" : ""}`,
    });
  }
  if (i.bestPrKg > 0) {
    out.push({
      id: "estela-voltaica",
      kind: "trail",
      name: "ESTELA VOLTAICA",
      color: "#38bdf8",
      source: `PR real de ${i.bestPrKg} kg`,
    });
  }
  if (i.daysCompleted >= 20) {
    out.push({
      id: "marca-inquebrantable",
      kind: "mark",
      name: "MARCA INQUEBRANTABLE",
      color: "#dc2626",
      source: `${i.daysCompleted} días completados`,
    });
  }
  return out;
}
