import { useMemo } from "react";
import { Activity } from "lucide-react";
import { loadSessions } from "../../lib/sessionStore";
import { ENERGY_META, TIMEDOMAIN_META } from "../../lib/blockMeta";
import { EnergySystem, BlockTimeDomain } from "../../types/workout";
import { SectionCard, EmptyState, Pill, TXT } from "../ui/primitives";

/**
 * Achieved-stimulus distribution — the payoff of the block↔set lineage (Phase E).
 * Reads the prescribed-stimulus snapshot captured on logged metcons + sets and
 * shows how the athlete's REAL training distributed across energy systems and
 * time domains, instead of only what the program prescribed.
 */
export default function AchievedStimulusSection() {
  const data = useMemo(() => {
    const energy: Record<string, number> = {};
    const domain: Record<string, number> = {};
    let tagged = 0;

    for (const s of loadSessions()) {
      // Metcon result carries the strongest stimulus signal.
      const m = s.metcon;
      if (m?.energySystem) {
        energy[m.energySystem] = (energy[m.energySystem] || 0) + 1;
        tagged++;
      }
      if (m?.timeDomain) domain[m.timeDomain] = (domain[m.timeDomain] || 0) + 1;
      // Strength/accessory sets carry a per-block snapshot too.
      for (const set of s.sets || []) {
        if (set.energySystem) energy[set.energySystem] = (energy[set.energySystem] || 0) + 1;
        if (set.timeDomain) domain[set.timeDomain] = (domain[set.timeDomain] || 0) + 1;
      }
    }
    const energyTotal = Object.values(energy).reduce((a, b) => a + b, 0);
    const domainTotal = Object.values(domain).reduce((a, b) => a + b, 0);
    return { energy, domain, energyTotal, domainTotal, tagged };
  }, []);

  if (data.energyTotal === 0 && data.domainTotal === 0) {
    return (
      <SectionCard
        title="ESTÍMULO REGISTRADO (LO QUE ENTRENASTE)"
        icon={<Activity size={15} className="text-white" />}
        subtitle="Distribución real de tus sesiones por sistema energético y dominio temporal"
        badge={<Pill tone="neutral">SIN DATOS</Pill>}
      >
        <EmptyState
          message="Todavía no hay sesiones con estímulo registrado"
          hint="Registrá metcons con INCURSIÓN: cada uno guarda el sistema energético y dominio temporal prescritos, y acá vas a ver cómo se reparte tu entrenamiento real."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="ESTÍMULO REGISTRADO (LO QUE ENTRENASTE)"
      icon={<Activity size={15} className="text-white" />}
      subtitle="Distribución real de tus sesiones por sistema energético y dominio temporal"
      badge={<Pill tone="accent">{data.tagged} METCONS REGISTRADOS</Pill>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className={`${TXT.label} mb-2`}>Sistema energético</div>
          <div className="space-y-2">
            {(Object.keys(ENERGY_META) as EnergySystem[]).map((k) => {
              const n = data.energy[k] || 0;
              const pct = data.energyTotal ? Math.round((n / data.energyTotal) * 100) : 0;
              const meta = ENERGY_META[k];
              return (
                <Bar key={k} label={meta.label} color={meta.color} pct={pct} count={n} />
              );
            })}
          </div>
        </div>
        <div>
          <div className={`${TXT.label} mb-2`}>Dominio temporal</div>
          <div className="space-y-2">
            {(Object.keys(TIMEDOMAIN_META) as BlockTimeDomain[]).map((k) => {
              const n = data.domain[k] || 0;
              const pct = data.domainTotal ? Math.round((n / data.domainTotal) * 100) : 0;
              return (
                <Bar key={k} label={TIMEDOMAIN_META[k].label} color="#FFFFFF" pct={pct} count={n} />
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function Bar({ label, color, pct, count }: { label: string; color: string; pct: number; count: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
        <span style={{ color }}>{label}</span>
        <span className="text-neutral-400">
          {pct}% · {count}
        </span>
      </div>
      <div className="w-full bg-[#18181B] rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
