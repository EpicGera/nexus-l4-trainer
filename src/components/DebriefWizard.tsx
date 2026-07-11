import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, FileText, SkipForward } from "lucide-react";
import { DayVariation } from "../types/workout";
import { getCleanExerciseName, cleanExerciseLabel } from "../lib/historyUtils";
import { isCardio as classifyIsCardio } from "../lib/workoutClassifier";

interface DebriefWizardProps {
  dayId: string;
  dayName: string;
  dayTitle: string;
  variation: DayVariation;
  onClose: () => void;
  onFinish: () => void; // called after data saved → parent triggers CSV export
}

type MetconType = "forTime" | "amrap" | "emom" | "intervals" | "continuous" | "generic";

type StepKind = "strength" | "metconScore" | "metconMove" | "cardio";

interface WizardStep {
  kind: StepKind;
  blockLabel: "FUERZA" | "METCON" | "ACCESORIOS" | "CARDIO";
  blockKey: string; // groups metcon score + its movements
  storeKey: string; // localStorage key (clean name)
  exName: string; // clean exercise label
  rawItem: string;
  metconType?: MetconType;
}

interface StepData {
  weight: string;
  reps: string;
  rpe: string;
  rir: string;
  tiempo: string;
  rondas: string;
  repsExtra: string;
}

const BLOCK_COLORS: Record<string, string> = {
  FUERZA: "#ef4444",
  METCON: "#06b6d4",
  ACCESORIOS: "#f97316",
  CARDIO: "#22c55e",
};

const emptyData = (rir = "2"): StepData => ({
  weight: "",
  reps: "",
  rpe: "8",
  rir,
  tiempo: "",
  rondas: "",
  repsExtra: "",
});

function detectMetconType(scheme: string): MetconType {
  const s = String(scheme).toLowerCase();
  if (/amrap/.test(s)) return "amrap";
  if (/emom/.test(s)) return "emom";
  if (/for time|por tiempo|chipper|time cap/.test(s)) return "forTime";
  if (/continu|zona\s*2|minutos continuos|flush|regenerativo/.test(s)) return "continuous";
  if (/on\s*\/|on\/|interval|rondas|round/.test(s)) return "intervals";
  return "generic";
}

