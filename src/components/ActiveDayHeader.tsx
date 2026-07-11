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

  // Per-chapter theme + per-day-type visual (boss=red, team=green, volume=orange,
  // recovery=teal, else the chapter accent) and the chapter's title font.
  const chapterTheme = getActiveChapter()?.theme || THEME_PALETTES[0];
  const blockText = (activeDay.variations?.[0]?.blocks || [])
    .map((b: any) => `${b.title} ${(b.items || []).join(" ")}`)
    .join(" ");
  const dv = dayVisual(activeDay.title || "", chapterTheme, blockText);
  const titleFont = fontFamilyFor(chapterTheme.fontKey);

  return (
    <motion.div
      ref={rootRef}
      className="sticky z-[60] w-full overflow-hidden select-none border-y border-[color:var(--color-line)] py-3 flex items-center justify-center transition-all duration-300 bg-zinc-950/85 backdrop-blur-md mb-6"
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
        className="font-brutalist text-white uppercase tracking-[0.05em] leading-none m-0 p-0 text-center font-black select-none w-full"
        animate={
          isIntroGlitching
            ? {
                // entrada sobria: un zoom rápido, sin glitch de color ni skew
                scale: [1.06, 1],
                opacity: [0, 1],
                color: "#ffffff",
              }
            : dayTitleAlertTrigger
              ? {
                  // alerta contundente pero adulta: micro-shake + flash rojo señal
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-1.5 px-4 h-full">
          {/* STATUS INDICATOR: verde=completado · gris tachado=perdido · acento=pendiente */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/25 transition-all duration-500 shrink-0 shadow-sm"
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
          </div>

          {/* TITLE TEXT — per-chapter font when set */}
          <span
            className="text-[clamp(1.8rem,7vw,3.6rem)] font-black tracking-wide leading-none select-none"
            style={titleFont ? { fontFamily: titleFont } : undefined}
          >
            {activeDay.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
