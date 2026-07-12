import React, { useMemo, useState, useEffect } from "react";
import { DayVariation, EnergySystem, BlockTimeDomain } from "../types/workout";
import {
  LoggedSet,
  MetconFormat,
  MetconResult,
  MovementScaling,
  MovementScalingType,
  Scaling,
  TrainingSession,
} from "../types/training";
import { resolveOrInfer } from "../data/exerciseCatalog";
import { energyForExercise } from "../lib/blockMeta";
import { cleanBlockTitle } from "../lib/titleClean";
import { InputMode, detectInputMode, prescribedReps, prescribedSets, prescribedSeconds, prescribedKg, prescribedPct } from "../lib/inputSignals";
import { getInputOverride, setInputOverride } from "../lib/inputOverrides";
import { sessionTotals, sessionLoadAU, estimate1RM } from "../lib/trainingEngine";
import { saveSession, bridgeLegacyLogs, loadSessions } from "../lib/sessionStore";
import { getBodyweightKg, setBodyweightKg } from "../lib/profileMetrics";
import { getCleanExerciseName, isCueOrNote } from "../lib/historyUtils";
import { resolveBlockItems } from "../lib/blockGrouping";
import { parseSplits } from "../lib/tightGrouping";
import { expandMetconWork } from "../lib/metconWork";
import { getSuggestedRpe } from "../lib/biomechanicsAdvisor";
import { getOneRepMaxes, estimateOneRepMaxesFromLogs, resolveWmRange, wmRangeLabel, setOneRepMax } from "../lib/workingMax";
import {
  ModalSheet,
  NexusButton,
  Field,
  Input,
  ProgressBar,
  RpeDial,
  Pill,
  TXT,
} from "./ui/primitives";

interface Station {
  key: string;
  /** Lift name used to classify + log against (e.g. "Heavy Deadlift"). */
  name: string;
  /** What the step shows — tier text for "-> " sub-lines, else the name. */
  label: string;
  exerciseId: string;
  scheme: string;
  blockLabel: string;
  /** raw prescription text of the item (carries "5x5", "8 reps", "20 seg"…) */
  rawText: string;
  mode: InputMode;
  // Stimulus lineage snapshot (from the source ProgramBlock), for analytics.
  blockSlot?: string;
  blockTitle?: string;
  energySystem?: EnergySystem;
  timeDomain?: BlockTimeDomain;
  blockCapSec?: number;
  /** per-exercise energy fallback when the block has no energySystem */
  exEnergy?: EnergySystem;
}
interface DraftSet {
  weightKg: number | null;
  addedLoadKg: number | null;
  reps: number | null;
  calories: number | null;
  distanceM: number | null;
  timeSec: number | null;
  rpe: number | null;
  /** auto-created from the prescription ("pro default"), pending confirmation */
  prescribed?: boolean;
}

interface SessionWizardProps {
  open: boolean;
  onClose: () => void;
  dayId: string;
  dayName: string;
  dayTitle: string;
  variation: DayVariation;
  bodyweightKg?: number;
  /** When the day already has a sealed session, preload it so the wizard edits it. */
  initialSession?: TrainingSession | null;
  onSealed?: (session: TrainingSession) => void;
}

