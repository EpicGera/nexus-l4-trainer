import { Accessibility } from "lucide-react";
import { muscleLoadForVariation, toHeatmapParts, type MuscleGroup } from "../../lib/muscleMap";
import BodyHeatmap from "./BodyHeatmap";

interface MuscleMapSectionProps {
  activeDay: any;
  currentVariationIndex: number;
}

// Réplica del "MUSCLE BIO-SCAN" de WODFORGE: rojo señal para impacto primario,
// naranja (voltage) para el soporte secundario.
const PRIMARY = "#EF4444";
const SECONDARY = "#FF3D00";

const LABELS: Record<MuscleGroup, string> = {
  quads: "Cuádriceps", hamstrings: "Isquios", glutes: "Glúteos", calves: "Gemelos",
  lower_back: "Lumbares", upper_back: "Espalda alta", lats: "Dorsales",
  chest: "Pecho", shoulders: "Hombros", biceps: "Bíceps", triceps: "Tríceps",
  forearms: "Antebrazos", core: "Core",
};

/** Caja de lectura táctica: título con color de acento + chips de músculos. */
function Readout({ title, muscles, color }: { title: string; muscles: MuscleGroup[]; color: string }) {
  return (
    <div className="w-full p-3 rounded-sm border" style={{ borderColor: `${color}4D`, background: "rgba(10,10,10,0.8)" }}>
      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.15em]" style={{ color }}>
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {muscles.map((m) => (
          <span
            key={m}
            className="px-1.5 py-0.5 rounded-xs text-[11px] font-mono font-bold text-[var(--color-ink)]"
            style={{ background: `${color}26` }}
          >
            {LABELS[m].toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MuscleMapSection({ activeDay, currentVariationIndex }: MuscleMapSectionProps) {
  if (!activeDay) return null;
  const v = activeDay.variations?.[currentVariationIndex] || activeDay.variations?.[0];
  if (!v) return null;

  const load = muscleLoadForVariation(v);
  const parts = toHeatmapParts(load);

  const groups = Object.keys(load) as MuscleGroup[];
  const primary = groups.filter((m) => load[m] >= 0.7);
  const secondary = groups.filter((m) => load[m] >= 0.4 && load[m] < 0.7);
  const hasData = groups.some((m) => load[m] > 0);

  return (
    <section className="border bg-[var(--color-surface-1)] border-[var(--color-line)] rounded-sm flex flex-col text-left overflow-hidden shadow-sm">
      {/* Header táctico */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface-2)] border-b border-[var(--color-line)]">
        <span className="text-xs font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest">
          MUSCLE BIO-SCAN <span className="text-[var(--color-ink-faint)]">// IMPACTO DEL DÍA</span>
        </span>
        <Accessibility size={16} style={{ color: PRIMARY }} />
      </div>

      {/* Cuerpo del escáner: grilla + gradiente rojo sutil */}
      <div
        className="p-6 flex flex-col items-center gap-6"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 30px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 30px),
            linear-gradient(to bottom, transparent, rgba(220,38,38,0.05), transparent)
          `,
        }}
      >
        <BodyHeatmap values={parts} baseColor={PRIMARY} className="w-full max-w-[240px] h-auto" />

        {hasData ? (
          <div className="w-full space-y-3">
            {primary.length > 0 && <Readout title="PRIMARY TARGETS" muscles={primary} color={PRIMARY} />}
            {secondary.length > 0 && <Readout title="SECONDARY SUPPORT" muscles={secondary} color={SECONDARY} />}
          </div>
        ) : (
          <p className="text-[11px] font-mono text-[var(--color-ink-faint)]">Sin ejercicios cargados.</p>
        )}
      </div>
    </section>
  );
}
