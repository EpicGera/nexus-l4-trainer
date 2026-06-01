import React from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, RotateCcw, Check, Dices } from "lucide-react";

interface DailyMissionPanelProps {
  dayId: string;
  dailyGoalText: string;
  isGeneratingQuest: boolean;
  sideQuestCompleted: boolean;
  questData: any;
  rewards: { xp: number; item: string };
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  dayTitleAlertTrigger: boolean;
  handleFetchSideQuest: () => Promise<void>;
  handleResetQuest: (dayId: string) => void;
  mousePos: { x: number; y: number };
}

export default function DailyMissionPanel({
  dayId,
  dailyGoalText,
  isGeneratingQuest,
  sideQuestCompleted,
  questData,
  rewards,
  isHelpOpen,
  setIsHelpOpen,
  dayTitleAlertTrigger,
  handleFetchSideQuest,
  handleResetQuest,
}: DailyMissionPanelProps) {
  return (
    <motion.div
      animate={
        dayTitleAlertTrigger
          ? {
              scale: [1, 1.04, 0.98, 1.02, 1],
              borderColor: [
                "rgba(255,255,255,0.05)",
                "rgba(0,240,255,0.8)",
                "rgba(255,0,127,0.8)",
                "rgba(0,240,255,0.4)",
                "rgba(255,255,255,0.05)",
              ],
              boxShadow: [
                "0 4px 20px rgba(0,0,0,0.65)",
                "0 0 15px rgba(0,240,255,0.35)",
                "0 0 20px rgba(255,0,127,0.35)",
                "0 0 10px rgba(0,240,255,0.15)",
                "0 4px 20px rgba(0,0,0,0.65)",
              ],
            }
          : {}
      }
      transition={{ duration: 0.85, ease: "easeInOut" }}
      className="mt-3 w-full max-w-xl mx-auto bg-zinc-950/95 text-white p-1.5 md:p-2 shadow-[0_4px_25px_rgba(0,0,0,0.8)] font-mono text-left relative overflow-hidden rounded-none border border-white/5"
    >
      <div className="flex justify-between items-center text-[7.5px] sm:text-[8px] font-bold text-zinc-500 border-b border-white/5 pb-0.5 mb-1.5 uppercase tracking-widest leading-none">
        <span className="flex items-center gap-1">
          <Sparkles size={8} className="text-amber-500" />★ OBJ. DIARIO
        </span>
        <span className="text-amber-500 font-extrabold pb-0.5">
          MISIÓN SECUNDARIA
        </span>
      </div>

      <div className="grid grid-cols-12 gap-x-2 gap-y-1.5 items-center">
        <div className="col-span-12 sm:col-span-7 flex justify-between items-center gap-1.5 border-b sm:border-b-0 sm:border-r border-white/10 pb-1 sm:pb-0 sm:pr-2.5">
          <div className="flex-1 min-h-[1.2rem] flex items-center">
            <p className="font-bold text-[9.5px] sm:text-[10px] tracking-wide uppercase text-zinc-100 border-l-2 border-[#00f0ff] pl-1.5 py-0 w-full whitespace-normal break-words leading-snug">
              {isGeneratingQuest ? (
                <span className="text-neutral-500 flex items-center gap-1">
                  <span>BUSCANDO EN LA BASE CO-OP RE-ROLL CON IA...</span>
                </span>
              ) : (
                dailyGoalText || "DALE CLIC AL DADO PARA GENERAR LA MISIÓN SECUNDARIA CON IA"
              )}
            </p>
          </div>
          {!sideQuestCompleted && (
            <button
              onClick={handleFetchSideQuest}
              disabled={isGeneratingQuest}
              className="bg-electric-blue/15 text-electric-blue hover:bg-electric-blue/25 disabled:bg-neutral-800 disabled:text-neutral-600 p-0.5 shadow-sm hover:shadow-sm active:scale-95 transition-all cursor-pointer rounded-none shrink-0 group relative overflow-hidden flex items-center justify-center"
              title="Obtener misión seleccionada por IA según el entreno del día"
              style={{ width: "20px", height: "20px" }}
            >
              <Dices
                size={10}
                className={`transition-transform text-white ${isGeneratingQuest ? "animate-spin" : "group-hover:rotate-12"}`}
              />
            </button>
          )}
        </div>

        <div className="col-span-12 sm:col-span-5">
          {sideQuestCompleted && questData ? (
            <div className="animate-fade-in space-y-1">
              <div className="bg-amber-500/10 p-1 rounded-none flex justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="bg-amber-500 text-black p-0.5 rounded-none shrink-0">
                    <Trophy size={9} />
                  </div>
                  <span className="text-[7.5px] font-black text-amber-400 uppercase tracking-wider leading-none">
                    PRUEBA VALIDADA
                  </span>
                </div>
                <button
                  onClick={() => handleResetQuest(dayId)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[7px] font-bold uppercase tracking-wider py-0.5 px-1 flex items-center gap-0.5 transition-all rounded-none shrink-0"
                  type="button"
                >
                  <RotateCcw size={7} /> REABRIR
                </button>
              </div>

              <div className="bg-zinc-900/40 p-1 space-y-0.5 text-[9px] text-left rounded-none font-mono">
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="bg-black/40 p-0.5 text-center rounded-none">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      XP
                    </span>
                    <span className="text-[8.5px] font-black text-[#00f0ff]">
                      +{questData.xpEarned || rewards.xp}
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-none">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      SCORE
                    </span>
                    <span className="text-[8.5px] font-black text-amber-400">
                      {questData.evalScore || 90}/100
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-none flex flex-col justify-center">
                    <span className="text-[6.5px] text-zinc-500 block uppercase font-bold leading-none mb-0.5">
                      BOTÍN
                    </span>
                    <span
                      className="text-[7.5px] font-black text-emerald-400 line-clamp-1"
                      title={questData.rewardItem}
                    >
                      🛡️ {questData.rewardItem || rewards.item}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-0.5 pt-0.5 text-[6.5px]">
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 font-bold px-1 py-0.2 rounded-none">
                    <Check size={7} /> ROM
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 font-bold px-1 py-0.2 rounded-none">
                    <Check size={7} /> POSTURA
                  </span>
                </div>

                {questData.aiFeedback && (
                  <div
                    className="bg-black p-1 rounded-none leading-tight text-zinc-400 text-[8px] line-clamp-2"
                    title={questData.aiFeedback}
                  >
                    <p className="italic font-sans leading-tight">
                      "{questData.aiFeedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in space-y-1.5">
              <div className="flex justify-between items-center text-[7.5px] pb-0.5 font-mono leading-none">
                <span className="text-zinc-500 font-bold">RECOMPENSAS:</span>
                <span className="text-electric-blue font-bold flex items-center gap-0.5">
                  <Sparkles size={7} className="text-amber-500" />
                  <span>+{rewards.xp} XP</span>
                </span>
              </div>

              <div className="bg-zinc-900/60 p-1 border border-white/5 rounded-none flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="flex items-center gap-1 text-[8px] font-black text-electric-blue uppercase tracking-wider font-mono hover:text-electric-blue/80 transition-colors focus:outline-none cursor-pointer"
                >
                  <Sparkles size={7} className="text-[#00f0ff] shrink-0" />
                  <span>{isHelpOpen ? "▲ OCULTAR" : "▼ GUÍA"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event("open_nexus_chat"));
                  }}
                  className="py-1 px-1.5 font-brutalist text-[8px] font-black tracking-widest text-center bg-electric-blue text-white hover:bg-opacity-95 cursor-pointer active:scale-[0.98] uppercase flex items-center gap-0.5 transition-all"
                >
                  <span>REPORTAR</span>
                </button>
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isHelpOpen ? "max-h-[150px] mt-0.5 opacity-100 pt-0.5 border-t border-white/5" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <p className="text-[7.5px] font-mono text-zinc-400 text-left leading-tight">
                  Reporta pesos, RPE/RIR, o adaptaciones al **Coach Chat** para recibir XP y botín.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
