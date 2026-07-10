import React, { useMemo, useState } from "react";
import { Database } from "../types/workout";
import { Modality, Pattern, MODALITIES, PATTERNS } from "../types/training";
import { evaluateAthlete, ChapterRequest, BlockIntention } from "../lib/chapterCreator";
import { generateChapter, ChapterResult } from "../services/aiService";
import { parseJsonToDatabase, summarizeDatabase } from "../lib/sheetImport";
import { getObjective, setObjective, objectiveGapText, AthleteObjective } from "../lib/athleteObjective";
import { athleteProfileBrief } from "../lib/athleteProfile";
import { auditProgram } from "../lib/auditProgram";
import { getOneRepMaxes } from "../lib/workingMax";
import { CATALOG } from "../data/exerciseCatalog";
import { classifyMovement } from "../data/exerciseCatalog";
import { emitToast } from "../lib/exportService";
import { getCleanExerciseName } from "../lib/historyUtils";

const CHAPTER_INDEX_KEY = "nexus_chapter_index";

// Compact inventory of the current program so the new chapter can vary from it.
function summarizeProgram(db?: Database): string {
  if (!db) return "";
  const moves = new Set<string>();
  const formats = new Set<string>();
  Object.keys(db).filter((k) => /^w\d+$/.test(k)).forEach((wk) => {
    (db[wk]?.days || []).forEach((d) => {
      const v = d.variations?.[0];
      if (!v) return;
      [...(v.strength?.items || []), ...(v.metcon?.items || []), ...(v.accessories?.items || [])].forEach((it) => {
        const n = getCleanExerciseName(it);
        if (n) moves.add(n);
      });
      if (v.metcon?.scheme) formats.add(v.metcon.scheme);
    });
  });
  if (moves.size === 0) return "";
  return `Movimientos usados: ${[...moves].slice(0, 30).join(", ")}. Formatos de metcon: ${[...formats].slice(0, 10).join(", ") || "—"}.`;
}
import { SectionCard, StatBox, Pill, NexusButton, Field, Input, TXT } from "./ui/primitives";
import EnrichmentToggle from "./EnrichmentToggle";

const INTENTION_ES: Record<BlockIntention, string> = {
  acumulacion: "Acumulación", intensificacion: "Intensificación",
  realizacion: "Realización", restauracion: "Restauración",
};

