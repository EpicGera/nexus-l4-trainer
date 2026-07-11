import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { TrendingUp, Zap } from "lucide-react";
import { SectionCard, Pill, EmptyState, TXT } from "../ui/primitives";
import { CHART } from "../../lib/chartTheme";

interface FatigueAndIntensitySectionProps {
  currentWeek: string;
}

interface SetRecord {
  rpe: number;
  timestamp: number;
}

/**
 * Fatigue over time, computed from the REAL timestamp stored in every set
 * (set.timestamp, written by the logger/wizard) — never from key names or
 * random values. Days without registered sets simply don't appear.
 */
export default function FatigueAndIntensitySection({
  currentWeek,
}: FatigueAndIntensitySectionProps) {
  const [rpeTrendRange, setRpeTrendRange] = useState<number>(14);
  const [syncTrigger, setSyncTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => setSyncTrigger((prev) => prev + 1);
    window.addEventListener("nexus_storage_changed", handleStorageChange);
    window.addEventListener("nexus_logs_updated", handleStorageChange);
    return () => {
      window.removeEventListener("nexus_storage_changed", handleStorageChange);
      window.removeEventListener("nexus_logs_updated", handleStorageChange);
    };
  }, []);

  // Single pass: collect every set that has BOTH a valid RPE and a real timestamp.
  const allSets: SetRecord[] = useMemo(() => {
    const sets: SetRecord[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("nexus_logs_")) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) continue;
            parsed.forEach((entry: any) => {
              const rpe = parseFloat(entry?.rpe);
              const ts = typeof entry?.timestamp === "number" ? entry.timestamp : NaN;
              if (!isNaN(rpe) && rpe > 0 && !isNaN(ts) && ts > 0) {
                sets.push({ rpe, timestamp: ts });
              }
            });
          } catch {
            /* skip malformed */
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return sets;
  }, [currentWeek, syncTrigger]);

  // Group by calendar day within the selected window.
  const { trendData, windowAvg, setsInWindow } = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const byDay = new Map<number, { sum: number; count: number }>();
    let totalSum = 0;
    let totalCount = 0;

    allSets.forEach((s) => {
      const daysAgo = Math.floor((now - s.timestamp) / dayMs);
      if (daysAgo >= 0 && daysAgo <= rpeTrendRange) {
        const bucket = byDay.get(daysAgo) || { sum: 0, count: 0 };
        bucket.sum += s.rpe;
        bucket.count++;
        byDay.set(daysAgo, bucket);
        totalSum += s.rpe;
        totalCount++;
      }
    });

    const points = Array.from(byDay.entries())
      .sort((a, b) => b[0] - a[0]) // oldest first
      .map(([daysAgo, { sum, count }]) => ({
        name: daysAgo === 0 ? "Hoy" : `-${daysAgo}d`,
        rpeAvg: Number((sum / count).toFixed(1)),
        sets: count,
      }));

    return {
      trendData: points,
      windowAvg: totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : null,
      setsInWindow: totalCount,
    };
  }, [allSets, rpeTrendRange]);

  // CNS load: last 14 days of real data.
  const cns = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const recent = allSets.filter((s) => now - s.timestamp <= 14 * dayMs);
    if (recent.length === 0) return null;

    const avg = recent.reduce((a, b) => a + b.rpe, 0) / recent.length;
    const scalePercent = Math.min(100, Math.max(0, (avg / 10) * 100));

    let stateLabel = "ESTADO ESTABLE";
    let tone: "good" | "warn" | "danger" = "good";
    let progressBg = "bg-white";
    let detailAdvice =
      "Tus vías neuromotoras están despejadas. Respetá las pausas y dormí +7.5 horas.";

    if (avg > 8.5) {
      stateLabel = "SNC AL LÍMITE";
      tone = "danger";
      progressBg = "bg-rose-600";
      detailAdvice =
        "Doble aviso biomecánico: reducí un 15% el peso de tu cargada. En semana 4, descarga total.";
    } else if (avg > 7.4) {
      stateLabel = "FATIGA REGULADA";
      tone = "warn";
      progressBg = "bg-yellow-500";
      detailAdvice =
        "Carga acumulativa normal de media fase. Evitá añadir accesorios extenuantes.";
    }

    return {
      avg: Number(avg.toFixed(1)),
      scalePercent,
      stateLabel,
      tone,
      progressBg,
      detailAdvice,
      setCount: recent.length,
    };
  }, [allSets]);

  const isHighFatigue = windowAvg !== null && windowAvg > 8;
  const trendLineColor = isHighFatigue ? "#DC2626" : "#FFFFFF";

  return (
    <div className="space-y-5">
      {/* ── TREND OVER TIME ───────────────────────────────────────────── */}
      <SectionCard
        title="TENDENCIA DE FATIGA (RPE EN EL TIEMPO)"
        icon={<TrendingUp size={15} className="text-white" />}
        subtitle="Promedio diario calculado con la fecha real de cada serie registrada"
        badge={
          <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-bold border bg-black border-[color:var(--color-line)] p-1 rounded">
            {[7, 14, 30].map((days) => (
              <button
                key={`range-${days}`}
                onClick={() => setRpeTrendRange(days)}
                className={`px-2.5 py-1.5 rounded transition-all cursor-pointer leading-none ${
                  rpeTrendRange === days
                    ? "bg-[color:var(--color-card-2)] text-white border border-white/40"
                    : "hover:bg-[color:var(--color-card-2)] border border-transparent"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        }
      >
        {trendData.length === 0 ? (
          <EmptyState
            message={`Sin series con RPE en los últimos ${rpeTrendRange} días`}
            hint="Cada serie que registrás guarda su fecha real. Cuando cargues entrenamientos, esta curva mostrará tu fatiga día a día."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={isHighFatigue ? "danger" : "good"}>
                RPE PROMEDIO {rpeTrendRange}D: {windowAvg}
              </Pill>
              <Pill tone="neutral">{setsInWindow} SERIES ANALIZADAS</Pill>
              {isHighFatigue && (
                <span className="text-[11px] font-mono font-bold text-rose-400">
                  ⚠️ Por encima del umbral continuo recomendado (8.0) — bajá cargas 10-15%.
                </span>
              )}
            </div>

            <div className="h-[200px] bg-black/40 rounded p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRpe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={trendLineColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={trendLineColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis
                    dataKey="name"
                    stroke={CHART.tick.fill}
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                  />
                  <YAxis
                    stroke={CHART.tick.fill}
                    fontSize={10}
                    domain={[0, 10]}
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      borderColor: "#3F3F46",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    formatter={(value: number, name: string) =>
                      name === "rpeAvg"
                        ? [`${value}/10`, "RPE Promedio"]
                        : [value, "Series"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="rpeAvg"
                    stroke={trendLineColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRpe)"
                    name="rpeAvg"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── CNS LOAD ──────────────────────────────────────────────────── */}
      <SectionCard
        title="CARGA NEURAL (SNC) — ÚLTIMOS 14 DÍAS"
        icon={<Zap size={15} className="text-yellow-400" />}
        subtitle="Presión acumulada sobre tu sistema nervioso central según tu RPE real"
        badge={
          cns ? (
            <Pill tone={cns.tone}>● {cns.stateLabel}</Pill>
          ) : (
            <Pill tone="neutral">SIN DATOS</Pill>
          )
        }
      >
        {!cns ? (
          <EmptyState
            message="Sin registros en los últimos 14 días"
            hint="Esta métrica necesita series con RPE para medir cuánta presión acumula tu sistema nervioso."
          />
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            <div className="space-y-2">
              <div className={TXT.label}>PRESIÓN NEURAL</div>
              <div className="flex items-center gap-3">
                <span className="font-brutalist text-3xl font-black text-white tracking-wide">
                  {cns.avg}
                  <span className="text-xs text-[color:var(--color-label)] font-mono"> /10</span>
                </span>
                <div className="flex-grow bg-neutral-900 h-3 rounded overflow-hidden p-0.5 ">
                  <div
                    className={`h-full ${cns.progressBg} transition-all duration-500 rounded-sm`}
                    style={{ width: `${cns.scalePercent}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] font-mono text-[color:var(--color-label)]">
                Basado en {cns.setCount} series registradas.
              </p>
            </div>
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-[color:var(--color-line)] pt-3 md:pt-0 md:pl-6">
              <p className="text-[11px] font-mono text-neutral-300 leading-relaxed">
                <strong className="text-white uppercase font-black">
                  PRESCRIPCIÓN CF-L4:
                </strong>{" "}
                {cns.detailAdvice}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[color:var(--color-line)] flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-[color:var(--color-label)] uppercase tracking-wider">
            <span><span className="text-emerald-400">●</span> Estable ≤ 7.4</span>
            <span><span className="text-amber-400">●</span> Regulada 7.4–8.5</span>
            <span><span className="text-rose-400">●</span> Al límite &gt; 8.5</span>
          </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
