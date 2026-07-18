import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Trophy, RotateCcw, Check, X, Dices, ShieldCheck } from "lucide-react";
import type { MissionValidation } from "../lib/missionEngine";

interface DailyMissionPanelProps {
  dayId: string;
  dailyGoalText: string;
  missionText: string;
  isGeneratingQuest: boolean;
  sideQuestCompleted: boolean;
  questData: any;
  rewards: { xp: number; item: string };
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  dayTitleAlertTrigger: boolean;
  handleFetchSideQuest: () => void;
  handleResetQuest: (dayId: string) => void;
  onValidate: (dayId: string) => MissionValidation;
  mousePos: { x: number; y: number };
}

export default function DailyMissionPanel({
  dayId,
  dailyGoalText,
  missionText,
  isGeneratingQuest,
  sideQuestCompleted,
  questData,
  rewards,
  isHelpOpen,
  setIsHelpOpen,
  dayTitleAlertTrigger,
  handleFetchSideQuest,
  handleResetQuest,
  onValidate,
}: DailyMissionPanelProps) {
  const [validation, setValidation] = useState<MissionValidation | null>(null);
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
      className="mt-3 w-full max-w-xl mx-auto text-white p-2.5 md:p-3 shadow-[var(--shadow-card)] font-mono text-left relative overflow-hidden rounded-[var(--radius-card)]"
      style={{ background: "linear-gradient(160deg, #1e1720 0%, var(--color-card) 65%)" }}
    >
      <div className="flex justify-between items-center text-[7.5px] sm:text-[8px] font-bold text-[color:var(--color-label)] border-b border-white/5 pb-0.5 mb-1.5 uppercase tracking-widest leading-none">
        <span className="flex items-center gap-1">
          <Sparkles size={8} className="text-[color:var(--color-sem-amber)]" />★ OBJ. DIARIO
        </span>
        <span className="text-[color:var(--color-sem-amber)] font-extrabold pb-0.5">
          MISIÓN SECUNDARIA
        </span>
      </div>

      {/* OBJ. DIARIO: meta del día derivada del JSON del programa */}
      {dailyGoalText && (
        <div className="mb-1.5 bg-[color:var(--color-card-2)] px-2 py-1 rounded-sm">
          <p className="font-bold text-[9px] sm:text-[9.5px] tracking-wide uppercase text-[color:var(--color-sem-amber)] leading-snug break-words">
            {dailyGoalText}
          </p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-x-2 gap-y-1.5 items-center">
        <div className="col-span-12 sm:col-span-7 flex justify-between items-center gap-1.5 border-b sm:border-b-0 sm:border-r border-[color:var(--color-line)] pb-1 sm:pb-0 sm:pr-2.5">
          <div className="flex-1 min-h-[1.2rem] flex items-center">
            <p className="font-bold text-[9.5px] sm:text-[10px] tracking-wide uppercase text-[color:var(--color-ink)] px-1 py-0 w-full whitespace-normal break-words leading-snug">
              {isGeneratingQuest ? (
                <span className="text-[color:var(--color-label)] flex items-center gap-1">
                  <span>GENERANDO MISIÓN…</span>
                </span>
              ) : (
                missionText || "DALE CLIC AL DADO PARA GENERAR LA MISIÓN SECUNDARIA"
              )}
            </p>
          </div>
          {!sideQuestCompleted && (
            <button
              onClick={handleFetchSideQuest}
              disabled={isGeneratingQuest}
              className="bg-electric-blue/15 text-electric-blue hover:bg-electric-blue/25 disabled:bg-[color:var(--color-card-2)] disabled:text-[color:var(--color-label)] p-0.5 shadow-sm hover:shadow-sm active:scale-95 transition-all cursor-pointer rounded-[var(--radius-tile)] shrink-0 group relative flex items-center justify-center after:absolute after:-inset-3.5 after:content-['']"
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
              <div className="bg-[color:var(--color-sem-amber)]/10 p-1 rounded-[var(--radius-tile)] flex justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="bg-[color:var(--color-sem-amber)] text-black p-0.5 rounded-[var(--radius-tile)] shrink-0">
                    <Trophy size={9} />
                  </div>
                  <span className="text-[7.5px] font-black text-[color:var(--color-sem-amber)] uppercase tracking-wider leading-none">
                    PRUEBA VALIDADA
                  </span>
                </div>
                <button
                  onClick={() => handleResetQuest(dayId)}
                  className="relative bg-[color:var(--color-card-2)] hover:bg-[color:#26262e] text-[color:var(--color-ink-2)] font-mono text-[7.5px] font-bold uppercase tracking-wider py-0.5 px-1 flex items-center gap-0.5 transition-all rounded-[var(--radius-tile)] shrink-0 after:absolute after:-inset-y-3.5 after:-inset-x-1 after:content-['']"
                  type="button"
                >
                  <RotateCcw size={7} /> REABRIR
                </button>
              </div>

              <div className="bg-[color:var(--color-card-2)]/60 p-1 space-y-0.5 text-[9px] text-left rounded-[var(--radius-tile)] font-mono">
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="bg-black/40 p-0.5 text-center rounded-[var(--radius-tile)]">
                    <span className="text-[7.5px] text-[color:var(--color-label)] block uppercase font-bold leading-none mb-0.5">
                      XP
                    </span>
                    <span className="text-[8.5px] font-black text-[color:var(--color-sem-cyan)]">
                      +{questData.xpEarned || rewards.xp}
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-[var(--radius-tile)]">
                    <span className="text-[7.5px] text-[color:var(--color-label)] block uppercase font-bold leading-none mb-0.5">
                      SCORE
                    </span>
                    <span className="text-[8.5px] font-black text-[color:var(--color-sem-amber)]">
                      {questData.evalScore || 90}/100
                    </span>
                  </div>
                  <div className="bg-black/40 p-0.5 text-center rounded-[var(--radius-tile)] flex flex-col justify-center">
                    <span className="text-[7.5px] text-[color:var(--color-label)] block uppercase font-bold leading-none mb-0.5">
                      BOTÍN
                    </span>
                    <span
                      className="text-[7.5px] font-black text-[color:var(--color-sem-green)] line-clamp-1"
                      title={questData.rewardItem}
                    >
                      🛡️ {questData.rewardItem || rewards.item}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-0.5 pt-0.5 text-[7.5px]">
                  <span className="inline-flex items-center gap-0.5 bg-[color:var(--color-sem-green)]/10 text-[color:var(--color-sem-green)] font-bold px-1 py-0.2 rounded-[var(--radius-tile)]">
                    <Check size={7} /> ROM
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-[color:var(--color-sem-green)]/10 text-[color:var(--color-sem-green)] font-bold px-1 py-0.2 rounded-[var(--radius-tile)]">
                    <Check size={7} /> POSTURA
                  </span>
                </div>

                {questData.aiFeedback && (
                  <div
                    className="bg-black p-1 rounded-[var(--radius-tile)] leading-tight text-[color:var(--color-ink-2)] text-[8px] line-clamp-2"
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
                <span className="text-[color:var(--color-label)] font-bold">RECOMPENSAS:</span>
                <span className="text-electric-blue font-bold flex items-center gap-0.5">
                  <Sparkles size={7} className="text-[color:var(--color-sem-amber)]" />
                  <span>+{rewards.xp} XP</span>
                </span>
              </div>

              <div className="bg-[color:var(--color-card-2)] p-1 rounded-[var(--radius-tile)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="flex items-center gap-1 text-[8px] font-black text-[var(--color-ink-muted)] uppercase tracking-wider font-mono hover:text-white transition-colors focus:outline-none cursor-pointer"
                >
                  <Sparkles size={7} className="text-[color:var(--color-sem-amber)] shrink-0" />
                  <span>{isHelpOpen ? "▲ OCULTAR" : "▼ GUÍA"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValidation(onValidate(dayId))}
                  className="relative py-1 px-1.5 font-brutalist text-[8px] font-black tracking-widest text-center bg-[var(--color-accent)] text-white hover:brightness-110 cursor-pointer active:scale-[0.98] uppercase flex items-center gap-0.5 transition-all after:absolute after:-inset-3.5 after:content-['']"
                >
                  <ShieldCheck size={9} /> VALIDAR MISIÓN
                </button>
              </div>

              {/* checks del validador determinista */}
              {validation && !validation.ok && (
                <div className="bg-[color:var(--color-card)] p-1 space-y-0.5 rounded-[var(--radius-tile)]">
                  {validation.checks.map((c, i) => (
                    <div key={i} className="flex items-center gap-1 text-[7.5px] font-mono leading-tight">
                      {c.pass ? (
                        <Check size={8} className="text-[color:var(--color-sem-green)] shrink-0" />
                      ) : (
                        <X size={8} className="text-[var(--color-accent-soft)] shrink-0" />
                      )}
                      <span className={c.pass ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                  <p className="text-[7.5px] font-mono text-[var(--color-ink-faint)] pt-0.5 leading-tight">
                    Registrá la sesión con ANOTAR WOD para completar la misión.
                  </p>
                </div>
              )}

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isHelpOpen ? "max-h-[150px] mt-0.5 opacity-100 pt-0.5 border-t border-[color:var(--color-line)]" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <p className="text-[7.5px] font-mono text-[var(--color-ink-muted)] text-left leading-tight">
                  Registrá tu entrenamiento con **ANOTAR WOD** y tocá VALIDAR: la misión se sella con XP y botín si los datos cumplen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
