import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceArea,
} from "recharts";
import { WEEK_RPE_TARGET } from "../../lib/constants";
import { Activity } from "lucide-react";
import {
  computeChartData,
  computeRpeDistributionData,
  computeRpeComparisonInfo,
} from "../../lib/analyticsService";
import { SectionCard, Pill, EmptyState, TXT } from "../ui/primitives";
import { CHART } from "../../lib/chartTheme";

interface WeeklyRpeSectionProps {
  currentWeek: string;
  activeDayId: string | null;
  logsVersion: number;
  accentColor: string;
}

/**
 * Single home for the athlete's REAL weekly RPE picture:
 * per-day trend, intensity distribution, and the honest day-vs-prior-cycles
 * comparison. Only registered data is plotted — days without logs are gaps.
 */
export default function WeeklyRpeSection({
  currentWeek,
  activeDayId,
  logsVersion,
  accentColor,
}: WeeklyRpeSectionProps) {
  const chartData = useMemo(
    () => computeChartData(currentWeek, logsVersion),
    [currentWeek, logsVersion],
  );
  const distributionData = useMemo(
    () => computeRpeDistributionData(currentWeek, logsVersion),
    [currentWeek, logsVersion],
  );
  const comparison = useMemo(
    () =>
      activeDayId
        ? computeRpeComparisonInfo(currentWeek, activeDayId, logsVersion)
        : null,
    [currentWeek, activeDayId, logsVersion],
  );

  const realDaysCount = chartData.filter((d) => d.isReal).length;
  const hasAnyData = realDaysCount > 0;

  return (
    <SectionCard
      title="TU SEMANA REAL (RPE REGISTRADO)"
      icon={<Activity size={15} className="text-cyan-300" />}
      subtitle={`Semana ${currentWeek.replace("w", "")} — solo datos que registraste, sin estimaciones`}
      badge={
        hasAnyData ? (
          <Pill tone="accent">{realDaysCount}/7 DÍAS CON DATOS</Pill>
        ) : (
          <Pill tone="neutral">SIN REGISTROS AÚN</Pill>
        )
      }
    >
      {!hasAnyData ? (
        <EmptyState
          message="Todavía no registraste RPE esta semana"
          hint="Cargá series con el logger de cada ejercicio o completá el wizard al final del día. Acá vas a ver tu intensidad real por día, sin datos inventados."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* RPE per weekday */}
          <div className="space-y-2">
            <div className={TXT.label}>
              RPE PROMEDIO POR DÍA
              {WEEK_RPE_TARGET[currentWeek] && (
                <span className="ml-2 normal-case text-[color:var(--color-label)]" style={{ color: accentColor }}>
                  · objetivo {WEEK_RPE_TARGET[currentWeek].min}–{WEEK_RPE_TARGET[currentWeek].max}
                </span>
              )}
            </div>
            <div className="h-[180px] bg-black/40 rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  {WEEK_RPE_TARGET[currentWeek] && (
                    <ReferenceArea
                      y1={WEEK_RPE_TARGET[currentWeek].min}
                      y2={WEEK_RPE_TARGET[currentWeek].max}
                      fill={accentColor}
                      fillOpacity={0.12}
                      stroke={accentColor}
                      strokeOpacity={0.3}
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"
                    />
                  )}
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
                    ticks={[2, 4, 6, 8, 10]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        if (data.isMissed) {
                          return (
                            <div className="bg-[color:var(--color-card)] p-2 text-[10px] font-mono shadow-md text-left z-50">
                              <p className="font-bold text-white uppercase">{data.name}</p>
                              <p className="text-neutral-400">Día perdido — sin registro</p>
                            </div>
                          );
                        }
                        if (!data.isReal) return null;
                        return (
                          <div className="bg-[color:var(--color-card)] p-2 text-[10px] font-mono shadow-md text-left z-50">
                            <p className="font-bold text-white uppercase">{data.name}</p>
                            <p style={{ color: accentColor }}>
                              RPE: <span className="text-white font-bold">{data.rpe}/10</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rpe"
                    stroke={CHART.cyan}
                    strokeWidth={2.5}
                    connectNulls={false}
                    dot={(props: any) => {
                      const { cx, cy, key, payload } = props;
                      if (cx == null || cy == null) return <g key={key} />;
                      // Día perdido: aro ámbar hueco en 0 (cierra el hueco de la
                      // línea sin fingir un RPE). Día real: punto cian (dato medido).
                      return payload?.isMissed ? (
                        <circle key={key} cx={cx} cy={cy} r={4.5} fill="var(--color-card)" stroke={CHART.missed} strokeWidth={2} />
                      ) : (
                        <circle key={key} cx={cx} cy={cy} r={4} fill="var(--color-card)" stroke={CHART.cyan} strokeWidth={2} />
                      );
                    }}
                    activeDot={{ r: 5, fill: CHART.cyan }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-mono text-[color:var(--color-label)] leading-relaxed">
              Los días sin punto no tienen registros. Un punto gris hueco en 0 es un día marcado como perdido.
            </p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <div className={TXT.label}>DISTRIBUCIÓN DE INTENSIDAD (RPE 1-10)</div>
            <div className="h-[180px] bg-black/40 rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis
                    dataKey="rpeName"
                    stroke={CHART.tick.fill}
                    fontSize={9}
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                    tickFormatter={(val) => val.replace("RPE ", "")}
                  />
                  <YAxis
                    stroke={CHART.tick.fill}
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[color:var(--color-card)] p-2 text-[10px] font-mono shadow-md text-left z-50">
                            <p className="font-bold text-white uppercase">{data.rpeName}</p>
                            <p className="text-neutral-300">
                              {data.frequency} {data.frequency === 1 ? "serie" : "series"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="frequency">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.displayColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-mono text-[color:var(--color-label)] leading-relaxed">
              Verde: liviano (1-4) · Lima: moderado (5-7) · Rosa: pesado (8-9) · Rojo: máximo (10).
            </p>
          </div>
        </div>
      )}

      {/* Honest day-vs-prior-cycles comparison */}
      {comparison && comparison.hasCurrentReal && (
        <div className="mt-5 bg-black/50 p-4 rounded-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-2">
            <span className={TXT.label}>HOY VS. MISMO DÍA EN OTRAS SEMANAS</span>
            <Pill
              tone={
                !comparison.hasComparison
                  ? "neutral"
                  : comparison.status === "warning"
                    ? "danger"
                    : comparison.status === "good"
                      ? "good"
                      : "neutral"
              }
            >
              {comparison.label}
            </Pill>
          </div>

          {comparison.hasComparison ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={TXT.label}>HOY</div>
                  <div className="text-2xl font-brutalist font-black text-white">
                    {comparison.currentAvg}
                  </div>
                </div>
                <div className="border-l border-r border-[color:var(--color-line)]">
                  <div className={TXT.label}>CICLOS PREVIOS</div>
                  <div className="text-2xl font-brutalist font-black text-neutral-400">
                    {comparison.priorAvg}
                  </div>
                </div>
                <div>
                  <div className={TXT.label}>DIFERENCIA</div>
                  <div
                    className={`text-2xl font-brutalist font-black ${
                      comparison.status === "warning"
                        ? "text-rose-400"
                        : comparison.status === "good"
                          ? "text-emerald-400"
                          : "text-white"
                    }`}
                  >
                    {comparison.diff !== null && comparison.diff > 0 ? "+" : ""}
                    {comparison.diff}
                  </div>
                </div>
              </div>
              <p
                className={`text-[11px] font-mono font-bold leading-relaxed ${
                  comparison.status === "warning"
                    ? "text-rose-400"
                    : comparison.status === "good"
                      ? "text-emerald-400"
                      : "text-neutral-300"
                }`}
              >
                {comparison.message}
              </p>
              <p className="text-[10px] font-mono text-neutral-400 italic leading-relaxed">
                L4: "{comparison.advice}"
              </p>
            </>
          ) : (
            <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
              {comparison.message}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
