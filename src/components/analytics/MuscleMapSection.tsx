import { Accessibility } from "lucide-react";
import { muscleLoadForVariation, type MuscleGroup } from "../../lib/muscleMap";
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

  const groups = Object.keys(load) as MuscleGroup[];
  const primary = groups.filter((m) => load[m] >= 0.7);
  const secondary = groups.filter((m) => load[m] >= 0.4 && load[m] < 0.7);
  // desglose completo: todo grupo con carga > 0, orden descendente
  const ranked = groups.filter((m) => load[m] > 0).sort((a, b) => load[b] - load[a]);
  const hasData = ranked.length > 0;

  return (
    <section className="border bg-[var(--color-surface-1)] border-[var(--color-line)] rounded-sm flex flex-col text-left overflow-hidden shadow-sm">
      {/* Header táctico */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface-2)] border-b border-[var(--color-line)]">
        <span className="text-xs font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest">
          MUSCLE BIO-SCAN <span className="text-[var(--color-ink-faint)]">// IMPACTO DEL DÍA</span>
        </span>
        <Accessibility size={16} style={{ color: PRIMARY }} />
      </div>

      {/* Cuerpo del escáner: fondo plano, sin texturas */}
      <div className="p-6 flex flex-col items-center gap-5 bg-[var(--color-surface-1)]">
        <div className="w-full max-w-[280px] flex flex-col items-center gap-1.5">
          <BodyHeatmap values={load} baseColor={PRIMARY} className="w-full h-auto" />
          {/* etiquetas de vista: el asset trae frente a la izquierda, dorso a la derecha */}
          <div className="w-full flex justify-around text-[8px] font-mono uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
            <span>Frente</span>
            <span>Dorso</span>
          </div>
        </div>

        {/* leyenda de intensidad */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Leve</span>
          <div
            className="h-1.5 flex-1 rounded-full"
            style={{ background: `linear-gradient(to right, ${PRIMARY}2E, ${PRIMARY})` }}
          />
          <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Máximo</span>
        </div>

        {hasData ? (
          <div className="w-full space-y-3">
            {primary.length > 0 && <Readout title="PRIMARY TARGETS" muscles={primary} color={PRIMARY} />}
            {secondary.length > 0 && <Readout title="SECONDARY SUPPORT" muscles={secondary} color={SECONDARY} />}

            {/* Desglose completo — barra de intensidad + % por grupo */}
            <div className="w-full pt-1">
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--color-ink-faint)] mb-2">
                Desglose completo
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {ranked.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--color-ink-muted)] w-[68px] shrink-0 truncate">
                      {LABELS[m]}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#18181B] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.round(load[m] * 100)}%`, background: PRIMARY, opacity: 0.35 + 0.65 * load[m] }}
                      />
                    </div>
                    <span className="text-[9px] font-mono tabular-nums text-[var(--color-ink-faint)] w-7 text-right">
                      {Math.round(load[m] * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] font-mono text-[var(--color-ink-faint)]">Sin ejercicios cargados.</p>
        )}
      </div>
    </section>
  );
}
