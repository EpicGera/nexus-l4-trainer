import React from "react";
import { motion } from "framer-motion";
import { User } from "firebase/auth";
import { AthleteState, DayWorkout } from "../types/workout";
import { pushAllLocalToCloud } from "../lib/syncEngine";
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
} from "recharts";
import {
  CloudLightning,
  Trophy,
  Upload,
  FileText,
  Check,
  Zap,
} from "lucide-react";

interface TelemetryBoardProps {
  athlete: AthleteState;
  currentWeek: string;
  chartData: any[];
  rpeDistributionData: any[];
  rpeComparisonInfo: any;
  currentXp: number;
  xpPercentage: number;
  weeklyCompletionInfo: { completedCount: number; percentage: number };
  activeDay: DayWorkout | null;
  activeDayLoggingPercentage: number;
  earnedLootList: string[];
  currentUser: User | null;
  manualSyncState: "idle" | "syncing" | "success" | "error";
  setManualSyncState: React.Dispatch<React.SetStateAction<"idle" | "syncing" | "success" | "error">>;
  setShowResetModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setTempAthlete: (athlete: AthleteState) => void;
  handleExportLocalHistory: () => void;
  handleExportLocalHistoryCSV: () => void;
  activeColorSet: { color: string; hover?: string; pulse?: string; text?: string; shadow?: string };
}

