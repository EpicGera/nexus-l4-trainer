import React, { useState } from "react";
import { ModalSheet, Field, Input, NexusButton, TXT } from "./ui/primitives";
import { MAIN_LIFTS, setOneRepMax } from "../lib/workingMax";
import { setBodyweightKg } from "../lib/profileMetrics";
import {
  Sex, SkillLevel, AthleteBio, ONBOARDING_SKILLS,
  setAthleteBio, setSkillLevels, markOnboardingDone,
} from "../lib/athleteProfile";

// PRs que el onboarding pregunta — el subconjunto de mayor señal para el punto
// de referencia (Working Max, RPE sugerido, stats del juego). El resto se
// completa después en PERFIL.
const ONBOARDING_LIFTS = MAIN_LIFTS.filter((l) =>
  ["back-squat", "deadlift", "strict-press", "bench-press", "clean", "snatch"].includes(l.id),
);

const SKILL_CYCLE: SkillLevel[] = ["none", "some", "rx"];
const SKILL_LABEL: Record<SkillLevel, string> = { none: "NO", some: "EN PROGRESO", rx: "RX" };

interface Props {
  onDone: () => void;
  onSkip: () => void;
}

/**
 * Onboarding de atleta nuevo: sexo/edad/altura/peso → PRs clave → skills.
 * Escribe perfil + 1RMs y computa el punto de referencia inicial (athleteStats
 * lo deriva solo de estos datos). Todo opcional: lo que no se ingresa degrada
 * honestamente, nunca se inventa.
 */
export default function OnboardingWizard({ onDone, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState<AthleteBio>({ sex: null, ageYears: null, heightCm: null });
  const [bodyweight, setBodyweight] = useState<string>("");
  const [prs, setPrs] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<Record<string, SkillLevel>>({});

  const num = (v: string): number | null => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const finish = () => {
    setAthleteBio(bio);
    const bw = num(bodyweight);
    if (bw) setBodyweightKg(bw);
    for (const l of ONBOARDING_LIFTS) {
      const kg = num(prs[l.id] ?? "");
      if (kg) setOneRepMax(l.id, kg);
    }
    setSkillLevels(skills);
    markOnboardingDone();
    onDone();
  };

  const STEPS = ["ATLETA", "MARCAS (PR)", "HABILIDADES"];
  const isLast = step === STEPS.length - 1;

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={step === 0 ? onSkip : () => setStep((s) => s - 1)}
        className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 hover:text-white transition-colors cursor-pointer"
      >
        {step === 0 ? "Saltar por ahora" : "← Atrás"}
      </button>
      <div className="flex items-center gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-white" : "bg-white/20"}`} />
        ))}
      </div>
      <NexusButton variant="primary" onClick={isLast ? finish : () => setStep((s) => s + 1)}>
        {isLast ? "COMPUTAR PUNTO DE INICIO" : "SIGUIENTE →"}
      </NexusButton>
    </div>
  );

  return (
    <ModalSheet
      open
      onClose={onSkip}
      title="CALIBRACIÓN DEL ATLETA"
      subtitle={`Paso ${step + 1}/3 · ${STEPS[step]} — define tu punto de referencia`}
      footer={footer}
    >
      {step === 0 && (
        <div className="space-y-4">
          <p className={TXT.body}>
            Estos datos anclan tu punto de partida: fuerza relativa, expectativas por sexo y edad,
            y el trabajo de los movimientos de peso corporal. Todo es opcional y editable después.
          </p>
          <Field label="Sexo">
            <div className="grid grid-cols-3 gap-1.5">
              {(["M", "F", "X"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setBio((b) => ({ ...b, sex: s }))}
                  className={`py-2.5 rounded-none border text-sm font-mono font-bold transition-colors cursor-pointer ${
                    bio.sex === s ? "bg-white text-black border-transparent" : "bg-transparent text-neutral-300 border-white/20 hover:border-white/40"
                  }`}
                >
                  {s === "M" ? "MASC" : s === "F" ? "FEM" : "OTRO"}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Edad" hint="años">
              <Input inputMode="numeric" value={bio.ageYears ?? ""} onChange={(e) => setBio((b) => ({ ...b, ageYears: num(e.target.value) }))} />
            </Field>
            <Field label="Altura" hint="cm">
              <Input inputMode="numeric" value={bio.heightCm ?? ""} onChange={(e) => setBio((b) => ({ ...b, heightCm: num(e.target.value) }))} />
            </Field>
            <Field label="Peso" hint="kg">
              <Input inputMode="decimal" value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className={TXT.body}>
            Tus mejores marcas (1RM) en kg. Cargá las que sepas — el resto lo estimamos de tus
            registros con el tiempo. Alimentan tu Working Max y el RPE sugerido.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ONBOARDING_LIFTS.map((l) => (
              <Field key={l.id} label={l.name} hint="kg">
                <Input
                  inputMode="decimal"
                  value={prs[l.id] ?? ""}
                  onChange={(e) => setPrs((p) => ({ ...p, [l.id]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className={TXT.body}>
            ¿Qué skills gimnásticos manejás? Tocá cada uno para ciclar entre NO / EN PROGRESO / RX.
            Esto orienta las escalas sugeridas y tu perfil de habilidad.
          </p>
          <div className="space-y-2">
            {ONBOARDING_SKILLS.map((sk) => {
              const lvl = skills[sk.id] ?? "none";
              return (
                <button
                  key={sk.id}
                  onClick={() =>
                    setSkills((s) => ({ ...s, [sk.id]: SKILL_CYCLE[(SKILL_CYCLE.indexOf(lvl) + 1) % 3] }))
                  }
                  className="w-full flex items-center justify-between px-4 py-3 border border-white/15 bg-transparent hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-mono text-white uppercase tracking-wider">{sk.label}</span>
                  <span
                    className={`text-[11px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded-none ${
                      lvl === "rx" ? "bg-white text-black" : lvl === "some" ? "text-white border border-white/40" : "text-neutral-500 border border-white/15"
                    }`}
                  >
                    {SKILL_LABEL[lvl]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </ModalSheet>
  );
}
