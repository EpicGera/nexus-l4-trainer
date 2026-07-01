import React from "react";
import { RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import HistoryTable from "./HistoryTable";
import { getCleanExerciseName, getExerciseHistory } from "../lib/historyUtils";
import { WEEK_ACCENT_COLORS } from "../lib/constants";

interface WorkoutHistoryControlProps {
  items: string[];
  isHistoryExpanded: boolean;
  onToggleHistory: () => void;
  currentWeek?: string;
}

export default function WorkoutHistoryControl({
  items,
  isHistoryExpanded,
  onToggleHistory,
  currentWeek = "w2",
}: WorkoutHistoryControlProps) {
  // Retrieve the week's accent color metadata
  const weekAccent = WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;

  return (
    <div className="no-print mt-auto pt-2">
      <div
        className="transition-all duration-300 border bg-zinc-950/90 select-none overflow-hidden"
        style={{
          boxShadow: isHistoryExpanded ? weekAccent.shadow : "none",
          borderColor: isHistoryExpanded ? weekAccent.color : "rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Compact Toggle Card Header */}
        <button
          type="button"
          onClick={onToggleHistory}
          className="w-full flex justify-between items-center py-2 px-3 hover:bg-neutral-900/80 transition-all font-mono text-[9px] tracking-wider uppercase font-bold cursor-pointer"
          style={{
            borderBottom: isHistoryExpanded ? `1px solid ${weekAccent.color}25` : "none",
          }}
        >
          <span className="flex items-center gap-1.5" style={{ color: weekAccent.color }}>
            <RotateCcw size={10} style={{ color: weekAccent.color }} className="animate-pulse" />
            <span>METRÓNOMO DE HISTORIA ({items.length})</span>
          </span>
          <span className="flex items-center gap-1 text-neutral-400">
            <span>{isHistoryExpanded ? "CERRAR" : "EXPANDIR"}</span>
            {isHistoryExpanded ? (
              <ChevronUp size={11} style={{ color: weekAccent.color }} />
            ) : (
              <ChevronDown size={11} />
            )}
          </span>
        </button>

        {isHistoryExpanded && (
          <div className="p-2 space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar bg-black/60 scroll-smooth">
            {items.map((item, itemIdx) => {
              const cleanName = getCleanExerciseName(item);
              const history = getExerciseHistory(item);
              return (
                <div
                  key={itemIdx}
                  className="p-1.5 bg-neutral-950/80 border border-neutral-900/60 rounded-xs last:pb-1.5 transition-all hover:bg-neutral-900/30"
                >
                  <div className="font-condensed font-bold text-[11px] text-neutral-300 uppercase tracking-wide flex justify-between items-center mb-1">
                    <span
                      className="truncate max-w-[170px] hover:text-white transition-colors"
                      title={cleanName}
                    >
                      {cleanName}
                    </span>
                    {history.length > 0 && (
                      <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1 border border-emerald-900/30 rounded-xs">
                        {history.length} {history.length === 1 ? "sesión" : "sesiones"}
                      </span>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="text-[8px] font-mono text-neutral-600 italic px-1">
                      Aún sin registros en bitácora L4
                    </div>
                  ) : (
                    <div className="px-0.5">
                      <HistoryTable history={history} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