const toNum = (s: string): number | null => {
  const m = String(s ?? "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
const mmssToSec = (s: string): number | null => {
  const v = String(s ?? "").trim();
  const mm = v.match(/^(\d+):(\d{1,2})$/);
  if (mm) return parseInt(mm[1], 10) * 60 + parseInt(mm[2], 10);
  return toNum(v);
};
// Auto-detect the metcon protocol from its scheme/title. Only the unambiguous
// scored formats (EMOM, AMRAP/Tabata) are special-cased; everything else with a
// metcon shape — rounds-for-time, intervals, chippers, caps, descending ladders —
// scores against the clock, so "for time" is the default. Never assume AMRAP.
const guessFormat = (scheme: string): MetconFormat => {
  const s = (scheme || "").toUpperCase();
  if (/\bEMOM\b|E\d+MOM|\bEVERY\b|\bCADA\s+\d/.test(s)) return "emom";
  if (/\bAMRAP\b|\bTABATA\b|M[AÁ]X(?:IMO)?\s+(?:RONDAS|REPS|REPETICIONES)/.test(s))
    return "amrap";
  return "fortime";
};
const cleanItems = (items: string[]): string[] =>
  items
    .filter((i) => !isCueOrNote(i)) // drop coaching cues — they aren't movements
    .map((i) => getCleanExerciseName(i))
    .filter((n) => n && n.length > 1);

// Items that aren't trainable movements — they shouldn't become loggable
// stations asking for weight/reps/RPE (sauna, baths, mobility, rest, etc.).
const RECOVERY_RE =
  /(sauna|tina|jacuzzi|hidromasaje|ba[ñn]o|masaje|descanso|recuperaci|movilidad|estiramiento|elonga|foam|rolling|sue[ñn]o|hidrataci|respiraci|meditaci|siesta|dieta|nutrici|relax|paseo|charla|social|libre)/i;
const isRecovery = (name: string) => RECOVERY_RE.test(name);

// The athlete can correct what a station asks for ("this logs calories, not reps").
const KIND_OPTIONS: { mode: InputMode; label: string }[] = [
  { mode: "loaded", label: "Peso" },
  { mode: "loadedBodyweight", label: "Peso+BW" },
  { mode: "cardioCal", label: "Calorías" },
  { mode: "cardioDist", label: "Distancia" },
  { mode: "bodyweight", label: "Reps" },
  { mode: "timed", label: "Tiempo" },
];


const fmtTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// Time-window of a skill/EMOM scheme ("15 MIN RELOJ", "10 Minutos", "EMOM 12"),
// in seconds — used to pre-register a duration default when there are no reps.
const schemeWindowSec = (scheme: string): number | null => {
  const m = String(scheme ?? "").toLowerCase().match(/(\d+)\s*min/);
  return m ? Number(m[1]) * 60 : null;
};

export default function SessionWizard({
  open,
  onClose,
  dayId,
  dayName,
  dayTitle,
  variation,
  bodyweightKg = 75,
  initialSession,
  onSealed,
}: SessionWizardProps) {
  // Bumped when the athlete corrects a station's data type, so the station list
  // (which reads getInputOverride) recomputes. Declared before the stations memo.
  const [inputOverrideVersion, setInputOverrideVersion] = useState(0);

  // Walk the day in its authored block order and emit both the loggable stations
  // and the ordered step keys, with a single "metcon" marker placed exactly where
  // the metcon block sits — so the wizard mirrors the board: warmup (skipped) →
  // skill/strength → metcon → accessories/grunt, instead of forcing metcon last.
  const { list: stations, order: stepOrder } = useMemo(() => {
    const out: Station[] = [];
    const order: string[] = [];
    let metconPlaced = false;
    const placeMetcon = () => {
      if (!metconPlaced) {
        order.push("metcon");
        metconPlaced = true;
      }
    };
    const addBlock = (
      items: string[],
      scheme: string,
      label: string,
      meta?: {
        slot?: string;
        title?: string;
        energySystem?: EnergySystem;
        timeDomain?: BlockTimeDomain;
        capSec?: number;
      },
    ) => {
      // Header lines ("X - Levantamiento Principal") render as titles, not
      // stations; their "-> " tiers become stations that inherit the lift name
      // so they classify (and all log under one lift), while the step shows the
      // tier text. Plain movements are unchanged.
      resolveBlockItems(items).forEach((entry, i) => {
        if (entry.role === "cue" || entry.role === "header") return;
        const name = entry.name;
        if (!name || name.length <= 1 || isRecovery(name)) return;
        const ex = resolveOrInfer(name);
        const tier = entry.text.replace(/<[^>]*>/g, "").replace(/^\s*(?:-+>|→|⟶|⇒|»)\s*/u, "").trim();
        const display = entry.role === "subline" ? `${name} · ${tier}` : name;
        const key = `${label}-${i}-${name}`.replace(/\s+/g, "_");
        out.push({
          key,
          name,
          label: display,
          exerciseId: ex.id,
          scheme,
          blockLabel: label,
          rawText: tier,
          mode: getInputOverride(name) ?? detectInputMode(entry.text, ex),
          blockSlot: meta?.slot,
          blockTitle: meta?.title ?? label,
          energySystem: meta?.energySystem,
          timeDomain: meta?.timeDomain,
          blockCapSec: meta?.capSec,
          exEnergy: energyForExercise(ex),
        });
        order.push(key);
      });
    };
    if (variation.blocks?.length) {
      for (const b of variation.blocks) {
        if (b.bucket === "warmup") continue; // warmup isn't logged
        if (b.bucket === "metcon") {
          placeMetcon(); // metcon logs as the protocol step, in its real position
          continue;
        }
        const title = b.title?.replace(/^\d+\.\s*/, "") || b.key;
        addBlock(b.items, b.scheme, title, {
          slot: b.key || b.bucket,
          title,
          energySystem: b.energySystem,
          timeDomain: b.timeDomain,
          capSec: b.capSec,
        });
      }
    } else {
      // Legacy four-lane day: strength → metcon → accessories.
      addBlock(variation.strength.items, variation.strength.scheme, "Fuerza", {
        slot: "strength",
        title: "Fuerza",
      });
      placeMetcon();
      addBlock(variation.accessories.items, variation.accessories.scheme, "Accesorios", {
        slot: "accessories",
        title: "Accesorios",
      });
    }
    if (!metconPlaced) order.push("metcon"); // fallback metcon (if any) goes last
    return { list: out, order };
  }, [variation, inputOverrideVersion]);

  // Athlete 1RM per lift (explicit from PERFIL & BIO, falling back to the best
  // estimate from logged sets) — powers the L4 suggested-RPE on loaded stations.
  const oneRepMaxes = useMemo(
    () => ({ ...estimateOneRepMaxesFromLogs(), ...getOneRepMaxes() }),
    [],
  );

  // Last logged set per lift (most recent session) — powers the "Última: …" chip
  // so a repeated day prefills from what the athlete did last time.
  const lastByExercise = useMemo(() => {
    const out: Record<string, { weightKg: number | null; reps: number | null; date: string }> = {};
    for (const s of loadSessions()) {
      for (const set of s.sets) {
        const id = set.exerciseId;
        if (!id) continue;
        const prev = out[id];
        if (!prev || s.date >= prev.date) out[id] = { weightKg: set.weightKg ?? null, reps: set.reps ?? null, date: s.date };
      }
    }
    return out;
  }, []);

  // First metcon-bucket block — source of the prescribed-stimulus snapshot
  // attached to the logged metcon result (energy system / time domain).
  const metconBlock = useMemo(
    () => variation.blocks?.find((b) => b.bucket === "metcon") ?? null,
    [variation],
  );

  // Metcon protocol step: every metcon-bucket block's movements (flexible) or the
  // merged metcon lane (legacy).
  // Items CRUDOS del metcon (conservan cantidades: "15 Cal Row (9kg)") — la
  // fuente de la expansión prescripción × rondas al sellar.
  const rawMetconItems = useMemo(() => {
    if (variation.blocks?.length) {
      const items = variation.blocks.filter((b) => b.bucket === "metcon").flatMap((b) => b.items);
      return items.length ? items : variation.metcon.items;
    }
    return variation.metcon.items;
  }, [variation]);

  const metconMovements = useMemo(() => {
    if (variation.blocks?.length) {
      const items = variation.blocks.filter((b) => b.bucket === "metcon").flatMap((b) => b.items);
      return cleanItems(items.length ? items : variation.metcon.items);
    }
    return cleanItems(variation.metcon.items);
  }, [variation]);
  const hasMetcon = metconMovements.length > 0;

  // Combined metcon text (title + scheme of every metcon block, or the legacy
  // lane) so protocol auto-detection sees "4 RONDAS / INTERVALOS" etc., not just
  // the bare scheme field.
  const metconSchemeText = useMemo(() => {
    if (variation.blocks?.length) {
      const mb = variation.blocks.filter((b) => b.bucket === "metcon");
      if (mb.length) return mb.map((b) => `${b.title || ""} ${b.scheme || ""}`).join(" ");
    }
    return variation.metcon.scheme || "";
  }, [variation]);

  const steps = useMemo(() => {
    // stepOrder already interleaves the "metcon" marker in block order; drop it
    // when there's nothing to log for the metcon.
    const body = stepOrder.filter((k) => k !== "metcon" || hasMetcon);
    return ["intro", ...body, "seal"];
  }, [stepOrder, hasMetcon]);

  const [stepIdx, setStepIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, DraftSet[]>>({});
  const [inW, setInW] = useState("");
  const [inR, setInR] = useState("");
  const [inCal, setInCal] = useState("");
  const [inDist, setInDist] = useState("");
  const [inTime, setInTime] = useState("");
  const [inRpe, setInRpe] = useState<number | null>(8);
  const [showKind, setShowKind] = useState(false); // "tipo de dato" reclassify toggle

  // metcon
  const [mFormat, setMFormat] = useState<MetconFormat>(() => guessFormat(metconSchemeText));
  const [mFinished, setMFinished] = useState(true);
  const [mTime, setMTime] = useState("");
  const [mRounds, setMRounds] = useState("");
  const [mReps, setMReps] = useState("");
  const [mLastMovement, setMLastMovement] = useState(""); // AMRAP partial round
  const [mRepsAtCap, setMRepsAtCap] = useState("");
  const [mScaling, setMScaling] = useState<Scaling>("rx");
  const [mNotes, setMNotes] = useState("");
  const [mMoveScaling, setMMoveScaling] = useState<Record<string, MovementScalingType>>({});
  const [mSplits, setMSplits] = useState("");

  // seal
  const [srpe, setSrpe] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState("");
  const [bw, setBw] = useState<number>(() => getBodyweightKg());
  const [sealed, setSealed] = useState<TrainingSession | null>(null);
  // Backfill: which calendar date this session is logged for (defaults to today).
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));

  const stepKey = steps[stepIdx];
  const loggedCount = stations.filter((st) => (drafts[st.key] || []).length > 0).length;
  const activeStation = stations.find((s) => s.key === stepKey) || null;
  const progress = steps.length > 1 ? stepIdx / (steps.length - 1) : 0;

  // Prescribed defaults so the athlete confirms instead of typing: reps from the
  // scheme/tier text, weight from % WM, then % 1RM, then an explicit kg, then the
  // last logged set.
  const suggestedFor = (st: Station): { w: string; r: string } => {
    // The reps live in the raw item text ("5x5 Pike Push-ups", "8 Reps por
    // pierna") — the clean name/scheme often don't carry them.
    const reps =
      prescribedReps(st.rawText) ?? prescribedReps(st.label) ?? prescribedReps(st.scheme) ?? lastByExercise[st.exerciseId]?.reps ?? null;
    let w = "";
    if (st.mode === "loaded" || st.mode === "loadedBodyweight") {
      const wm = resolveWmRange(st.scheme, st.name);
      const orm = oneRepMaxes[st.exerciseId];
      const pct = prescribedPct(st.scheme);
      const kg = prescribedKg(st.rawText) ?? prescribedKg(st.label) ?? prescribedKg(st.scheme);
      const round = (n: number) => Math.round(n * 2) / 2;
      if (wm) w = String(round((wm.lowKg + wm.highKg) / 2));
      else if (kg != null) w = String(kg);
      else if (pct && orm) w = String(round((orm * ((pct.lo + pct.hi) / 2)) / 100));
      else if (lastByExercise[st.exerciseId]?.weightKg != null) w = String(lastByExercise[st.exerciseId]!.weightKg);
    }
    return { w, r: reps != null ? String(reps) : "" };
  };

  // Prescribed sets pre-registered by default ("pro default"): build the draft
  // row(s) the prescription implies so the athlete confirms/edits instead of
  // typing. Returns [] when nothing is parseable (skill/EMOM with no rep count
  // or cardio) — we never fabricate reps or load.
  const prescribedDraftsFor = (st: Station): DraftSet[] => {
    const reps = prescribedReps(st.rawText) ?? prescribedReps(st.label) ?? prescribedReps(st.scheme);
    const setCount = Math.min(
      10,
      Math.max(1, prescribedSets(st.rawText) ?? prescribedSets(st.label) ?? prescribedSets(st.scheme) ?? 1),
    );
    const secs = prescribedSeconds(st.rawText);
    const { w } = suggestedFor(st);
    const weight = toNum(w);
    const max1RM = oneRepMaxes[st.exerciseId];
    const rpeSug =
      (st.mode === "loaded" || st.mode === "loadedBodyweight") && w && max1RM
        ? getSuggestedRpe(w, max1RM)
        : null;
    const rpe = rpeSug ? Math.max(6, Math.min(10, Math.round(parseFloat(rpeSug.rpe)))) : 8;

    const windowSec = schemeWindowSec(st.scheme);
    const base: DraftSet = {
      weightKg: null, addedLoadKg: null, reps: null, calories: null,
      distanceM: null, timeSec: null, rpe, prescribed: true,
    };
    switch (st.mode) {
      case "loaded": base.weightKg = weight; base.reps = reps; break;
      case "loadedBodyweight": base.addedLoadKg = weight; base.reps = reps; break;
      case "bodyweight": base.reps = reps; break;
      case "timed": base.reps = reps; break;
      default: return []; // cardio cal/dist/time aren't reliably prescribed per-set
    }
    // No reps but a timed prescription: per-set seconds ("3x20 segundos") take
    // precedence over the whole-block window ("15 MIN RELOJ"), which is the last
    // resort for a repless skill (chosen behavior).
    if (base.reps == null && secs != null) base.timeSec = secs;
    else if (base.reps == null && windowSec != null) base.timeSec = windowSec;

    const has =
      base.weightKg != null || base.addedLoadKg != null ||
      base.reps != null || base.timeSec != null;
    if (!has) return [];
    // Per-set seconds repeat across N sets; a whole-block window is one block.
    const n =
      base.reps != null || secs != null ? setCount
      : base.timeSec != null ? 1
      : setCount;
    return Array.from({ length: n }, () => ({ ...base }));
  };

  // On arriving at a station, pre-register its prescribed set(s) by default so
  // the athlete confirms/edits instead of typing (and the work is logged even on
  // a tap-through). Skip stations that already have drafts (revisit / edit mode).
  // When nothing is parseable, fall back to prefilling the inputs for manual log.
  useEffect(() => {
    if (!activeStation) return;
    if (drafts[activeStation.key]?.length) {
      setInW("");
      setInR("");
      return;
    }
    const pre = prescribedDraftsFor(activeStation);
    if (pre.length) {
      setDrafts((d) => ({ ...d, [activeStation.key]: pre }));
      setInW("");
      setInR("");
    } else {
      const s = suggestedFor(activeStation);
      setInW(s.w);
      setInR(s.r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStation?.key]);

  // On open: reset to a clean run, OR preload an existing session to EDIT it.
  // (The wizard instance persists across opens, so without this it would keep
  // stale drafts / the last reward screen.)
  useEffect(() => {
    if (!open) return;
    setStepIdx(0);
    setSealed(null);
    if (initialSession && initialSession.sets.length) {
      // Distribute the saved sets across stations sharing an exerciseId (e.g. the
      // two deadlift tiers each get half), so the athlete can fix them in place.
      const queues: Record<string, LoggedSet[]> = {};
      for (const s of initialSession.sets) (queues[s.exerciseId] ||= []).push(s);
      const remaining: Record<string, number> = {};
      for (const st of stations) remaining[st.exerciseId] = (remaining[st.exerciseId] || 0) + 1;
      const nd: Record<string, DraftSet[]> = {};
      for (const st of stations) {
        const q = queues[st.exerciseId];
        const n = remaining[st.exerciseId] || 1;
        if (q && q.length) {
          nd[st.key] = q.splice(0, Math.ceil(q.length / n)).map((s) => ({
            weightKg: s.weightKg ?? null, addedLoadKg: s.addedLoadKg ?? null, reps: s.reps ?? null,
            calories: s.calories ?? null, distanceM: s.distanceM ?? null, timeSec: s.timeSec ?? null, rpe: s.rpe ?? null,
          }));
        }
        remaining[st.exerciseId] = n - 1;
      }
      setDrafts(nd);
      if (initialSession.durationMin != null) setDurationMin(String(initialSession.durationMin));
      if (initialSession.sessionRpe != null) setSrpe(initialSession.sessionRpe);
      if (initialSession.date) setLogDate(initialSession.date);
      const m = initialSession.metcon;
      if (m) {
        setMFormat(m.format);
        if (m.finished != null) setMFinished(m.finished);
        if (m.timeSec != null) setMTime(fmtTime(m.timeSec));
        if (m.repsAtCap != null) setMRepsAtCap(String(m.repsAtCap));
        if (m.rounds != null) setMRounds(String(m.rounds));
        if (m.reps != null) setMReps(String(m.reps));
        if (m.scaling) setMScaling(m.scaling);
      }
    } else {
      setDrafts({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Prefill the metcon result from the prescription on NEW sessions ("pro
  // default"): For Time → the time field defaults to the prescribed cap; an
  // explicit "N RONDAS" → rounds. Guards (!initialSession, !field) keep the
  // saved-session preload and any value the athlete already entered.
  useEffect(() => {
    if (!open || initialSession || !hasMetcon) return;
    if (mFormat === "fortime" && metconBlock?.capSec && !mTime) {
      setMTime(fmtTime(metconBlock.capSec));
    }
    const rm = (metconSchemeText || "").match(/(\d+)\s*rondas?/i);
    if (rm && Number(rm[1]) > 1 && !mRounds) setMRounds(rm[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mFormat, metconBlock?.capSec]);

  const resetInputs = () => {
    setInW("");
    setInR("");
    setInCal("");
    setInDist("");
    setInTime("");
    setInRpe(8);
  };
  const go = (delta: number) => {
    setStepIdx((i) => Math.max(0, Math.min(steps.length - 1, i + delta)));
    resetInputs();
  };

  const addSet = () => {
    if (!activeStation) return;
    const reps = toNum(inR);
    const draft: DraftSet = {
      weightKg: null, addedLoadKg: null, reps: null, calories: null,
      distanceM: null, timeSec: null, rpe: inRpe,
    };
    switch (activeStation.mode) {
      case "loaded": draft.weightKg = toNum(inW); draft.reps = reps; break;
      case "loadedBodyweight": draft.addedLoadKg = toNum(inW); draft.reps = reps; break;
      case "bodyweight": draft.reps = reps; break;
      case "cardioCal": draft.calories = toNum(inCal); draft.timeSec = mmssToSec(inTime); break;
      case "cardioDist": draft.distanceM = toNum(inDist); draft.timeSec = mmssToSec(inTime); break;
      default: draft.reps = reps; draft.timeSec = mmssToSec(inTime); break; // timed
    }
    const has =
      draft.weightKg != null || draft.addedLoadKg != null || draft.reps != null ||
      draft.calories != null || draft.distanceM != null || draft.timeSec != null;
    if (!has) return;
    setDrafts((prev) => ({
      ...prev,
      [activeStation.key]: [...(prev[activeStation.key] || []), draft],
    }));
    // Keep weight + reps so straight sets are one tap; cardio intervals vary, so
    // clear those.
    setInCal("");
    setInDist("");
    setInTime("");
  };
  const removeSet = (key: string, idx: number) => {
    setDrafts((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  };

  const buildSession = (): TrainingSession => {
    const now = Date.now();
    const sets: LoggedSet[] = [];
    stations.forEach((st) => {
      // Skipped stations still log the prescribed work by default ("pro default").
      const rows = drafts[st.key]?.length ? drafts[st.key] : prescribedDraftsFor(st);
      rows.forEach((d) => {
        sets.push({
          id: `set_${now}_${Math.random().toString(36).slice(2, 8)}`,
          exerciseId: st.exerciseId,
          exerciseName: st.name,
          weightKg: d.weightKg,
          isBodyweight: d.weightKg == null && (st.mode === "bodyweight" || st.mode === "loadedBodyweight"),
          addedLoadKg: d.addedLoadKg,
          reps: d.reps,
          distanceM: d.distanceM,
          calories: d.calories,
          timeSec: d.timeSec,
          rpe: d.rpe,
          rir: d.rpe != null ? Math.max(0, 10 - d.rpe) : null,
          tempo: null,
          setType: "working",
          ts: now,
          blockSlot: st.blockSlot,
          blockTitle: st.blockTitle,
          energySystem: st.energySystem ?? st.exEnergy,
          timeDomain: st.timeDomain,
          blockCapSec: st.blockCapSec,
        });
      });
    });

    let metcon: MetconResult | undefined;
    if (hasMetcon) {
      metcon = {
        format: mFormat,
        scaling: mScaling,
        estimateApprox: mScaling !== "rx" ? true : undefined,
        scaledNotes: mNotes.trim() || undefined,
        energySystem: metconBlock?.energySystem,
        timeDomain: metconBlock?.timeDomain,
      };
      if (mScaling !== "rx") {
        const ms: Record<string, MovementScaling> = {};
        Object.entries(mMoveScaling).forEach(([name, type]) => {
          ms[resolveOrInfer(name).id] = { type };
        });
        if (Object.keys(ms).length) metcon.movementScaling = ms;
      }
      if (mFormat === "fortime") {
        if (mFinished) metcon.timeSec = mmssToSec(mTime) ?? undefined;
        else metcon.repsAtCap = toNum(mRepsAtCap) ?? undefined;
        metcon.finished = mFinished;
      } else if (mFormat === "amrap") {
        metcon.rounds = toNum(mRounds) ?? undefined;
        metcon.reps = toNum(mReps) ?? undefined;
        // Pin the partial round to where it stopped in execution order.
        if (mLastMovement && metconMovements.length > 1)
          metcon.partialRoundMovement = mLastMovement;
      } else if (mFormat === "emom" || mFormat === "max") {
        metcon.reps = toNum(mReps) ?? undefined;
      }
      const splits = parseSplits(mSplits);
      if (splits.length >= 2) metcon.splits = splits;

      // Prescripción × rondas reales → sets con números REALES por movimiento
      // (15 cal Row × 5 rondas = 75 cal). Con esto el cardio del metcon entra
      // al trabajo/balance/hopper con datos, no estimaciones.
      expandMetconWork(rawMetconItems, metconSchemeText, metcon).forEach((q) => {
        const ex = resolveOrInfer(q.name);
        sets.push({
          id: `set_${now}_${Math.random().toString(36).slice(2, 8)}`,
          exerciseId: ex.id,
          exerciseName: q.name,
          weightKg: q.weightKg,
          isBodyweight: q.weightKg == null,
          addedLoadKg: null,
          reps: q.reps,
          distanceM: q.distanceM,
          calories: q.calories,
          timeSec: null,
          rpe: null,
          rir: null,
          tempo: null,
          setType: "working",
          ts: now,
          blockSlot: metconBlock?.key ?? "metcon",
          blockTitle: cleanBlockTitle(metconBlock?.title || "") || "Metcon",
          energySystem: metcon.energySystem ?? energyForExercise(ex),
          timeDomain: metcon.timeDomain,
          blockCapSec: metconBlock?.capSec,
        });
      });
    }

    return {
      id: `sess_${dayId}_${now}`,
      date: logDate,
      dayId,
      variationTab: variation.tabName,
      completed: true,
      durationMin: toNum(durationMin),
      sessionRpe: srpe,
      metcon,
      sets,
    };
  };

  // Switching metcon format clears the AMRAP-only partial-round movement so it
  // can't leak a stale value into a non-AMRAP result.
  const changeFormat = (f: MetconFormat) => {
    setMFormat(f);
    if (f !== "amrap") setMLastMovement("");
  };

  const seal = () => {
    // For Time + hit the cap needs the reps done at the cap, or work/power is wrong.
    if (hasMetcon && mFormat === "fortime" && !mFinished && toNum(mRepsAtCap) == null) {
      window.dispatchEvent(
        new CustomEvent("nexus_toast", {
          detail: { message: "Especificá las reps completadas al cap antes de sellar.", kind: "error", durationMs: 5000 },
        }),
      );
      return;
    }
    if (bw > 0) setBodyweightKg(bw); // a blank field is 0 — don't overwrite the profile
    const session = buildSession();
    saveSession(session);
    bridgeLegacyLogs(session); // feed the legacy analytics/game/history consumers
    setSealed(session);
    onSealed?.(session);
  };

  const reward = useMemo(() => {
    if (!sealed) return null;
    // A blank bodyweight (0) would zero out every bodyweight movement's work.
    const t = sessionTotals(sealed, bw > 0 ? bw : bodyweightKg || 75);
    return { ...t, loadAU: sessionLoadAU(sealed) };
  }, [sealed, bw, bodyweightKg]);

  // 1RM PRs: the sealed session's best estimated 1RM per lift vs. the maxes known
  // BEFORE it (oneRepMaxes is memoized at mount, so it excludes this session).
  const prs = useMemo(() => {
    if (!sealed) return [];
    const best: Record<string, { name: string; e1rm: number }> = {};
    for (const set of sealed.sets) {
      const e = estimate1RM(set.weightKg ?? null, set.reps ?? null);
      if (e == null) continue;
      const cur = best[set.exerciseId];
      if (!cur || e > cur.e1rm) best[set.exerciseId] = { name: set.exerciseName, e1rm: e };
    }
    return Object.entries(best)
      .filter(([id, b]) => b.e1rm > (oneRepMaxes[id] ?? 0))
      .map(([id, b]) => ({ exerciseId: id, name: b.name, e1rm: Math.round(b.e1rm), prev: oneRepMaxes[id] ?? null }));
  }, [sealed, oneRepMaxes]);
  const [prsSaved, setPrsSaved] = useState(false);

  const renderBody = () => {
    if (sealed && reward) {
      return (
        <div className="space-y-4 text-center">
          <div className="text-xs font-mono tracking-widest text-electric-blue uppercase">
            Incursión sellada
          </div>
          <div className="text-3xl font-brutalist font-black text-white">
            +{200 + reward.totalSets * 10} XP
          </div>
          {prs.length > 0 && (
            <div className="border border-amber-400/50 bg-amber-950/30 rounded-sm p-3 text-left space-y-2">
              <div className="text-xs font-brutalist tracking-wider text-amber-300 uppercase">
                🏆 ¡Nuevo {prs.length > 1 ? "récords" : "récord"} de 1RM!
              </div>
              <ul className="space-y-1">
                {prs.map((p) => (
                  <li key={p.exerciseId} className="text-[12px] font-mono text-amber-200">
                    {p.name}: <strong className="text-white">≈ {p.e1rm} kg</strong>
                    {p.prev ? <span className="text-amber-400/70"> (antes {Math.round(p.prev)})</span> : null}
                  </li>
                ))}
              </ul>
              {!prsSaved ? (
                <NexusButton
                  variant="primary"
                  className="w-full"
                  onClick={() => { prs.forEach((p) => setOneRepMax(p.exerciseId, p.e1rm)); setPrsSaved(true); }}
                >
                  Actualizar mi 1RM
                </NexusButton>
              ) : (
                <p className="text-[11px] font-mono text-emerald-400 uppercase">✓ 1RM actualizado</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-black/60 rounded-sm p-3">
              <div className={TXT.label}>Trabajo</div>
              <div className="text-lg font-brutalist text-white">{Math.round(reward.totalWorkJ / 1000)} kJ</div>
            </div>
            <div className="bg-black/60 rounded-sm p-3">
              <div className={TXT.label}>Volumen</div>
              <div className="text-lg font-brutalist text-white">{reward.totalVolumeKg.toLocaleString()} kg</div>
            </div>
            <div className="bg-black/60 rounded-sm p-3">
              <div className={TXT.label}>Potencia</div>
              <div className="text-lg font-brutalist text-white">{reward.avgPowerW != null ? `${reward.avgPowerW} W` : "—"}</div>
            </div>
            <div className="bg-black/60 rounded-sm p-3">
              <div className={TXT.label}>Carga</div>
              <div className="text-lg font-brutalist text-white">{reward.loadAU != null ? `${reward.loadAU} AU` : "—"}</div>
            </div>
          </div>
          {reward.uncategorizedSets > 0 && (
            <p role="alert" className="text-xs font-mono text-amber-400 uppercase leading-snug">
              {reward.uncategorizedSets} serie(s) sin clasificar — usá «¿Otro tipo de dato?» en la estación para clasificar el movimiento
            </p>
          )}
        </div>
      );
    }

    if (stepKey === "intro") {
      const loggedCount = stations.filter((st) => (drafts[st.key] || []).length > 0).length;
      const isBackfill = logDate !== new Date().toISOString().slice(0, 10);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-mono tracking-widest text-electric-blue uppercase">Incursión</div>
            {loggedCount > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 uppercase">{loggedCount}/{stations.length} registradas</span>
            )}
          </div>
          <h2 className="text-2xl font-brutalist font-black text-white uppercase leading-tight">{dayTitle}</h2>
          <p className={TXT.sectionSubtitle}>{dayName}</p>
          <Field label="Fecha" hint={isBackfill ? "registro retroactivo" : "hoy"}>
            <Input type="date" value={logDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setLogDate(e.target.value)} />
          </Field>
          {/* Preview mirrors the real step order (metcon sits in its block slot). */}
          <div className="space-y-2">
            {steps.slice(1, -1).map((key) => {
              if (key === "metcon") {
                return (
                  <div key="metcon" className="flex items-center gap-2 text-[12px] font-mono text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                    <span>Metcon</span>
                    <span className="ml-auto text-neutral-400 truncate max-w-[50%]">{variation.metcon.scheme}</span>
                  </div>
                );
              }
              const s = stations.find((st) => st.key === key);
              if (!s) return null;
              const done = (drafts[s.key] || []).length > 0;
              return (
                <div key={s.key} className="flex items-center gap-2 text-[12px] font-mono text-neutral-300">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${done ? "bg-emerald-400" : "bg-electric-blue"}`} />
                  <span className="truncate">{done ? "✓ " : ""}{s.label}</span>
                  <span className="ml-auto text-neutral-400 truncate max-w-[40%]">{s.scheme}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeStation) {
      const logged = drafts[activeStation.key] || [];
      // L4 suggested RPE: weight as % of the lift's 1RM, snapped to the dial.
      const max1RM = oneRepMaxes[activeStation.exerciseId];
      const rpeSug =
        (activeStation.mode === "loaded" || activeStation.mode === "loadedBodyweight") && inW && max1RM
          ? getSuggestedRpe(inW, max1RM)
          : null;
      const snapRpe = rpeSug ? Math.max(6, Math.min(10, Math.round(parseFloat(rpeSug.rpe)))) : null;
      // Prescribed load from a "% WM" scheme + the athlete's 1RM (board shows the
      // same chip) — tap to drop the midpoint into the weight field.
      const wmRange =
        (activeStation.mode === "loaded" || activeStation.mode === "loadedBodyweight")
          ? resolveWmRange(activeStation.scheme, activeStation.name)
          : null;
      // Last time this lift was logged — offered as a one-tap prefill.
      const last = lastByExercise[activeStation.exerciseId];
      const lastChip =
        (activeStation.mode === "loaded" || activeStation.mode === "loadedBodyweight") &&
        last && (last.weightKg != null || last.reps != null)
          ? last
          : null;
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-mono tracking-widest text-electric-blue uppercase">{cleanBlockTitle(activeStation.blockLabel)}</div>
              <h2 className="text-xl font-brutalist font-black text-white uppercase leading-tight truncate">{activeStation.label}</h2>
            </div>
            {activeStation.scheme && <Pill tone="accent">{activeStation.scheme}</Pill>}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowKind((v) => !v)}
              aria-expanded={showKind}
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-label)] hover:text-white transition-colors cursor-pointer"
            >
              <span aria-hidden="true">⚙</span>
              <span>¿Otro tipo de dato?</span>
            </button>
            {showKind && (
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Tipo de dato">
                {KIND_OPTIONS.map((opt) => {
                  const sel = activeStation.mode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => {
                        setInputOverride(activeStation.name, opt.mode);
                        setInputOverrideVersion((v) => v + 1);
                        setShowKind(false);
                      }}
                      className={`px-2.5 py-2 rounded-sm border text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        sel
                          ? "bg-electric-blue text-black border-transparent"
                          : "bg-black/40 text-neutral-300 border-[color:var(--color-line)] hover:border-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {wmRange && (
            <button
              type="button"
              onClick={() => setInW(String(Math.round(((wmRange.lowKg + wmRange.highKg) / 2) * 2) / 2))}
              className="w-full flex items-center gap-2 text-left bg-electric-blue/10 border border-electric-blue/30 rounded-sm px-3 py-2 text-[11px] font-mono text-electric-blue hover:bg-electric-blue/20 transition-colors cursor-pointer"
            >
              <span className="font-bold">WM</span>
              <span>{wmRange.pctLow}{wmRange.pctHigh !== wmRange.pctLow ? `–${wmRange.pctHigh}` : ""}% · {wmRangeLabel(wmRange)}</span>
              <span className="ml-auto text-electric-blue/70">tocar para usar</span>
            </button>
          )}
          {lastChip && (
            <button
              type="button"
              onClick={() => {
                if (lastChip.weightKg != null) setInW(String(lastChip.weightKg));
                if (lastChip.reps != null) setInR(String(lastChip.reps));
              }}
              className="w-full flex items-center gap-2 text-left bg-[color:var(--color-card-2)] rounded-sm px-3 py-2 text-[11px] font-mono text-neutral-300 hover:bg-[color:var(--color-card-2)] transition-colors cursor-pointer"
            >
              <span className="font-bold text-neutral-400">Última</span>
              <span>{lastChip.weightKg != null ? `${lastChip.weightKg} kg` : ""}{lastChip.weightKg != null && lastChip.reps != null ? " × " : ""}{lastChip.reps != null ? `${lastChip.reps} reps` : ""}</span>
              <span className="ml-auto text-[color:var(--color-label)]">tocar para usar</span>
            </button>
          )}
          {activeStation.mode === "loaded" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso (kg)"><Input value={inW} onChange={(e) => setInW(e.target.value)} inputMode="decimal" placeholder="opcional" /></Field>
              <Field label="Reps"><Input value={inR} onChange={(e) => setInR(e.target.value)} inputMode="numeric" placeholder="reps" /></Field>
            </div>
          )}
          {activeStation.mode === "loadedBodyweight" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Reps"><Input value={inR} onChange={(e) => setInR(e.target.value)} inputMode="numeric" placeholder="reps" /></Field>
              <Field label="Lastre (kg)" hint="opcional"><Input value={inW} onChange={(e) => setInW(e.target.value)} inputMode="decimal" placeholder="con banda/peso" /></Field>
            </div>
          )}
          {activeStation.mode === "bodyweight" && (
            <Field label="Reps"><Input value={inR} onChange={(e) => setInR(e.target.value)} inputMode="numeric" placeholder="reps" /></Field>
          )}
          {activeStation.mode === "cardioCal" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Calorías"><Input value={inCal} onChange={(e) => setInCal(e.target.value)} inputMode="numeric" placeholder="cal" /></Field>
              <Field label="Tiempo (mm:ss)" hint="opcional"><Input value={inTime} onChange={(e) => setInTime(e.target.value)} placeholder="2:00" /></Field>
            </div>
          )}
          {activeStation.mode === "cardioDist" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Distancia (m)"><Input value={inDist} onChange={(e) => setInDist(e.target.value)} inputMode="numeric" placeholder="m" /></Field>
              <Field label="Tiempo (mm:ss)" hint="opcional"><Input value={inTime} onChange={(e) => setInTime(e.target.value)} placeholder="4:00" /></Field>
            </div>
          )}
          {activeStation.mode === "timed" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Reps" hint="opcional"><Input value={inR} onChange={(e) => setInR(e.target.value)} inputMode="numeric" placeholder="ej. 60" /></Field>
              <Field label="Tiempo (mm:ss)" hint="opcional"><Input value={inTime} onChange={(e) => setInTime(e.target.value)} placeholder="1:00" /></Field>
            </div>
          )}
          {rpeSug && snapRpe != null && (
            <button
              type="button"
              onClick={() => setInRpe(snapRpe)}
              className="w-full flex items-center gap-2 text-left bg-electric-blue/10 border border-electric-blue/30 rounded-sm px-3 py-2 text-[11px] font-mono text-electric-blue hover:bg-electric-blue/20 transition-colors cursor-pointer"
            >
              <span className="font-bold">L4</span>
              <span>{rpeSug.percentage}% de tu 1RM · RPE sugerido {snapRpe}</span>
              <span className="ml-auto text-electric-blue/70">tocar para usar</span>
            </button>
          )}
          <Field label="RPE" hint={inRpe != null ? `RIR ${Math.max(0, 10 - inRpe)}` : ""}>
            <RpeDial value={inRpe} onChange={setInRpe} />
          </Field>
          <NexusButton variant="primary" className="w-full" onClick={addSet}>
            + Registrar serie
          </NexusButton>
          {logged.length > 0 && (
            <div className="space-y-1.5">
              {logged.map((d, i) => {
                const desc =
                  d.calories != null ? `${d.calories} cal${d.timeSec != null ? ` · ${fmtTime(d.timeSec)}` : ""}`
                  : d.distanceM != null ? `${d.distanceM} m${d.timeSec != null ? ` · ${fmtTime(d.timeSec)}` : ""}`
                  : d.weightKg != null ? `${d.weightKg} kg × ${d.reps ?? "—"}`
                  : d.addedLoadKg != null ? `+${d.addedLoadKg} kg × ${d.reps ?? "—"}`
                  : d.reps != null ? `${d.reps} reps${d.timeSec != null ? ` · ${fmtTime(d.timeSec)}` : ""}`
                  : d.timeSec != null ? fmtTime(d.timeSec)
                  : "—";
                return (
                  <div key={i} className="flex items-center gap-2 bg-black/40 rounded-sm px-3 py-2 text-[12px] font-mono">
                    <span className="text-[color:var(--color-label)]">S{i + 1}</span>
                    <span className="text-white">{desc}</span>
                    {d.prescribed && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/80 border border-amber-500/30 px-1 rounded-sm">
                        prescrito
                      </span>
                    )}
                    {d.rpe != null && <span className="ml-auto text-electric-blue">RPE {d.rpe}</span>}
                    <button type="button" aria-label="Eliminar serie" onClick={() => removeSet(activeStation.key, i)} className="text-neutral-400 hover:text-rose-400 cursor-pointer"><span aria-hidden="true">✕</span></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (stepKey === "metcon") {
      const fmts: { v: MetconFormat; label: string }[] = [
        { v: "amrap", label: "AMRAP" },
        { v: "fortime", label: "For Time" },
        { v: "emom", label: "EMOM" },
        { v: "max", label: "Max" },
      ];
      return (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-orange-400 uppercase">Metcon — resultado</div>
            <h2 className="text-lg font-brutalist font-black text-white uppercase">{variation.metcon.scheme || "Resultado"}</h2>
          </div>
          <Field label="Protocolo">
            <div className="flex gap-1.5 flex-wrap">
              {fmts.map((f) => (
                <button key={f.v} type="button" onClick={() => changeFormat(f.v)}
                  className={`flex-1 min-w-[64px] py-2 rounded-sm border text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${mFormat === f.v ? "bg-orange-500 text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </Field>

          {mFormat === "amrap" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rondas completas"><Input value={mRounds} onChange={(e) => setMRounds(e.target.value)} inputMode="numeric" /></Field>
                <Field
                  label={metconMovements.length > 1 ? "+ Reps (de esa estación)" : "+ Reps"}
                  hint="ronda parcial"
                >
                  <Input value={mReps} onChange={(e) => setMReps(e.target.value)} inputMode="numeric" />
                </Field>
              </div>
              {/* Multi-movement AMRAP: pin where the partial round stopped, in
                  execution order, so "+ reps" is unambiguous. */}
              {metconMovements.length > 1 && (
                <Field label="Última estación alcanzada (orden de ejecución)" hint="opcional">
                  <div className="flex gap-1.5 flex-wrap">
                    {metconMovements.map((mv, i) => {
                      const sel = mLastMovement === mv;
                      return (
                        <button
                          key={mv}
                          type="button"
                          onClick={() => setMLastMovement(sel ? "" : mv)}
                          className={`text-[11px] font-mono px-2.5 py-1.5 rounded-sm border cursor-pointer transition-colors ${sel ? "bg-orange-500 text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}
                        >
                          <span className="text-[color:var(--color-label)] mr-1">{i + 1}.</span>
                          {mv}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </div>
          )}
          {mFormat === "fortime" && (
            <div className="space-y-3">
              <Field label="¿Terminó dentro del cap?">
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setMFinished(true)} className={`flex-1 py-2 rounded-sm border text-[11px] font-mono uppercase cursor-pointer ${mFinished ? "bg-electric-blue text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}>Sí</button>
                  <button type="button" onClick={() => setMFinished(false)} className={`flex-1 py-2 rounded-sm border text-[11px] font-mono uppercase cursor-pointer ${!mFinished ? "bg-amber-400 text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}>No — pegué el cap</button>
                </div>
              </Field>
              {mFinished ? (
                <Field
                  label="Tiempo final (mm:ss)"
                  hint={metconBlock?.capSec ? `cap ${fmtTime(metconBlock.capSec)}` : undefined}
                >
                  <Input value={mTime} onChange={(e) => setMTime(e.target.value)} placeholder="11:42" />
                </Field>
              ) : (
                <Field label="Reps completadas al cap"><Input value={mRepsAtCap} onChange={(e) => setMRepsAtCap(e.target.value)} inputMode="numeric" /></Field>
              )}
            </div>
          )}
          {(mFormat === "emom" || mFormat === "max") && (
            <Field label={mFormat === "max" ? "Máximo (reps/cal/m)" : "Reps totales"}><Input value={mReps} onChange={(e) => setMReps(e.target.value)} inputMode="numeric" /></Field>
          )}

          <Field label="Estándar">
            <div className="flex gap-1.5">
              {(["rx", "scaled", "mixed"] as Scaling[]).map((sc) => (
                <button key={sc} type="button" onClick={() => setMScaling(sc)}
                  className={`flex-1 py-2 rounded-sm border text-[11px] font-mono uppercase cursor-pointer ${mScaling === sc ? "bg-electric-blue text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}>
                  {sc === "rx" ? "RX" : sc === "scaled" ? "Escalado" : "Mixto"}
                </button>
              ))}
            </div>
          </Field>
          {mScaling !== "rx" && (
            <>
              <Field label="Qué cambió, por movimiento">
                <div className="space-y-2">
                  {metconMovements.map((mv) => (
                    <div key={mv} className="bg-black/40 rounded-sm p-2">
                      <div className="text-[12px] font-mono text-neutral-200 mb-1.5 truncate">{mv}</div>
                      <div className="flex gap-1.5 flex-wrap">
                        {([
                          ["rx", "RX"], ["load", "Carga↓"], ["reps", "Reps↓"], ["assist", "Banda"], ["sub", "Sust"],
                        ] as [MovementScalingType, string][]).map(([t, lbl]) => {
                          const sel = (mMoveScaling[mv] || "rx") === t;
                          return (
                            <button key={t} type="button"
                              onClick={() => setMMoveScaling((p) => ({ ...p, [mv]: t }))}
                              className={`text-[10.5px] font-mono px-2.5 py-1 rounded-sm border cursor-pointer ${sel ? "bg-electric-blue text-black border-transparent" : "bg-black/40 text-neutral-300 border-[color:var(--color-line)]"}`}>
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="Cómo varió (opcional · escalado dinámico)">
                <textarea value={mNotes} onChange={(e) => setMNotes(e.target.value)} rows={2}
                  className="w-full bg-black/60 rounded-sm p-2.5 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
                  placeholder="ej. rondas 1-3 RX, después pull-ups con banda" />
              </Field>
            </>
          )}

          <Field label="Tiempos por ronda (opcional · agrupación)" hint="para intervalos: te calcula el pacing (cap. 43)">
            <Input value={mSplits} onChange={(e) => setMSplits(e.target.value)} placeholder="1:52  1:54  1:53  1:55" />
          </Field>
        </div>
      );
    }

    if (stepKey === "seal") {
      return (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-electric-blue uppercase">Cierre</div>
            <h2 className="text-xl font-brutalist font-black text-white uppercase">Sellar sesión</h2>
          </div>
          <Field label="Esfuerzo global de la sesión (sRPE)">
            <RpeDial value={srpe} onChange={setSrpe} />
          </Field>
          <Field label="Duración (min)">
            <Input value={durationMin} onChange={(e) => setDurationMin(e.target.value)} inputMode="numeric" placeholder="48" />
          </Field>
          <Field label="Peso corporal (kg)" hint="alimenta el cálculo de trabajo">
            <Input value={bw ? String(bw) : ""} onChange={(e) => setBw(parseFloat(e.target.value) || 0)} inputMode="decimal" placeholder="75" />
          </Field>
        </div>
      );
    }

    return null;
  };

  const footer = sealed ? (
    <NexusButton variant="primary" className="w-full" onClick={onClose}>Cerrar</NexusButton>
  ) : (
    <div className="flex items-center gap-2">
      {stepIdx > 0 && <NexusButton variant="ghost" onClick={() => go(-1)}>Atrás</NexusButton>}
      {stepKey === "seal" ? (
        <NexusButton variant="primary" className="flex-1" onClick={seal}>⛨ Sellar incursión</NexusButton>
      ) : (
        <NexusButton variant="primary" className="flex-1" onClick={() => go(1)}>
          {stepKey === "intro" ? "Iniciar incursión" : "Siguiente"}
        </NexusButton>
      )}
    </div>
  );

  return (
    <ModalSheet open={open} onClose={onClose} fullScreen footer={footer}>
      {!sealed && (
        <div className="mb-4 space-y-1">
          <div className="flex justify-between gap-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
            <span>Paso {stepIdx + 1} / {steps.length}</span>
            {stations.length > 0 && (
              <span className="text-emerald-400">{loggedCount}/{stations.length} reg.</span>
            )}
            <span className="ml-auto truncate max-w-[40%]">
              {variation.tabName === "ESPECIAL" && <span className="text-signal-red">ESPECIAL · </span>}
              {dayName}
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}
      {renderBody()}
    </ModalSheet>
  );
}
