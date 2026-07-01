import React from "react";
import { Zap } from "lucide-react";

interface TimerSetupFormProps {
  isFull: boolean;
  tempWork: number;
  tempRest: number;
  tempRounds: number;
  setTempWork: React.Dispatch<React.SetStateAction<number>>;
  setTempRest: React.Dispatch<React.SetStateAction<number>>;
  setTempRounds: React.Dispatch<React.SetStateAction<number>>;
  formatTime: (seconds: number) => string;
  onStartSeries: () => void;
  onOnlyRest: () => void;
  onCancel: () => void;
}

export default function TimerSetupForm({
  isFull,
  tempWork,
  tempRest,
  tempRounds,
  setTempWork,
  setTempRest,
  setTempRounds,
  formatTime,
  onStartSeries,
  onOnlyRest,
  onCancel,
}: TimerSetupFormProps) {
  return (
    <div
      className={`w-full flex flex-col bg-zinc-950/95 border-2 border-emerald-500/40 rounded-xl p-4 sm:p-6 transition-all shadow-2xl text-left ${
        isFull ? "max-w-xl mx-auto border-emerald-500/55" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/15 pb-3.5 mb-5 font-mono">
        <Zap
          size={18}
          className="text-emerald-400 animate-pulse shrink-0 fill-current"
        />
        <div>
          <h3 className="text-xs sm:text-sm font-black tracking-widest text-emerald-400 uppercase">
            ASISTENTE DE SERIES AUTOMÁTICAS L4
          </h3>
          <p className="text-[10px] text-neutral-400 leading-tight mt-1 uppercase mb-0 font-medium">
            El protocolo actual no predefinió series. Configura tu ciclo de (Trabajo + Descanso)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Work Time Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              1. TIEMPO DE TRABAJO (EJECUCIÓN)
            </span>
            <span className="text-xs font-mono font-black text-rose-400">
              {formatTime(tempWork)} ({tempWork}s)
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempWork((p) => Math.max(5, p - 5))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => setTempWork((p) => Math.max(10, p - 30))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -30s
            </button>
            <input
              type="number"
              value={tempWork}
              onChange={(e) =>
                setTempWork(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="flex-grow min-w-0 px-2.5 py-1 bg-black border border-white/20 text-white font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempWork((p) => p + 5)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +5s
            </button>
            <button
              type="button"
              onClick={() => setTempWork((p) => p + 30)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +30s
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {[20, 30, 40, 45, 60, 90, 120].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTempWork(s)}
                className={`text-[9px] px-2 py-1 rounded font-mono font-bold border transition-all cursor-pointer ${
                  tempWork === s
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                    : "bg-neutral-900 border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Rest Time Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              2. TIEMPO DE DESCANSO (RECUPERACIÓN)
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              {formatTime(tempRest)} ({tempRest}s)
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempRest((p) => Math.max(0, p - 5))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -5s
            </button>
            <button
              type="button"
              onClick={() => setTempRest((p) => Math.max(0, p - 30))}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -30s
            </button>
            <input
              type="number"
              value={tempRest}
              onChange={(e) =>
                setTempRest(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="flex-grow min-w-0 px-2.5 py-1 bg-black border border-white/20 text-emerald-400 font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempRest((p) => p + 5)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +5s
            </button>
            <button
              type="button"
              onClick={() => setTempRest((p) => p + 30)}
              className="px-2 py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +30s
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {[30, 45, 60, 90, 120, 150, 180].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setTempRest(s)}
                className={`text-[9px] px-2 py-1 rounded font-mono font-bold border transition-all cursor-pointer ${
                  tempRest === s
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-neutral-900 border-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {s}s REPOSO
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center select-none">
            <span className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest">
              3. CANTIDAD DE SERIES (REPETICIONES)
            </span>
            <span className="text-xs font-mono font-black text-[#00F0FF]">
              {tempRounds} {tempRounds === 1 ? "Serie" : "Series"}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setTempRounds((p) => Math.max(1, p - 1))}
              className="flex-grow py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              -1 Serie
            </button>
            <input
              type="number"
              value={tempRounds}
              onChange={(e) =>
                setTempRounds(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-20 px-2.5 py-1 bg-black border border-white/20 text-[#00F0FF] font-mono text-xs rounded text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setTempRounds((p) => p + 1)}
              className="flex-grow py-1.5 bg-neutral-900 border border-white/10 text-[10px] sm:text-xs font-mono rounded text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              +1 Serie
            </button>
          </div>
        </div>
      </div>

      {/* Action button options */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onStartSeries}
          className="flex-grow py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all rounded-md flex items-center justify-center gap-1.5 shadow-lg cursor-pointer hover:scale-102"
        >
          <Zap size={14} className="fill-current animate-bounce" />
          <span>
            INICIAR SERIES ({tempRounds} x {formatTime(tempWork)} / R:{" "}
            {formatTime(tempRest)})
          </span>
        </button>

        <button
          type="button"
          onClick={onOnlyRest}
          className="px-3 py-3 bg-zinc-900 border border-white/5 text-neutral-300 hover:text-white uppercase tracking-wider text-[10px] font-mono duration-150 rounded cursor-pointer"
        >
          SÓLO DESCANSO COMPLETO
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-3 bg-zinc-800/80 text-neutral-300 hover:text-white uppercase tracking-wider text-[10px] font-mono duration-150 rounded cursor-pointer"
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
}
