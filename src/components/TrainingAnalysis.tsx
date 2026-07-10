import React, { useEffect, useMemo, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { loadSessions } from "../lib/sessionStore";
import { listChapters, getActiveChapterId, getChapterSessionsRaw } from "../lib/chapterStore";
import { TrainingSession } from "../types/training";
import {
  sessionTotals,
  sessionLoadAU,
  estimate1RM,
  skillsRadar,
  modalMapCoverage,
  patternVolume,
  acwr,
  monotonyStrain,
  exerciseForSet,
  TimeDomain,
} from "../lib/trainingEngine";
import { Modality, GeneralSkill, Pattern, MODALITIES, PATTERNS } from "../types/training";
import { Database, EnergySystem, BlockTimeDomain } from "../types/workout";
import { programCoverage } from "../lib/programCoverage";
import { ENERGY_META, TIMEDOMAIN_LABEL } from "../lib/blockMeta";
import { classifyMovement } from "../data/exerciseCatalog";
import SubstitutionCard from "./SubstitutionCard";
import TightGroupingCard from "./TightGroupingCard";
import { tightGrouping, GroupingResult, GROUPING_META, fmtSec } from "../lib/tightGrouping";
import { getBodyweightKg } from "../lib/profileMetrics";
import {
  SectionCard, StatBox, Pill, EmptyState, ProgressBar, ModalSheet, NexusButton, Field, TXT,
} from "./ui/primitives";

const SKILL_ES: Record<GeneralSkill, string> = {
  cardio: "Cardio", stamina: "Stamina", strength: "Fuerza", flexibility: "Flexib.",
  power: "Potencia", speed: "Velocidad", coordination: "Coord.", agility: "Agilidad",
  balance: "Equilibrio", accuracy: "Precisión",
};
const MODALITY_ES: Record<Modality, string> = { M: "Cardio (M)", G: "Gimnasia (G)", W: "Pesas (W)" };
const PATTERN_ES: Partial<Record<Pattern, string>> = {
  squat: "Sentadilla", hinge: "Bisagra", "horizontal-push": "Empuje horiz.",
  "vertical-push": "Empuje vert.", "horizontal-pull": "Tracción horiz.",
  "vertical-pull": "Tracción vert.", carry: "Acarreo", core: "Core",
  olympic: "Olímpico", monostructural: "Monoestruct.", "gymnastics-skill": "Gimnasia",
};
const TD_ES: Record<TimeDomain, string> = { sprint: "Sprint", short: "Corto", medium: "Medio", long: "Largo" };
const TIME_DOMAINS: TimeDomain[] = ["sprint", "short", "medium", "long"];

function ClassifyMovementModal({ name, onClose }: { name: string | null; onClose: () => void }) {
  const [modality, setModality] = useState<Modality>("W");
  const [pattern, setPattern] = useState<Pattern>("squat");
  useEffect(() => {
    if (name) {
      setModality("W");
      setPattern("squat");
    }
  }, [name]);
  return (
    <ModalSheet
      open={!!name}
      onClose={onClose}
      title="Clasificar movimiento"
      subtitle={name || ""}
      footer={
        <NexusButton
          variant="primary"
          className="w-full"
          onClick={() => {
            if (name) classifyMovement(name, modality, pattern);
            onClose();
          }}
        >
          Guardar clasificación
        </NexusButton>
      }
    >
      <Field label="Modalidad">
        <div className="flex gap-1.5">
          {MODALITIES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModality(m)}
              className={`flex-1 py-2 rounded-sm border text-[11px] font-mono uppercase cursor-pointer ${modality === m ? "bg-electric-blue text-black border-transparent" : "bg-black/40 text-neutral-300 border-[#3F3F46]"}`}
            >
              {MODALITY_ES[m]}
            </button>
          ))}
        </div>
      </Field>
      <div className="mt-3">
        <Field label="Patrón">
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value as Pattern)}
            className="w-full bg-black/60 border border-[#3F3F46] rounded-sm h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
          >
            {PATTERNS.map((p) => (
              <option key={p} value={p}>{PATTERN_ES[p] || p}</option>
            ))}
          </select>
        </Field>
      </div>
    </ModalSheet>
  );
}

