import React from "react";
import { motion } from "framer-motion";

interface ActiveDayHeaderProps {
  activeDay: any;
  completedDays: Record<string, boolean>;
  headerHeight: number;
  mousePos: { x: number; y: number };
  setMousePos: (pos: { x: number; y: number }) => void;
  scrollY: number;
  isIntroGlitching: boolean;
  dayTitleAlertTrigger: boolean;
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
}: ActiveDayHeaderProps) {
  if (!activeDay) return null;

  return (
    <motion.div
      className="sticky z-[60] w-full overflow-hidden select-none border-y border-white/10 py-3 flex items-center justify-center transition-all duration-300 bg-zinc-950/85 backdrop-blur-md mb-6"
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 0 35px rgba(0, 240, 255, 0.55), 0 0 15px rgba(255, 0, 127, 0.45)",
        borderColor: "rgba(0, 240, 255, 0.4)",
      }}
      style={{
        top: `${headerHeight}px`,
        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(31, 81, 255, 0.45) 0%, rgba(255, 0, 127, 0.4) ${45 + Math.sin(scrollY * 0.01) * 15}%, rgba(14, 14, 17, 0.98) 95%)`,
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
                x: [0, -25, 20, -15, 15, -8, 8, -4, 4, 0],
                y: [0, 5, -5, 3, -3, 0],
                skewX: [0, 20, -20, 15, -15, 8, -8, 0],
                scale: [1, 1.12, 0.9, 1.05, 1],
                filter: [
                  "hue-rotate(90deg) brightness(2)",
                  "hue-rotate(-45deg) brightness(0.8)",
                  "hue-rotate(180deg) brightness(1.5)",
                  "hue-rotate(0deg) brightness(1)",
                ],
                color: [
                  "#ffffff",
                  "#00f0ff",
                  "#ff007f",
                  "#00f0ff",
                  "#ffffff",
                ],
              }
            : dayTitleAlertTrigger
              ? {
                  x: [0, -12, 12, -12, 12, -6, 6, -3, 3, 0],
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  rotate: [0, -3, 3, -3, 3, -1, 1, 0],
                  filter: [
                    "brightness(1)",
                    "brightness(2)",
                    "brightness(0.8)",
                    "brightness(1.8)",
                    "brightness(1)",
                  ],
                  color: [
                    "#ffffff",
                    "#00f0ff",
                    "#ff007f",
                    "#00f0ff",
                    "#ffffff",
                  ],
                  textShadow: [
                    "0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 40px #1F51FF, 0 0 6px #000",
                    "0 0 25px #ff007f, 0 0 50px #ff007f, 0 0 80px #1F51FF, 0 0 6px #000",
                    "0 0 5px #1F51FF, 0 0 10px #1F51FF, 0 0 20px #00f0ff, 0 0 6px #000",
                    "0 0 35px #ffffff, 0 0 60px #00f0ff, 0 0 100px #00f0ff, 0 0 6px #000",
                    "0 0 15px #00f0ff, 0 0 30px #00f0ff, 0 0 50px #1F51FF, 0 0 6px #000",
                  ],
                }
              : {
                  opacity: 1,
                  textShadow:
                    "0 0 15px #a124ff, 0 0 30px #a124ff, 0 0 50px #1F51FF, 0 0 6px #000",
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
          {/* STATUS INDICATOR (GREEN/RED) */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <span
              className={`w-3.5 h-3.5 rounded-full border border-white/25 transition-all duration-500 shrink-0 ${
                completedDays[activeDay.id]
                  ? "bg-emerald-500 shadow-sm"
                  : "bg-[#ff0055] shadow-sm"
              } `}
              title={
                completedDays[activeDay.id]
                  ? "¡Entrenamiento Completado!"
                  : "Entrenamiento Incompleto"
              }
            />
          </div>

          {/* TITLE TEXT */}
          <span className="text-[1.8rem] xs:text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.6rem] font-black tracking-wide leading-none select-none">
            {activeDay.title}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
