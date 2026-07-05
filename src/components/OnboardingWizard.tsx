import React, { useState } from "react";
import { ModalSheet, Field, Input, NexusButton, TXT } from "./ui/primitives";
import { MAIN_LIFTS, setOneRepMax } from "../lib/workingMax";
import { setBodyweightKg } from "../lib/profileMetrics";
import { setObjective, EMPTY_OBJECTIVE } from "../lib/athleteObjective";
import {
  Sex, SkillLevel, Level3, DietApproach, AthleteBio, CardioMarks,
  ONBOARDING_SKILLS, ONBOARDING_KIPPING, CARDIO_FIELDS, DIET_LABEL, GEAR_DIMENSIONS,
  DEFAULT_PROFILE,
  setAthleteBio, setSkillLevels, setKippingLevels, setCardioMarks,
  setHealth, setDiet, setLifeGear, markOnboardingDone,
} from "../lib/athleteProfile";

const ONBOARDING_LIFTS = MAIN_LIFTS.filter((l) =>
  ["back-squat", "deadlift", "strict-press", "bench-press", "clean", "snatch"].includes(l.id),
);
const SKILL_CYCLE: SkillLevel[] = ["none", "some", "rx"];
const SKILL_LABEL: Record<SkillLevel, string> = { none: "NO", some: "EN PROGRESO", rx: "RX" };
const GEAR_CYCLE: Level3[] = ["low", "mid", "high"];

const parseMMSS = (v: string): number | null => {
  const s = v.trim();
  if (!s) return null;
  const m = s.match(/^(\d+):(\d{1,2})$/);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null; // segundos sueltos
};
const num = (v: string): number | null => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

interface Props {
  onDone: () => void;
  onSkip: () => void;
}

/** Level cycler compartido (skills, kipping). */
function LevelRow({ label, level, onClick }: { label: string; level: SkillLevel; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2.5 border border-white/15 bg-transparent hover:bg-white/5 transition-colors cursor-pointer"
    >
      <span className="text-sm font-mono text-white uppercase tracking-wider">{label}</span>
      <span
        className={`text-[11px] font-mono font-bold uppercase tracking-widest px-2 py-1 ${
          level === "rx" ? "bg-white text-black" : level === "some" ? "text-white border border-white/40" : "text-neutral-500 border border-white/15"
        }`}
      >
        {SKILL_LABEL[level]}
      </span>
    </button>
  );
}