export default function TrainingAnalysis({ bodyweightKg, database }: { bodyweightKg?: number; database?: Database }) {
  const [version, setVersion] = useState(0);
  const [classifyName, setClassifyName] = useState<string | null>(null);
  // Analysis scope: rolling week, a specific chapter, or all chapters combined.
  const [scope, setScope] = useState<{ kind: "week" | "chapter" | "global"; chapterId?: string }>(
    () => ({ kind: "chapter", chapterId: getActiveChapterId() }),
  );
  const bw = bodyweightKg ?? getBodyweightKg();
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener("nexus_logs_updated", bump);
    window.addEventListener("nexus_cloud_synced", bump);
    window.addEventListener("nexus_chapter_changed", bump);
    return () => {
      window.removeEventListener("nexus_logs_updated", bump);
      window.removeEventListener("nexus_cloud_synced", bump);
      window.removeEventListener("nexus_chapter_changed", bump);
    };
  }, []);

  const chapters = useMemo(() => listChapters(), [version]);
  const sessionsForChapter = (id: string): TrainingSession[] => {
    try {
      const raw = getChapterSessionsRaw(id);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const scopedSessions = useMemo((): TrainingSession[] => {
    if (scope.kind === "global") return chapters.flatMap((c) => sessionsForChapter(c.id));
    const id = scope.chapterId || getActiveChapterId();
    const sess = id === getActiveChapterId() ? loadSessions() : sessionsForChapter(id);
    if (scope.kind === "week") {
      const cutoff = Date.now() - 7 * 86400000;
      return sess.filter((s) => new Date(s.date).getTime() >= cutoff);
    }
    return sess;
  }, [scope, chapters, version]);

  const data = useMemo(() => {
    const sessions = scopedSessions;
    if (sessions.length === 0) return null;

    let totalWorkJ = 0;
    let totalVolumeKg = 0;
    let uncategorized = 0;
    const modalityWorkJ: Record<Modality, number> = { M: 0, G: 0, W: 0 };
    const prs: Record<string, number> = {};
    const dailyLoads: Record<string, number> = {};
    const unclassified = new Set<string>();
    const intervalGroupings: { date: string; dayId: string; result: GroupingResult }[] = [];

    for (const s of sessions) {
      const t = sessionTotals(s, bw);
      totalWorkJ += t.totalWorkJ;
      totalVolumeKg += t.totalVolumeKg;
      uncategorized += t.uncategorizedSets;
      (Object.keys(modalityWorkJ) as Modality[]).forEach((m) => (modalityWorkJ[m] += t.modalityWorkJ[m]));
      const load = sessionLoadAU(s);
      if (load != null) dailyLoads[s.date] = (dailyLoads[s.date] || 0) + load;
      if (s.metcon?.splits && s.metcon.splits.length >= 2) {
        const g = tightGrouping(s.metcon.splits);
        if (g) intervalGroupings.push({ date: s.date, dayId: s.dayId, result: g });
      }
      for (const set of s.sets) {
        const e = estimate1RM(set.weightKg, set.reps);
        if (e != null) prs[set.exerciseName] = Math.max(prs[set.exerciseName] || 0, e);
        if (exerciseForSet(set).source === "inferred") unclassified.add(set.exerciseName);
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const last7: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7.push(dailyLoads[d.toISOString().slice(0, 10)] || 0);
    }
    const ms = monotonyStrain(last7);
    const loadDays = Object.keys(dailyLoads).length;

    const modalTotal = modalityWorkJ.M + modalityWorkJ.G + modalityWorkJ.W;
    const radar = skillsRadar(sessions);
    const radarData = (Object.keys(SKILL_ES) as GeneralSkill[]).map((k) => ({ skill: SKILL_ES[k], v: radar[k] }));
    const map = modalMapCoverage(sessions, bw);
    const mapMax = Math.max(1, ...(Object.values(map).flatMap((r) => Object.values(r)) as number[]));
    const pv = patternVolume(sessions, bw);
    const topPatterns = (Object.entries(pv) as [Pattern, { sets: number; reps: number; tonnageKg: number }][])
      .filter(([, v]) => v.sets > 0)
      .sort((a, b) => b[1].tonnageKg - a[1].tonnageKg || b[1].sets - a[1].sets)
      .slice(0, 6);
    const patMax = Math.max(1, ...topPatterns.map(([, v]) => v.tonnageKg || v.sets));
    const topPrs = Object.entries(prs).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      sessions: sessions.length, totalWorkJ, totalVolumeKg, uncategorized,
      modalityWorkJ, modalTotal,
      acwr: loadDays >= 7 ? acwr(dailyLoads, today) : null, weeklyLoad: ms.weeklyLoad, monotony: ms.monotony,
      radarData, map, mapMax, topPatterns, patMax, topPrs,
      unclassified: [...unclassified],
      intervalGroupings: intervalGroupings.slice().reverse().slice(0, 6),
    };
  }, [bw, scopedSessions]);

  // Scope selector (rendered above the analysis in both empty and full states).
  const scopeSelector = (
    <SectionCard title="Análisis del atleta" subtitle="Elegí el alcance: semana, capítulo o global">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ["week", "ÚLTIMA SEMANA"],
          ["chapter", "CAPÍTULO"],
          ["global", "GLOBAL"],
        ] as const).map(([k, lbl]) => (
          <button
            key={k}
            type="button"
            onClick={() => setScope((s) => ({ ...s, kind: k }))}
            className={`text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1.5 rounded-sm cursor-pointer transition-all ${
              scope.kind === k ? "bg-electric-blue text-black" : "bg-[#18181B] text-neutral-300 hover:bg-[#27272A]"
            }`}
          >
            {lbl}
          </button>
        ))}
        {scope.kind !== "global" && chapters.length > 1 && (
          <select
            value={scope.chapterId || getActiveChapterId()}
            onChange={(e) => setScope((s) => ({ ...s, chapterId: e.target.value }))}
            className="bg-black/60 border border-[#3F3F46] rounded-sm h-[30px] px-2 text-white font-mono text-[11px] focus:outline-none focus:border-electric-blue"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {String(c.index).padStart(2, "0")} · {c.title}
              </option>
            ))}
          </select>
        )}
        <span className="text-[10px] font-mono text-neutral-500 ml-auto">
          {scopedSessions.length} incursión(es) en alcance
        </span>
      </div>
    </SectionCard>
  );

  // Spectrum coverage is program-level (uses Fase-D derived block metadata), so
  // it renders even before any session is logged. Null for legacy/no program.
  const coverage = database ? programCoverage(database) : null;
  const coverageCard =
    coverage && coverage.totalMetcons > 0 ? (
      <SectionCard
        title="Cobertura del espectro"
        subtitle="Sistemas energéticos × dominios del programa — las celdas vacías son tus huecos (PRVN)"
      >
        <div className="text-[10px] font-mono text-neutral-500 uppercase mb-2">
          {coverage.totalMetcons} metcon(s) del programa con metadata
          {coverage.unclassified > 0 && (
            <span className="text-amber-500/80"> · {coverage.unclassified} sin clasificar (sin duración parseable)</span>
          )}
        </div>
        <div className="mb-3">
          <div className={`${TXT.label} mb-1.5`}>Sistemas energéticos</div>
          {(Object.keys(coverage.energy) as EnergySystem[]).map((es) => {
            const count = coverage.energy[es];
            const max = Math.max(1, ...Object.values(coverage.energy));
            return (
              <div key={es} className="mb-1.5 last:mb-0">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px] font-mono uppercase" style={{ color: ENERGY_META[es].color }}>
                    {ENERGY_META[es].label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">{count}</span>
                </div>
                <div className="h-2 rounded-sm bg-[#18181B] overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: ENERGY_META[es].color, opacity: count > 0 ? 0.85 : 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className={`${TXT.label} mb-1.5`}>Dominios de tiempo</div>
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(coverage.timeDomain) as BlockTimeDomain[]).map((td) => {
              const count = coverage.timeDomain[td];
              return (
                <div
                  key={td}
                  className="rounded-sm border border-[#3F3F46] p-2 text-center"
                  style={{ backgroundColor: count > 0 ? "rgba(0,200,255,0.10)" : "rgba(255,255,255,0.03)" }}
                >
                  <div className="text-[9px] font-mono uppercase text-neutral-400">{TIMEDOMAIN_LABEL[td]}</div>
                  <div className={`text-lg font-brutalist ${count > 0 ? "text-white" : "text-neutral-700"}`}>{count || "·"}</div>
                </div>
              );
            })}
          </div>
        </div>
        {(coverage.energyGaps.length > 0 || coverage.timeGaps.length > 0) && (
          <p className="mt-3 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            Huecos:{" "}
            {[
              ...coverage.energyGaps.map((e) => ENERGY_META[e].label),
              ...coverage.timeGaps.map((t) => TIMEDOMAIN_LABEL[t]),
            ].join(" · ")}
          </p>
        )}
      </SectionCard>
    ) : null;

  if (!data) {
    return (
      <div className="space-y-4">
        {scopeSelector}
        {coverageCard}
        <SectionCard title="Análisis Nexus L4" subtitle="Capacidad de trabajo · 3 dimensiones del CrossFit">
          <EmptyState
            message="Todavía no sellaste ninguna incursión"
            hint="Registrá una sesión con el wizard ⚔ INCURSIÓN y acá vas a ver tu trabajo, potencia, mapa modal, skills, e1RM y carga (ACWR)."
          />
        </SectionCard>
        <SubstitutionCard />
        <TightGroupingCard />
      </div>
    );
  }

  const acwrTone = data.acwr == null ? "neutral"
    : data.acwr > 1.5 ? "danger"
    : data.acwr < 0.8 || data.acwr > 1.3 ? "warn"
    : "good";
  const acwrLabel = data.acwr == null ? "Necesita ~4 sem"
    : data.acwr > 1.5 ? "Riesgo alto"
    : data.acwr < 0.8 ? "Subcarga"
    : data.acwr > 1.3 ? "Vigilar"
    : "Zona óptima";

  const workDisplay = data.totalWorkJ >= 1_000_000
    ? { v: (data.totalWorkJ / 1_000_000).toFixed(1), u: "MJ" }
    : { v: Math.round(data.totalWorkJ / 1000), u: "kJ" };
  const volDisplay = data.totalVolumeKg >= 10_000
    ? { v: (data.totalVolumeKg / 1000).toFixed(1), u: "t" }
    : { v: Math.round(data.totalVolumeKg).toLocaleString(), u: "kg" };

  return (
    <div className="space-y-4">
      {scopeSelector}
      <SectionCard title="Análisis Nexus L4" subtitle="Capacidad de trabajo · derivado de tus incursiones">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Incursiones" value={data.sessions} />
          <StatBox label="Trabajo total" value={workDisplay.v} unit={workDisplay.u} tone="accent" />
          <StatBox label="Volumen total" value={volDisplay.v} unit={volDisplay.u} />
          <StatBox label="ACWR" value={data.acwr ?? "—"} tone={acwrTone as any} hint={acwrLabel} />
        </div>
        {data.uncategorized > 0 && (
          <p className="mt-3 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
            {data.uncategorized} serie(s) sin clasificar — clasificá el movimiento para el desglose completo
          </p>
        )}
      </SectionCard>

      {coverageCard}

      {data.unclassified.length > 0 && (
        <SectionCard title="Sin clasificar" subtitle="Clasificá estos movimientos para el desglose modal/skills completo">
          <div className="space-y-1.5">
            {data.unclassified.map((name) => (
              <div key={name} className="flex items-center justify-between gap-2 bg-black/40 border border-[#3F3F46] rounded-sm px-3 py-2">
                <span className="text-[12px] font-mono text-white truncate">{name}</span>
                <NexusButton variant="ghost" onClick={() => setClassifyName(name)}>Clasificar</NexusButton>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Balance modal" subtitle="Las 3 modalidades del CrossFit (por trabajo)">
        {(["M", "G", "W"] as Modality[]).map((m) => {
          const pct = data.modalTotal > 0 ? data.modalityWorkJ[m] / data.modalTotal : 0;
          return (
            <div key={m} className="mb-2.5 last:mb-0">
              <div className="flex justify-between mb-1">
                <span className={TXT.label}>{MODALITY_ES[m]}</span>
                <span className="text-[10px] font-mono text-neutral-400">{Math.round(pct * 100)}%</span>
              </div>
              <ProgressBar value={pct} tone={m === "M" ? "good" : m === "G" ? "accent" : "warn"} />
            </div>
          );
        })}
      </SectionCard>

      <SectionCard title="Mapa modal (El Hopper)" subtitle="Modalidad × duración — las celdas vacías son tus huecos">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="p-1"></th>
                {TIME_DOMAINS.map((td) => (
                  <th key={td} className={`${TXT.label} p-1`}>{TD_ES[td]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["M", "G", "W"] as Modality[]).map((m) => (
                <tr key={m}>
                  <td className={`${TXT.label} text-left pr-2 whitespace-nowrap`}>{MODALITY_ES[m]}</td>
                  {TIME_DOMAINS.map((td) => {
                    const v = data.map[m][td];
                    const intensity = v / data.mapMax;
                    return (
                      <td key={td} className="p-1">
                        <div
                          className="h-9 rounded-sm border border-[#3F3F46] flex items-center justify-center text-[9px] font-mono"
                          style={{ backgroundColor: v > 0 ? `rgba(0, 200, 255, ${0.12 + intensity * 0.6})` : "rgba(255,255,255,0.03)" }}
                          title={`${MODALITY_ES[m]} · ${TD_ES[td]}: ${Math.round(v / 1000)} kJ`}
                        >
                          {v > 0 ? `${Math.round(v / 1000)}` : "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[9px] font-mono text-neutral-500 uppercase">kJ por celda · cuanto más oscura, menos tocaste esa combinación</p>
      </SectionCard>

      <SectionCard title="Radar de habilidades" subtitle="Las 10 cualidades físicas (por exposición)">
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <RadarChart data={data.radarData} outerRadius="72%">
              <PolarGrid stroke="#27272A" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#A1A1AA", fontSize: 11, fontFamily: "monospace" }} />
              <Radar dataKey="v" stroke="#FAFAFA" fill="#FAFAFA" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {data.topPrs.length > 0 && (
        <SectionCard title="e1RM — fuerza estimada" subtitle="1RM proyectado (Epley) de tus mejores series">
          <div className="space-y-1.5">
            {data.topPrs.map(([name, kg]) => (
              <div key={name} className="flex items-center justify-between gap-2 bg-black/40 border border-[#3F3F46] rounded-sm px-3 py-2">
                <span className="text-[12px] font-mono text-white truncate">{name}</span>
                <Pill tone="accent">{Math.round(kg)} kg</Pill>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Volumen por patrón" subtitle="Sentadilla · bisagra · empuje · tracción · acarreo · core">
        {data.topPatterns.length === 0 ? (
          <EmptyState message="Sin volumen por patrón todavía" />
        ) : (
          data.topPatterns.map(([p, v]) => {
            const ref = v.tonnageKg || v.sets;
            return (
              <div key={p} className="mb-2.5 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className={TXT.label}>{PATTERN_ES[p] || p}</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {v.sets} series · {v.tonnageKg > 0 ? `${v.tonnageKg.toLocaleString()} kg` : `${v.reps} reps`}
                  </span>
                </div>
                <ProgressBar value={ref / data.patMax} tone="accent" />
              </div>
            );
          })
        )}
      </SectionCard>

      {data.intervalGroupings.length > 0 && (
        <SectionCard title="Agrupación registrada" subtitle="Pacing de tus metcons de intervalos sellados (cap. 43)">
          <div className="space-y-2">
            {data.intervalGroupings.map((g, i) => {
              const meta = GROUPING_META[g.result.verdict];
              return (
                <div key={`${g.dayId}-${i}`} className="flex items-center justify-between gap-2 bg-black/40 border border-[#3F3F46] rounded-sm px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono text-white">{g.dayId || g.date}</div>
                    <div className="text-[9px] font-mono text-neutral-500">
                      {g.result.count} rondas · media {fmtSec(g.result.meanSec)} · spread {fmtSec(g.result.spreadSec)} · CV {g.result.cvPct}%
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-[9.5px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded-sm border"
                    style={{ color: meta.color, borderColor: `${meta.color}55` }}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SubstitutionCard />

      <TightGroupingCard />

      <ClassifyMovementModal name={classifyName} onClose={() => setClassifyName(null)} />
    </div>
  );
}
