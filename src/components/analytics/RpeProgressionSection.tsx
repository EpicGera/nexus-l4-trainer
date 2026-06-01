import { useState } from "react";
import { ShieldAlert, Zap } from "lucide-react";

interface RpeProgressionSectionProps {
  currentWeek: string;
}

export default function RpeProgressionSection({
  currentWeek,
}: RpeProgressionSectionProps) {
  // --- COMPARATIVE RPE TABLE (Current Week vs Last 30 Days) ---
  const getWeeklyVsMonthlyStats = () => {
    let weekRpes: number[] = [];
    let monthRpes: number[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexus_logs_")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const isCurrentWeek = key.includes(`_${currentWeek}d`);
            parsed.forEach((log: any) => {
              const rpe = parseFloat(log.rpe);
              if (!isNaN(rpe)) {
                monthRpes.push(rpe);
                if (isCurrentWeek) weekRpes.push(rpe);
              }
            });
          } catch {}
        }
      }
    }

    const currentWeekAvg =
      weekRpes.length > 0
        ? weekRpes.reduce((a, b) => a + b, 0) / weekRpes.length
        : 0;
    const monthAvg =
      monthRpes.length > 0
        ? monthRpes.reduce((a, b) => a + b, 0) / monthRpes.length
        : 0;

    let isDanger = false;
    let diffPercent = 0;
    if (monthAvg > 0) {
      diffPercent = ((currentWeekAvg - monthAvg) / monthAvg) * 100;
      isDanger = currentWeekAvg > 9 || diffPercent > 15;
    }

    return { currentWeekAvg, monthAvg, diffPercent, isDanger };
  };

  const { currentWeekAvg, monthAvg, diffPercent, isDanger } = getWeeklyVsMonthlyStats();

  const weeksProgression = [
    {
      week: "W1",
      title: "SEMANA 1",
      label: "ACUMULACIÓN",
      minTarget: 6,
      maxTarget: 7,
      glowColor: "bg-emerald-500 shadow-sm text-black font-extrabold",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/35",
      physiological: "ADAPTACIÓN NEURAL BASE",
      desc: "Iniciación con volumen de control. Estimulación inicial de la vía ADP/ATP sin saturar los depósitos de glucógeno. El cuerpo absorbe la carga sin fatiga residual severa.",
    },
    {
      week: "W2",
      title: "SEMANA 2",
      label: "INTENSIFICACIÓN",
      minTarget: 7,
      maxTarget: 8,
      glowColor: "bg-yellow-500 shadow-sm text-black font-extrabold",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/35",
      physiological: "RECLUTAMIENTO DE ALTO TORQUE",
      desc: "Aumento progresivo de la carga absoluta en los bloques principales de fuerza y accesorios, conservando la alta velocidad de la barra. Activación sin distrés metabólico.",
    },
    {
      week: "W3",
      title: "SEMANA 3",
      label: "PICO / BOSS FIGHT",
      minTarget: 8,
      maxTarget: 9,
      glowColor: "bg-rose-500 shadow-sm text-white font-extrabold",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/35",
      physiological: "FALLO TÁCTICO & RECLUTAMIENTO IIB",
      desc: "Fuerza extrema y demanda cardíaca terminal. Reclutamiento de unidades motoras de alto umbral. El SNC trabaja al 100% para vencer complejos pesados.",
    },
    {
      week: "W4",
      title: "SEMANA 4",
      label: "DESCARGA (DELOAD)",
      minTarget: 5,
      maxTarget: 6,
      glowColor: "bg-cyan-500 shadow-sm text-black font-extrabold",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/35",
      physiological: "SUPERCOMPENSACIÓN ACTIVA",
      desc: "Compulsiva bajada de intensidad para vaciar la fatiga acumulada en el sistema. Favorece la reconstitución de meniscos, desinflamación y la asimilación del volumen anterior.",
    },
  ];

  const cycleData = {
    fase1: [
      {
        code: "w1",
        name: "SEMANA 1",
        phase: "ACUMULACIÓN",
        target: "RPE 6 - 7",
        maxVal: 7,
        color: "text-rose-400",
        borderColor: "border-rose-500/20",
        bgGlow: "hover:border-rose-500/30",
        activeGlow: "shadow-sm border-rose-500",
        desc: "Reconocimiento neural. Carga base de volumen regular. Foco en ROM perfecto y control postural sin llegar al fallo muscular.",
        tip: "Evita acelerar las repeticiones. Control biomecánico absoluto.",
      },
      {
        code: "w2",
        name: "SEMANA 2",
        phase: "INTENSIFICACIÓN",
        target: "RPE 7 - 8",
        maxVal: 8,
        color: "text-yellow-400",
        borderColor: "border-yellow-500/20",
        bgGlow: "hover:border-yellow-500/30",
        activeGlow: "shadow-sm border-yellow-500",
        desc: "Incremento progresivo de carga manteniendo gran velocidad de barra. Activación de más unidades motoras.",
        tip: "Mide la fatiga acumulada del día anterior antes de cargar la barra.",
      },
      {
        code: "w3",
        name: "SEMANA 3",
        phase: "PICO DE ESFUERZO",
        target: "RPE 8 - 9",
        maxVal: 9,
        color: "text-[#00f0ff]",
        borderColor: "border-[#00f0ff]/20",
        bgGlow: "hover:border-[#00f0ff]/30",
        activeGlow: "shadow-sm border-[#00f0ff]",
        desc: "Máxima demanda cardíaca y neural. Reclutamiento de fibras IIB. Esfuerzo terminal controlado sin perder la postura.",
        tip: "Tu biomecánica debe estar al 100%. RPE 9 es real, cuida el psoas y las lumbares.",
      },
      {
        code: "w4",
        name: "SEMANA 4",
        phase: "DESCARGA (DELOAD)",
        target: "RPE 5 - 6",
        maxVal: 6,
        color: "text-[#a124ff]",
        borderColor: "border-[#a124ff]/20",
        bgGlow: "hover:border-[#a124ff]/30",
        activeGlow: "shadow-sm border-[#a124ff]",
        desc: "Respetar la regeneración activa de tejidos blandos y SNC. Bajada drástica de volumen para supercompensar el ciclo anterior.",
        tip: "La descarga no es negociable en Nexus. Permite rellenar depósitos de glucógeno para reiniciar.",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 1. CICLO RECOMENDADO CARD */}
      <section className="p-5 border bg-zinc-950/80 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/5 shadow-sm text-left">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-[#39ff14]" />
          CICLO DE INTENSIDAD RECOMENDADO (RPE OBJETIVO)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cycleData.fase1.map((wk) => {
            const isCurrent = currentWeek === wk.code;
            return (
              <div
                key={wk.code}
                className={`p-4 border transition-all duration-200 text-left bg-black/60 relative ${
                  isCurrent
                    ? `${wk.activeGlow} scale-102 bg-zinc-900/40 z-10`
                    : `${wk.borderColor} ${wk.bgGlow}`
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 left-3 bg-emerald-500 text-black text-[7.5px] font-mono leading-none px-1.5 py-0.5 rounded-xs tracking-widest font-black uppercase shadow">
                    SEMANA ACTUAL
                  </span>
                )}
                <div className="text-[10px] font-mono text-neutral-400">
                  {wk.name}
                </div>
                <div className="text-sm font-brutalist text-white tracking-wide uppercase mt-0.5">
                  {wk.phase}
                </div>
                <div className={`text-xl font-black font-brutalist mt-2 ${wk.color}`}>
                  {wk.target}
                </div>
                <p className="text-[9.5px] font-mono text-neutral-400 mt-2 leading-relaxed">
                  {wk.desc}
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[8.5px] font-mono text-neutral-500 leading-normal">
                  <span className="text-amber-500 font-bold">TIPS L4: </span>
                  {wk.tip}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. COMPARATIVA RPE PROM */}
      <section className="bg-zinc-950/80 border border-white/5 p-5 no-print text-left rounded-sm mx-0">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShieldAlert
            size={14}
            className={isDanger ? "text-rose-500" : "text-emerald-500"}
          />
          COMPARATIVA RPE PROM. (SEMANA vs ÚLTIMOS 30 DÍAS)
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono border border-white/10 rounded-sm bg-black p-3">
          <div>
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Promedio Mes
            </p>
            <p className="text-lg text-white font-bold">
              {monthAvg > 0 ? monthAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="border-l border-r border-white/10">
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Promedio W{currentWeek.replace("w", "")}
            </p>
            <p className={isDanger ? "text-rose-400 text-lg font-black" : "text-emerald-400 text-lg font-black"}>
              {currentWeekAvg > 0 ? currentWeekAvg.toFixed(1) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 mb-1 tracking-wider uppercase">
              Desviación %
            </p>
            <p className={`text-lg font-bold ${isDanger ? "text-rose-500" : "text-emerald-500"}`}>
              {monthAvg > 0 ? `${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(0)}%` : "N/A"}
            </p>
          </div>
        </div>
      </section>

      {/* 3. DETAILED PRO-LONGEVITY BOARD */}
      <section
        className="col-span-full border border-white/10 p-6 bg-pure-black/90 backdrop-blur-md rounded-sm no-print space-y-6 flex flex-col"
        id="rpe1-10ProgressionBoard"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/15 pb-4 gap-4">
          <div className="space-y-1">
            <h3 className="text-xl lg:text-2xl font-brutalist tracking-wider text-pure-white flex items-center gap-2 uppercase text-left">
              <Zap size={18} className="text-[#39ff14] fill-[#39ff14]/30" />
              PROGRESIÓN SEMANAL RPE 1-10: CONTROL SIN SOBREENTRENAMIENTO (CF-L4)
            </h3>
            <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 text-left">
              // EVOLUCIÓN MANDATORIA DE LA CARGA NEUROMUSCULAR PARA EVITAR LESIONES Y ESTANCAMIENTOS
            </p>
          </div>
          <div className="bg-zinc-950/80 border border-white/10 px-3 py-1.5 rounded-sm shrink-0 flex items-center gap-2 self-start lg:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#39ff14] shrink-0" />
            <span className="font-mono text-[8.5px] text-neutral-300 font-bold uppercase tracking-wider">
              PRESUPUESTO DE MANÁ NEURAL ACTIVO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="col-span-1 lg:col-span-7 bg-zinc-950/70 border border-white/5 p-4 rounded-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-white/5 gap-1.5">
                <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-widest text-left">
                  TABLA DEL ESFUERZO PERCIBIDO (RPE) DE SEMANAS 1 - 4
                </span>
                <span className="text-[8px] font-mono text-neutral-500">
                  1: MÍNIMO | 10: ESFUERZO MÁXIMO
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-center pt-2">
                {weeksProgression.map((weekData, wIdx) => (
                  <div key={wIdx} className="space-y-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-brutalist text-white tracking-widest">
                        {weekData.title}
                      </div>
                      <div className={`text-[7.5px] font-mono font-black uppercase tracking-wider truncate block ${weekData.textColor}`}>
                        {weekData.label}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 h-[210px] bg-black/80 p-1.5 border border-white/5 rounded-xs justify-between">
                      {Array.from({ length: 10 }).map((_, bIdx) => {
                        const levelVal = 10 - bIdx;
                        const isTarget =
                          levelVal >= weekData.minTarget &&
                          levelVal <= weekData.maxTarget;

                        return (
                          <div
                            key={bIdx}
                            className={`h-[16px] flex items-center justify-between px-1.5 text-[8.5px] font-mono rounded-xs transition-all duration-300 ${
                              isTarget
                                ? `${weekData.glowColor} text-black font-extrabold border-l-2 border-r-2 border-white/30 scale-102`
                                : "bg-neutral-900/60 text-neutral-600 border border-white/5 opacity-30 hover:opacity-70"
                            }`}
                            title={`Nivel de Esfuerzo RPE ${levelVal} ${isTarget ? "(Rango objetivo para esta fase)" : ""}`}
                          >
                            <span>RPE {levelVal}</span>
                            {isTarget && (
                              <span className="h-1 w-1 rounded-full bg-black shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/5 px-1.5 py-0.5 border border-white/5 rounded-sm">
                      <div className={`text-[8px] font-mono font-bold leading-none ${weekData.textColor}`}>
                        RPE {weekData.minTarget} - {weekData.maxTarget}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex gap-2.5 items-start bg-emerald-950/10 p-2.5 border border-emerald-900/20 rounded-xs">
              <ShieldAlert size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-neutral-300 text-left leading-relaxed">
                <strong className="text-emerald-400 uppercase font-black">
                  LA REGLA DE LA FATIGA CF-L4:
                </strong>{" "}
                El RPE indica el porcentaje de fuerza/estimulación neuromuscular. Intentar operar en RPE 9-10 desde la Semana 1 resulta en una destrucción temprana del SNC, provocando estancamiento neuromuscular e inflamación en la unión del tendón. Respeta este ciclo de autorregulación.
              </p>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-15 flex flex-col justify-between space-y-3">
            <div className="space-y-2 flex-grow overflow-y-auto max-h-[310px] pr-1">
              {weeksProgression.map((weekData, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 bg-zinc-950/60 border-l-4 ${weekData.borderColor} hover:bg-neutral-900/40 transition-colors flex flex-col gap-1 text-left rounded-r-xs`}
                >
                  <div className="flex justify-between items-center leading-none">
                    <span className="text-[11px] font-black font-brutalist tracking-wider text-pure-white leading-none">
                      {weekData.title}: {weekData.label}
                    </span>
                    <span className={`text-[8.5px] font-mono font-black ${weekData.textColor} tracking-widest`}>
                      OBJETIVO: RPE {weekData.minTarget}-{weekData.maxTarget}
                    </span>
                  </div>

                  <span className="text-[7.5px] font-mono text-neutral-500 uppercase font-black tracking-widest leading-none pt-0.5">
                    PARÁMETRO BIOMÉTRICO: {weekData.physiological}
                  </span>

                  <p className="text-[9.5px] text-neutral-400 leading-normal font-mono">
                    {weekData.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#0b0c10] border-2 border-dashed border-[#00f0ff]/30 p-3 space-y-1.5 text-left rounded-xs">
              <span className="text-[8px] font-black text-[#00f0ff] uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Zap size={10} className="text-[#00f0ff]" />
                REGLA DE VIDA DE ATLETA EN NEXUS L4
              </span>
              <p className="text-[9.5px] font-mono text-neutral-300 leading-relaxed italic">
                "El sobreentrenamiento no es el resultado de un solo día pesado de testing, sino de no entender la obligatoriedad de la descarga. La hipertrofia estructural y la remodelación del colágeno solo se activan cuando descargas el psoas lumbar en la Semana 4 para reiniciar el ciclo en el próximo macrociclo."
              </p>
              <div className="text-[7.5px] font-mono text-neutral-500 text-right uppercase">
                — Nexus Coach CF-L4 Master Edition
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
