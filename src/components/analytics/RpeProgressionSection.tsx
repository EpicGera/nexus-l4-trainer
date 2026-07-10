import { useState, useMemo, useEffect } from "react";
import { ShieldAlert, Zap } from "lucide-react";
import { SectionCard, Pill, TXT } from "../ui/primitives";

interface RpeProgressionSectionProps {
  currentWeek: string;
  /** Declared/inferred intention of the current program week (WeekMeta). */
  weekIntention?: string;
}

// Card ↔ canonical BlockIntention, so week 5+ of a long program still maps to
// its real phase instead of matching nothing (the old w1–w4 code equality).
const INTENTION_TO_CODE: Record<string, string> = {
  acumulacion: "w1",
  intensificacion: "w2",
  realizacion: "w3",
  restauracion: "w4",
};

/**
 * Single source of truth for the 4-week intensity cycle: one card per week
 * with phase, RPE target band (visual 1-10 strip), description and tip.
 * Plus the real week-vs-month RPE comparison (registered data only).
 */
export default function RpeProgressionSection({
  currentWeek,
  weekIntention,
}: RpeProgressionSectionProps) {
  const [storageUpdate, setStorageUpdate] = useState(0);

  useEffect(() => {
    const handleStorage = () => setStorageUpdate((prev) => prev + 1);
    // "storage" only fires cross-tab; nexus_logs_updated covers same-tab logging.
    window.addEventListener("storage", handleStorage);
    window.addEventListener("nexus_logs_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("nexus_logs_updated", handleStorage);
    };
  }, []);

  // --- COMPARATIVE RPE TABLE (Current Week vs Last 30 Days) — real data only ---
  const { currentWeekAvg, monthAvg, diffPercent, isDanger } = useMemo(() => {
    let weekRpesCount = 0;
    let weekRpesSum = 0;
    let monthRpesCount = 0;
    let monthRpesSum = 0;

    const keys = Object.keys(localStorage);
    const weekSuffix = `_${currentWeek}d`;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const isCurrentWeek = key.includes(weekSuffix);
              for (let j = 0; j < parsed.length; j++) {
                const rpe = parseFloat(parsed[j].rpe);
                if (!isNaN(rpe)) {
                  monthRpesSum += rpe;
                  monthRpesCount++;
                  if (isCurrentWeek) {
                    weekRpesSum += rpe;
                    weekRpesCount++;
                  }
                }
              }
            }
          } catch {}
        }
      }
    }

    const currentWeekAvg = weekRpesCount > 0 ? weekRpesSum / weekRpesCount : 0;
    const monthAvg = monthRpesCount > 0 ? monthRpesSum / monthRpesCount : 0;

    let isDanger = false;
    let diffPercent = 0;
    if (monthAvg > 0) {
      diffPercent = ((currentWeekAvg - monthAvg) / monthAvg) * 100;
      isDanger = currentWeekAvg > 9 || diffPercent > 15;
    }

    return { currentWeekAvg, monthAvg, diffPercent, isDanger };
  }, [currentWeek, storageUpdate]);

  // ONE definition of the cycle — phase, target band, physiology, tip.
  const cycle = [
    {
      code: "w1",
      name: "SEMANA 1",
      phase: "ACUMULACIÓN",
      minTarget: 6,
      maxTarget: 7,
      color: "#34d399",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/35",
      physiological: "ADAPTACIÓN NEURAL BASE",
      desc: "Volumen de control. Foco en ROM perfecto y control postural, sin llegar al fallo muscular.",
      tip: "Evitá acelerar las repeticiones. Control biomecánico absoluto.",
    },
    {
      code: "w2",
      name: "SEMANA 2",
      phase: "INTENSIFICACIÓN",
      minTarget: 7,
      maxTarget: 8,
      color: "#facc15",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/35",
      physiological: "RECLUTAMIENTO DE ALTO TORQUE",
      desc: "Más carga absoluta en fuerza y accesorios, conservando velocidad de barra.",
      tip: "Medí la fatiga del día anterior antes de cargar la barra.",
    },
    {
      code: "w3",
      name: "SEMANA 3",
      phase: "PICO / BOSS FIGHT",
      minTarget: 8,
      maxTarget: 9,
      color: "#fb7185",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/35",
      physiological: "FALLO TÁCTICO & FIBRAS IIB",
      desc: "Máxima demanda cardíaca y neural. Esfuerzo terminal controlado sin perder la postura.",
      tip: "RPE 9 es real: cuidá el psoas y las lumbares.",
    },
    {
      code: "w4",
      name: "SEMANA 4",
      phase: "DESCARGA (DELOAD)",
      minTarget: 5,
      maxTarget: 6,
      color: "#22d3ee",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/35",
      physiological: "SUPERCOMPENSACIÓN ACTIVA",
      desc: "Bajada drástica de intensidad para vaciar la fatiga acumulada y asimilar el ciclo.",
      tip: "La descarga no es negociable: permite reiniciar el próximo macrociclo.",
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. THE CYCLE — single, complete definition */}
      <SectionCard
        title="CICLO DE INTENSIDAD (RPE OBJETIVO)"
        icon={<Zap size={15} className="text-[#A1A1AA]" />}
        subtitle="Tu mapa de 4 semanas: a qué esfuerzo apuntar en cada fase y por qué"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cycle.map((wk) => {
            // Prefer the program's declared/inferred intention (works for any
            // cycle length); fall back to code equality for the classic w1–w4.
            const isCurrent = weekIntention
              ? INTENTION_TO_CODE[weekIntention] === wk.code
              : currentWeek === wk.code;
            return (
              <div
                key={wk.code}
                className={`p-4 border bg-black/60 rounded-sm relative transition-all ${
                  isCurrent
                    ? `${wk.borderColor} border-2 bg-zinc-900/40`
                    : "border-[#3F3F46]"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 left-3 bg-emerald-500 text-black text-[10px] font-mono leading-none px-2 py-1 rounded-xs tracking-wider font-black uppercase">
                    ESTÁS ACÁ
                  </span>
                )}
                <div className={TXT.label}>{wk.name}</div>
                <div className="text-sm font-brutalist text-white tracking-wide uppercase mt-0.5">
                  {wk.phase}
                </div>
                <div className={`text-2xl font-black font-brutalist mt-2 ${wk.textColor}`}>
                  RPE {wk.minTarget}–{wk.maxTarget}
                </div>

                {/* Visual 1-10 target band */}
                <div className="flex gap-0.5 mt-2.5" title={`Rango objetivo: RPE ${wk.minTarget}-${wk.maxTarget}`}>
                  {Array.from({ length: 10 }).map((_, i) => {
                    const level = i + 1;
                    const inBand = level >= wk.minTarget && level <= wk.maxTarget;
                    return (
                      <div
                        key={level}
                        className="h-2 flex-1 rounded-xs"
                        style={{
                          backgroundColor: inBand ? wk.color : "#27272a",
                          opacity: inBand ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>

                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mt-3">
                  {wk.physiological}
                </div>
                <p className="text-[11px] font-mono text-neutral-300 mt-1.5 leading-relaxed">
                  {wk.desc}
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] font-mono text-neutral-400 leading-relaxed">
                  <span className="text-amber-400 font-bold">TIP L4: </span>
                  {wk.tip}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2.5 items-start bg-emerald-950/10 p-3 border border-emerald-900/20 rounded-xs">
          <ShieldAlert size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-mono text-neutral-300 text-left leading-relaxed">
            <strong className="text-emerald-400 uppercase font-black">
              REGLA DE LA FATIGA CF-L4:
            </strong>{" "}
            Operar en RPE 9-10 desde la Semana 1 destruye el SNC temprano y provoca
            estancamiento e inflamación tendinosa. Respetá el ciclo de autorregulación.
          </p>
        </div>
      </SectionCard>

      {/* 2. REAL COMPARISON — registered data only */}
      <SectionCard
        title="TU RPE PROMEDIO (SEMANA VS ÚLTIMOS 30 DÍAS)"
        icon={
          <ShieldAlert
            size={15}
            className={isDanger ? "text-rose-500" : "text-emerald-500"}
          />
        }
        subtitle="Calculado solo con tus series registradas"
        badge={
          monthAvg > 0 ? (
            <Pill tone={isDanger ? "danger" : "good"}>
              {isDanger ? "DESVIACIÓN ALTA" : "EN RANGO"}
            </Pill>
          ) : (
            <Pill tone="neutral">SIN REGISTROS</Pill>
          )
        }
      >
        <div className="grid grid-cols-3 gap-3 text-center bg-black/60 border border-[#3F3F46] rounded-sm p-4">
          <div>
            <p className={`${TXT.label} mb-1`}>PROMEDIO MES</p>
            <p className="text-2xl text-white font-brutalist font-black">
              {monthAvg > 0 ? monthAvg.toFixed(1) : "—"}
            </p>
          </div>
          <div className="border-l border-r border-[#3F3F46]">
            <p className={`${TXT.label} mb-1`}>
              SEMANA {currentWeek.replace("w", "")}
            </p>
            <p
              className={`text-2xl font-brutalist font-black ${
                currentWeekAvg === 0
                  ? "text-neutral-500"
                  : isDanger
                    ? "text-rose-400"
                    : "text-emerald-400"
              }`}
            >
              {currentWeekAvg > 0 ? currentWeekAvg.toFixed(1) : "—"}
            </p>
          </div>
          <div>
            <p className={`${TXT.label} mb-1`}>DESVIACIÓN</p>
            <p
              className={`text-2xl font-brutalist font-black ${
                monthAvg === 0
                  ? "text-neutral-500"
                  : isDanger
                    ? "text-rose-500"
                    : "text-emerald-500"
              }`}
            >
              {monthAvg > 0
                ? `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(0)}%`
                : "—"}
            </p>
          </div>
        </div>
        <p className="text-[10px] font-mono text-neutral-500 mt-2 leading-relaxed">
          {monthAvg === 0
            ? "Registrá series con RPE para activar esta comparación."
            : "Desviación alta = tu semana supera RPE 9 o se aleja más de +15% del promedio del mes."}
        </p>
      </SectionCard>
    </div>
  );
}
