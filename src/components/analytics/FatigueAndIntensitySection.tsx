import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ComposedChart,
  Bar,
  Line,
} from "recharts";
import { TrendingUp, Zap, ShieldAlert } from "lucide-react";

interface FatigueAndIntensitySectionProps {
  currentWeek: string;
}

export default function FatigueAndIntensitySection({
  currentWeek,
}: FatigueAndIntensitySectionProps) {
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(14);

  // --- SINGLE PASS DATA PARSING ---
  const parsedLogs = useMemo(() => {
    const logs = [];
    const now = Date.now();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              const parts = key.split("_");
              const maybeTs = parseInt(parts[parts.length - 1]);
              const timestamp =
                maybeTs && maybeTs > 1000000
                  ? maybeTs
                  : now - Math.random() * (7 * 24 * 60 * 60 * 1000);
              logs.push({
                key,
                timestamp,
                parsed: Array.isArray(parsed) ? parsed : [],
              });
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return logs;
  }, [currentWeek]); // Reparse when currentWeek changes

  // --- RENDERING INTENSITY TRENDS (AreaChart) ---
  const getIntensityTrendData = () => {
    let rpeDataPoints = [];
    const now = Date.now();

    let totalRpeSum = 0;
    let rpeCount = 0;
    let relativeTotalLoad = 0;

    for (const logEntry of parsedLogs) {
      const daysAgo = Math.floor(
        (now - logEntry.timestamp) / (24 * 60 * 60 * 1000),
      );

      if (daysAgo <= rpeTrendRange) {
        let dayRpeSum = 0;
        let dayRpeCount = 0;

        logEntry.parsed.forEach((log) => {
          const r = parseFloat(log.rpe);
          if (!isNaN(r)) {
            dayRpeSum += r;
            dayRpeCount++;
            totalRpeSum += r;
            rpeCount++;
          }
          relativeTotalLoad +=
            (parseFloat(log.weight) || 0) * (parseFloat(log.reps) || 0);
        });

        if (dayRpeCount > 0) {
          rpeDataPoints.push({
            dayOffset: daysAgo,
            rpeAvg: dayRpeSum / dayRpeCount,
          });
        }
      }
    }

    let fatigueTrendData = [];
    if (rpeDataPoints.length === 0) {
      fatigueTrendData = [
        {
          name: "Día -" + rpeTrendRange,
          rpeAvg: 6,
          fatigue: 60,
          label: "No Data",
        },
        { name: "Hoy", rpeAvg: 6, fatigue: 60, label: "No Data" },
      ];
    } else {
      rpeDataPoints.sort((a, b) => b.dayOffset - a.dayOffset);
      fatigueTrendData = rpeDataPoints.map((dp) => {
        const label = dp.dayOffset === 0 ? "Hoy" : `Hace ${dp.dayOffset} d`;
        return {
          name: label,
          rpeAvg: Number(dp.rpeAvg.toFixed(1)),
          fatigue: Math.round(dp.rpeAvg * 10),
        };
      });
    }

    const currentAvg =
      rpeCount > 0 ? parseFloat((totalRpeSum / rpeCount).toFixed(1)) : 6.2;

    const isOverL4Threshold = currentAvg > 8 || relativeTotalLoad > 10000;
    const trendLineColor = isOverL4Threshold ? "#f43f5e" : "#00f0ff";
    const isHighFatigue = isOverL4Threshold;

    return {
      fatigueTrendData,
      currentAvg,
      isOverL4Threshold,
      trendLineColor,
      isHighFatigue,
    };
  };

  const {
    fatigueTrendData,
    currentAvg,
    isOverL4Threshold,
    trendLineColor,
    isHighFatigue,
  } = getIntensityTrendData();

  // --- 8. CNS FATIGUE DATA LOGIC ---
  const getCnsFatigueData = () => {
    let recentRpes: number[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const logEntry of parsedLogs) {
      if (now - logEntry.timestamp <= 14 * dayMs) {
        logEntry.parsed.forEach((p) => {
          const r = parseFloat(p.rpe);
          if (!isNaN(r)) recentRpes.push(r);
        });
      }
    }

    const cnsLoadAvg =
      recentRpes.length > 0
        ? recentRpes.reduce((a, b) => a + b, 0) / recentRpes.length
        : 6.2;

    const scalePercent = Math.min(100, Math.max(0, (cnsLoadAvg / 10) * 100));

    let stateLabel = "ESTADO ESTABLE G11";
    let stateColor = "text-[#39ff14]";
    let progressBg = "bg-[#39ff14]";
    let detailAdvice =
      "Tus vías neuromotoras están despejadas. Respeta las pausas y duerme +7.5 horas.";

    if (cnsLoadAvg > 8.5) {
      stateLabel = "ALTA INTERFERENCIA (SNC AL LÍMITE)";
      stateColor = "text-rose-500 font-black animate-pulse";
      progressBg = "bg-rose-600";
      detailAdvice =
        "Doble aviso biomecánico. Reduce un 15% el peso de tu cargada. En Week 4 haz descarga total.";
    } else if (cnsLoadAvg > 7.4) {
      stateLabel = "FATIGA COMPRENSIVA REGULADA";
      stateColor = "text-yellow-400 font-bold";
      progressBg = "bg-yellow-500";
      detailAdvice =
        "Carga acumulativa normal de media fase. Evita añadir accesorios extenuantes.";
    }

    return {
      cnsLoadAvg,
      scalePercent,
      stateLabel,
      stateColor,
      progressBg,
      detailAdvice,
    };
  };

  const {
    cnsLoadAvg,
    scalePercent,
    stateLabel,
    stateColor,
    progressBg,
    detailAdvice,
  } = getCnsFatigueData();

  // --- 9. RELATION DE CARGA DATA (ComposedChart Volume vs RPE) ---
  const getRelationCargaData = () => {
    const weeklyMetrics = {
      w1: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w2: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w3: { volume: 0, rpeSum: 0, rpeCount: 0 },
      w4: { volume: 0, rpeSum: 0, rpeCount: 0 },
    };

    for (const logEntry of parsedLogs) {
      const parts = logEntry.key.split("_");
      const dayId = parts[2] || "";
      const wkKey = dayId.substring(0, 2).toLowerCase();

      if (
        wkKey &&
        weeklyMetrics[wkKey as keyof typeof weeklyMetrics] !== undefined
      ) {
        logEntry.parsed.forEach((log) => {
          const wt = parseFloat(log.weight) || 0;
          const rp = parseFloat(log.reps) || 0;
          const rpeVal = parseFloat(log.rpe) || 0;

          weeklyMetrics[wkKey as keyof typeof weeklyMetrics].volume += wt * rp;
          if (rpeVal > 0) {
            weeklyMetrics[wkKey as keyof typeof weeklyMetrics].rpeSum += rpeVal;
            weeklyMetrics[wkKey as keyof typeof weeklyMetrics].rpeCount++;
          }
        });
      }
    }

    const compiledData = Object.keys(weeklyMetrics).map((wk) => {
      const entry = weeklyMetrics[wk as keyof typeof weeklyMetrics];
      return {
        week: wk.toUpperCase(),
        volume: Math.round(entry.volume),
        rpe:
          entry.rpeCount > 0
            ? Number((entry.rpeSum / entry.rpeCount).toFixed(1))
            : 0,
      };
    });

    return compiledData;
  };

  const relationCargaCompiledData = getRelationCargaData();
  return (
    <div className="space-y-6">
      {/* RPE & RECURRENT FATIGUE DISTRIBUTION AREA CHART */}
      <section className="p-5 border bg-pure-black/40 backdrop-blur-xs transition-all duration-300 rounded-sm border-white/10 shadow-sm mt-4 text-left">
        <header className="px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-900 border border-white/10 rounded-xs mb-4 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#00f0ff]" />
            <h3 className="text-sm font-brutalist italic text-white uppercase tracking-wider">
              DISTRIBUCIÓN RPE Y FATIGA RECURRENTE
            </h3>
          </div>

          <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-extrabold border bg-black border-white/10 p-1 rounded">
            {[7, 14, 30].map((days) => (
              <button
                key={`range-${days}`}
                onClick={() => setRpeTrendRange(days)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  rpeTrendRange === days
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                {days} Días
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="space-y-3 lg:col-span-1">
            <div className="bg-zinc-950 p-3.5 border border-white/5 space-y-2 rounded">
              <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase font-mono block">
                🔴 AUDITORÍA DE SUPERCOMPENSACIÓN Y FATIGA
              </span>
              <div className="text-neutral-400 font-mono text-[10px] leading-relaxed space-y-2">
                <p>
                  El RPE promedio de la ventana seleccionada ({rpeTrendRange}{" "}
                  días) es{" "}
                  <span className="text-white font-bold font-mono">
                    {currentAvg}
                  </span>
                  . Basado en el patrón biomecánico:
                </p>
                {isHighFatigue ? (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2 text-rose-400 rounded-xs space-y-1">
                    <span className="font-extrabold block">
                      ⚠️ ALERTA: SOBREVOLUMEN / FATIGA CRÍTICA
                    </span>
                    <p className="text-[9px]">
                      Carga detectada en límite. Superaste el umbral RPE
                      recomendado continuo.
                    </p>
                    <p className="text-[8.5px] text-rose-300 italic pt-0.5 border-t border-rose-500/10">
                      "Baja las cargas un 10-15%, cuida el psoas y prioriza el
                      ROM."
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 rounded-xs space-y-1">
                    <span className="font-extrabold block">
                      ✓ ESTADO OPTIMIZADO SANO (SUPERCOMPENSACIÓN)
                    </span>
                    <p className="text-[9px]">
                      Carga bajo control. El estímulo biomecánico es seguro.
                    </p>
                  </div>
                )}
                <p className="border-t border-white/5 pt-2 text-[9px] italic font-mono">
                  Distribución temporal calculada sobre los últimos registros.
                </p>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-2 h-[200px] sm:h-[180px] bg-black/40 border border-white/5 rounded p-3 relative mt-4 lg:mt-0"
            id="intensityChartContainer"
          >
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1 pointer-events-none">
              <span
                className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black border uppercase tracking-wider flex items-center gap-1 ${
                  isOverL4Threshold
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isOverL4Threshold ? "bg-rose-500" : "bg-emerald-400"}`}
                />
                RPE Ponderado: {currentAvg}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={fatigueTrendData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={trendLineColor}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={trendLineColor}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={9}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={9}
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="rpeAvg"
                  stroke={trendLineColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRpe)"
                  name="RPE Promedio"
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#f43f5e"
                  strokeWidth={1}
                  fillOpacity={1}
                  fill="url(#colorFatigue)"
                  name="Nivel de Fatiga (%)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CNS FATIGUE AUDITOR DASHBOARD */}
      <section className="bg-zinc-950 p-5 border border-white/5 relative overflow-hidden rounded text-left no-print col-span-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              SISTEMA DE AUDITORÍA CENTRAL DE FATIGA NEURAL (SNC)
            </h4>
            <p className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">
              Métricas e interferencia hormonal calculadas en base a registros
              recientes (14 días).
            </p>
          </div>
          <div className="bg-black/60 border border-white/5 py-1 px-3 self-start md:self-auto rounded">
            <span
              className={`text-[10px] font-mono font-black uppercase ${stateColor}`}
            >
              ● {stateLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="text-[8px] font-mono text-zinc-500 tracking-wider font-extrabold">
              BARRA DE PRESIÓN NEURAL (SNC METRIC ID_099)
            </div>
            <div className="flex items-center gap-3">
              <span className="font-brutalist text-3xl font-black text-white tracking-widest">
                {cnsLoadAvg.toFixed(1)}
                <span className="text-xs text-neutral-500 font-mono"> /10</span>
              </span>
              <div className="flex-grow bg-neutral-900 h-3 rounded overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full ${progressBg} transition-all duration-500 rounded-sm`}
                  style={{ width: `${scalePercent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2 font-mono text-[9.5px] text-zinc-400 leading-relaxed border-l border-white/10 pl-0 md:pl-6 space-y-2">
            <p>
              <strong className="text-white uppercase font-black">
                PRESCRIPCIÓN CF-L4:
              </strong>{" "}
              {detailAdvice}
            </p>
            <p className="text-[8.5px] text-zinc-600">
              *Nota L4: El magnesio directo, las calleras de carbono con pliegue
              táctico y el mantenimiento del ROM completo ayudan a descargar
              tensión de los antebrazos, reduciendo la inhibición motora
              refleja.
            </p>
          </div>
        </div>
      </section>

      {/* RELATION CARGA-ESTRÉS */}
      <section className="p-5 border bg-zinc-950/80 border-white/5 rounded-sm flex flex-col text-left space-y-4 shadow-sm">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert size={14} className="text-rose-500" />
          RELACIÓN CARGA-ESTRÉS (VOLUMEN INTEGRADO vs RPE)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          <div className="lg:col-span-3 h-[220px] bg-black/40 border border-white/5 rounded p-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={relationCargaCompiledData}
                margin={{ left: -10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="week" stroke="#555" fontSize={9} />
                <YAxis
                  yAxisId="left"
                  stroke="#888"
                  fontSize={9}
                  name="Volume"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f43f5e"
                  fontSize={9}
                  domain={[0, 10]}
                  name="RPE"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#333",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="volume"
                  fill="#222"
                  stroke="#444"
                  name="Volume Kg"
                  maxBarSize={40}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rpe"
                  stroke="#FF1493"
                  strokeWidth={2.5}
                  name="RPE Promedio"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-1 space-y-3 font-mono text-[9.5px]">
            <div className="bg-zinc-900 border border-white/5 p-3 rounded space-y-2">
              <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase block">
                <img
                  src="/logo.svg"
                  className="w-3 h-3 object-contain inline-block align-middle mr-1"
                  alt=""
                />{" "}
                INTERPRETACIÓN DE CURVAS
              </span>
              <p className="text-neutral-400 leading-normal">
                Si el volumen sube pero el RPE se mantiene estable dentro del
                rango recomendado (Fase 1: 6-7, Fase 2: 7-8), tu
                acondicionamiento motor progresa de forma idónea. Si el volumen
                decrece pero el RPE se dispara hacia 9 o 10, se confirma un
                cuadro de inflamación sistémica profunda. ¡Presta atención!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
