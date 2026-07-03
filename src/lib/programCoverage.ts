// Fase E — cobertura del espectro (PRVN, enciclopedia V7 caps. 15-16 y 40): en una ventana de
// programa, ¿qué sistemas energéticos y dominios de tiempo toca el atleta? Las
// celdas vacías son los huecos. Usa la metadata derivada de los bloques metcon
// (Fase D), así que solo aplica a programas con `blocks[]`.

import { Database, EnergySystem, BlockTimeDomain } from "../types/workout";

export interface SpectrumCoverage {
  energy: Record<EnergySystem, number>;
  timeDomain: Record<BlockTimeDomain, number>;
  totalMetcons: number;
  /** Metcons del programa sin metadata derivable (duración no parseable) — visibles, no ocultos. */
  unclassified: number;
  /** Pure energy systems with zero exposure (mixto se excluye: es catch-all). */
  energyGaps: EnergySystem[];
  timeGaps: BlockTimeDomain[];
}

const ENERGY_PURE: EnergySystem[] = ["phosphagen", "glycolytic", "oxidative"];
const TD_ALL: BlockTimeDomain[] = ["sprint", "short", "medium", "long"];

export function programCoverage(db: Database): SpectrumCoverage {
  const energy: Record<EnergySystem, number> = { phosphagen: 0, glycolytic: 0, oxidative: 0, mixed: 0 };
  const timeDomain: Record<BlockTimeDomain, number> = { sprint: 0, short: 0, medium: 0, long: 0 };
  let total = 0;
  let unclassified = 0;

  for (const wk of Object.values(db)) {
    for (const day of wk.days) {
      for (const v of day.variations) {
        for (const b of v.blocks ?? []) {
          if (b.bucket !== "metcon") continue;
          if (!b.energySystem && !b.timeDomain) {
            unclassified++;
            continue;
          }
          total++;
          if (b.energySystem) energy[b.energySystem]++;
          if (b.timeDomain) timeDomain[b.timeDomain]++;
        }
      }
    }
  }

  return {
    energy,
    timeDomain,
    totalMetcons: total,
    unclassified,
    energyGaps: total > 0 ? ENERGY_PURE.filter((e) => energy[e] === 0) : [],
    timeGaps: total > 0 ? TD_ALL.filter((t) => timeDomain[t] === 0) : [],
  };
}
