import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Cell,
} from "recharts";
import { Dumbbell, FileText } from "lucide-react";
import { ACCENT_COLORS_MAP, WEEK_ACCENT_COLORS } from "../../lib/constants";
import { SectionCard, Pill, StatBox, EmptyState, NexusButton, TXT } from "../ui/primitives";

interface VolumeProgressionSectionProps {
  currentWeek: string;
  handleGenerateMonthlyReportPDF: () => void;
  getMonthlyVolumeStats: () => {
    weeklyVolume: Record<string, number>;
    weeklyCount: Record<string, number>;
    weeklyRpeSum: Record<string, number>;
    weeklyRpeCount: Record<string, number>;
    totalVolume: number;
    totalLogsCount: number;
  };
}

const PHASE_NAMES: Record<string, string> = {
  w1: "ACUMULACIÓN",
  w2: "INTENSIFICACIÓN",
  w3: "PICO",
  w4: "DELOAD",
};

/**
 * Real tonnage per week (kg × reps from registered sets) with the average RPE
 * line on a second axis — volume and effort in ONE chart, no invented targets.
 */
export default function VolumeProgressionSection({
  currentWeek,
  handleGenerateMonthlyReportPDF,
  getMonthlyVolumeStats,
}: VolumeProgressionSectionProps) {
  const stats = getMonthlyVolumeStats();

  // Weeks come from the data itself (numeric sort) — the old fixed w1..w4 map
  // silently hid week 5+ from the chart. Always show at least the classic 4.
  const weekKeys = Array.from(
    new Set(["w1", "w2", "w3", "w4", ...Object.keys(stats.weeklyVolume)]),
  ).sort(
    (a, b) => (parseInt(a.slice(1), 10) || 0) - (parseInt(b.slice(1), 10) || 0),
  );

  const chartData = weekKeys.map((wk) => {
    const volume = Math.round(stats.weeklyVolume[wk] || 0);
    const rpeCount = stats.weeklyRpeCount[wk] || 0;
    const rpe =
      rpeCount > 0
        ? Number(((stats.weeklyRpeSum[wk] || 0) / rpeCount).toFixed(1))
        : null;
    return {
      week: wk,
      name: `SEM ${wk.replace("w", "")}`,
      phase: PHASE_NAMES[wk],
      volume,
      rpe,
      color: WEEK_ACCENT_COLORS[wk]?.color || "#00f0ff",
    };
  });

  const totalReal = chartData.reduce((sum, d) => sum + d.volume, 0);
  const hasData = totalReal > 0 || stats.totalLogsCount > 0;

  // Deload sanity check: the cycle's deload week (w4) vs the athlete's own
  // loading weeks (no fixed kg targets). Only meaningful in the 4-week cycle.
  const deload = chartData.find((d) => d.week === "w4");
  const loading = chartData.filter(
    (d) => ["w1", "w2", "w3"].includes(d.week) && d.volume > 0,
  );
  const loadAvg = loading.length
    ? loading.reduce((s, d) => s + d.volume, 0) / loading.length
    : 0;
  const isW4Overdoing =
    !!deload && deload.volume > 0 && loadAvg > 0 && deload.volume > loadAvg * 0.75;

  let accentColor = "#1F51FF";
  const savedColorId = localStorage.getItem("nexus_custom_accent_color");
  if (savedColorId && ACCENT_COLORS_MAP[savedColorId]) {
    accentColor = ACCENT_COLORS_MAP[savedColorId].color;
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="VOLUMEN REAL POR SEMANA (TONELAJE)"
        icon={<Dumbbell size={15} className="text-cyan-300" />}
        subtitle="Kg × reps de tus series registradas, con tu RPE promedio superpuesto"
        badge={
          <Pill tone="accent">
            FASE ACTUAL: {PHASE_NAMES[currentWeek] || "FUERA DE CICLO"}
          </Pill>
        }
        id="totalVolumeChartSection"
      >
        {!hasData ? (
          <EmptyState
            message="Todavía no hay tonelaje registrado este ciclo"
            hint="Registrá pesos y reps con el logger o importá tu CSV de Drive. Acá vas a ver cuántos kg moviste por semana y con qué esfuerzo."
          />
        ) : (
          <div className="space-y-4">
            {/* Totals row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox
                label="TONELAJE TOTAL"
                value={totalReal.toLocaleString("es-ES")}
                unit="kg"
                tone="accent"
              />
              <StatBox
                label="SERIES REGISTRADAS"
                value={stats.totalLogsCount}
                tone="neutral"
              />
              <StatBox
                label="SEMANA MÁS PESADA"
                value={
                  chartData.reduce((max, d) => (d.volume > max.volume ? d : max), chartData[0])
                    .name
                }
                tone="neutral"
              />
              <StatBox
                label="DELOAD (SEM 4)"
                value={
                  chartData[3].volume === 0
                    ? "—"
                    : isW4Overdoing
                      ? "EXCESIVO"
                      : "CORRECTO"
                }
                tone={
                  chartData[3].volume === 0
                    ? "neutral"
                    : isW4Overdoing
                      ? "danger"
                      : "good"
                }
                hint={
                  chartData[3].volume === 0
                    ? "sin datos"
                    : isW4Overdoing
                      ? "supera el 75% de tus semanas de carga"
                      : "bien por debajo de tu carga media"
                }
              />
            </div>

            {/* ONE chart: volume bars + RPE line */}
            <div className="h-[260px] bg-black/40 border border-white/5 rounded p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 15, right: 5, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis
                    dataKey="name"
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f43f5e"
                    fontSize={10}
                    domain={[0, 10]}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#333",
                      fontSize: 11,
                      fontFamily: "monospace",
                    }}
                    labelStyle={{ color: "#fff", fontWeight: "bold" }}
                    formatter={(value: number, name: string) =>
                      name === "Tonelaje (kg)"
                        ? [`${value.toLocaleString("es-ES")} kg`, name]
                        : [`${value}/10`, name]
                    }
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
                    verticalAlign="top"
                    height={30}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="volume"
                    name="Tonelaje (kg)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={56}
                    animationDuration={800}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.week}
                        fill={entry.color}
                        fillOpacity={entry.week === currentWeek ? 0.9 : 0.35}
                        stroke={entry.week === currentWeek ? entry.color : "none"}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rpe"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    name="RPE Promedio"
                    connectNulls={false}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
              <strong className="text-white">Cómo leerlo:</strong> si el volumen sube y el
              RPE se mantiene dentro del objetivo de la fase, tu acondicionamiento progresa
              bien. Si el volumen baja pero el RPE se dispara hacia 9-10, hay fatiga
              sistémica acumulada: priorizá la descarga. La barra resaltada es tu semana actual.
            </p>
          </div>
        )}
      </SectionCard>

      {/* PDF REPORT EXPORT */}
      <SectionCard
        title="INFORME MENSUAL (PDF)"
        icon={<FileText size={15} style={{ color: accentColor }} />}
        subtitle="Reporte clínico del mes: volumen, picos de fatiga y tendencia RPE"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className={TXT.body}>
              Compila tu tonelaje acumulado, la relación volumen/RPE por microciclo y la
              tendencia semanal en un PDF listo para compartir con tu coach.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-neutral-300">
              <span>
                Series:{" "}
                <strong className="text-cyan-300">{stats.totalLogsCount}</strong>
              </span>
              <span>
                Tonelaje:{" "}
                <strong style={{ color: accentColor }}>
                  {stats.totalVolume.toLocaleString("es-ES")} kg
                </strong>
              </span>
            </div>
          </div>
          <NexusButton
            variant="primary"
            icon={<FileText size={13} />}
            onClick={handleGenerateMonthlyReportPDF}
            className="shrink-0"
          >
            EXPORTAR PDF
          </NexusButton>
        </div>
      </SectionCard>
    </div>
  );
}
