import React from "react";
import { motion } from "motion/react";
import { Trophy, Check, Zap } from "lucide-react";
import { AthleteState } from "../types/workout";
import { MASTER_ACHIEVEMENTS } from "../lib/constants";
import { MAIN_LIFTS, MAIN_LIFT_IDS, getOneRepMaxes, setOneRepMax, WM_FACTOR, estimateOneRepMaxesFromLogs } from "../lib/workingMax";
import { getProgramStartDate, setProgramStartDate } from "../lib/programStart";
import { CATALOG, resolveOrInfer } from "../data/exerciseCatalog";
import { emitToast } from "../lib/exportService";

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
  /** Re-abre el onboarding (recalibra el punto de referencia del atleta). */
  onRecalibrate?: () => void;
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
  onRecalibrate,
}: ProfileModalProps) {
  // 1RM store lives in its own syncable key (nexus_athlete_1rm), separate from
  // the athlete identity doc. Writing dispatches an update so the board's
  // Working-Max chips refresh live.
  const [oneRms, setOneRms] = React.useState<Record<string, number>>(() => getOneRepMaxes());
  // Epley estimates from logged sessions (computed once on open).
  const [logEstimates] = React.useState<Record<string, number>>(() => estimateOneRepMaxesFromLogs());
  const updateOneRm = (id: string, raw: string) => {
    const kg = raw.trim() === "" ? null : parseFloat(raw);
    setOneRms((prev) => {
      const next = { ...prev };
      if (kg == null || !Number.isFinite(kg) || kg <= 0) delete next[id];
      else next[id] = kg;
      return next;
    });
    setOneRepMax(id, kg);
  };
  // Fill only the lifts the athlete hasn't entered yet, from log estimates.
  const autofillFromLogs = () => {
    setOneRms((prev) => {
      const next = { ...prev };
      for (const lift of MAIN_LIFTS) {
        if (next[lift.id] == null && logEstimates[lift.id] != null) {
          next[lift.id] = logEstimates[lift.id];
          setOneRepMax(lift.id, logEstimates[lift.id]);
        }
      }
      return next;
    });
  };
  const hasLogEstimates = MAIN_LIFTS.some((l) => logEstimates[l.id] != null);

  // Working loads for NON-main loaded movements (KB swing, bulgarian, weighted
  // V-up…) so "% WM" resolves and autoregulates for them too. K does NOT apply
  // here (the stored value is the working load, not a barbell 1RM).
  const catById = React.useMemo(() => {
    const m: Record<string, { name: string; loaded: boolean }> = {};
    for (const e of CATALOG) m[e.id] = { name: e.name, loaded: e.loadType === "external" || e.loadType === "bodyweight+load" };
    return m;
  }, []);
  const [manualIds, setManualIds] = React.useState<string[]>([]);
  const accessoryIds = React.useMemo(() => {
    const ids = new Set<string>([...Object.keys(oneRms), ...Object.keys(logEstimates), ...manualIds]);
    return [...ids]
      .filter((id) => !MAIN_LIFT_IDS.has(id) && catById[id]?.loaded)
      .sort((a, b) => (catById[a]?.name || a).localeCompare(catById[b]?.name || b));
  }, [oneRms, logEstimates, manualIds, catById]);
  const [newMove, setNewMove] = React.useState("");
  const addMovement = () => {
    const n = newMove.trim();
    if (!n) return;
    const ex = resolveOrInfer(n);
    const loaded = ex && (ex.loadType === "external" || ex.loadType === "bodyweight+load");
    if (!loaded) {
      emitToast(`"${n}" no usa carga externa — no necesita Working Max.`, "info", 5000);
      return;
    }
    setManualIds((prev) => (prev.includes(ex.id) ? prev : [...prev, ex.id]));
    setNewMove("");
  };

  // Program start date — anchors "ACOPLAR HOY" to the real week/day of the cycle.
  const [programStart, setProgramStart] = React.useState<string>(
    () => getProgramStartDate() || "",
  );
  const updateProgramStart = (iso: string) => {
    setProgramStart(iso);
    setProgramStartDate(iso || null);
    // Nudge any real-time-synced views to recompute from the new anchor.
    window.dispatchEvent(new Event("nexus_logs_updated"));
  };

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
        className="p-6 md:p-8 max-w-xl w-full bg-[#0A0A0B] shadow-sm font-condensed relative overflow-hidden my-auto"
      >
        {/* decorative lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-electric-blue/40 via-electric-blue to-electric-blue/40"></div>
        <div className="absolute -top-4 -right-4 text-electric-blue/5 text-[120px] font-brutalist select-none pointer-events-none">
          L4
        </div>

        <h3 className="text-3xl sm:text-4xl font-brutalist tracking-widest text-pure-white leading-tight text-center relative z-10">
          PERFIL DE RENDIMIENTO L4
        </h3>
        <p className="text-center font-bold text-neutral-400 text-[10px] sm:text-xs tracking-[0.2em] uppercase border-b border-[color:var(--color-line)] pb-5 mb-5 text-electric-blue/80 relative z-10">
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
              className="w-full bg-[#111113] p-2.5 sm:p-3 text-white text-sm uppercase font-bold focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
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
              className="w-full bg-[#111113] p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700 mb-2"
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
                  className={`text-[9px] font-mono bg-[color:var(--color-card-2)] text-neutral-300 px-2 py-1.5 transition-all cursor-pointer ${preset.color} hover:bg-[color:var(--color-card-2)] active:scale-95 text-left leading-tight`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* CALENDARIO DEL PROGRAMA — start date for "ACOPLAR HOY" */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-2 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              CALENDARIO DEL PROGRAMA
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Fecha en que arrancaste{" "}
              <span className="text-electric-blue font-bold">Acto I · Semana 1 · Día 1</span>.
              Con esto, <span className="text-electric-blue font-bold">ACOPLAR HOY</span> calcula
              tu semana y día reales del ciclo (4 semanas) de ahí en adelante. Sin fecha, usa la
              semana del calendario.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="date"
                value={programStart}
                onChange={(e) => updateProgramStart(e.target.value)}
                className="bg-[#111113] p-2.5 text-white text-sm font-mono focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all [color-scheme:dark]"
              />
              {programStart && (
                <button
                  type="button"
                  onClick={() => updateProgramStart("")}
                  className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 hover:text-white hover:border-white/30 px-3 py-2.5 transition-all cursor-pointer"
                >
                  Limpiar
                </button>
              )}
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
                className="w-full bg-[#111113] p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
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
                className="w-full bg-[#111113] p-2 text-white text-sm focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
              />
            </div>
          </div>

          {/* LOOT EQUIPO */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3 mt-4">
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
                className="w-full bg-[#111113] p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
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
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors text-neutral-300 px-1.5 py-1"
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
                className="w-full bg-[#111113] p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
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
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors text-neutral-300 px-1.5 py-1"
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
                className="w-full bg-[#111113] p-2 text-white text-xs focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
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
                    className="text-[8.5px] font-mono bg-[#111113] hover:text-electric-blue duration-150 transition-colors text-neutral-300 px-1.5 py-1"
                  >
                    {item.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MARCAS DE FUERZA (1RM) → WORKING MAX */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3 mt-4">
            <span className="text-xs sm:text-sm font-brutalist text-electric-blue block tracking-widest uppercase flex items-center gap-2">
              <span className="h-1 w-1 bg-electric-blue rounded-full"></span>
              MARCAS DE FUERZA (1RM) // WORKING MAX
            </span>
            <p className="text-[10px] font-mono text-neutral-400">
              Cargá tu 1RM real (kg) de cada levantamiento. El sistema usa el{" "}
              <span className="text-electric-blue font-bold">Working Max = {Math.round((tempAthlete.kCoefficient ?? WM_FACTOR) * 100)}% del 1RM (coeficiente K)</span>{" "}
              para resolver los esquemas con <span className="text-electric-blue font-bold">% WM</span> a una carga
              sugerida en kg, al lado de cada ejercicio en el pizarrón.
            </p>

            {/* Coeficiente K del Working Max Dinámico (enciclopedia cap. 30–31 / Apéndice B) */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-mono text-[color:var(--color-label)] uppercase tracking-wider">
                Calibración del Working Max Dinámico (K)
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { k: 0.85, label: "0.85", hint: "Alta eficiencia neural · poco volumen" },
                  { k: 0.9, label: "0.90", hint: "Balanceado (por defecto)" },
                  { k: 0.95, label: "0.95", hint: "Principiante · alto volumen" },
                ].map((opt) => {
                  const active = Math.abs((tempAthlete.kCoefficient ?? WM_FACTOR) - opt.k) < 0.001;
                  return (
                    <button
                      key={opt.k}
                      type="button"
                      title={opt.hint}
                      onClick={() => setTempAthlete({ ...tempAthlete, kCoefficient: opt.k })}
                      className={`py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                        active ? "bg-electric-blue text-pure-black" : "bg-[#111113] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] font-mono text-[color:var(--color-label)] leading-relaxed">
                K calibra cuánta carga real tolerás bajo volumen: 0.85 si tu SNC se fatiga rápido, 0.95 si toleras
                mucho. Afecta todas las cargas % WM del pizarrón.
              </p>
            </div>
            {hasLogEstimates && (
              <button
                type="button"
                onClick={autofillFromLogs}
                title="Estimar 1RM (Epley) desde tus incursiones registradas y completar los vacíos"
                className="text-[9px] font-mono font-black uppercase tracking-wider bg-electric-blue/10 border border-electric-blue/40 text-electric-blue hover:bg-electric-blue hover:text-pure-black transition-all px-3 py-1.5 cursor-pointer"
              >
                ⚡ Estimar 1RM desde mis logs
              </button>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 pt-1">
              {MAIN_LIFTS.map((lift) => {
                const orm = oneRms[lift.id];
                const wm = orm ? Math.round(orm * WM_FACTOR * 10) / 10 : null;
                const logEst = logEstimates[lift.id];
                return (
                  <div key={lift.id} className="space-y-0.5 group">
                    <label className="text-[9px] font-mono text-neutral-400 uppercase block truncate group-focus-within:text-electric-blue transition-colors">
                      {lift.name}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="2.5"
                        value={orm ?? ""}
                        onChange={(e) => updateOneRm(lift.id, e.target.value)}
                        className="w-full bg-[#111113] p-2 pr-9 text-white text-sm font-bold focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
                        placeholder="—"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[color:var(--color-label)] pointer-events-none">
                        kg
                      </span>
                    </div>
                    <div className="text-[8px] font-mono text-[color:var(--color-label)] flex items-center gap-1.5 min-h-[12px]">
                      {wm != null && <span>WM {wm} kg</span>}
                      {logEst != null && (
                        <button
                          type="button"
                          onClick={() => updateOneRm(lift.id, String(logEst))}
                          title="Usar la estimación de tus logs (Epley)"
                          className="text-amber-500/80 hover:text-amber-400 underline decoration-dotted cursor-pointer"
                        >
                          logs ≈{logEst}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Otros movimientos con carga (carga de trabajo, sin K) */}
            <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
              <div className="text-[10px] font-mono text-[color:var(--color-label)] uppercase tracking-wider">
                Otros movimientos con carga (carga de trabajo)
              </div>
              <p className="text-[9px] font-mono text-[color:var(--color-label)] leading-relaxed">
                Cargá el peso que usás en accesorios/KB/DB (KB Swing, Bulgarian, V-up lastrado…) para que el
                pizarrón resuelva sus cargas <span className="text-electric-blue font-bold">% WM</span> y se autorregulen.
                Acá <span className="text-neutral-400">no</span> se aplica el coeficiente K.
              </p>
              {accessoryIds.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
                  {accessoryIds.map((id) => {
                    const val = oneRms[id];
                    const logEst = logEstimates[id];
                    return (
                      <div key={id} className="space-y-0.5 group">
                        <label className="text-[9px] font-mono text-neutral-400 uppercase block truncate">
                          {catById[id]?.name || id}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="2.5"
                            value={val ?? ""}
                            onChange={(e) => updateOneRm(id, e.target.value)}
                            placeholder="—"
                            className="w-full bg-[#111113] p-2 pr-9 text-white text-sm font-bold focus:border-electric-blue focus:bg-electric-blue/5 focus:outline-none transition-all placeholder:text-neutral-700"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[color:var(--color-label)] pointer-events-none">kg</span>
                        </div>
                        <div className="text-[8px] font-mono text-[color:var(--color-label)] min-h-[12px]">
                          {logEst != null && (
                            <button
                              type="button"
                              onClick={() => updateOneRm(id, String(logEst))}
                              title="Usar la estimación de tus logs (Epley)"
                              className="text-amber-500/80 hover:text-amber-400 underline decoration-dotted cursor-pointer"
                            >
                              logs ≈{logEst}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-1.5">
                <input
                  value={newMove}
                  onChange={(e) => setNewMove(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMovement(); } }}
                  placeholder="Agregar movimiento (ej. KB Swing)"
                  spellCheck={false}
                  className="flex-1 bg-[#111113] p-2 text-white text-xs focus:border-electric-blue focus:outline-none placeholder:text-neutral-700"
                />
                <button
                  type="button"
                  onClick={addMovement}
                  className="bg-electric-blue/10 border border-electric-blue/40 text-electric-blue hover:bg-electric-blue hover:text-pure-black text-[10px] font-mono font-black uppercase px-3 cursor-pointer transition-all"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE LOGROS ADQUIRIDOS (GAMIFICACIÓN) */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3 mt-4">
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
                          <span className="text-[color:var(--color-label)] italic">POR ADQUIRIR</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLOR DE ACENTO DE TEMÁTICA CLÍNICA */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3 mt-4">
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
                  className={`text-[9px] font-mono p-1.5 border hover:bg-[color:var(--color-card-2)] transition-all cursor-pointer text-left flex flex-col justify-between h-[45px] ${
                    customAccentColor === opt.id
                      ? `${opt.borderActive} bg-[color:var(--color-card-2)] font-bold`
                      : "border-[color:var(--color-line)] text-neutral-300"
                  }`}
                >
                  <span className={`block truncate w-full ${opt.colorText}`}>{opt.name}</span>
                  <span className="text-[7.5px] text-[color:var(--color-label)] block leading-none">
                    {opt.id === "default" ? "Sincro auto" : "Anulación manual"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ESTILO Y GRÁFICAS DE FONDO */}
          <div className="border-t border-[color:var(--color-line)] pt-4 space-y-3 mt-4">
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
                        className="text-[9px] font-mono bg-[color:var(--color-card-2)] text-neutral-300 p-1.5 hover:bg-electric-blue/10 hover:border-electric-blue duration-150 transition-all text-left flex flex-col justify-between h-[52px] cursor-pointer"
                      >
                        <span className="font-bold text-white block truncate w-full">{preset.name}</span>
                        <span className="text-[7.5px] text-[color:var(--color-label)] line-clamp-2 leading-tight">
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
                      className="w-full bg-[#111113] p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
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
                      className="w-full bg-[#111113] p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
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
                      className="w-full bg-[#111113] p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
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
                      className="w-full bg-[#111113] p-1.5 text-white font-mono text-[9px] focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {onRecalibrate && (
          <div className="pt-4 relative z-10">
            <button
              onClick={() => { onRecalibrate(); onClose(); }}
              className="w-full bg-transparent text-white font-brutalist py-3 px-4 text-xs tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer uppercase font-bold"
              title="Volver a responder el cuestionario y recomputar tu punto de referencia"
            >
              ⚙ CALIBRAR ATLETA (RE-ONBOARDING)
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-6 relative z-10 mt-2 border-t border-[color:var(--color-line)]">
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
            className="w-full sm:w-auto bg-transparent text-neutral-400 font-brutalist py-3 px-6 text-xs sm:text-sm tracking-wider hover:bg-[color:var(--color-card-2)] hover:text-white hover:border-white/40 transition-all cursor-pointer font-bold"
            onClick={onClose}
          >
            CERRAR
          </button>
        </div>
      </motion.div>
    </div>
  );
}
