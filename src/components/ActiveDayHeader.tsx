import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { getActiveChapter, THEME_PALETTES } from "../lib/chapterStore";
import { dayVisual, fontFamilyFor } from "../lib/dayTheme";
import { DayStatus } from "../lib/storageKeys";

interface ActiveDayHeaderProps {
  activeDay: any;
  completedDays: Record<string, DayStatus>;
  headerHeight: number;
  mousePos: { x: number; y: number };
  setMousePos: (pos: { x: number; y: number }) => void;
  scrollY: number;
  isIntroGlitching: boolean;
  dayTitleAlertTrigger: boolean;
  /** Reports the rendered height of the sticky band so callers can stack under it. */
  onHeightChange?: (height: number) => void;
  // Props for the consolidated header
  athlete: { identity: string };
  isEditingName: boolean;
  setIsEditingName: (val: boolean) => void;
  tempName: string;
  setTempName: (val: string) => void;
  saveName: () => void;
  startEditingName: () => void;
}

export default function ActiveDayHeader({
  activeDay,
  completedDays,
  headerHeight,
  mousePos,
  setMousePos,
  scrollY,
  isIntroGlitching,
  dayTitleAlertTrigger,
  onHeightChange,
  athlete,
  isEditingName,
  setIsEditingName,
  tempName,
  setTempName,
  saveName,
  startEditingName,
}: ActiveDayHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !onHeightChange || typeof ResizeObserver === "undefined") return;
    const measure = () => onHeightChange(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, activeDay?.id]);

  if (!activeDay) return null;

  const chapterTheme = getActiveChapter()?.theme || THEME_PALETTES[0];
  const blockText = (activeDay.variations?.[0]?.blocks || [])
    .map((b: any) => `${b.title} ${(b.items || []).join(" ")}`)
    .join(" ");
  const dv = dayVisual(activeDay.title || "", chapterTheme, blockText);
  const titleFont = fontFamilyFor(chapterTheme.fontKey);

  return (
    <motion.div
      ref={rootRef}
      className="sticky z-[60] w-full overflow-hidden select-none border-y border-[color:var(--color-line)] py-2 flex items-center justify-center transition-all duration-300 bg-zinc-950/85 backdrop-blur-md mb-6"
      whileHover={{ scale: 1.03 }}
      style={{
        top: `${headerHeight}px`,
        ["--mx" as any]: `${mousePos.x * 100}%`,
        ["--my" as any]: `${(45 + Math.sin(scrollY * 0.01) * 15)}%`,
        background: dv.band,
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
      }}
    >
      <motion.div
        id="uiDayTitle"
        className="text-white m-0 p-0 text-center select-none w-full flex flex-col items-center justify-center gap-1.5 md:gap-2 h-full"
        animate={
          isIntroGlitching
            ? {
                scale: [1.06, 1],
                opacity: [0, 1],
                color: "#ffffff",
              }
            : dayTitleAlertTrigger
              ? {
                  x: [0, -6, 6, -4, 4, 0],
                  scale: [1, 1.04, 1],
                  color: ["#ffffff", "#DC2626", "#ffffff"],
                  textShadow: [
                    "0 0 8px rgba(0,0,0,0.6)",
                    "0 0 16px rgba(220,38,38,0.6), 0 0 6px #000",
                    "0 0 8px rgba(0,0,0,0.6)",
                  ],
                }
              : {
                  opacity: 1,
                  textShadow: dv.glow,
                }
        }
        transition={
          isIntroGlitching
            ? {
                duration: 0.8,
                ease: "easeInOut",
              }
            : dayTitleAlertTrigger
              ? {
                  duration: 0.85,
                  repeat: 1,
                  ease: "easeInOut",
                }
              : {}
        }
      >
        {/* Top row: Day Name + Logo + Editable Athlete Name */}
        <div className="flex items-center justify-center gap-3 flex-wrap leading-none">
          <span className="text-xl sm:text-2xl font-black font-brutalist tracking-wider text-white opacity-80 uppercase">
            {activeDay.name}
          </span>
          <img 
            src="/logo.svg" 
            alt="Nexus L4" 
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain inline-block drop-shadow-lg"
          />
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setIsEditingName(false);
              }}
              className="bg-zinc-900 text-white border border-white/20 focus:border-electric-blue/50 font-brutalist text-xl sm:text-2xl uppercase px-2 py-0 focus:outline-none text-center max-w-[200px] inline-block transition-colors"
              autoFocus
            />
          ) : (
            <span
              className="text-white hover:text-electric-blue cursor-pointer transition-all relative group inline-flex items-center gap-1.5 border-0 font-brutalist text-xl sm:text-2xl uppercase"
              onClick={startEditingName}
              title="Haz clic para cambiar nombre de atleta"
            >
              <span>{athlete.identity}</span>
              <span className="text-sm text-electric-blue opacity-50 group-hover:opacity-100 transition-opacity">
                ✎
              </span>
            </span>
          )}
        </div>

        {/* Bottom row: Status Dot + Day Title */}
        <div className="flex items-center justify-center gap-3 leading-none w-full px-4">
          {/* STATUS INDICATOR: verde=completado · gris tachado=perdido · acento=pendiente */}
          <span
            className="w-3.5 h-3.5 rounded-full transition-all duration-500 shrink-0 shadow-sm"
            style={{
              backgroundColor:
                completedDays[activeDay.id] === "completed"
                  ? "#10b981"
                  : completedDays[activeDay.id] === "missed"
                    ? "#525252"
                    : dv.accent,
            }}
            title={
              completedDays[activeDay.id] === "completed"
                ? "¡Entrenamiento Completado!"
                : completedDays[activeDay.id] === "missed"
                  ? "Día perdido — cerrado sin registro"
                  : "Entrenamiento Incompleto"
            }
          />

          {/* TITLE TEXT — per-chapter font when set */}
          <span
            className="text-sm sm:text-lg md:text-xl font-black tracking-wide leading-tight select-none uppercase font-brutalist text-zinc-100 line-clamp-1"
            style={titleFont ? { fontFamily: titleFont } : undefined}
          >
            {activeDay.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