export default function ChapterCreator({
  onInstall,
  currentProgram,
}: {
  onInstall: (db: Database, meta?: { title?: string; lore?: string }) => void;
  currentProgram?: Database;
}) {
  const evaluation = useMemo(() => evaluateAthlete(), []);
  const [objective, setObjectiveState] = useState<AthleteObjective>(() => getObjective());
  const saveObjective = (o: AthleteObjective) => { setObjectiveState(o); setObjective(o); };
  const [skillsText, setSkillsText] = useState(() => getObjective().skills.join(", "));
  const [boss, setBoss] = useState("");
  const [days, setDays] = useState(5);
  const [equipment, setEquipment] = useState("");
  const [minutes, setMinutes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ChapterResult | null>(null);
  const [installing, setInstalling] = useState(false);
  const [enriched, setEnriched] = useState(() => localStorage.getItem('nexus_enriched_mode') === 'true');

  const generate = async () => {
    if (!boss.trim()) {
      emitToast("Decí en qué se inspiran los bosses del capítulo primero.", "info", 6000);
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const prevIndex = parseInt(localStorage.getItem(CHAPTER_INDEX_KEY) || "1", 10) || 1;
      // Gap to the goal, measured against the athlete's real logged marks.
      const currentMarks = evaluation.topPrs.map((p) => ({ name: p.name, kg: p.e1rmKg }));
      // Full load map (movement → kg) so the AI can prescribe % WM for every lift.
      const nameById: Record<string, string> = {};
      for (const e of CATALOG) nameById[e.id] = e.name;
      const loads = Object.entries(getOneRepMaxes())
        .map(([id, kg]) => `${nameById[id] || id} ${kg}kg`)
        .join(", ");
      const req: ChapterRequest = {
        bossInspiration: boss.trim(),
        daysPerWeek: days,
        equipment: equipment.trim() || undefined,
        sessionMinutes: minutes ? parseInt(minutes, 10) || undefined : undefined,
        enriched,
        previousProgramSummary: summarizeProgram(currentProgram) || undefined,
        chapterIndex: prevIndex + 1,
        objective: objectiveGapText(objective, currentMarks) || undefined,
        loads: loads || undefined,
        profileBrief: athleteProfileBrief() || undefined,
      };
      const r = await generateChapter(req, evaluation);
      setResult(r);
      if (r.warning) emitToast(r.warning, "info", 9000);
    } catch (e: any) {
      emitToast("❌ No se pudo generar el capítulo: " + (e?.message ?? String(e)), "error", 9000);
    } finally {
      setBusy(false);
    }
  };

  const install = () => {
    if (!result) return;
    setInstalling(true);
    try {
      // Close the loop: audit the AI output against the same contract as imports
      // — clean titles + flag unreadable items — then install the NORMALIZED program.
      const audit = auditProgram(result.program);
      if (!audit.ok) {
        const errs = audit.issues.filter((i) => i.severity === "error").map((i) => i.message).join(" · ");
        throw new Error("La auditoría rechazó el capítulo generado: " + errs);
      }
      const db = parseJsonToDatabase(JSON.stringify(audit.normalized));
      const s = summarizeDatabase(db);
      if (s.days === 0) throw new Error("El programa generado no tiene días reconocibles.");
      if (audit.stats.unreadableItems > 0 || audit.stats.loadedWithoutLoad > 0) {
        const parts = [];
        if (audit.stats.unreadableItems > 0) parts.push(`${audit.stats.unreadableItems} no auto-legible(s)`);
        if (audit.stats.loadedWithoutLoad > 0) parts.push(`${audit.stats.loadedWithoutLoad} con peso sin carga WMD`);
        emitToast(`⚠ Capítulo instalado con avisos: ${parts.join(" · ")}.`, "info", 8000);
      }
      // Register the chapter's new movements so the open-world resolver knows them.
      result.newMovements.forEach((m) => {
        if (m?.name && (MODALITIES as string[]).includes(m.modality) && (PATTERNS as string[]).includes(m.pattern)) {
          classifyMovement(m.name, m.modality as Modality, m.pattern as Pattern);
        }
      });
      onInstall(db, { title: (result.lore || "NUEVO CAPÍTULO").toUpperCase().slice(0, 60), lore: result.lore });
      // Advance the chapter counter so the NEXT chapter knows it must progress.
      const prevIndex = parseInt(localStorage.getItem(CHAPTER_INDEX_KEY) || "1", 10) || 1;
      localStorage.setItem(CHAPTER_INDEX_KEY, String(prevIndex + 1));
      emitToast(
        `✅ Capítulo instalado: ${s.weeks} semana(s) · ${s.days} días · ${s.items} ejercicios` +
          (result.newMovements.length ? ` · ${result.newMovements.length} movimiento(s) nuevo(s)` : ""),
        "success",
        9000,
      );
      setResult(null);
    } catch (e: any) {
      emitToast("❌ Capítulo inválido: " + (e?.message ?? String(e)), "error", 9000);
    } finally {
      setInstalling(false);
    }
  };

  const summary = result ? summarizeDatabase(safeDb(result.program)) : null;

  return (
    <SectionCard
      title="Creador de capítulos (IA)"
      subtitle="Programación mensual fundamentada en la enciclopedia NEXUS y en tus resultados"
    >
      {/* Evaluación del atleta (lo que la IA usa como base) */}
      <div className="bg-black/40 border border-[#3F3F46] rounded-sm p-3 mb-4">
        <div className={`${TXT.label} mb-1`}>Evaluación del atleta</div>
        <p className="text-[11px] font-mono text-neutral-300 leading-relaxed">{evaluation.summary}</p>
      </div>

      {/* OBJETIVO — el hilo que guía la periodización entre capítulos */}
      <div className="bg-electric-blue/5 border border-electric-blue/25 rounded-sm p-3 mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className={`${TXT.label} text-electric-blue`}>🎯 Objetivo del atleta (guía la continuación)</div>
          {objective.horizonChapters ? <Pill tone="accent">{objective.horizonChapters} cap.</Pill> : null}
        </div>
        <Field label="Meta (en una frase)">
          <textarea
            value={objective.statement}
            onChange={(e) => saveObjective({ ...objective, statement: e.target.value })}
            rows={2}
            placeholder="ej. Prep Open: snatch 80kg y primer ring muscle-up en 3 capítulos"
            className="w-full bg-black/60 border border-[#3F3F46] rounded-sm p-2.5 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
          />
        </Field>

        <div>
          <div className={`${TXT.label} mb-1.5`}>Marcas objetivo (levantamiento → kg)</div>
          <div className="space-y-1.5">
            {objective.lifts.map((lift, i) => (
              <div key={i} className="flex gap-1.5 items-center">
                <Input
                  value={lift.movement}
                  onChange={(e) =>
                    saveObjective({ ...objective, lifts: objective.lifts.map((l, j) => (j === i ? { ...l, movement: e.target.value } : l)) })
                  }
                  placeholder="Snatch"
                  className="flex-1"
                />
                <Input
                  value={lift.targetKg ? String(lift.targetKg) : ""}
                  onChange={(e) =>
                    saveObjective({ ...objective, lifts: objective.lifts.map((l, j) => (j === i ? { ...l, targetKg: Number(e.target.value) || 0 } : l)) })
                  }
                  inputMode="numeric"
                  unit="kg"
                  className="w-24"
                />
                <button
                  type="button"
                  aria-label="Quitar marca"
                  onClick={() => saveObjective({ ...objective, lifts: objective.lifts.filter((_, j) => j !== i) })}
                  className="text-neutral-500 hover:text-rose-400 cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => saveObjective({ ...objective, lifts: [...objective.lifts, { movement: "", targetKg: 0 }] })}
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-electric-blue/80 hover:text-electric-blue cursor-pointer"
            >
              + agregar marca
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Field label="Skills objetivo (coma)" className="sm:col-span-2">
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              onBlur={() => saveObjective({ ...objective, skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Ring MU, HSPU estricto, DU x50"
            />
          </Field>
          <Field label="Horizonte (cap.)">
            <Input
              value={objective.horizonChapters ? String(objective.horizonChapters) : ""}
              onChange={(e) => saveObjective({ ...objective, horizonChapters: Number(e.target.value) || undefined })}
              inputMode="numeric"
              placeholder="3"
            />
          </Field>
        </div>
        <p className="text-[9px] font-mono text-neutral-500 leading-relaxed">
          Cada capítulo se genera como el próximo paso hacia esto: la IA recibe tu brecha real (marca
          actual vs objetivo) y prescribe para cerrarla.
        </p>
      </div>

      <div className="space-y-3">
        <Field label="¿En qué se inspiran los bosses / semi-bosses? (tema del capítulo)">
          <textarea
            value={boss}
            onChange={(e) => setBoss(e.target.value)}
            rows={2}
            placeholder="ej. demonios del desierto de Diablo II, cada semana un Acto…"
            className="w-full bg-black/60 border border-[#3F3F46] rounded-sm p-2.5 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Días por semana">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="w-full bg-black/60 border border-[#3F3F46] rounded-sm h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-electric-blue"
            >
              {[3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>{d} días</option>
              ))}
            </select>
          </Field>
          <Field label="Duración por sesión (min, opc.)">
            <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="numeric" placeholder="60" />
          </Field>
        </div>
        <Field label="Material disponible (opcional)">
          <Input value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="barra, dumbbells, remo, soga…" />
        </Field>

        <div className="mt-1">
          <EnrichmentToggle value={enriched} onChange={setEnriched} />
        </div>

        <NexusButton variant="primary" className="w-full" onClick={generate} disabled={busy}>
          {busy ? "GENERANDO CAPÍTULO…" : "⚒ Generar capítulo"}
        </NexusButton>
      </div>

      {result && (
        <div className="mt-4 space-y-3 border-t border-[#3F3F46] pt-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-brutalist tracking-wider text-white uppercase truncate">{result.lore || "Capítulo"}</h4>
            <Pill tone="accent">{INTENTION_ES[result.blockIntention as BlockIntention] || result.blockIntention}</Pill>
          </div>
          {summary && (
            <div className="grid grid-cols-3 gap-2.5">
              <StatBox label="Semanas" value={summary.weeks} />
              <StatBox label="Días" value={summary.days} />
              <StatBox label="Ejercicios" value={summary.items} />
            </div>
          )}
          {result.witnessMetrics.length > 0 && (
            <div>
              <div className={`${TXT.label} mb-1`}>Métricas testigo (HWPO)</div>
              <div className="flex flex-wrap gap-1.5">
                {result.witnessMetrics.map((m, i) => (
                  <Pill key={i} tone="neutral">{m}</Pill>
                ))}
              </div>
            </div>
          )}
          {result.newMovements.length > 0 && (
            <div>
              <div className={`${TXT.label} mb-1`}>Movimientos nuevos (se agregan al catálogo)</div>
              <div className="space-y-1">
                {result.newMovements.map((m, i) => (
                  <div key={i} className="text-[11px] font-mono text-neutral-300">
                    <span className="text-white">{m.name}</span>{" "}
                    <span className="text-neutral-500">· {m.modality}/{m.pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <NexusButton variant="good" className="w-full" onClick={install} disabled={installing}>
            {installing ? "INSTALANDO…" : "⬇ Instalar capítulo (reemplaza el programa activo)"}
          </NexusButton>
        </div>
      )}
    </SectionCard>
  );
}

// Best-effort normalize for the preview summary (the real install re-parses).
function safeDb(program: any): Database {
  try {
    return parseJsonToDatabase(JSON.stringify(program));
  } catch {
    return {} as Database;
  }
}