export default function DebriefWizard({
  dayId,
  dayName,
  dayTitle,
  variation,
  onClose,
  onFinish,
}: DebriefWizardProps) {
  const keyFor = (cleanName: string) =>
    `nexus_logs_${dayId}_${cleanName.replace(/\s+/g, "_")}`;

  // ── Build the protocol-aware step list ───────────────────────────────────
  const steps = useMemo<WizardStep[]>(() => {
    const out: WizardStep[] = [];

    // FUERZA
    (variation.strength?.items || []).forEach((raw) => {
      const storeName = getCleanExerciseName(raw);
      if (!storeName) return;
      out.push({
        kind: "strength",
        blockLabel: "FUERZA",
        blockKey: "strength",
        storeKey: keyFor(storeName),
        exName: cleanExerciseLabel(raw) || storeName,
        rawItem: raw,
      });
    });

    // METCON (protocol-aware)
    const metconItems = variation.metcon?.items || [];
    const metconScheme = variation.metcon?.scheme || "";
    const loggableMetcon = metconItems
      .map((raw) => ({ raw, storeName: getCleanExerciseName(raw) }))
      .filter((x) => x.storeName);

    if (loggableMetcon.length > 0) {
      const mType = detectMetconType(metconScheme);
      const singleCardio =
        loggableMetcon.length === 1 &&
        (mType === "continuous" ||
          classifyIsCardio(loggableMetcon[0].storeName, loggableMetcon[0].raw));

      if (singleCardio) {
        const it = loggableMetcon[0];
        out.push({
          kind: "cardio",
          blockLabel: "CARDIO",
          blockKey: "metcon",
          storeKey: keyFor(it.storeName),
          exName: cleanExerciseLabel(it.raw) || it.storeName,
          rawItem: it.raw,
        });
      } else {
        // One score step for the whole metcon, then a step per movement
        out.push({
          kind: "metconScore",
          blockLabel: "METCON",
          blockKey: "metcon",
          storeKey: "",
          exName: variation.metcon?.title || "Metcon",
          rawItem: metconScheme,
          metconType: mType,
        });
        loggableMetcon.forEach((it) => {
          out.push({
            kind: "metconMove",
            blockLabel: "METCON",
            blockKey: "metcon",
            storeKey: keyFor(it.storeName),
            exName: cleanExerciseLabel(it.raw) || it.storeName,
            rawItem: it.raw,
            metconType: mType,
          });
        });
      }
    }

    // ACCESORIOS
    (variation.accessories?.items || []).forEach((raw) => {
      const storeName = getCleanExerciseName(raw);
      if (!storeName) return;
      out.push({
        kind: "strength", // same fields as strength
        blockLabel: "ACCESORIOS",
        blockKey: "accessories",
        storeKey: keyFor(storeName),
        exName: cleanExerciseLabel(raw) || storeName,
        rawItem: raw,
      });
    });

    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variation, dayId]);

  // Map blockKey → index of its metconScore step (to share rondas/tiempo)
  const scoreIndexByBlock = useMemo(() => {
    const m: Record<string, number> = {};
    steps.forEach((s, i) => {
      if (s.kind === "metconScore") m[s.blockKey] = i;
    });
    return m;
  }, [steps]);

  // ── Pre-fill from existing logs ──────────────────────────────────────────
  const [data, setData] = useState<Record<number, StepData>>(() => {
    const init: Record<number, StepData> = {};
    steps.forEach((s, idx) => {
      const base = emptyData(s.kind === "cardio" ? "N/D" : "2");
      if (s.storeKey) {
        try {
          const raw = localStorage.getItem(s.storeKey);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) {
              const last = arr[arr.length - 1];
              base.weight = String(last.weight ?? "")
                .replace(/\s*kg$/i, "")
                .replace("P. Corporal", "");
              base.reps = String(last.reps ?? "").replace(/\s*reps$/i, "");
              base.rpe = String(last.rpe ?? "8");
              base.rir = String(last.rir ?? base.rir);
              base.tiempo = String(last.tiempo ?? "");
              base.rondas = String(last.rondas ?? "");
              base.repsExtra = String(last.repsExtra ?? "");
            }
          }
        } catch {
          /* ignore */
        }
      }
      init[idx] = base;
    });
    return init;
  });

  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);

  const total = steps.length;
  const step = steps[current];
  const cur = data[current] || emptyData();

  const updateField = (field: keyof StepData, value: string) => {
    setData((prev) => {
      const next = { ...prev, [current]: { ...prev[current], [field]: value } };
      // Link RPE/RIR for strength (RPE = 10 - RIR)
      if (step.kind === "strength") {
        if (field === "rpe") {
          const n = parseFloat(value);
          if (!isNaN(n)) {
            const rir = 10 - n;
            next[current].rir = rir >= 0 && rir <= 6 ? String(rir) : "N/D";
          }
        } else if (field === "rir") {
          const n = parseFloat(value);
          if (!isNaN(n)) {
            const rpe = 10 - n;
            if (rpe >= 1 && rpe <= 10) next[current].rpe = String(rpe);
          }
        }
      }
      return next;
    });
  };

  // Persist a single step to localStorage (returns true if it wrote a row)
  const persistStep = (idx: number) => {
    const s = steps[idx];
    const d = data[idx];
    if (!s || !d || !s.storeKey) return false; // metconScore has no own row

    // Pull shared metcon score (rondas / tiempo) for metcon movements
    let rondas = d.rondas;
    let repsExtra = d.repsExtra;
    let tiempo = d.tiempo;
    if (s.kind === "metconMove") {
      const scoreIdx = scoreIndexByBlock[s.blockKey];
      const score = scoreIdx != null ? data[scoreIdx] : undefined;
      if (score) {
        rondas = score.rondas;
        repsExtra = score.repsExtra;
        tiempo = score.tiempo;
      }
    }

    const hasWeight = d.weight.trim() !== "";
    const hasReps = d.reps.trim() !== "";
    const hasTime = (tiempo || "").trim() !== "";
    const hasRounds = (rondas || "").trim() !== "";

    // Decide whether there is anything worth saving for this row.
    // For metcon movements, hasTime/hasRounds come from the shared block score —
    // so a movement is saved only if the metcon was actually scored or it carries weight.
    const worth = hasWeight || hasReps || hasTime || hasRounds;
    if (!worth) return false;

    const entry: any = {
      id: crypto.randomUUID(),
      source: "debrief",
      block:
        s.blockLabel === "FUERZA"
          ? "Fuerza"
          : s.blockLabel === "ACCESORIOS"
            ? "Accesorios"
            : s.blockLabel === "CARDIO"
              ? "Cardio"
              : "Metcon",
      exName: s.exName,
      rpe: d.rpe || "8",
      rir: d.rir || (s.kind === "cardio" ? "N/D" : "2"),
      tiempo: tiempo || "",
      rondas: rondas || "",
      repsExtra: repsExtra || "",
      timestamp: Date.now(),
    };

    if (s.kind === "cardio") {
      entry.weight = ""; // never pollute Kg with time
      entry.reps = hasReps ? d.reps.trim() : ""; // distance / cals
    } else {
      entry.weight = hasWeight ? `${d.weight.trim()} kg` : "P. Corporal";
      entry.reps = hasReps ? `${d.reps.trim()} reps` : "";
    }

    // Merge instead of overwrite: keep the sets logged manually during the
    // session (ExerciseLogger) and replace only the previous debrief summary,
    // so re-running the wizard never duplicates and never destroys data.
    let existing: any[] = [];
    try {
      const raw = localStorage.getItem(s.storeKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) existing = parsed;
    } catch {
      /* ignore malformed storage */
    }
    const manualSets = existing.filter((e: any) => e?.source !== "debrief");
    localStorage.setItem(s.storeKey, JSON.stringify([...manualSets, entry]));
    return true;
  };

  const goNext = () => {
    persistStep(current);
    if (current < total - 1) setCurrent((c) => c + 1);
  };
  const goPrev = () => {
    persistStep(current);
    if (current > 0) setCurrent((c) => c - 1);
  };
  const skip = () => {
    if (current < total - 1) setCurrent((c) => c + 1);
    else finish();
  };
  const finish = () => {
    setSaving(true);
    steps.forEach((_, idx) => persistStep(idx));
    window.dispatchEvent(new Event("nexus_logs_updated"));
    setTimeout(() => onFinish(), 150);
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (total === 0) {
    return createPortal(
      <div className="fixed inset-0 bg-pure-black/95 flex items-center justify-center z-[300] p-4">
        <div className="border-4 border-electric-blue p-8 max-w-sm w-full bg-black text-center space-y-5">
          <h3 className="text-2xl font-brutalist text-white">SIN EJERCICIOS REGISTRABLES</h3>
          <p className="text-neutral-400 text-sm font-condensed">
            Este día no tiene ejercicios de fuerza, metcon o accesorios para registrar.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-electric-blue text-black font-brutalist py-2.5 tracking-wider hover:bg-blue-400 transition-all cursor-pointer"
          >
            CERRAR
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const accent = BLOCK_COLORS[step.blockLabel] || "#1f51ff";
  const progressPct = Math.round(((current + 1) / total) * 100);

  // Field renderer helpers
  const inputCls =
    "bg-[#16161c] text-white border border-[color:var(--color-line)] rounded px-3 h-11 focus:outline-none focus:border-electric-blue font-mono text-center text-base transition-colors";
  const labelCls =
    "text-[9px] font-extrabold uppercase tracking-widest text-neutral-400";

  const renderFields = () => {
    if (step.kind === "strength") {
      return (
        <div className="px-5 py-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>PESO (KG)</label>
            <input type="text" inputMode="decimal" placeholder="80" value={cur.weight}
              onChange={(e) => updateField("weight", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>REPS</label>
            <input type="text" inputMode="numeric" placeholder="6" value={cur.reps}
              onChange={(e) => updateField("reps", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>RPE (ESFUERZO)</label>
            <select value={cur.rpe} onChange={(e) => updateField("rpe", e.target.value)}
              className={inputCls + " appearance-none cursor-pointer"}>
              {["10","9.5","9","8.5","8","7.5","7","6.5","6","5","4"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>RIR (RESERVA)</label>
            <input type="text" inputMode="numeric" placeholder="2"
              value={cur.rir === "N/D" ? "" : cur.rir}
              onChange={(e) => updateField("rir", e.target.value || "N/D")} className={inputCls} />
          </div>
        </div>
      );
    }

    if (step.kind === "cardio") {
      return (
        <div className="px-5 py-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>TIEMPO (MM:SS)</label>
            <input type="text" inputMode="text" placeholder="35:00" value={cur.tiempo}
              onChange={(e) => updateField("tiempo", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>DISTANCIA / CALS</label>
            <input type="text" inputMode="text" placeholder="5000m / 300cal" value={cur.reps}
              onChange={(e) => updateField("reps", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className={labelCls}>RPE (ESFUERZO GLOBAL)</label>
            <select value={cur.rpe} onChange={(e) => updateField("rpe", e.target.value)}
              className={inputCls + " appearance-none cursor-pointer"}>
              {["10","9.5","9","8.5","8","7.5","7","6.5","6","5","4"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (step.kind === "metconScore") {
      const t = step.metconType;
      const hint =
        t === "forTime" ? "⏱️ FOR TIME — anotá el TIEMPO total que tardaste."
        : t === "amrap" ? "🔁 AMRAP — anotá RONDAS completas + reps extra."
        : t === "emom" || t === "intervals" ? "⏲️ INTERVALOS/EMOM — anotá RONDAS (y tiempo si aplica)."
        : "Anotá lo que aplique a este metcon.";
      return (
        <>
          <div className="px-5 -mt-1 mb-1">
            <p className="text-[11px] font-condensed font-bold text-neutral-300 bg-[color:var(--color-card-2)] border-l-2 px-3 py-2"
               style={{ borderColor: accent }}>
              {hint}
            </p>
          </div>
          <div className="px-5 py-2 grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>TIEMPO</label>
              <input type="text" placeholder="12:30" value={cur.tiempo}
                onChange={(e) => updateField("tiempo", e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>RONDAS</label>
              <input type="text" inputMode="numeric" placeholder="4" value={cur.rondas}
                onChange={(e) => updateField("rondas", e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>REPS EXTRA</label>
              <input type="text" inputMode="numeric" placeholder="12" value={cur.repsExtra}
                onChange={(e) => updateField("repsExtra", e.target.value)} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1 col-span-3">
              <label className={labelCls}>RPE DEL METCON (ESFUERZO GLOBAL)</label>
              <select value={cur.rpe} onChange={(e) => updateField("rpe", e.target.value)}
                className={inputCls + " appearance-none cursor-pointer"}>
                {["10","9.5","9","8.5","8","7.5","7","6.5","6","5","4"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      );
    }

    // metconMove
    return (
      <div className="px-5 py-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 col-span-2">
          <label className={labelCls}>PESO USADO (KG) — dejá vacío si es peso corporal</label>
          <input type="text" inputMode="decimal" placeholder="9" value={cur.weight}
            onChange={(e) => updateField("weight", e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <label className={labelCls}>RPE DE ESTE MOVIMIENTO (opcional)</label>
          <select value={cur.rpe} onChange={(e) => updateField("rpe", e.target.value)}
            className={inputCls + " appearance-none cursor-pointer"}>
            {["10","9.5","9","8.5","8","7.5","7","6.5","6","5","4"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const isLast = current === total - 1;

  return createPortal(
    <div className="fixed inset-0 bg-pure-black/95 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="border-2 border-[color:var(--color-line)] bg-[#0a0a0e] w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.9)]"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#0a0a0e] border-b border-[color:var(--color-line)] px-5 py-3.5 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[9px] font-mono tracking-[0.2em] text-electric-blue uppercase">
              DEBRIEF L4 · {dayName}
            </div>
            <div className="text-base font-brutalist text-white truncate">{dayTitle}</div>
          </div>
          <button onClick={onClose}
            className="shrink-0 text-neutral-500 hover:text-white transition-colors cursor-pointer p-1"
            title="Cerrar sin terminar">
            <X size={20} />
          </button>
        </div>

        {/* PROGRESS */}
        <div className="px-5 pt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
              Paso {current + 1} / {total}
            </span>
            <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-sm uppercase tracking-wider"
              style={{ backgroundColor: `${accent}22`, color: accent }}>
              {step.blockLabel}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[color:var(--color-card-2)] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: accent }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>
        </div>

        {/* TITLE */}
        <div className="px-5 pt-4 pb-1">
          <h3 className="text-2xl font-condensed font-black text-white leading-tight">
            {step.kind === "metconScore" ? "🎯 Resultado del Metcon" : step.exName}
          </h3>
        </div>

        {renderFields()}

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-[#0a0a0e] border-t border-[color:var(--color-line)] px-5 py-3.5 flex items-center gap-2">
          <button onClick={goPrev} disabled={current === 0}
            className="flex items-center gap-1 px-3 h-11 rounded font-mono text-xs font-bold uppercase tracking-wider border border-[color:var(--color-line)] text-neutral-300 hover:bg-[color:var(--color-card-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
            <ChevronLeft size={16} /> Atrás
          </button>
          <button onClick={skip}
            className="flex items-center gap-1 px-3 h-11 rounded font-mono text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-300 transition-all cursor-pointer"
            title="Saltar este paso">
            <SkipForward size={14} /> Saltar
          </button>
          <div className="flex-grow" />
          {!isLast ? (
            <button onClick={goNext}
              className="flex items-center gap-1.5 px-5 h-11 rounded font-mono text-xs font-black uppercase tracking-wider bg-electric-blue text-black hover:bg-blue-400 active:scale-95 transition-all cursor-pointer">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={finish} disabled={saving}
              className="flex items-center gap-1.5 px-5 h-11 rounded font-mono text-xs font-black uppercase tracking-wider bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 disabled:opacity-60 transition-all cursor-pointer">
              {saving ? <>Guardando…</> : <><FileText size={15} /> Finalizar y exportar CSV</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
