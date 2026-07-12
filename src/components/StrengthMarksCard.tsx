import React from "react";
import { Dumbbell, Zap } from "lucide-react";
import { AthleteState } from "../types/workout";
import {
  MAIN_LIFTS,
  MAIN_LIFT_IDS,
  getOneRepMaxes,
  setOneRepMax,
  WM_FACTOR,
  estimateOneRepMaxesFromLogs,
} from "../lib/workingMax";
import { CATALOG, resolveOrInfer } from "../data/exerciseCatalog";
import { emitToast } from "../lib/exportService";
import { SectionCard, TXT } from "./ui/primitives";

/**
 * Marcas de fuerza (1RM) → Working Max: el núcleo funcional del perfil.
 * Alimenta workingMax.ts / resolveWmRange, que resuelve los esquemas "% WM"
 * del pizarrón y la autorregulación. Cada input persiste directo en
 * nexus_athlete_1rm al tipear (sin submit); el coeficiente K vive en el
 * documento del atleta y se persiste vía handleUpdateAthlete.
 */
export default function StrengthMarksCard({
  athlete,
  handleUpdateAthlete,
}: {
  athlete: AthleteState;
  handleUpdateAthlete: (athlete: AthleteState) => void;
}) {
  const [oneRms, setOneRms] = React.useState<Record<string, number>>(() => getOneRepMaxes());
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

  return (
    <SectionCard
      title="Marcas de fuerza (1RM) // Working Max"
      icon={<Dumbbell size={16} className="text-[color:var(--color-sem-cyan)]" />}
      subtitle="Alimenta las cargas % WM del pizarrón"
    >
      <p className={TXT.body}>
        Cargá tu 1RM real (kg) de cada levantamiento. El sistema usa el{" "}
        <span className="text-[color:var(--color-sem-cyan)] font-bold">
          Working Max = {Math.round((athlete.kCoefficient ?? WM_FACTOR) * 100)}% del 1RM (coeficiente K)
        </span>{" "}
        para resolver los esquemas con <span className="text-[color:var(--color-sem-cyan)] font-bold">% WM</span> a
        una carga sugerida en kg, al lado de cada ejercicio en el pizarrón.
      </p>

      {/* Coeficiente K del Working Max Dinámico (enciclopedia cap. 30–31 / Apéndice B) */}
      <div className="space-y-1.5 mt-4">
        <div className={TXT.label}>Calibración del Working Max Dinámico (K)</div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { k: 0.85, label: "0.85", hint: "Alta eficiencia neural · poco volumen" },
            { k: 0.9, label: "0.90", hint: "Balanceado (por defecto)" },
            { k: 0.95, label: "0.95", hint: "Principiante · alto volumen" },
          ].map((opt) => {
            const active = Math.abs((athlete.kCoefficient ?? WM_FACTOR) - opt.k) < 0.001;
            return (
              <button
                key={opt.k}
                type="button"
                title={opt.hint}
                onClick={() => handleUpdateAthlete({ ...athlete, kCoefficient: opt.k })}
                className={`py-1.5 rounded-[var(--radius-tile)] text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                  active
                    ? "bg-[color:var(--color-sem-cyan)] text-black"
                    : "bg-[color:var(--color-card-2)] text-[color:var(--color-ink-2)] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-[9px] font-mono text-[color:var(--color-label)] leading-relaxed">
          K calibra cuánta carga real tolerás bajo volumen: 0.85 si tu SNC se fatiga rápido, 0.95 si toleras mucho.
          Afecta todas las cargas % WM del pizarrón.
        </p>
      </div>

      {hasLogEstimates && (
        <button
          type="button"
          onClick={autofillFromLogs}
          title="Estimar 1RM (Epley) desde tus incursiones registradas y completar los vacíos"
          className="mt-3 flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-wider bg-[color:var(--color-sem-cyan)]/10 text-[color:var(--color-sem-cyan)] hover:bg-[color:var(--color-sem-cyan)] hover:text-black transition-all px-3 py-1.5 rounded-[var(--radius-tile)] cursor-pointer"
        >
          <Zap size={11} aria-hidden="true" /> Estimar 1RM desde mis logs
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 pt-3">
        {MAIN_LIFTS.map((lift) => {
          const orm = oneRms[lift.id];
          const wm = orm ? Math.round(orm * WM_FACTOR * 10) / 10 : null;
          const logEst = logEstimates[lift.id];
          return (
            <div key={lift.id} className="space-y-0.5">
              <label className="text-[9px] font-mono text-[color:var(--color-label)] uppercase block truncate">
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
                  placeholder="—"
                  className="w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] p-2 pr-9 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow placeholder:text-[color:var(--color-ink-faint)]"
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
      <div className="border-t border-white/[0.06] pt-3 mt-3 space-y-2">
        <div className={TXT.label}>Otros movimientos con carga (carga de trabajo)</div>
        <p className="text-[9px] font-mono text-[color:var(--color-label)] leading-relaxed">
          Cargá el peso que usás en accesorios/KB/DB (KB Swing, Bulgarian, V-up lastrado…) para que el pizarrón
          resuelva sus cargas <span className="text-[color:var(--color-sem-cyan)] font-bold">% WM</span> y se
          autorregulen. Acá <span className="text-[color:var(--color-ink-2)]">no</span> se aplica el coeficiente K.
        </p>
        {accessoryIds.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
            {accessoryIds.map((id) => {
              const val = oneRms[id];
              const logEst = logEstimates[id];
              return (
                <div key={id} className="space-y-0.5">
                  <label className="text-[9px] font-mono text-[color:var(--color-label)] uppercase block truncate">
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
                      className="w-full bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] p-2 pr-9 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] transition-shadow placeholder:text-[color:var(--color-ink-faint)]"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[color:var(--color-label)] pointer-events-none">
                      kg
                    </span>
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
            className="flex-1 bg-[color:var(--color-card-2)] rounded-[var(--radius-tile)] p-2 text-white text-xs outline-none focus:ring-2 focus:ring-[color:var(--color-sem-cyan)] placeholder:text-[color:var(--color-ink-faint)]"
          />
          <button
            type="button"
            onClick={addMovement}
            className="bg-[color:var(--color-sem-cyan)]/10 text-[color:var(--color-sem-cyan)] hover:bg-[color:var(--color-sem-cyan)] hover:text-black text-[10px] font-mono font-black uppercase px-3 rounded-[var(--radius-tile)] cursor-pointer transition-all"
          >
            + Agregar
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
