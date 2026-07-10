import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ShieldAlert, TrendingUp } from "lucide-react";
import { ACCENT_COLORS_MAP } from "../lib/constants";

interface LogSet {
  weight: string;
  reps: string;
  rpe: string;
  rir?: string;
  timestamp: number;
}

interface HistoryItem {
  dayName: string;
  sets: LogSet[];
}

interface HistoryTableProps {
  history: HistoryItem[];
}

const historyTableContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const historyTableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

export default function HistoryTable({ history }: HistoryTableProps) {
  const [showChart, setShowChart] = useState(false);
  const [filterHighRpe, setFilterHighRpe] = useState(false);

  if (!history || history.length === 0) return null;

  // Custom weight parser
  const getSessionMaxWeight = (sets: LogSet[]) => {
    let maxW = 0;
    sets.forEach((set) => {
      const wStr = String(set.weight || "")
        .toLowerCase()
        .replace("kg", "")
        .trim();
      if (wStr === "p.c." || wStr === "pc" || wStr === "") {
        return;
      }
      const val = parseFloat(wStr);
      if (!isNaN(val) && val > maxW) {
        maxW = val;
      }
    });
    return maxW;
  };

  const chartData = useMemo(() => {
    return [...history].reverse().map((hist) => {
      const maxWeight = getSessionMaxWeight(hist.sets);
      return {
        name: hist.dayName.split(" - ")[0] || hist.dayName,
        fullName: hist.dayName,
        weight: maxWeight,
        displayWeight: maxWeight > 0 ? `${maxWeight} kg` : "P.C.",
        sets: hist.sets,
      };
    });
  }, [history]);

  const rpeComparisonData = useMemo(() => {
    if (!history || history.length === 0) return [];
    const currentSession = history[0];
    const currentSets = currentSession.sets || [];
    const prevSessions = history.slice(1, 4);

    return currentSets.map((set, idx) => {
      const currentRpeVal = parseFloat(set.rpe);
      const rpeActual =
        !isNaN(currentRpeVal) && currentRpeVal > 0 ? currentRpeVal : null;

      let prevSum = 0;
      let prevCount = 0;
      prevSessions.forEach((prevS) => {
        if (prevS.sets && prevS.sets[idx]) {
          const val = parseFloat(prevS.sets[idx].rpe);
          if (!isNaN(val) && val > 0) {
            prevSum += val;
            prevCount++;
          }
        }
      });
      const rpePromedio =
        prevCount > 0 ? parseFloat((prevSum / prevCount).toFixed(1)) : null;

      return {
        name: `S${idx + 1}`,
        rpeActual,
        rpePromedio,
        cargaActual: set.weight ? `${set.weight}kg` : "P.C.",
        repsActual: set.reps ? `${set.reps}r` : "Fallo",
      };
    });
  }, [history]);

  const hasRpeValues = useMemo(() => {
    return rpeComparisonData.some(
      (d) => d.rpeActual !== null || d.rpePromedio !== null,
    );
  }, [rpeComparisonData]);

  // Dynamically find current system accent color
  const activeColor = useMemo(() => {
    const savedColorId = localStorage.getItem("nexus_custom_accent_color");
    if (savedColorId && ACCENT_COLORS_MAP[savedColorId]) {
      return ACCENT_COLORS_MAP[savedColorId].color;
    }
    return "#1F51FF"; // default electric-blue
  }, []);

  return (
    <div className="w-full mt-2">
      {/* Toggle button for Chart & Filtering */}
      <div className="flex justify-between items-center mb-1.5 bg-zinc-950/40 border border-white/5 px-2 py-1 rounded-xs flex-wrap gap-2">
        <span className="text-[8px] text-neutral-400 uppercase font-mono tracking-wider">
          Bitácora Reciente
        </span>
        <div className="flex items-center gap-1.5">
          {!showChart && (
            <button
              type="button"
              onClick={() => setFilterHighRpe(!filterHighRpe)}
              className={`text-[8.5px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer transition-all px-1.5 py-0.5 rounded-xs border ${
                filterHighRpe
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-[#18181B] text-neutral-400 hover:text-white border-transparent hover:bg-[#27272A]"
              }`}
            >
              <ShieldAlert size={10} />
              <span>
                {filterHighRpe ? "Mostrando RPE > 9" : "Filtrar RPE > 9"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="text-[8.5px] font-mono hover:text-white uppercase font-bold flex items-center gap-1 cursor-pointer transition-all bg-[#18181B] hover:bg-[#27272A] px-1.5 py-0.5 rounded-xs"
            style={{ color: activeColor }}
          >
            <TrendingUp size={10} style={{ color: activeColor }} />
            <span>{showChart ? "Ver Tabla 📋" : "Ver Carga (Gráfica) 📊"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showChart ? (
          <motion.div
            key="chart-view"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#0A0A0B]/85 border border-white/5 p-2.5 rounded-sm mb-1.5"
          >
            <p className="text-[8px] font-mono text-neutral-500 uppercase mb-2 text-center tracking-wider">
              Evolución de Cargas Múltiples (kg) - Últimas {chartData.length} Sesiones
            </p>
            {chartData.every((d) => d.weight === 0) ? (
              <div className="text-[9px] font-mono text-neutral-500 italic text-center py-6">
                Todas las sesiones cargadas con Peso Corporal (P.C.) o sin registro de peso numérico
              </div>
            ) : (
              <div className="h-[95px] w-full mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="#888"
                      fontSize={7}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888"
                      fontSize={7}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-zinc-950 border border-[#3F3F46] p-1.5 font-mono text-[8px] rounded-xs shadow-xl text-left">
                              <p className="font-bold text-white mb-0.5 truncate max-w-[150px]">
                                {data.fullName}
                              </p>
                              <p style={{ color: activeColor }}>
                                Carga Max:{" "}
                                <span className="font-bold text-white">
                                  {data.displayWeight}
                                </span>
                              </p>
                              <p className="text-neutral-400">
                                Series:{" "}
                                <span className="text-white">
                                  {data.sets.length}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="weight"
                      fill={activeColor}
                      radius={[1.5, 1.5, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === chartData.length - 1
                              ? "#00f0ff"
                              : activeColor
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full custom-scrollbar overflow-x-auto"
          >
            <table className="w-full text-[9px] font-mono text-left border-collapse min-w-[200px]">
              <thead>
                <tr className="border-b border-[#3F3F46] text-neutral-500 uppercase">
                  <th className="py-1 pr-2 font-medium">Sesión</th>
                  <th className="py-1 px-2 font-medium">Series (Carga × Reps @ RPE)</th>
                </tr>
              </thead>
              <motion.tbody
                variants={{} as any}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {history.map((hist, histIdx) => {
                    const filteredSets = filterHighRpe
                      ? hist.sets.filter((set) => parseFloat(set.rpe) >= 9)
                      : hist.sets;

                    if (filterHighRpe && filteredSets.length === 0) return null;

                    const rowKey = `${hist.dayName}-${histIdx}-${hist.sets ? hist.sets.length : 0}`;

                    const rpes = hist.sets
                      .map((s) => parseFloat(s.rpe))
                      .filter((r) => !isNaN(r));
                    const sessionAvgRpe =
                      rpes.length > 0
                        ? rpes.reduce((a, b) => a + b, 0) / rpes.length
                        : 0;

                    return (
                      <motion.tr
                        key={rowKey}
                        variants={{} as any}
                        className={`border-b ${sessionAvgRpe > 9 ? "border-rose-500 shadow-sm bg-rose-500/5" : "border-white/5 last:border-b-0 hover:bg-[#18181B]"} transition-all`}
                        id={`history_row_${rowKey}`}
                      >
                        <td className="py-1.5 pr-2 whitespace-nowrap text-neutral-400 font-bold border-r border-white/5 align-top pt-2.5">
                          <div className="flex flex-col gap-1">
                            <span>{hist.dayName}</span>
                            {sessionAvgRpe > 9 && (
                              <span className="text-[7.5px] bg-rose-500 text-black px-1 py-0.5 rounded-xs font-black w-fit flex items-center gap-0.5 tracking-wider uppercase ">
                                <ShieldAlert size={8} /> RIESGO L4
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            {filteredSets.map((set, setIdx) => {
                              const isHighRpe = parseFloat(set.rpe) >= 9;
                              return (
                                <span
                                  key={setIdx}
                                  id={`history_set_${rowKey}_${setIdx}`}
                                  className={`border rounded px-1.5 py-0.5 text-[8.5px] font-mono flex items-center gap-1 shrink-0 ${
                                    isHighRpe
                                      ? "bg-rose-950/30 border-rose-500/30 text-rose-300"
                                      : "bg-[#18181B] border-[#3F3F46] text-neutral-300"
                                  }`}
                                >
                                  <span className="font-bold text-white">
                                    {set.weight ? `${set.weight}kg` : "P.C."}
                                  </span>
                                  <span className="text-neutral-500">×</span>
                                  <span className="text-emerald-400 font-semibold font-mono">
                                    {set.reps ? `${set.reps}r` : "Fallo"}
                                  </span>
                                  <span
                                    className={`px-1 rounded-xs text-[8px] font-black ${
                                      isHighRpe
                                        ? "bg-rose-500 text-black"
                                        : "bg-amber-400 text-black"
                                    }`}
                                  >
                                    R{set.rpe}
                                  </span>
                                  {set.rir && set.rir !== "N/D" && (
                                    <span className="text-neutral-400 text-[8px] italic">
                                      RIR{set.rir}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time RPE Comparison Chart */}
      {rpeComparisonData && rpeComparisonData.length > 0 && hasRpeValues && (
        <div className="mt-3 pt-2.5 border-t border-white/5 bg-[#0D0D10]/40 p-2 rounded-xs">
          <div className="flex justify-between items-center mb-1.5 px-0.5">
            <span className="text-[7.5px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp size={9} style={{ color: activeColor }} />
              Monitoreo Biomecánico RPE Actual vs. Histórico (Promedio 3)
            </span>
            <span className="text-[7px] font-mono text-neutral-500 italic bg-white/2.5 px-1 py-0.5 rounded-xs">
              Métrica de Fatiga SNC
            </span>
          </div>

          <div className="h-[75px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={rpeComparisonData}
                margin={{ top: 5, right: 10, left: -32, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis
                  dataKey="name"
                  stroke="#555"
                  fontSize={7}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#555"
                  fontSize={7}
                  tickLine={false}
                  axisLine={false}
                  domain={[1, 10]}
                  ticks={[2, 4, 6, 8, 10]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const rpeReal = payload.find(
                        (p) => p.dataKey === "rpeActual",
                      )?.value;
                      const rpeHist = payload.find(
                        (p) => p.dataKey === "rpePromedio",
                      )?.value;
                      return (
                        <div className="bg-zinc-950 border border-[#3F3F46] p-1.5 font-mono text-[8px] rounded-xs shadow-xl text-left">
                          <p className="font-bold text-white mb-1 uppercase tracking-wider">
                            {data.name} ({data.cargaActual} × {data.repsActual})
                          </p>
                          <p className="text-white flex items-center gap-1.5">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: activeColor }}
                            />
                            RPE Actual:{" "}
                            <span
                              className="font-bold"
                              style={{ color: activeColor }}
                            >
                              {rpeReal !== undefined && rpeReal !== null
                                ? `${rpeReal}/10`
                                : "S/D"}
                            </span>
                          </p>
                          {rpeHist !== undefined && rpeHist !== null && (
                            <p className="text-[#00f0ff] flex items-center gap-1.5 mt-0.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                              Promedio 3 Previos:{" "}
                              <span className="font-bold text-[#00f0ff]">
                                {rpeHist}/10
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rpeActual"
                  stroke={activeColor}
                  strokeWidth={1.8}
                  dot={{ r: 2.5, fill: activeColor, strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                  name="RPE Actual"
                  connectNulls
                />
                {history.length > 1 && (
                  <Line
                    type="monotone"
                    dataKey="rpePromedio"
                    stroke="#00f0ff"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    dot={{ r: 1.5, fill: "#00f0ff", strokeWidth: 0 }}
                    name="Promedio 3 Previos"
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Small Legend */}
          <div className="flex justify-center items-center gap-3 text-[7.5px] font-mono text-neutral-400 mt-1.5 border-t border-white/2.5 pt-1">
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-0.5"
                style={{ backgroundColor: activeColor }}
              />
              <span>RPE Actual</span>
            </div>
            {history.length > 1 ? (
              <div className="flex items-center gap-1">
                <span
                  className="w-2 h-0.5 border-t border-dashed border-cyan-400"
                  style={{ borderColor: "#00f0ff" }}
                />
                <span>
                  Promedio Anterior (Últimos {Math.min(3, history.length - 1)})
                </span>
              </div>
            ) : (
              <span
                className="text-neutral-500 italic text-[7px]"
                id="rpe_chart_no_history_legend"
              >
                (Siguiente sesión habilitará el comparativo histórico)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