export default function OnboardingWizard({ onDone, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState<AthleteBio>(DEFAULT_PROFILE.bio);
  const [bodyweight, setBodyweight] = useState("");
  const [goal, setGoal] = useState("");
  const [goalSkills, setGoalSkills] = useState("");
  const [prs, setPrs] = useState<Record<string, string>>({});
  const [cardio, setCardio] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<Record<string, SkillLevel>>({});
  const [kipping, setKipping] = useState<Record<string, SkillLevel>>({});
  const [injuries, setInjuries] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [diet, setDietState] = useState<DietApproach>("sin_definir");
  const [restrictions, setRestrictions] = useState("");
  const [gear, setGear] = useState(DEFAULT_PROFILE.gear);

  const finish = () => {
    setAthleteBio(bio);
    const bw = num(bodyweight);
    if (bw) setBodyweightKg(bw);
    for (const l of ONBOARDING_LIFTS) {
      const kg = num(prs[l.id] ?? "");
      if (kg) setOneRepMax(l.id, kg);
    }
    const marks: CardioMarks = { ...DEFAULT_PROFILE.cardio };
    for (const f of CARDIO_FIELDS) {
      const raw = cardio[f.id] ?? "";
      marks[f.id] = f.unit === "reps" ? num(raw) : parseMMSS(raw);
    }
    setCardioMarks(marks);
    setSkillLevels(skills);
    setKippingLevels(kipping);
    setHealth({ injuries: injuries.trim(), weaknesses: weaknesses.trim() });
    setDiet({ approach: diet, restrictions: restrictions.trim() });
    setLifeGear(gear);
    if (goal.trim() || goalSkills.trim()) {
      setObjective({
        ...EMPTY_OBJECTIVE,
        statement: goal.trim(),
        skills: goalSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });
    }
    markOnboardingDone();
    onDone();
  };

  const STEPS = ["ATLETA", "OBJETIVO", "MARCAS", "CARDIO", "GIMNASIA", "SALUD", "VIDA"];
  const isLast = step === STEPS.length - 1;
  const cycle = (map: Record<string, SkillLevel>, set: (m: Record<string, SkillLevel>) => void, id: string) =>
    set({ ...map, [id]: SKILL_CYCLE[(SKILL_CYCLE.indexOf(map[id] ?? "none") + 1) % 3] });

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={step === 0 ? onSkip : () => setStep((s) => s - 1)}
        className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 hover:text-white transition-colors cursor-pointer"
      >
        {step === 0 ? "Saltar" : "← Atrás"}
      </button>
      <div className="flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-white" : "bg-white/20"}`} />
        ))}
      </div>
      <NexusButton variant="primary" onClick={isLast ? finish : () => setStep((s) => s + 1)}>
        {isLast ? "COMPUTAR REFERENCIA" : "SIGUIENTE →"}
      </NexusButton>
    </div>
  );

  const inputCls = "w-full bg-black/60 border border-white/15 rounded-none h-[38px] px-3 text-white font-mono text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600";
  const areaCls = "w-full bg-black/60 border border-white/15 rounded-none p-3 text-white font-mono text-sm focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 resize-none";

  return (
    <ModalSheet
      open
      onClose={onSkip}
      title="CALIBRACIÓN DEL ATLETA"
      subtitle={`Paso ${step + 1}/${STEPS.length} · ${STEPS[step]} — define tu punto de referencia`}
      footer={footer}
    >
      {step === 0 && (
        <div className="space-y-4">
          <p className={TXT.body}>Datos base: anclan fuerza relativa, expectativas y el trabajo de peso corporal. Todo opcional y editable después.</p>
          <Field label="Sexo">
            <div className="grid grid-cols-3 gap-1.5">
              {(["M", "F", "X"] as Sex[]).map((s) => (
                <button key={s} onClick={() => setBio((b) => ({ ...b, sex: s }))}
                  className={`py-2.5 border text-sm font-mono font-bold cursor-pointer ${bio.sex === s ? "bg-white text-black border-transparent" : "text-neutral-300 border-white/20 hover:border-white/40"}`}>
                  {s === "M" ? "MASC" : s === "F" ? "FEM" : "OTRO"}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Edad" hint="años"><Input inputMode="numeric" value={bio.ageYears ?? ""} onChange={(e) => setBio((b) => ({ ...b, ageYears: num(e.target.value) }))} /></Field>
            <Field label="Altura" hint="cm"><Input inputMode="numeric" value={bio.heightCm ?? ""} onChange={(e) => setBio((b) => ({ ...b, heightCm: num(e.target.value) }))} /></Field>
            <Field label="Peso" hint="kg"><Input inputMode="decimal" value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} /></Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className={TXT.body}>Tu objetivo guía la periodización: cada capítulo será el próximo paso hacia esto. Alimenta directamente al generador de planificaciones.</p>
          <Field label="Meta principal (norte)">
            <textarea rows={2} className={areaCls} placeholder="Ej: clasificar al Open · primer ring muscle-up · sub-3:00 en Fran" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </Field>
          <Field label="Skills objetivo" hint="separá con comas">
            <Input placeholder="Muscle-up, HSPU estricto, DU x50 sin cortar" value={goalSkills} onChange={(e) => setGoalSkills(e.target.value)} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className={TXT.body}>Tus 1RM en kg (los que sepas). Alimentan tu Working Max y el RPE sugerido; el resto se estima de tus registros.</p>
          <div className="grid grid-cols-2 gap-3">
            {ONBOARDING_LIFTS.map((l) => (
              <Field key={l.id} label={l.name} hint="kg">
                <Input inputMode="decimal" value={prs[l.id] ?? ""} onChange={(e) => setPrs((p) => ({ ...p, [l.id]: e.target.value }))} />
              </Field>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className={TXT.body}>Tiempos de referencia (mm:ss). Con esto el generador prescribe ritmos y objetivos relativos a TU cardio, no genéricos. Dejá vacío lo que no sepas.</p>
          <div className="grid grid-cols-2 gap-3">
            {CARDIO_FIELDS.map((f) => (
              <Field key={f.id} label={f.label} hint={f.unit === "reps" ? "reps" : "mm:ss"}>
                <Input inputMode={f.unit === "reps" ? "numeric" : "text"} placeholder={f.unit === "reps" ? "50" : "3:45"} value={cardio[f.id] ?? ""} onChange={(e) => setCardio((c) => ({ ...c, [f.id]: e.target.value }))} />
              </Field>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className={TXT.body}>Skills gimnásticos y técnica de kipping. Tocá para ciclar NO / EN PROGRESO / RX. Orienta el escalado y las progresiones que el generador prescribe.</p>
          <div className={`${TXT.label} pt-1`}>Skills</div>
          <div className="space-y-2">
            {ONBOARDING_SKILLS.map((sk) => (
              <LevelRow key={sk.id} label={sk.label} level={skills[sk.id] ?? "none"} onClick={() => cycle(skills, setSkills, sk.id)} />
            ))}
          </div>
          <div className={`${TXT.label} pt-2`}>Kipping / eficiencia gimnástica</div>
          <div className="space-y-2">
            {ONBOARDING_KIPPING.map((sk) => (
              <LevelRow key={sk.id} label={sk.label} level={kipping[sk.id] ?? "none"} onClick={() => cycle(kipping, setKipping, sk.id)} />
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <p className={TXT.body}>El veto salud &gt; recuperación &gt; adherencia manda: lo que declares acá se RESPETA en cada plan (se evita o escala lo que agrava, se ataca lo débil).</p>
          <Field label="Lesiones / dolencias crónicas">
            <textarea rows={2} className={areaCls} placeholder="Ej: hombro derecho (evitar overhead pesado), lumbar sensible en peso muerto máximo" value={injuries} onChange={(e) => setInjuries(e.target.value)} />
          </Field>
          <Field label="Debilidades a atacar">
            <textarea rows={2} className={areaCls} placeholder="Ej: resistencia en metcons largos, cargada técnica, movilidad de tobillo" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
          </Field>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <p className={TXT.body}>Contexto de recuperación: calibra cuánto volumen e intensidad tolerás y cada cuánto descargar.</p>
          <Field label="Dieta">
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DIET_LABEL) as DietApproach[]).map((d) => (
                <button key={d} onClick={() => setDietState(d)}
                  className={`py-2 px-2 border text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer ${diet === d ? "bg-white text-black border-transparent" : "text-neutral-300 border-white/15 hover:border-white/40"}`}>
                  {DIET_LABEL[d]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Restricciones / alergias"><Input placeholder="Sin gluten, intolerancia a lactosa…" value={restrictions} onChange={(e) => setRestrictions(e.target.value)} /></Field>
          <div className={`${TXT.label} pt-1`}>Life Gear</div>
          <div className="space-y-2">
            {GEAR_DIMENSIONS.map((dim) => {
              const lvl = gear[dim.id];
              const meta = dim.levels[lvl];
              return (
                <button key={dim.id} onClick={() => setGear((g) => ({ ...g, [dim.id]: GEAR_CYCLE[(GEAR_CYCLE.indexOf(g[dim.id]) + 1) % 3] }))}
                  className="w-full text-left px-4 py-2.5 border border-white/15 bg-transparent hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-white uppercase tracking-wider">{dim.label}</span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">{meta.desc}</span>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5 normal-case">{meta.tip}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
