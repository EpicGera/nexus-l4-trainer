import React from "react";
import { motion } from "framer-motion";
import { Trophy, Check, Zap } from "lucide-react";
import { AthleteState } from "../types/workout";
import { MASTER_ACHIEVEMENTS } from "../lib/constants";

interface ProfileModalProps {
  tempAthlete: AthleteState;
  setTempAthlete: React.Dispatch<React.SetStateAction<AthleteState>>;
  unlockedAchievements: string[];
  customAccentColor: string;
  setCustomAccentColor: (color: string) => void;
  enableThemedBackgrounds: boolean;
  setEnableThemedBackgrounds: (enabled: boolean) => void;
  warmupBg: string;
  setWarmupBg: (bg: string) => void;
  strengthBg: string;
  setStrengthBg: (bg: string) => void;
  metconBg: string;
  setMetconBg: (bg: string) => void;
  accessoriesBg: string;
  setAccessoriesBg: (bg: string) => void;
  handleUpdateAthlete: (athlete: AthleteState) => void;
  onClose: () => void;
}

export default function ProfileModal({
  tempAthlete,
  setTempAthlete,
  unlockedAchievements,
  customAccentColor,
  setCustomAccentColor,
  enableThemedBackgrounds,
  setEnableThemedBackgrounds,
  warmupBg,
  setWarmupBg,
  strengthBg,
  setStrengthBg,
  metconBg,
  setMetconBg,
  accessoriesBg,
  setAccessoriesBg,
  handleUpdateAthlete,
  onClose,
}: ProfileModalProps) {
  return (
    <div
      id="profileModal"
      className="fixed inset-0 bg-pure-black/95 flex items-center justify-center z-[100] p-4 overflow-y-auto backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="border border-white/20 p-6 md:p-8 max-w-xl w-full bg-[#0A0A0B] shadow-sm font-condensed relative overflow-hidden my-auto"
      >
        {/* decorative lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-blue/40 via-electric-blue to-electric-blue/40"></div>
        <div className="absolute -top-4 -right-4 text-electric-blue/5 text-[120px] font-brutalist select-none pointer-events-none">
          L4
        </div>

        <h3 className="text-3xl sm:text-4xl font-brutalist tracking-widest text-pure-white leading-tight text-center relative z-10">
          PERFIL DE RENDIMIENTO L4
        </h3>
        <p className="text-center font-bold text-neutral-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase border-b border-white/10 pb-5 mb-5 text-electric-blue/80 relative z-10">
          SISTEMA DE CONFIGURACIÓN DE BIOMECÁNICA DE ATLETA
        </p>

        <div className="space-y-4 text-left relative z-10 max-h-[60vh] overflow-y-auto pr-1">
          {/* ID / NOMBRE */}
          <div className="space-y-1 group">
            <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
              IDENTIDAD (NOMBRE)
            </label>
            <input
              type="text"
              value={tempAthlete.identity}
              onChange={(e) =>
                setTempAthlete({
                  ...tempAthlete,
                  identity: e.target.value.toUpperCase(),
                })
              }
              className="w-full bg-[#111113] border border-white/10 p-2.5 sm:p-3 text-white text-sm uppercase font-bold focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              placeholder="EJ: GERA & FLOR"
            />
          </div>

          {/* CLASE / LEVEL */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block">
              ESTILO & PLAN DE RENDIMIENTO
            </label>
            <input
              type="text"
              value={tempAthlete.level}
              onChange={(e) =>
                setTempAthlete({ ...tempAthlete, level: e.target.value })
              }
              className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700 mb-2"
              placeholder="EJ: PRVN ELITE // LVL 4 ⚡"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {[
                {
                  name: "PRVN Elite 🧬",
                  level: "PRVN ELITE // LVL 4 ⚡",
                  restriction: "RPE 8.5 MÁX (Velocidad de Barra)",
                  condition: "Atleta de Élite Base",
                  color: "hover:border-blue-400 hover:text-blue-400",
                },
                {
                  name: "HWPO Grind ⛓️",
                  level: "HWPO GRIND // LVL 4 🏋️",
                  restriction: "RPE 9.0 MÁX (Acumulación Segura)",
                  condition: "Grind & Hipertrofia Fraser",
                  color: "hover:border-red-400 hover:text-red-400",
                },
                {
                  name: "Mayhem Team 🌋",
                  level: "MAYHEM TEAM // LVL 3 🌋",
                  restriction: "RPE 8.0 MÁX (Volumen Mayhem)",
                  condition: "Sábados de Equipo Co-op",
                  color: "hover:border-orange-400 hover:text-orange-400",
                },
                {
                  name: "Haedo Adaptive 🪣",
                  level: "HAEDO ADAPTIVE // BALDE 🪣",
                  restriction: "RPE 7.0 MÁX (Postura Impecable)",
                  condition: "Salud Longevidad (Cazador de Cocas)",
                  color: "hover:border-emerald-400 hover:text-emerald-400",
                },
                {
                  name: "San Justo Peak 🚨",
                  level: "SAN JUSTO ATLETA // VALENTÍN 🚨",
                  restriction: "RPE 6.5 MÁX (Control de Fatiga)",
                  condition: "Halterofilia post-metcon Escalar",
                  color: "hover:border-purple-400 hover:text-purple-400",
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setTempAthlete({
                      ...tempAthlete,
                      level: preset.level,
                      restriction: preset.restriction,
                      condition: preset.condition,
                    })
                  }
                  className={`text-[9px] font-mono bg-white/5 text-neutral-300 px-2 py-1.5 border border-white/10 transition-all cursor-pointer ${preset.color} hover:bg-white/10 active:scale-95 text-left leading-tight`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* LIMITACIONES / CONDICIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1 group">
              <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
                RESTRICCIÓN / RPE
              </label>
              <input
                type="text"
                value={tempAthlete.restriction || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    restriction: e.target.value,
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
            <div className="space-y-1 group">
              <label className="text-[10px] sm:text-xs font-brutalist tracking-wider text-neutral-400 uppercase block group-focus-within:text-electric-blue transition-colors">
                CONDICIÓN CLÍNICA
              </label>
              <input
                type="text"
                value={tempAthlete.condition || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    condition: e.target.value,
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* LOOT EQUIPO */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              EQUIPAMIENTO / ACCESORIOS DE ENTRENAMIENTO [CF-L4]
            </span>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                RODILLERAS / COMPRESIÓN TÉRMICA:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.grebas || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      grebas: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Rodilleras de Neoprene 7mm (Soporte Articular)",
                  "Rodilleras de Compresión Anatómica (Estabilidad Propioceptiva)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          grebas: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                CALLERAS / AGARRE Y PROTECCIÓN:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.amuleto || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      amuleto: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Calleras de Fibra de Carbono (Dowel Effect)",
                  "Tape Elástico para Hook Grip (Física de Agarre)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          amuleto: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 block font-mono">
                BIOENERGÍA / RECUPERACIÓN SISTÉMICA:
              </label>
              <input
                type="text"
                value={tempAthlete.equipment?.filtro || ""}
                onChange={(e) =>
                  setTempAthlete({
                    ...tempAthlete,
                    equipment: {
                      ...tempAthlete.equipment,
                      filtro: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#111113] border border-white/10 p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "Suplementación de Electrolitos Sódicos (Soporte Hidrolítico)",
                  "Bebida Reconstituyente de Carbohidratos (Saturación de Glucógeno)",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTempAthlete({
                        ...tempAthlete,
                        equipment: {
                          ...tempAthlete.equipment,
                          filtro: item,
                        },
                      })
                    }
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors border border-white/10 text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECCIÓN DE LOGROS ADQUIRIDOS (GAMIFICACIÓN) */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-amber-400 block tracking-widest uppercase flex items-center gap-2">
              <Trophy size={14} className="text-amber-400 shrink-0" />
              LOGROS Y TROFEOS DE RENDIMIENTO ({unlockedAchievements.length} / {MASTER_ACHIEVEMENTS.length})
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Completa tus misiones, mantén consistencia técnica clínica de calidad y desbloquea insignias exclusivas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
              {MASTER_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-2.5 border transition-all relative flex gap-2 ${
                      isUnlocked
                        ? "bg-zinc-950/90 text-white"
                        : "bg-neutral-950/20 border-white/5 opacity-40 select-none"
                    }`}
                    style={{
                      borderColor: isUnlocked ? ach.color : "rgba(255,255,255,0.05)",
                      boxShadow: isUnlocked ? `0 0 10px ${ach.color}10` : "none",
                    }}
                  >
                    <div
                      className="text-2xl flex items-center justify-center shrink-0 w-8 h-8 rounded-none border font-mono animate-none"
                      style={{
                        backgroundColor: isUnlocked ? `${ach.color}15` : "transparent",
                        borderColor: isUnlocked ? `${ach.color}45` : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {isUnlocked ? ach.icon : "🔒"}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex justify-between items-center bg-white/0 gap-1.5">
                        <h5
                          className="font-brutalist text-xs uppercase tracking-wide truncate"
                          style={{
                            color: isUnlocked ? ach.color : "#737373",
                          }}
                        >
                          {ach.title}
                        </h5>
                        <span
                          className="text-[7.5px] font-mono font-black scale-90 select-none"
                          style={{
                            color: isUnlocked ? ach.color : "#737373",
                          }}
                        >
                          {ach.rarity}
                        </span>
                      </div>
                      <p className="text-[9.5px] font-condensed text-zinc-400 leading-tight mt-0.5 font-bold line-clamp-2">
                        {ach.description}
                      </p>
                      <div className="text-[8px] font-mono mt-1 text-right">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-end gap-0.5">
                            <Check size={8} className="stroke-[3]" /> DESBLOQUEADO
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">POR ADQUIRIR</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLOR DE ACENTO DE TEMÁTICA CLÍNICA */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              COLOR DE ACENTO PRINCIPAL DEL SISTEMA
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Personaliza el tono de la interfaz y los reportes de rendimiento clínico.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {[
                {
                  id: "default",
                  name: "Semana Activa 🔄",
                  colorText: "text-neutral-400",
                  borderActive: "border-white",
                },
                {
                  id: "electric-blue",
                  name: "Electric Blue ⚡",
                  colorText: "text-[#1F51FF]",
                  borderActive: "border-[#1F51FF]",
                },
                {
                  id: "neon-green",
                  name: "Neon Green 🟢",
                  colorText: "text-[#39FF14]",
                  borderActive: "border-[#39FF14]",
                },
                {
                  id: "royal-purple",
                  name: "Royal Purple 🟣",
                  colorText: "text-[#BD00FF]",
                  borderActive: "border-[#BD00FF]",
                },
                {
                  id: "neon-pink",
                  name: "Neon Pink 💗",
                  colorText: "text-[#FF007F]",
                  borderActive: "border-[#FF007F]",
                },
                {
                  id: "neon-orange",
                  name: "Neon Orange 🟠",
                  colorText: "text-[#FF5A00]",
                  borderActive: "border-[#FF5A00]",
                },
                {
                  id: "neon-cyan",
                  name: "Neon Cyan 🔵",
                  colorText: "text-[#00F0FF]",
                  borderActive: "border-[#00F0FF]",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setCustomAccentColor(opt.id);
                    localStorage.setItem("nexus_custom_accent_color", opt.id);
                  }}
                  className={`text-[9px] font-mono p-1.5 border hover:bg-white/5 transition-all cursor-pointer text-left flex flex-col justify-between h-[45px] ${
                    customAccentColor === opt.id
                      ? `${opt.borderActive} bg-white/10 font-bold`
                      : "border-white/10 text-neutral-300"
                  }`}
                >
                  <span className={`block truncate w-full ${opt.colorText}`}>{opt.name}</span>
                  <span className="text-[7.5px] text-neutral-500 block leading-none">
                    {opt.id === "default" ? "Sincro auto" : "Anulación manual"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ESTILO Y GRÁFICAS DE FONDO */}
          <div className="border-t border-white/10 pt-4 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
                <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
                IMÁGENES Y ESTILO VISUAL DE BLOQUES
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableThemedBackgrounds}
                  onChange={(e) => {
                    setEnableThemedBackgrounds(e.target.checked);
                    localStorage.setItem("nexus_enable_themed_backgrounds", String(e.target.checked));
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-electric-blue/70 peer-checked:after:bg-electric-blue"></div>
                <span className="ml-2 pr-1 font-mono text-[9px] uppercase font-bold text-neutral-400 peer-checked:text-electric-blue">
                  {enableThemedBackgrounds ? "ACTIVO" : "INACTIVO"}
                </span>
              </label>
            </div>

            {enableThemedBackgrounds && (
              <div className="space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 block font-mono">
                    PLANTILLAS DE GRÁFICAS TEMÁTICAS:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {[
                      {
                        name: "Noir Chalk & Iron 🏋️‍♂️",
                        d: "Estilo rústico, magnesio y halterofilia clásica",
                        warmup:
                          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                      {
                        name: "Cyber CrossFit 🧬",
                        d: "Fondo futurista de fibra y luces cibernéticas",
                        warmup:
                          "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                      {
                        name: "Raw Carbon 🍌",
                        d: "Inspirado en texturas de fibra e imagen de alta potencia",
                        warmup:
                          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop",
                        strength:
                          "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop",
                        metcon:
                          "https://images.unsplash.com/photo-1434596994096-19d4e89a7ec5?q=80&w=800&auto=format&fit=crop",
                        accessories:
                          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setWarmupBg(preset.warmup);
                          setStrengthBg(preset.strength);
                          setMetconBg(preset.metcon);
                          setAccessoriesBg(preset.accessories);
                          localStorage.setItem("nexus_bg_warmup", preset.warmup);
                          localStorage.setItem("nexus_bg_strength", preset.strength);
                          localStorage.setItem("nexus_bg_metcon", preset.metcon);
                          localStorage.setItem("nexus_bg_accessories", preset.accessories);
                        }}
                        className="text-[9px] font-mono bg-white/5 border border-white/10 text-neutral-300 p-1.5 hover:bg-electric-blue/10 hover:border-electric-blue duration-150 transition-all text-left flex flex-col justify-between h-[52px] cursor-pointer"
                      >
                        <span className="font-bold text-white block truncate w-full">{preset.name}</span>
                        <span className="text-[7.5px] text-neutral-500 line-clamp-2 leading-tight">
                          {preset.d}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO CALENTAMIENTO (URL):
                    </label>
                    <input
                      type="text"
                      value={warmupBg}
                      onChange={(e) => {
                        setWarmupBg(e.target.value);
                        localStorage.setItem("nexus_bg_warmup", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO FUERZA / OLY (URL):
                    </label>
                    <input
                      type="text"
                      value={strengthBg}
                      onChange={(e) => {
                        setStrengthBg(e.target.value);
                        localStorage.setItem("nexus_bg_strength", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO METCON (URL):
                    </label>
                    <input
                      type="text"
                      value={metconBg}
                      onChange={(e) => {
                        setMetconBg(e.target.value);
                        localStorage.setItem("nexus_bg_metcon", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-neutral-400 block font-mono uppercase">
                      FONDO ACCESORIOS (URL):
                    </label>
                    <input
                      type="text"
                      value={accessoriesBg}
                      onChange={(e) => {
                        setAccessoriesBg(e.target.value);
                        localStorage.setItem("nexus_bg_accessories", e.target.value);
                      }}
                      className="w-full bg-[#111113] border border-white/10 p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 relative z-10 mt-2 border-t border-white/10">
          <button
            className="flex-1 text-black font-brutalist py-3 sm:py-4 px-4 text-xs sm:text-sm tracking-widest transition-all cursor-pointer uppercase font-bold flex items-center justify-center gap-2 group relative overflow-hidden bg-electric-blue hover:bg-[#00F0FF]"
            onClick={() => {
              if (tempAthlete.identity.trim()) {
                handleUpdateAthlete(tempAthlete);
                onClose();
              }
            }}
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out"></span>
            <Zap size={16} className="group-hover:scale-110 transition-transform" />
            <span className="relative z-10">ACTUALIZAR PERFIL BIOMECÁNICO</span>
          </button>
          <button
            className="w-full sm:w-auto bg-transparent border border-white/20 text-neutral-400 font-brutalist py-3 px-6 text-xs sm:text-sm tracking-wider hover:bg-white/5 hover:text-white hover:border-white/40 transition-all cursor-pointer font-bold"
            onClick={onClose}
          >
            CERRAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
