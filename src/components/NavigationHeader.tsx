import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { LayoutDashboard, TrendingUp, UserCheck, Swords } from "lucide-react";
import { WEEK_ACCENT_COLORS, WEEK_MID_BAND_COLORS } from "../lib/constants";

interface NavigationHeaderProps {
  activeSheet: number;
  setActiveSheet: (index: number) => void;
  syncWithRealTime: boolean;
  currentWeek: string;
  realTime: Date;
  handleToggleSync: () => void;
  activeDayName?: string;
  setShowProfileModal: (show: boolean) => void;
  onHeightChange?: (height: number) => void;
}

export default function NavigationHeader({
  activeSheet,
  setActiveSheet,
  syncWithRealTime,
  currentWeek,
  realTime,
  handleToggleSync,
  activeDayName,
  setShowProfileModal,
  onHeightChange,
}: NavigationHeaderProps) {
  const sheets = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Pizarrón Diario",
      id: "pizarron",
      desc: "Misiones & Rutinas",
    },
    {
      icon: <TrendingUp size={18} />,
      label: "RPE & Metas",
      id: "rpe",
      desc: "Análisis & Tablas",
    },
    {
      icon: <UserCheck size={18} />,
      label: "Perfil & Bio",
      id: "perfil",
      desc: "Análisis Biomecánico L4",
    },
    {
      icon: <Swords size={18} />,
      label: "Guerrero",
      id: "guerrero",
      desc: "RPG & Stats del Atleta",
    },
  ];

  const progressPercent = ((activeSheet + 1) / sheets.length) * 100;
  const headerRef = useRef<HTMLElement | null>(null);

  const activeColorSet =
    WEEK_ACCENT_COLORS[currentWeek] || WEEK_ACCENT_COLORS.w2;
  const midBandColor =
    WEEK_MID_BAND_COLORS[currentWeek] || WEEK_MID_BAND_COLORS.w2;

  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return;

    const measure = () => {
      if (headerRef.current) {
        onHeightChange(headerRef.current.offsetHeight);
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(headerRef.current);

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [onHeightChange, activeSheet, currentWeek, syncWithRealTime]);

  return (
    <header
      ref={headerRef}
      className="app-header fixed top-0 left-0 right-0 z-50 bg-[#0A0A0E]/95 border-b-2 border-white/10 no-print backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.85)] select-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="w-full mx-auto px-2 sm:px-10 pt-1 pb-0.5 flex flex-col xl:flex-row flex-wrap items-center justify-between gap-1 xl:gap-0">
        <div className="flex w-full xl:w-auto justify-between items-center gap-1 flex-wrap">
          <div
            className="flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <img src="/logo.svg" alt="Nexus L4 Emblem" className="h-12 w-12 sm:h-16 sm:w-16 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] shrink-0" />
            <div className="border-l-2 border-white/40 px-1 sm:px-3 py-0.5 sm:py-1 transition-colors">
              <span className="text-white font-brutalist text-[5.5px] min-[320px]:text-[6.5px] min-[350px]:text-[7.5px] min-[375px]:text-[10px] sm:text-xs md:text-sm tracking-widest font-extrabold uppercase ">
                NEXUS L4 MASTER
              </span>
            </div>
            <span className="hidden lg:inline text-[9.5px] font-mono tracking-widest text-neutral-500 font-bold uppercase transition-colors hover:text-white">
              ⚙️ AJUSTAR BIOMECÁNICA DEL ATLETA
            </span>
          </div>

          <div className="bg-[#14141A] rounded px-1.5 py-0.5 flex items-center xl:hidden mt-0">
            <span className="text-[7.5px] min-[320px]:text-[8px] min-[375px]:text-[9px] sm:text-[10px] font-mono font-bold text-neutral-300">
              HOJA {activeSheet + 1}/{sheets.length}
            </span>
          </div>
        </div>

        {/* Right Info: Clock, Sync Status, Sheet Info */}
        <div className="flex w-full xl:w-auto items-center justify-between xl:justify-end gap-1 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2 font-mono bg-black/40 px-1 sm:px-1.5 py-0.5 rounded shrink-0">
            <span
              className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${syncWithRealTime ? "bg-white" : "bg-signal-red"}`}
            />
            <span className="text-white text-[7px] min-[375px]:text-[8px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
              {realTime
                .toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
                .toUpperCase()}
            </span>
            <span className="text-white text-[8.5px] min-[320px]:text-[9.5px] min-[375px]:text-[10.5px] sm:text-sm font-extrabold tracking-wider">
              {realTime.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 px-1.5 sm:px-3 py-0.5 rounded shrink-0 hidden md:flex">
            <span className="text-[8.5px] sm:text-[10px] font-mono shrink-0">
              {syncWithRealTime ? (
                <span className="text-white font-bold flex items-center gap-1">
                  ⚡ SEM {currentWeek.replace("w", "")} • {activeDayName}
                </span>
              ) : (
                <span className="text-signal-red font-bold flex items-center gap-1 ">
                  ⚠ OVERRIDE MANUAL
                </span>
              )}
            </span>
          </div>

          <button
            onClick={handleToggleSync}
            className={`px-1 min-[375px]:px-1.5 sm:px-3 py-0.5 sm:py-1 font-brutalist text-[7px] min-[320px]:text-[7.5px] min-[375px]:text-[8.5px] sm:text-[10px] tracking-wider transition-all cursor-pointer rounded-sm shrink-0 font-bold ${
              syncWithRealTime
                ? "bg-transparent border border-white/25 text-white hover:bg-white hover:text-black"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
            title={
              syncWithRealTime
                ? "Desactivar acoplamiento automático para navegar libremente"
                : "Ligar el pizarrón al día y hora de hoy"
            }
          >
            {syncWithRealTime ? (
              "🔌 FIJAR"
            ) : (
              <>
                <span className="hidden min-[320px]:inline">
                  ⚡ ACOPLAR HOY ↻
                </span>
                <span className="inline min-[320px]:hidden">⚡ ACOPLAR</span>
              </>
            )}
          </button>

          <div className="bg-[#14141A] rounded px-2 py-0.5 items-center gap-1 shrink-0 hidden md:flex">
            <span className="text-[9px] font-mono font-bold text-neutral-300">
              HOJA {activeSheet + 1}/{sheets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid selectors */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-1 grid grid-cols-4 gap-1">
        {sheets.map((sheet, index) => {
          const isActive = activeSheet === index;
          return (
            <button
              key={index}
              id={`nav-header-tab-${sheet.id}`}
              onClick={() => setActiveSheet(index)}
              className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded transition-all duration-300 relative cursor-pointer outline-none focus:outline-none ${
                isActive
                  ? "bg-white/10 text-white font-black"
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                <span
                  className={`${isActive ? "text-white" : "text-neutral-500"} scale-90 sm:scale-100`}
                >
                  {sheet.icon}
                </span>
                <span className="font-brutalist tracking-wider text-[9px] sm:text-[11.5px] uppercase leading-none">
                  {sheet.label}
                </span>
              </div>
              <span className="text-[7.5px] font-mono text-neutral-500 uppercase tracking-widest mt-0.5 hidden md:inline">
                {sheet.desc}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeSheetHeaderIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Sheet Interactive Progress Indicator */}
      <div className="w-full h-[3px] bg-white/5 relative overflow-hidden">
        <motion.div
          className="absolute top-0 bottom-0 left-0 shadow-sm"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{
            background: `linear-gradient(90deg, ${midBandColor.bg} 0%, ${activeColorSet.color} 100%)`,
            boxShadow: `0 0 10px ${activeColorSet.color}80`,
          }}
        />
      </div>
    </header>
  );
}
