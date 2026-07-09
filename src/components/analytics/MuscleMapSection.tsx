import { Activity } from "lucide-react";
import { muscleLoadForVariation, type MuscleGroup } from "../../lib/muscleMap";

interface MuscleMapSectionProps {
  activeDay: any;
  currentVariationIndex: number;
}

// Rojo acento con opacidad escalonada según la intensidad 0..1 del grupo.
function fillFor(intensity: number): string {
  if (intensity <= 0) return "rgba(255,255,255,0.04)";
  const a = intensity < 0.25 ? 0.15 : intensity < 0.5 ? 0.35 : intensity < 0.75 ? 0.6 : 0.9;
  return `rgba(220,38,38,${a})`;
}

const LABELS: Record<MuscleGroup, string> = {
  quads: "Cuádriceps", hamstrings: "Isquios", glutes: "Glúteos", calves: "Gemelos",
  lower_back: "Lumbares", upper_back: "Espalda alta", lats: "Dorsales",
  chest: "Pecho", shoulders: "Hombros", biceps: "Bíceps", triceps: "Tríceps",
  forearms: "Antebrazos", core: "Core",
};

/** Región muscular: un shape con fill por intensidad + borde tenue. */
function M({ d, load, group }: { d: string; load: Record<MuscleGroup, number>; group: MuscleGroup }) {
  return <path d={d} fill={fillFor(load[group])} stroke="#3F3F46" strokeWidth={0.6} />;
}

export default function MuscleMapSection({ activeDay, currentVariationIndex }: MuscleMapSectionProps) {
  if (!activeDay) return null;
  const v = activeDay.variations?.[currentVariationIndex] || activeDay.variations?.[0];
  if (!v) return null;

  const load = muscleLoadForVariation(v);
  const top3 = (Object.keys(load) as MuscleGroup[])
    .filter((m) => load[m] > 0)
    .sort((a, b) => load[b] - load[a])
    .slice(0, 3);

  return (
    <section className="p-5 border bg-[var(--color-surface-1)] border-[var(--color-line)] rounded-sm flex flex-col text-left space-y-4 shadow-sm">
      <h3 className="text-xs font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest flex items-center gap-2 border-b border-[var(--color-line)] pb-2">
        <Activity size={14} className="text-[var(--color-accent-soft)]" />
        MAPA DE IMPACTO MUSCULAR DEL DÍA
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
        {/* Maniquí frente + dorso */}
        <div className="flex items-end justify-center gap-6">
          {/* ── FRENTE ── */}
          <figure className="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 120 260" className="h-56 w-auto" role="img" aria-label="Vista frontal">
              {/* silueta base */}
              <g fill="none" stroke="#3F3F46" strokeWidth={1}>
                <circle cx="60" cy="22" r="14" />
                <path d="M46 34 L74 34 L82 60 L80 120 L40 120 L38 60 Z" />
              </g>
              {/* cabeza/cuello neutro */}
              <circle cx="60" cy="22" r="14" fill="rgba(255,255,255,0.03)" />
              {/* músculos frontales */}
              <M group="shoulders" load={load} d="M40 40 q-10 4 -12 18 l10 3 q3 -12 8 -16 Z" />
              <M group="shoulders" load={load} d="M80 40 q10 4 12 18 l-10 3 q-3 -12 -8 -16 Z" />
              <M group="chest" load={load} d="M46 44 L59 44 L59 66 Q52 68 46 62 Z" />
              <M group="chest" load={load} d="M74 44 L61 44 L61 66 Q68 68 74 62 Z" />
              <M group="core" load={load} d="M50 68 L70 68 L68 100 L52 100 Z" />
              <M group="biceps" load={load} d="M32 60 q-4 12 -3 24 l7 -1 q0 -12 3 -22 Z" />
              <M group="biceps" load={load} d="M88 60 q4 12 3 24 l-7 -1 q0 -12 -3 -22 Z" />
              <M group="forearms" load={load} d="M29 86 l6 0 l-2 26 l-6 0 Z" />
              <M group="forearms" load={load} d="M91 86 l-6 0 l2 26 l6 0 Z" />
              <M group="quads" load={load} d="M42 122 L58 122 L56 176 L46 176 Z" />
              <M group="quads" load={load} d="M78 122 L62 122 L64 176 L74 176 Z" />
              <M group="calves" load={load} d="M46 184 L55 184 L53 226 L48 226 Z" />
              <M group="calves" load={load} d="M74 184 L65 184 L67 226 L72 226 Z" />
            </svg>
            <figcaption className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Frente</figcaption>
          </figure>

          {/* ── DORSO ── */}
          <figure className="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 120 260" className="h-56 w-auto" role="img" aria-label="Vista dorsal">
              <g fill="none" stroke="#3F3F46" strokeWidth={1}>
                <circle cx="60" cy="22" r="14" />
                <path d="M46 34 L74 34 L82 60 L80 120 L40 120 L38 60 Z" />
              </g>
              <circle cx="60" cy="22" r="14" fill="rgba(255,255,255,0.03)" />
              <M group="shoulders" load={load} d="M40 40 q-10 4 -12 18 l10 3 q3 -12 8 -16 Z" />
              <M group="shoulders" load={load} d="M80 40 q10 4 12 18 l-10 3 q-3 -12 -8 -16 Z" />
              <M group="upper_back" load={load} d="M46 42 L74 42 L72 62 L48 62 Z" />
              <M group="lats" load={load} d="M47 64 L59 64 L57 92 Q50 90 47 80 Z" />
              <M group="lats" load={load} d="M73 64 L61 64 L63 92 Q70 90 73 80 Z" />
              <M group="lower_back" load={load} d="M52 82 L68 82 L66 104 L54 104 Z" />
              <M group="triceps" load={load} d="M32 60 q-4 12 -3 24 l7 -1 q0 -12 3 -22 Z" />
              <M group="triceps" load={load} d="M88 60 q4 12 3 24 l-7 -1 q0 -12 -3 -22 Z" />
              <M group="glutes" load={load} d="M44 106 L59 106 L59 128 Q50 128 44 122 Z" />
              <M group="glutes" load={load} d="M76 106 L61 106 L61 128 Q70 128 76 122 Z" />
              <M group="hamstrings" load={load} d="M44 130 L58 130 L56 176 L46 176 Z" />
              <M group="hamstrings" load={load} d="M76 130 L62 130 L64 176 L74 176 Z" />
              <M group="calves" load={load} d="M46 184 L55 184 L53 226 L48 226 Z" />
              <M group="calves" load={load} d="M74 184 L65 184 L67 226 L72 226 Z" />
            </svg>
            <figcaption className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Dorso</figcaption>
          </figure>
        </div>

        {/* Leyenda + top 3 */}
        <div className="space-y-3 min-w-[140px]">
          <div className="space-y-1.5">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Intensidad</div>
            <div className="flex items-center gap-1">
              {[0.15, 0.35, 0.6, 0.9].map((a) => (
                <span key={a} className="h-3 w-6 rounded-xs" style={{ background: `rgba(220,38,38,${a})` }} />
              ))}
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-[var(--color-ink-faint)] uppercase">
              <span>Bajo</span><span>Alto</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-ink-faint)]">Más trabajados hoy</div>
            {top3.length ? top3.map((m) => (
              <div key={m} className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[var(--color-ink-muted)]">{LABELS[m]}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[70px]">
                  <div className="h-full rounded-full" style={{ width: `${Math.round(load[m] * 100)}%`, background: "#DC2626" }} />
                </div>
              </div>
            )) : (
              <p className="text-[10px] font-mono text-[var(--color-ink-faint)]">Sin ejercicios cargados.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