export default function TelemetryBoard({
  athlete,
  currentWeek,
  chartData,
  rpeDistributionData,
  rpeComparisonInfo,
  currentXp,
  xpPercentage,
  weeklyCompletionInfo,
  activeDay,
  activeDayLoggingPercentage,
  earnedLootList,
  currentUser,
  manualSyncState,
  setManualSyncState,
  setShowResetModal,
  setShowProfileModal,
  setTempAthlete,
  handleExportLocalHistory,
  handleExportLocalHistoryCSV,
  activeColorSet,
}: TelemetryBoardProps) {
  return (
    <section
      className="mt-4 p-6 border-4 border-double border-white/20 bg-pure-black/95 backdrop-blur-md"
      data-purpose="rpg-dashboard"
    >
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch font-condensed font-bold">
        {/* Left Block: Athlete attributes */}
        <motion.div layout className="space-y-4 flex flex-col justify-start">
          <div className="flex bg-electric-blue text-pure-white px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md shadow-electric-blue/20 leading-none">
            ATLETA: {athlete.identity}
          </div>
          <div className="space-y-3 tracking-[0.08em] leading-relaxed font-condensed text-neutral-300 uppercase text-xs md:text-sm pt-2">
            <div>
              CONDICIÓN CLÍNICA:{" "}
              <span className="text-amber-500 font-bold tracking-[0.06em]">
                {athlete.condition}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setTempAthlete(athlete);
              setShowProfileModal(true);
            }}
            className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-electric-blue hover:text-white flex items-center gap-1 transition-all cursor-pointer self-start border-b border-dashed border-electric-blue hover:border-white w-auto mt-2"
          >
            ⚙️ EDITAR PERFIL COMPLETO
          </button>
        </motion.div>

        {/* Middle Block: Co-Op Host conditions */}
        <motion.div layout className="space-y-4 flex flex-col justify-start border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 lg:pl-8">
          <div className="flex bg-pure-white text-pure-black px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md leading-none">
            CONEXIÓN COMUNIDAD (CO-OP)
          </div>
          <div className="space-y-3 tracking-[0.08em] leading-relaxed font-condensed pt-2 text-left">
            <div className="text-lg lg:text-xl text-emerald-400 flex items-center gap-2">
              <span className="text-xs">●</span> LUK: CO-OP READY (SEDE HAEDO)
            </div>
            <div className="text-lg lg:text-xl text-purple-400 flex items-center gap-2">
              <span className="text-xs">●</span> FLOR: SUPPORT ACTIVE (MURPH INTEGRADO)
            </div>
          </div>
        </motion.div>

        {/* Third Block: Performance Trend Chart */}
        <motion.div layout className="space-y-4 flex flex-col justify-start border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6 lg:pl-8">
          <div className="flex bg-electric-blue text-pure-white px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md shadow-electric-blue/20 leading-none">
            TENDENCIA RPE
          </div>
          <div className="text-xs text-neutral-400 font-mono uppercase tracking-[0.12em] pt-1 text-left">
            FATIGA SEMANA {currentWeek.replace("w", "")}
          </div>
          <div className="h-[95px] w-full mt-1" id="rpeChartContainer">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
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
                  stroke="#888"
                  fontSize={10}
                  domain={[0, 10]}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                  ticks={[2, 4, 6, 8, 10]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0E0E11] border border-electric-blue p-2 text-[10px] font-mono shadow-md text-left z-50">
                          <p className="font-bold text-white uppercase">
                            {data.name}
                          </p>
                          <p className="text-electric-blue">
                            RPE:{" "}
                            <span className="text-white font-bold">
                              {data.rpe ? `${data.rpe}/10` : "S/D"}
                            </span>
                          </p>
                          <p className="text-[8px] text-neutral-500 mt-0.5 uppercase">
                            {data.isReal ? "● REGISTRADO" : "○ MODELADO L4"}
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
                  stroke={activeColorSet.color}
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    stroke: activeColorSet.color,
                    strokeWidth: 1,
                    fill: "#000",
                  }}
                  activeDot={{ r: 5, fill: activeColorSet.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution Chart of Effort Intensities */}
          <div className="border-t border-white/10 pt-2 mt-1 space-y-1">
            <div className="text-xs text-neutral-400 font-mono uppercase tracking-[0.12em] pt-1 text-left">
              DISTRIBUCIÓN INTENSIDAD RPE (1-10)
            </div>
            <div className="h-[95px] w-full" id="rpeDistChartContainer">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rpeDistributionData}
                  margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis
                    dataKey="rpeName"
                    stroke="#888"
                    fontSize={8}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                    tickFormatter={(val) => val.replace("RPE ", "")}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#333" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0E0E11] border border-electric-blue p-2 text-[10px] font-mono shadow-md text-left z-50">
                            <p className="font-bold text-white uppercase">
                              {data.rpeName}
                            </p>
                            <p className="text-electric-blue">
                              FRECUENCIA:{" "}
                              <span className="text-white font-bold">
                                {data.frequency}{" "}
                                {data.frequency === 1 ? "VEZ" : "VECES"}
                              </span>
                            </p>
                            <p className="text-[8px] text-neutral-500 mt-0.5 uppercase">
                              {data.isReal ? "● REGISTRADO" : "○ MODELADO L4"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="frequency" fill={activeColorSet.color}>
                    {rpeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.displayColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dynamic RPE Comparative & Overtraining Detector Alert */}
            {rpeComparisonInfo && (
              <div className="bg-[#0b0c10] border border-white/10 p-3.5 space-y-3.5 rounded-sm select-none">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase font-mono">
                    // HISTORIC COMPARISON (VS PREVIOUS CYCLES)
                  </span>
                  <span
                    className={`text-[8.5px] font-black px-2 py-0.5 rounded-xs tracking-widest uppercase font-mono leading-none ${
                      rpeComparisonInfo.status === "warning"
                        ? "bg-red-600/25 text-red-400 border border-red-500/30"
                        : rpeComparisonInfo.status === "good"
                          ? "bg-emerald-600/25 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {rpeComparisonInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                      PROPUESTO SESIÓN
                    </div>
                    <div className="text-xl font-bold font-brutalist text-white tracking-widest flex items-baseline justify-center gap-1 leading-none">
                      <span>{rpeComparisonInfo.currentAvg}</span>
                      <span className="text-[9px] text-neutral-500">AVG</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                      MEDIA ANT.
                    </div>
                    <div className="text-xl font-bold font-brutalist text-neutral-400 tracking-widest flex items-baseline justify-center gap-1 leading-none">
                      <span>{rpeComparisonInfo.priorAvg}</span>
                      <span className="text-[9px] text-neutral-500">AVG</span>
                    </div>
                  </div>
                </div>

                {/* Dev-style deviation meter bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-neutral-400">
                    <span>DEVIACIÓN ADAPTATIVA CF-L4</span>
                    <span
                      className={
                        rpeComparisonInfo.status === "warning"
                          ? "text-red-400 font-extrabold"
                          : "text-neutral-400 font-bold"
                      }
                    >
                      {rpeComparisonInfo.diff > 0
                        ? `+${rpeComparisonInfo.diff}`
                        : rpeComparisonInfo.diff}{" "}
                      RPE
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-950 border border-white/5 p-0.5 rounded-xs relative overflow-hidden flex">
                    {/* Zero center marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />

                    {/* Negative bar (good) or Positive bar (warning) */}
                    {rpeComparisonInfo.diff < 0 ? (
                      <div
                        className="h-full bg-emerald-500 self-center rounded-xs opacity-90 transition-all duration-300"
                        style={{
                          marginLeft: `${Math.max(10, 50 - Math.min(40, Math.abs(rpeComparisonInfo.diff * 12)))}%`,
                          width: `${Math.min(40, Math.abs(rpeComparisonInfo.diff * 12))}%`,
                        }}
                      />
                    ) : (
                      <div
                        className={`h-full self-center rounded-xs opacity-90 transition-all duration-300 ${
                          rpeComparisonInfo.diff >= 0.8
                            ? "bg-red-500 shadow-sm"
                            : "bg-electric-blue"
                        }`}
                        style={{
                          marginLeft: "50%",
                          width: `${Math.min(48, rpeComparisonInfo.diff * 12)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <p
                    className={`text-[9.5px] font-bold leading-relaxed uppercase ${
                      rpeComparisonInfo.status === "warning"
                        ? "text-red-400"
                        : rpeComparisonInfo.status === "good"
                          ? "text-emerald-400"
                          : "text-neutral-300"
                    }`}
                  >
                    {rpeComparisonInfo.message}
                  </p>
                  <p className="text-[9px] font-mono text-neutral-400 italic leading-relaxed">
                    L4 CUE: "{rpeComparisonInfo.advice}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Block: Real-time XP & Progress */}
        <motion.div layout className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 lg:pl-8">
          <div className="space-y-4">
            <div className="flex bg-pure-white text-pure-black px-4 py-2 text-md lg:text-lg font-brutalist tracking-[0.12em] w-full min-h-[52px] h-[52px] items-center justify-center text-center shadow-md leading-none">
              VOLUMEN DE TRABAJO
            </div>

            {/* 1. GENERAL EXP PROGRESS GAUGE */}
            <div className="space-y-1.5 text-left pt-1">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  // REPS ACUMULADAS ATLETA
                </span>
                <span className="text-xs font-mono font-black text-pure-white leading-none">
                  <motion.span
                    key={currentXp}
                    initial={{ scale: 1.3, color: "#39ff14" }}
                    animate={{ scale: 1, color: "#00f0ff" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="inline-block"
                  >
                    {currentXp}
                  </motion.span>{" "}
                  / 2000 REPS
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                <motion.div
                  className="h-full bg-electric-blue shadow-blue-glow"
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                  }}
                />
              </div>
            </div>

            {/* 2. WEEKLY COMPLETION GAUGE */}
            <div className="space-y-1.5 text-left border-t border-white/5 pt-2.5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  // PROGRESO SEMANA ACTIVADA
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 leading-none">
                  {weeklyCompletionInfo.completedCount} / 7 COMPLETO ({weeklyCompletionInfo.percentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                <motion.div
                  className="h-full bg-amber-400 shadow-sm"
                  animate={{
                    width: `${weeklyCompletionInfo.percentage}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 85,
                    damping: 16,
                  }}
                />
              </div>
            </div>

            {/* 3. DAILY TRACKING LOG GAUGE */}
            {activeDay && (
              <div className="space-y-1.5 text-left border-t border-white/5 pt-2.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    // BITÁCORA TÉCNICA DIARIA
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 leading-none">
                    {activeDayLoggingPercentage}% REGISTROS HECHOS
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-950 border border-white/10 p-0.5 overflow-hidden rounded-xs">
                  <motion.div
                    className="h-full bg-[#39ff14] shadow-sm"
                    animate={{
                      width: `${activeDayLoggingPercentage}%`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 15,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap text-left">
            <div className="flex gap-2 flex-wrap">
              <button
                className="bg-neutral-950 text-neutral-400 hover:text-white font-mono border border-white/15 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase"
                onClick={() => setShowResetModal(true)}
                type="button"
              >
                RESET ARCHIVE
              </button>
              <button
                className="bg-neutral-950 text-[#00f0ff] hover:text-white font-mono border border-[#00f0ff]/30 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1"
                onClick={handleExportLocalHistory}
                type="button"
                title="Exportar bitácora local completa en archivo JSON descargable para backup"
              >
                <Upload size={10} className="rotate-180" /> EXPORTAR JSON(DB)
              </button>
              <button
                className="bg-neutral-950 text-[#ff007f] hover:text-white font-mono border border-[#ff007f]/30 px-2 py-1 text-[8.5px] font-bold tracking-widest hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1"
                onClick={handleExportLocalHistoryCSV}
                type="button"
                title="Exportar bitácora estructurada en formato Excel (CSV) para análisis externo"
              >
                <FileText size={10} /> EXPORTAR CSV(EXCEL)
              </button>
              <button
                className={`font-mono border px-2 py-1 text-[8.5px] font-bold tracking-widest active:scale-95 transition-all cursor-pointer leading-none uppercase flex items-center gap-1.5 ${
                  currentUser
                    ? "bg-emerald-950/40 text-emerald-450 border-emerald-500/35 hover:bg-emerald-500 hover:text-black hover:border-white"
                    : "bg-neutral-950 text-neutral-600 border-white/5 opacity-40 cursor-not-allowed"
                }`}
                disabled={!currentUser || manualSyncState === "syncing"}
                onClick={async () => {
                  if (currentUser) {
                    setManualSyncState("syncing");
                    try {
                      await pushAllLocalToCloud(currentUser.uid);
                      window.dispatchEvent(new Event("nexus_cloud_synced"));
                      setManualSyncState("success");
                      setTimeout(() => setManualSyncState("idle"), 3000);
                    } catch (e) {
                      console.error(e);
                      setManualSyncState("error");
                      setTimeout(() => setManualSyncState("idle"), 3000);
                    }
                  }
                }}
                type="button"
                title={
                  currentUser
                    ? "Forzar persistencia completa ahora"
                    : "Inicia sesión para subir backups"
                }
              >
                {manualSyncState === "syncing" ? (
                  <span>⏳ BACKING UP...</span>
                ) : manualSyncState === "success" ? (
                  <span className="text-emerald-400 font-extrabold">✓ BACKUP OK</span>
                ) : manualSyncState === "error" ? (
                  <span className="text-rose-400 font-extrabold">❌ ERROR SYNC</span>
                ) : (
                  <span>☁️ PORZAR SINCRO CLOUD</span>
                )}
              </button>
            </div>
            <div className="text-[8px] font-mono text-neutral-500 uppercase italic">
              {currentUser ? "// BACKUP MANUAL HABILITADO" : "// ACCESO NUBE INACTIVO"}
            </div>
          </div>

          {/* Loot Deck Section */}
          {earnedLootList.length > 0 && (
            <div className="border-t border-white/10 pt-3 mt-1.5 space-y-1.5 text-left">
              <div className="text-[10px] text-amber-400 font-mono uppercase tracking-widest flex items-center gap-1 bg-amber-400/10 py-1 px-1.5 border border-amber-400/20 rounded-sm">
                <Trophy size={11} className="shrink-0 text-amber-400" />
                <span>BOTÍN RECLAMADO ({earnedLootList.length} ITEMS)</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto pr-1">
                {earnedLootList.map((item, index) => (
                  <span
                    key={index}
                    className="bg-neutral-900 border border-amber-400/40 text-amber-300 font-mono text-[9px] font-bold uppercase py-0.5 px-1.5 rounded-sm inline-flex items-center gap-1 select-text hover:border-amber-400 transition-colors"
                    title="Item obtenido por Misiones Diarias"
                  >
                    🛡️ {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
